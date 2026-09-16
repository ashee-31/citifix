import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api/helpers";
import { listComplaints, toPublicComplaint } from "@/lib/repo";
import { generateAuthorityInsights } from "@/lib/ai/authority";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";

async function authorized(request: NextRequest) {
  if (isDemoMode()) return true;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const admin = createAdminClient(); const { data } = await admin.auth.getUser(token);
  if (!data.user) return false;
  const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return profile?.role === "authority" || profile?.role === "admin";
}

/** Authority-only decision support. It returns no reporter IDs or private metadata. */
export async function GET(request: NextRequest) {
  if (!(await authorized(request))) return apiError("Authority access required", 403);
  try {
    const response = await generateAuthorityInsights(await listComplaints({ limit: 500 }));
    return apiOk({ ...response, disputedReopened: response.disputedReopened.map(toPublicComplaint), escalatedCandidates: response.escalatedCandidates.map(toPublicComplaint), demo: isDemoMode() });
  } catch (error) { return apiError(error instanceof Error ? error.message : "Authority intelligence unavailable", 500); }
}
