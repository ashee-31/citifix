import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { getComplaint, proofFor } from "@/lib/repo";
import { verifyRecordHash } from "@/lib/chain/hash";
import { hasBlockchain } from "@/lib/demo/mode";
import { verifyOnChain } from "@/lib/blockchain/service";
import type { Complaint } from "@/lib/types";

export const runtime = "nodejs";

/** A record is VERIFIED only after canonical-hash and live-chain checks pass. */
export async function POST(request: NextRequest) {
  const body = await parseBody<{ complaintId?: string }>(request);
  const complaintId = body?.complaintId?.trim();
  if (!complaintId) return apiError("complaintId is required", 400);
  const complaint = await getComplaint(complaintId);
  if (!complaint) return apiError("Complaint not found", 404);
  const proof = await proofFor(complaint.id);
  if (!proof) return apiOk({ state: "NOT_AVAILABLE", verified: false, matches: null, message: "No blockchain proof is available for this complaint." });
  const matches = await verifyRecordHash(canonicalInput(complaint), proof.record_hash);
  if (!matches) return apiOk({ state: "FAILED", verified: false, matches: false, message: "VERIFICATION FAILED: the current canonical record differs from the anchored proof." });
  if (!hasBlockchain()) return apiOk({ state: "NOT_AVAILABLE", verified: false, matches: true, message: "Demo/local hash matches, but no live-chain confirmation is available." });
  const onChain = await verifyOnChain(proof.record_hash, complaint.complaint_number);
  const verified = onChain.exists && onChain.matches;
  return apiOk({ state: verified ? "CONFIRMED" : onChain.exists ? "FAILED" : "PENDING", verified, matches: verified, onChainHash: onChain.onChainHash, message: verified ? "VERIFIED: canonical record and confirmed on-chain proof match." : onChain.exists ? "VERIFICATION FAILED: on-chain proof does not match." : "Blockchain anchoring is pending." });
}

function canonicalInput(c: Complaint) {
  return { complaintNumber: c.complaint_number, description: c.description, photoHash: null, latitude: c.latitude, longitude: c.longitude, createdAt: c.created_at, category: c.category };
}
