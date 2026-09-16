import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { addEvent, authorityUserIds, createNotification, createResolutionReview, getComplaint, updateComplaint } from "@/lib/repo";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";

async function citizenId(request: NextRequest): Promise<string | null> {
  if (isDemoMode()) return "demo-reporter";
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const admin = createAdminClient();
  const { data } = await admin.auth.getUser(token);
  if (!data.user) return null;
  const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return profile?.role === "citizen" ? data.user.id : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const reviewerId = await citizenId(request);
  if (!reviewerId) return apiError("Authenticated citizen access required", 403);
  const body = await parseBody<{ decision?: "approved" | "disputed"; reason?: string; evidenceUrl?: string }>(request);
  if (body?.decision !== "approved" && body?.decision !== "disputed") return apiError("A valid review decision is required", 400);
  if (body.decision === "disputed" && (!body.reason || body.reason.trim().length < 10)) return apiError("A dispute reason of at least 10 characters is required", 400);
  if (body.evidenceUrl && !/^https?:\/\//i.test(body.evidenceUrl)) return apiError("Supporting evidence must be a public HTTP(S) URL", 400);
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) return apiError("Complaint not found", 404);
  if (complaint.status !== "PUBLIC_REVIEW") return apiError("This complaint is not open for public review", 409);
  const review = await createResolutionReview({ complaint_id: complaint.id, reviewer_id: reviewerId, decision: body.decision, reason: body.reason?.trim() ?? null, evidence_url: body.evidenceUrl ?? null });
  if (!review) return apiError("You have already reviewed this resolution", 409);
  if (body.decision === "approved") {
    await updateComplaint(complaint.id, { status: "RESOLVED", resolved_at: new Date().toISOString() });
    await addEvent(complaint.id, { type: "RESOLVED", title: "Citizen approved — resolved", actor_role: "citizen", description: null, entity_ref: null });
    return apiOk({ status: "RESOLVED" });
  }
  await updateComplaint(complaint.id, { status: "DISPUTED", dispute_count: complaint.dispute_count + 1 });
  await addEvent(complaint.id, { type: "DISPUTED", title: "Citizen disputed resolution", actor_role: "citizen", description: body.reason!.trim(), entity_ref: null });
  await updateComplaint(complaint.id, { status: "REOPENED", reopen_count: complaint.reopen_count + 1 });
  await addEvent(complaint.id, { type: "REOPENED", title: "Reopened after dispute", actor_role: "system", description: "Previous resolution evidence remains in the audit trail.", entity_ref: null });
  const recipients = await authorityUserIds();
  await Promise.all(recipients.map((userId) => createNotification(userId, { title: "Resolution disputed", body: `${complaint.complaint_number} was reopened for further action.`, href: `/authority` })));
  return apiOk({ status: "REOPENED" });
}
