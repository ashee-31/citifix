import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api/helpers";
import { getComplaint, eventsFor, aiReviewFor, proofFor, resolutionEvidenceFor, supportCount } from "@/lib/repo";
import { toPublicComplaint } from "@/lib/repo";

export const runtime = "nodejs";

/** GET /api/complaints/[id] — full public dossier for one complaint. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) return apiError("Complaint not found", 404);

  const [events, review, proof, resolutionEvidence, support] = await Promise.all([
    eventsFor(complaint.id),
    aiReviewFor(complaint.id),
    proofFor(complaint.id),
    resolutionEvidenceFor(complaint.id),
    supportCount(complaint.id),
  ]);

  return apiOk({
    complaint: toPublicComplaint(complaint),
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      actor_role: e.actor_role,
      description: e.description,
      entity_ref: e.entity_ref,
      created_at: e.created_at,
    })),
    aiReview: review,
    proof,
    resolutionEvidence: resolutionEvidence.map(({ submitted_by: _submittedBy, ...evidence }) => evidence),
    supportCount: support,
  });
}
