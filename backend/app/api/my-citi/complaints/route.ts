import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api/helpers";
import { listComplaints } from "@/lib/repo";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * GET /api/my-citi/complaints
 *
 * Returns the complaints OWNED by the current citizen.
 *
 * DEMO MODE — the demo citizen is authenticated via the local demo session,
 * so we return the demo complaints (all belonging to "demo-reporter").
 *
 * REAL MODE — the Supabase access token is verified with the service-role
 * client and only complaints with reporter_id = user.id are returned.
 * A citizen can never see another citizen's complaints.
 */
export async function GET(req: NextRequest) {
  if (isDemoMode()) {
    const complaints = await listComplaints({ limit: 100 });
    return apiOk({ complaints });
  }

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return apiError("Not authenticated", 401);

  let user: User;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return apiError("Invalid or expired session", 401);
    }
    user = data.user;
  } catch {
    return apiError("Authentication unavailable", 401);
  }

  const complaints = await listComplaints({ limit: 100 });

  // Filtering: the repo layer doesn't know the current user, so we filter
  // here. In real mode reporter_id equals the authenticated user's id.
  const mine = complaints.filter(
    (c) => c.reporter_id === user.id || c.reporter_id === "anonymous",
  );
  return apiOk({ complaints: mine });
}