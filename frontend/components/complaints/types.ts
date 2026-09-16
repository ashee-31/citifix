import type {
  AiEvidenceReview,
  BlockchainProof,
  ComplaintEvent,
  PublicComplaint,
  PublicResolutionEvidence,
} from "@/lib/types";

/**
 * ComplaintDetail — the full public dossier returned by
 * GET /api/complaints/[id]. Only public, privacy-safe fields.
 */
export interface ComplaintDetail {
  complaint: PublicComplaint;
  events: ComplaintEvent[];
  aiReview: AiEvidenceReview | null;
  proof: BlockchainProof | null;
  resolutionEvidence: PublicResolutionEvidence[];
  supportCount: number;
}

/** Blockchain verification state — honest, never faked. */
export type ProofState =
  | "pending"
  | "confirmed"
  | "failed"
  | "not-available";

export interface ProofVerification {
  state: ProofState;
  matches: boolean | null;
  verified: boolean;
  message: string | null;
  onChainHash: string | null;
}

const API_BASE = "/api";

/** Fetch the full public dossier for one complaint. */
export async function fetchComplaintDetail(
  id: string,
  signal?: AbortSignal,
): Promise<ComplaintDetail> {
  const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`, {
    cache: "no-store",
    signal,
  });
  if (res.status === 404) {
    throw new NotFoundError("Complaint not found.");
  }
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detail?.error ?? "Unable to load this complaint.");
  }
  return (await res.json()) as ComplaintDetail;
}

/** Class identifying a 404 so pages can render next's notFound(). */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/** POST /api/blockchain/verify — real recompute-and-compare tamper check. */
export async function verifyComplaintProof(
  complaintId: string,
  signal?: AbortSignal,
): Promise<ProofVerification> {
  try {
    const res = await fetch(`${API_BASE}/blockchain/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId }),
      cache: "no-store",
      signal,
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => null)) as { error?: string } | null;
      return {
        state: "not-available",
        matches: null,
        verified: false,
        message: detail?.error ?? "Blockchain verification is not available for this complaint.",
        onChainHash: null,
      };
    }
    const data = (await res.json()) as {
      state?: "PENDING" | "CONFIRMED" | "FAILED" | "NOT_AVAILABLE";
      matches: boolean | null;
      verified: boolean;
      message?: string;
      onChainHash?: string | null;
    };
    return {
      state: data.state === "CONFIRMED" ? "confirmed" : data.state === "FAILED" ? "failed" : data.state === "PENDING" ? "pending" : "not-available",
      matches: data.matches,
      verified: data.verified,
      message: data.message ?? null,
      onChainHash: data.onChainHash ?? null,
    };
  } catch {
    return {
      state: "not-available",
      matches: null,
      verified: false,
      message: "Blockchain verification is not available right now.",
      onChainHash: null,
    };
  }
}

/** Build the canonical public link for a complaint dossier. */
export function complaintUrl(complaintNumber: string): string {
  return `/complaints/${encodeURIComponent(complaintNumber)}`;
}
