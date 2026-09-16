import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { addEvent, getComplaint, toPublicComplaint, updateComplaint } from "@/lib/repo";
import { isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";
import { canTransition, type ComplaintStatus } from "@/lib/state/complaint-status";

const operations = {
  acknowledge: { status: "ACKNOWLEDGED", type: "ACKNOWLEDGED", title: "Acknowledged" },
  assign: { status: "ASSIGNED", type: "ASSIGNED", title: "Assigned for operational work" },
  start: { status: "IN_PROGRESS", type: "WORK_STARTED", title: "Work started" },
  requestEvidence: { status: "RESOLUTION_EVIDENCE_REQUIRED", type: "RESOLUTION_EVIDENCE_REQUIRED", title: "Resolution evidence required" },
} as const;

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized(request))) return apiError("Authority access required", 403);
  const body = await parseBody<{ operation?: keyof typeof operations }>(request);
  const operation = body?.operation ? operations[body.operation] : null;
  if (!operation) return apiError("Unsupported operation", 400);
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) return apiError("Complaint not found", 404);
  if (!canTransition(complaint.status, operation.status as ComplaintStatus)) {
    return apiError("This operation is not permitted from the current complaint status", 409);
  }
  const updated = await updateComplaint(complaint.id, { status: operation.status as ComplaintStatus });
  if (!updated) return apiError("Complaint update failed", 500);
  await addEvent(complaint.id, { type: operation.type, title: operation.title, actor_role: "authority", description: null, entity_ref: null });
  return apiOk({ complaint: toPublicComplaint(updated) });
}
