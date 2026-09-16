import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api/helpers";
import { notificationsFor } from "@/lib/repo";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * GET /api/my-citi/notifications
 *
 * Returns the authenticated citizen's notifications.
 *
 * DEMO MODE — returns the seeded demo notifications (all belong to
 * "demo-reporter", which is the demo citizen).
 *
 * REAL MODE — the access token is verified server-side and notifications
 * are scoped to that user only.
 */
export async function GET(req: NextRequest) {
  if (isDemoMode()) {
    const notifications = await notificationsFor("demo-reporter");
    return apiOk({ notifications });
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

  const notifications = await notificationsFor(user.id);
  return apiOk({ notifications });
}