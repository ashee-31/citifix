import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { getComplaint } from "@/lib/repo";
import { anchorComplaintProof } from "@/lib/repo";
import { toPublicComplaint } from "@/lib/repo";

export const runtime = "nodejs";

/**
 * POST /api/blockchain/register — anchor a complaint to the chain.
 * Body: { complaintId: string }
 * In demo mode this simulates anchoring; with env vars it writes on-chain.
 */
export async function POST(req: NextRequest) {
  const body = await parseBody<{ complaintId?: string }>(req);
  const complaintId = body?.complaintId?.trim();
  if (!complaintId) return apiError("complaintId is required", 400);

  const complaint = await getComplaint(complaintId);
  if (!complaint) return apiError("Complaint not found", 404);

  const proof = await anchorComplaintProof(complaint, null);
  return apiOk({
    proof,
    complaint: toPublicComplaint(complaint),
  }, 201);
}