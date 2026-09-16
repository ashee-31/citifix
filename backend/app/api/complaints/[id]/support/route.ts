import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { getComplaint, support } from "@/lib/repo";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";

/**
 * POST /api/complaints/[id]/support — add community support (1 per user).
 *
 * Body: { userId: string }
 *
 * DEMO MODE — the userId is taken from the body (any string; the demo
 * citizen is "demo-reporter"), matching the demo-first architecture.
 *
 * REAL MODE — the caller must send `Authorization: Bearer <accessToken>`
 * AND a matching userId. The token is verified server-side; the userId is
 * cross-checked against the authenticated user so one citizen cannot
 * support as another.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) return apiError("Complaint not found", 404);

  const body = await parseBody<{ userId?: string }>(req);
  const userId = body?.userId?.trim();
  if (!userId) return apiError("userId is required", 400);

  // Real mode: verify the bearer token and cross-check the userId.
  if (!isDemoMode()) {
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

    if (user.id !== userId) {
      return apiError("userId does not match the authenticated user", 403);
    }
  }

  const result = await support(complaint.id, userId);
  return apiOk(result, result.ok ? 201 : 200);
}