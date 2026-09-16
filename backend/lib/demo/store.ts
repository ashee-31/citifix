import type {
  Complaint,
  ComplaintEvent,
  AiEvidenceReview,
  BlockchainProof,
  Notification,
} from "@/lib/types";
import {
  DEMO_COMPLAINTS,
  demoEvents,
  demoAiReview,
  demoBlockchainProof,
  demoNotifications,
  nextDemoSequence,
} from "@/lib/demo/seed";
import { demoHash } from "@/lib/chain/hash";
import { recalcPriority } from "@/lib/priority/engine";

function complaintId(year: number, sequence: number): string {
  return `CP-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Demo repository — in-memory store with the same shape as the Supabase
 * repository. Used when no Supabase env vars are configured, so the full
 * journey (report -> track -> verify -> tamper demo) works in DEMO MODE.
 *
 * Mutations persist for the lifetime of the server process. On Render this
 * is per-instance; that is acceptable for a hackathon demo, and the real
 * repository with Supabase is used as soon as credentials are provided.
 */

class DemoStore {
  private complaints: Map<string, Complaint> = new Map();
  private events: Map<string, ComplaintEvent[]> = new Map();
  private aiReviews: Map<string, AiEvidenceReview> = new Map();
  private proofs: Map<string, BlockchainProof> = new Map();
  private notifications: Map<string, Notification[]> = new Map();
  private supports: Map<string, Set<string>> = new Map();
  // Seeded support counts act as an anonymous baseline. Live supporters
  // (real user ids) add on top of it, so counts never drop after support().
  private supportBaseline: Map<string, number> = new Map();
  private seq = nextDemoSequence();

  constructor() {
    for (const c of DEMO_COMPLAINTS) {
      this.complaints.set(c.id, c);
      this.events.set(c.id, demoEvents(c));
      this.aiReviews.set(c.id, demoAiReview(c));
      this.proofs.set(c.id, demoBlockchainProof(c));
      this.supportBaseline.set(c.id, c.support_count);
    }
  }

  listComplaints(options?: {
      status?: string;
      category?: string;
      q?: string;
      limit?: number;
    }): Complaint[] {
      let list = [...this.complaints.values()].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      if (options?.status) {
        list = list.filter((c) => c.status === options.status);
      }
      if (options?.category) {
        list = list.filter((c) => c.category === options.category);
      }
      if (options?.q) {
        const term = options.q.toLowerCase();
        list = list.filter(
          (c) =>
            c.description.toLowerCase().includes(term) ||
            c.location_label.toLowerCase().includes(term) ||
            c.complaint_number.toLowerCase().includes(term),
        );
      }
      if (options?.limit) {
        list = list.slice(0, options.limit);
      }
      return list;
    }

  getComplaint(idOrNumber: string): Complaint | null {
    return (
      this.complaints.get(idOrNumber) ??
      [...this.complaints.values()].find((c) => c.complaint_number === idOrNumber) ??
      null
    );
  }

  createComplaint(input: {
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
  }): Complaint {
    const year = new Date().getFullYear();
    const number = complaintId(year, this.seq++);
    const nowIso = new Date().toISOString();
    const c: Complaint = {
      id: `demo-${number.toLowerCase().replace(/-/g, "")}`,
      complaint_number: number,
      reporter_id: "demo-reporter",
      category: input.category,
      description: input.description,
      location_label: input.locationLabel,
      latitude: input.latitude,
      longitude: input.longitude,
      status: "SUBMITTED",
      priority: "LOW",
      priority_score: 0,
      ai_severity: input.aiSeverity,
      ai_severity_score: input.aiSeverityScore,
      safety_risk: input.safetyRisk,
      safety_risk_score: input.safetyRiskScore,
      evidence_quality: input.evidenceQuality,
      ai_summary: input.aiSummary,
      evidence_url: input.evidenceUrl ?? null,
      resolution_evidence_url: null,
      resolution_note: null,
      support_count: 0,
      depth_impact: input.depthImpact ?? 500,
      overdue: false,
      report_count: 1,
      created_at: nowIso,
      updated_at: nowIso,
      resolved_at: null,
      reopen_count: 0,
      dispute_count: 0,
    };
    this.complaints.set(c.id, c);
    this.events.set(c.id, [
      {
        id: `${c.id}-evt-0`,
        complaint_id: c.id,
        type: "COMPLAINT_SUBMITTED",
        title: "Complaint submitted",
        actor_role: "citizen",
        description: c.description,
        entity_ref: null,
        created_at: nowIso,
      },
    ]);
    this.aiReviews.set(c.id, {
      id: `${c.id}-ai-review`,
      complaint_id: c.id,
      category: c.category,
      severity: c.ai_severity,
      severity_score: c.ai_severity_score,
      safety_risk: c.safety_risk,
      safety_risk_score: c.safety_risk_score,
      evidence_quality: c.evidence_quality,
      summary: c.ai_summary,
      duplicate_likelihood: 0.08,
      manipulation_indicators: [],
      analysis_version: "citi-vision-2.1",
      created_at: nowIso,
    });
    return c;
  }

  updateComplaint(id: string, patch: Partial<Complaint>): Complaint | null {
    const c = this.complaints.get(id);
    if (!c) return null;
    const updated = { ...c, ...patch, updated_at: new Date().toISOString() };
    this.complaints.set(id, updated);
    return updated;
  }

  addEvent(complaintId: string, event: Omit<ComplaintEvent, "id" | "complaint_id" | "created_at">): ComplaintEvent {
    const c = this.complaints.get(complaintId);
    if (!c) throw new Error("Complaint not found");
    const full: ComplaintEvent = {
      ...event,
      id: `${complaintId}-evt-${Date.now()}`,
      complaint_id: complaintId,
      created_at: new Date().toISOString(),
    };
    this.events.set(complaintId, [...(this.events.get(complaintId) ?? []), full]);
    return full;
  }

  eventsFor(complaintId: string): ComplaintEvent[] {
    return this.events.get(complaintId) ?? [];
  }

  aiReviewFor(complaintId: string): AiEvidenceReview | null {
    return this.aiReviews.get(complaintId) ?? null;
  }

  proofFor(complaintId: string): BlockchainProof | null {
    return this.proofs.get(complaintId) ?? null;
  }

  anchorProof(
    complaintId: string,
    proof: Omit<BlockchainProof, "id" | "complaint_id" | "anchored_at">,
  ): BlockchainProof {
    const c = this.complaints.get(complaintId);
    if (!c) throw new Error("Complaint not found");
    const full: BlockchainProof = {
      ...proof,
      id: `${complaintId}-proof`,
      complaint_id: complaintId,
      anchored_at: new Date().toISOString(),
    };
    this.proofs.set(complaintId, full);
    this.addEvent(complaintId, {
      type: "BLOCKCHAIN_ANCHORED",
      title: "Blockchain proof recorded",
      actor_role: "system",
      description: null,
      entity_ref: full.transaction_hash,
    });
    return full;
  }

  supportCount(complaintId: string): number {
      const live = this.supports.get(complaintId)?.size ?? 0;
      const baseline = this.supportBaseline.get(complaintId) ?? 0;
      return baseline + live;
    }

    hasSupported(complaintId: string, userId: string): boolean {
      return this.supports.get(complaintId)?.has(userId) ?? false;
    }

    support(complaintId: string, userId: string): { ok: boolean; count: number } {
      if (this.hasSupported(complaintId, userId)) {
        return { ok: false, count: this.supportCount(complaintId) };
      }
      const set = this.supports.get(complaintId) ?? new Set<string>();
      set.add(userId);
      this.supports.set(complaintId, set);
      const count = this.supportCount(complaintId);
      const c = this.complaints.get(complaintId);
      if (c) {
        const updated: Complaint = { ...c, support_count: count };
        const { priority, priorityScore } = recalcPriority(updated);
        updated.priority = priority;
        updated.priority_score = priorityScore;
        this.complaints.set(complaintId, updated);
      }
      return { ok: true, count };
    }

  notificationsFor(userId: string): Notification[] {
    // Merge persisted notifications with seed data (seed acts as baseline)
    const persisted = this.notifications.get(userId) ?? [];
    const seed = demoNotifications(userId);
    // Dedupe by id — persisted wins (may have read=true)
    const byId = new Map<string, Notification>();
    for (const n of seed) byId.set(n.id, n);
    for (const n of persisted) byId.set(n.id, n);
    return [...byId.values()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  createNotification(
    userId: string,
    input: { title: string; body: string; href?: string | null },
  ): Notification {
    const n: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: userId,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      read: false,
      created_at: new Date().toISOString(),
    };
    const existing = this.notifications.get(userId) ?? [];
    this.notifications.set(userId, [n, ...existing]);
    return n;
  }

  markNotificationRead(userId: string, id: string): void {
    const list = this.notificationsFor(userId);
    this.notifications.set(
      userId,
      list.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  /** Tamper a complaint's description (for the demo). */
    tamper(complaintId: string, newDescription: string): Complaint | null {
      const c = this.complaints.get(complaintId);
      if (!c) return null;
      // Deliberately do NOT update created_at or complaint_number — only the
      // description. Re-hashing must detect the change.
      const updated = { ...c, description: newDescription, updated_at: new Date().toISOString() };
      this.complaints.set(complaintId, updated);
      return updated;
    }
  }

  export const demoStore = new DemoStore();
