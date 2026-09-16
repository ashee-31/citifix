import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api/helpers";
import { markNotificationRead } from "@/lib/repo";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * PATCH /api/my-citi/notifications/[id] — mark a notification as read.
 *
 * DEMO MODE — marks the notification read for the demo citizen.
 *
 * REAL MODE — the access token is verified server-side and the update is
 * scoped to that user only (RLS plus explicit user_id filter).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return apiError("Notification id is required", 400);

  if (isDemoMode()) {
    await markNotificationRead("demo-reporter", id);
    return apiOk({ ok: true });
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

  await markNotificationRead(user.id, id);
  return apiOk({ ok: true });
}