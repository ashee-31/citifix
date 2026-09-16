import { hasSupabase } from "@/lib/demo/mode";
import { demoStore } from "@/lib/demo/store";
import { createAdminClient } from "@/lib/supabase/server";
import type {
  Complaint,
  ComplaintEvent,
  AiEvidenceReview,
  BlockchainProof,
  Notification,
  ResolutionEvidence,
  ResolutionReview,
} from "@/lib/types";
import { computeRecordHash } from "@/lib/chain/hash";
import { registerProof } from "@/lib/blockchain/service";
import { recalcPriority } from "@/lib/priority/engine";

/**
 * Unified data repository. In DEMO MODE it uses the in-memory demo store;
 * with Supabase configured it uses the real PostgreSQL backend.
 *
 * Server-only module (imports the service-role client). Never import from
 * client components.
 */

export interface CreateComplaintInput {
  description: string;
  category: Complaint["category"];
  locationLabel: string;
  latitude: number;
  longitude: number;
  aiSeverity: string;
  aiSeverityScore: number;
  safetyRisk: string;
  safetyRiskScore: number;
  evidenceQuality: number;
  aiSummary: string;
  depthImpact?: number;
  evidenceUrl?: string | null;
  photoHash?: string | null;
  reporterId?: string;
}

export async function createComplaint(input: CreateComplaintInput): Promise<Complaint> {
  if (!hasSupabase()) {
    return demoStore.createComplaint(input);
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("complaints")
    .insert({
      reporter_id: input.reporterId ?? "anonymous",
      category: input.category,
      description: input.description,
      location_label: input.locationLabel,
      latitude: input.latitude,
      longitude: input.longitude,
      status: "SUBMITTED",
      ai_severity: input.aiSeverity,
      ai_severity_score: input.aiSeverityScore,
      safety_risk: input.safetyRisk,
      safety_risk_score: input.safetyRiskScore,
      evidence_quality: input.evidenceQuality,
      ai_summary: input.aiSummary,
      evidence_url: input.evidenceUrl ?? null,
      depth_impact: input.depthImpact ?? 500,
      report_count: 1,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create complaint: ${error.message}`);
  return data as Complaint;
}

export async function anchorComplaintProof(
  complaint: Complaint,
  photoHash: string | null,
): Promise<BlockchainProof> {
  if (!hasSupabase()) {
    const recordHash = (await computeRecordHash({
      complaintNumber: complaint.complaint_number,
      description: complaint.description,
      photoHash,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      createdAt: complaint.created_at,
      category: complaint.category,
    }));
    return demoStore.anchorProof(complaint.id, {
      chain: "polygon-amoy-demo",
      contract_address: "0x000000000000000000000000000000000000d3m0",
      transaction_hash: "0x" + "demo".repeat(16),
      record_hash: recordHash,
      block_number: Math.floor(Date.now() / 1000) % 9_000_000 + 4_100_000,
      data_uri: `ipfs://citifix-demo/${complaint.complaint_number}`,
    });
  }

  const admin = createAdminClient();
  const recordHash = await computeRecordHash({
    complaintNumber: complaint.complaint_number,
    description: complaint.description,
    photoHash,
    latitude: complaint.latitude,
    longitude: complaint.longitude,
      createdAt: complaint.created_at,
      category: complaint.category,
  });
  const proof = await registerProof(
    {
      complaintNumber: complaint.complaint_number,
      description: complaint.description,
      photoHash,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      createdAt: complaint.created_at,
    },
    `ipfs://citifix/${complaint.complaint_number}`,
  );

  const { data, error } = await admin
    .from("blockchain_proofs")
    .insert({
      complaint_id: complaint.id,
      chain: process.env.BLOCKCHAIN_CHAIN_ID ?? "80002",
      contract_address: process.env.BLOCKCHAIN_CONTRACT_ADDRESS ?? "",
      transaction_hash: proof.transactionHash,
      record_hash: recordHash,
      block_number: proof.blockNumber,
      data_uri: proof.dataUri,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to anchor proof: ${error.message}`);
  return data as BlockchainProof;
}

export async function listComplaints(options?: {
  status?: string;
  category?: string;
  q?: string;
  limit?: number;
}): Promise<Complaint[]> {
  if (!hasSupabase()) return demoStore.listComplaints(options);
  const admin = createAdminClient();
  let query = admin.from("complaints").select("*").order("created_at", { ascending: false });
  if (options?.status) query = query.eq("status", options.status);
  if (options?.category) query = query.eq("category", options.category);
  if (options?.q) {
    const term = `%${options.q}%`;
    query = query.or(`description.ilike.${term},location_label.ilike.${term},complaint_number.ilike.${term}`);
  }
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to list complaints: ${error.message}`);
  return (data ?? []) as Complaint[];
}

export async function getComplaint(idOrNumber: string): Promise<Complaint | null> {
  if (!hasSupabase()) return demoStore.getComplaint(idOrNumber);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("complaints")
    .select("*")
    .or(`id.eq.${idOrNumber},complaint_number.eq.${idOrNumber}`)
    .maybeSingle();
  if (error) throw new Error(`Failed to get complaint: ${error.message}`);
  return (data ?? null) as Complaint | null;
}

export async function updateComplaint(id: string, patch: Partial<Complaint>): Promise<Complaint | null> {
  if (!hasSupabase()) return demoStore.updateComplaint(id, patch);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("complaints")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update complaint: ${error.message}`);
  return (data ?? null) as Complaint | null;
}

export async function addEvent(
  complaintId: string,
  event: Omit<ComplaintEvent, "id" | "complaint_id" | "created_at">,
): Promise<ComplaintEvent> {
  if (!hasSupabase()) return demoStore.addEvent(complaintId, event);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("complaint_events")
    .insert({ ...event, complaint_id: complaintId })
    .select()
    .single();
  if (error) throw new Error(`Failed to add event: ${error.message}`);
  return data as ComplaintEvent;
}

export async function eventsFor(complaintId: string): Promise<ComplaintEvent[]> {
  if (!hasSupabase()) return demoStore.eventsFor(complaintId);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("complaint_events")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to list events: ${error.message}`);
  return (data ?? []) as ComplaintEvent[];
}

export async function aiReviewFor(complaintId: string): Promise<AiEvidenceReview | null> {
  if (!hasSupabase()) return demoStore.aiReviewFor(complaintId);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ai_evidence_reviews")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to get AI review: ${error.message}`);
  return (data ?? null) as AiEvidenceReview | null;
}

export async function proofFor(complaintId: string): Promise<BlockchainProof | null> {
  if (!hasSupabase()) return demoStore.proofFor(complaintId);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blockchain_proofs")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("anchored_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to get proof: ${error.message}`);
  return (data ?? null) as BlockchainProof | null;
}

export async function supportCount(complaintId: string): Promise<number> {
  if (!hasSupabase()) return demoStore.supportCount(complaintId);
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("complaint_support")
    .select("id", { count: "exact", head: true })
    .eq("complaint_id", complaintId);
  if (error) throw new Error(`Failed to count support: ${error.message}`);
  return count ?? 0;
}

export async function hasSupported(complaintId: string, userId: string): Promise<boolean> {
  if (!hasSupabase()) return demoStore.hasSupported(complaintId, userId);
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("complaint_support")
    .select("id", { count: "exact", head: true })
    .eq("complaint_id", complaintId)
    .eq("supporter_id", userId);
  if (error) throw new Error(`Failed to check support: ${error.message}`);
  return (count ?? 0) > 0;
}

export async function support(complaintId: string, userId: string): Promise<{ ok: boolean; count: number }> {
  if (!hasSupabase()) return demoStore.support(complaintId, userId);
  const already = await hasSupported(complaintId, userId);
  if (already) return { ok: false, count: await supportCount(complaintId) };
  const admin = createAdminClient();
  const { error } = await admin
    .from("complaint_support")
    .insert({ complaint_id: complaintId, supporter_id: userId });
  if (error) throw new Error(`Failed to support: ${error.message}`);

  const { count } = await admin
    .from("complaint_support")
    .select("id", { count: "exact", head: true })
    .eq("complaint_id", complaintId);
  const patch: Record<string, unknown> = { support_count: count ?? 0 };
    // Recalculate priority via the existing engine — support is already
    // weighted there, so this just reflects the new support count.
    const complaint = await getComplaint(complaintId);
    if (complaint) {
      try {
        const { priority, priorityScore } = recalcPriority({
          ...complaint,
          support_count: count ?? 0,
        });
        patch.priority = priority;
        patch.priority_score = priorityScore;
      } catch {
        // Priority recalc must never fail the support action.
      }
    }
  await admin.from("complaints").update(patch).eq("id", complaintId);
  return { ok: true, count: count ?? 0 };
}

export async function notificationsFor(userId: string): Promise<Notification[]> {
  if (!hasSupabase()) return demoStore.notificationsFor(userId);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(`Failed to get notifications: ${error.message}`);
  return (data ?? []) as Notification[];
}

export async function markNotificationRead(userId: string, id: string): Promise<void> {
  if (!hasSupabase()) {
    demoStore.markNotificationRead(userId, id);
    return;
  }
  const admin = createAdminClient();
  await admin.from("notifications").update({ read: true }).eq("id", id).eq("user_id", userId);
}

export async function createNotification(
  userId: string,
  input: { title: string; body: string; href?: string | null },
): Promise<Notification> {
  if (!hasSupabase()) {
    return demoStore.createNotification(userId, input);
  }
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: userId,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      read: false,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create notification: ${error.message}`);
  return data as Notification;
}

/** Public presentation of a complaint — strips every identity field. */
export function toPublicComplaint(c: Complaint): Omit<Complaint, "reporter_id"> {
  const { reporter_id: _reporterId, ...rest } = c;
  return rest;
}

/** Append, never replace, authority resolution evidence. */
export async function createResolutionEvidence(input: Omit<ResolutionEvidence, "id" | "created_at">): Promise<ResolutionEvidence> {
  if (!hasSupabase()) {
    // Demo data is process-local; the complaint retains the latest public presentation
    // while the audit event below preserves the historical workflow.
    return {
      ...input,
      id: `demo-resolution-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
  }
  const admin = createAdminClient();
  const { data, error } = await admin.from("resolution_evidence").insert(input).select().single();
  if (error) throw new Error(`Failed to save resolution evidence: ${error.message}`);
  return data as ResolutionEvidence;
}

export async function resolutionEvidenceFor(complaintId: string): Promise<ResolutionEvidence[]> {
  if (!hasSupabase()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin.from("resolution_evidence").select("*").eq("complaint_id", complaintId).order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to list resolution evidence: ${error.message}`);
  return (data ?? []) as ResolutionEvidence[];
}

export async function createResolutionReview(input: Omit<ResolutionReview, "id" | "created_at">): Promise<ResolutionReview | null> {
  if (!hasSupabase()) return { ...input, id: `demo-review-${input.reviewer_id}-${input.complaint_id}`, created_at: new Date().toISOString() };
  const admin = createAdminClient();
  const { data, error } = await admin.from("resolution_reviews").insert(input).select().single();
  if (error?.code === "23505") return null;
  if (error) throw new Error(`Failed to save resolution review: ${error.message}`);
  return data as ResolutionReview;
}

export async function authorityUserIds(): Promise<string[]> {
  if (!hasSupabase()) return [];
  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("id").in("role", ["authority", "admin"]);
  if (error) throw new Error(`Failed to list authority recipients: ${error.message}`);
  return (data ?? []).map((row) => String(row.id));
}
