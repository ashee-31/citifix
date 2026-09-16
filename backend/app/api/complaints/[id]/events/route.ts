import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api/helpers";
import { getComplaint, eventsFor } from "@/lib/repo";

export const runtime = "nodejs";

/** GET /api/complaints/[id]/events — audit timeline for a complaint. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) return apiError("Complaint not found", 404);
  const events = await eventsFor(complaint.id);
  return apiOk({
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      actor_role: e.actor_role,
      description: e.description,
      entity_ref: e.entity_ref,
      created_at: e.created_at,
    })),
  });
}