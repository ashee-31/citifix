import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api/helpers";
import { listComplaints, toPublicComplaint } from "@/lib/repo";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";

async function authorized(request: NextRequest): Promise<boolean> {
  if (isDemoMode()) return true;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const admin = createAdminClient();
  const { data } = await admin.auth.getUser(token);
  if (!data.user) return false;
  const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return profile?.role === "authority" || profile?.role === "admin";
}

/** Privacy-safe authority queue. Repository records are projected before response. */
export async function GET(request: NextRequest) {
  if (!(await authorized(request))) return apiError("Authority access required", 403);
  const complaints = await listComplaints({ limit: 500 });
  return apiOk({ complaints: complaints.map(toPublicComplaint) });
}
