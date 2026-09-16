import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/api/helpers";
import { getComplaint, proofFor } from "@/lib/repo";

export const runtime = "nodejs";

/** GET /api/complaints/[id]/proof — on-chain proof for one complaint. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) return apiError("Complaint not found", 404);
  const proof = await proofFor(complaint.id);
  return apiOk({ proof });
}