import type { ComplaintStatus, ComplaintEventType } from "@/lib/state/complaint-status";
import type { PriorityLevel } from "@/lib/priority/engine";

export const COMPLAINT_CATEGORIES = [
  "ROADS",
  "WASTE",
  "STREETLIGHTS",
  "WATER",
  "DRAINAGE",
  "FOOTPATH",
  "OTHER",
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  ROADS: "Roads",
  WASTE: "Waste",
  STREETLIGHTS: "Streetlights",
  WATER: "Water",
  DRAINAGE: "Drainage",
  FOOTPATH: "Footpath",
  OTHER: "Other",
};

export type Role = "citizen" | "authority" | "admin";

/** Public profile — never expose name/email/phone through public APIs. */
export interface Profile {
  id: string;
  role: Role;
  display_name: string | null;
  ward: string | null;
  created_at: string;
}

/**
 * Complaints are the heart of the system. The public APIs expose only the
 * fields in this interface; identity fields never leave the server authz layer.
 */
export interface Complaint {
  id: string; // uuid
  complaint_number: string; // CP-2026-0042
  reporter_id: string; // NOT exposed publicly — filtered server-side
  category: ComplaintCategory;
  description: string;
  location_label: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  priority: PriorityLevel;
  priority_score: number;
  ai_severity: string; // e.g. "Critical", "High", "Medium", "Low"
  ai_severity_score: number; // 0-100
  safety_risk: string; // "High", "Medium", "Low"
  safety_risk_score: number; // 0-100
  evidence_quality: number; // 0-100
  ai_summary: string;
  evidence_url: string | null;
  resolution_evidence_url: string | null;
  resolution_note: string | null;
  support_count: number;
  depth_impact: number; // affected population estimate
  overdue: boolean;
  report_count: number; // repeated reports count
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  reopen_count: number;
  dispute_count: number;
}

/** Public complaint shape — what the public APIs expose. Identity fields are stripped server-side. */
export type PublicComplaint = Omit<Complaint, "reporter_id">;

export interface ComplaintEvent {
  id: string;
  complaint_id: string;
  type: ComplaintEventType;
  title: string;
  actor_role: Role | "citizen" | "authority" | "system" | "ai";
  description: string | null;
  entity_ref: string | null; // e.g. tx hash, evidence id
  created_at: string;
}

export interface AiEvidenceReview {
  id: string;
  complaint_id: string;
  category: ComplaintCategory;
  severity: string;
  severity_score: number;
  safety_risk: string;
  safety_risk_score: number;
  evidence_quality: number;
  summary: string;
  duplicate_likelihood: number;
  manipulation_indicators: string[];
  analysis_version: string;
  created_at: string;
}

export interface ResolutionEvidence {
  id: string;
  complaint_id: string;
  submitted_by: string;
  kind: "resolved" | "disputed" | "reopened_evidence";
  description: string;
  evidence_url: string;
  ai_analysis: string | null; // JSON string of before/after review
  created_at: string;
}

/** Public evidence omits the authority account that submitted it. */
export type PublicResolutionEvidence = Omit<ResolutionEvidence, "submitted_by">;

/** An authenticated citizen's one-time response to a public resolution review. */
export interface ResolutionReview {
  id: string;
  complaint_id: string;
  reviewer_id: string; // server-only; never returned by public APIs
  decision: "approved" | "disputed";
  reason: string | null;
  evidence_url: string | null;
  created_at: string;
}

export interface BlockchainProof {
  id: string;
  complaint_id: string;
  chain: string;
  contract_address: string;
  transaction_hash: string;
  record_hash: string;
  block_number: number;
  data_uri: string;
  anchored_at: string;
}

export interface Support {
  id: string;
  complaint_id: string;
  supporter_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
}

/** Priority breakdown — the WHY behind a priority score. */
export interface PriorityBreakdown {
  severityScore: number;
  safetyScore: number;
  ageScore: number;
  supportScore: number;
  affectedScore: number;
  repeatScore: number;
  disputeScore: number;
  total: number;
  level: PriorityLevel;
}

/** AI resolution review output (before/after comparison). */
export interface AiResolutionReview {
  comparison: "improved" | "unchanged" | "worse";
  confidence: number; // 0-100
  issues_found: number;
  summary: string;
  evidence_quality: number;
}

/** AI evidence analysis output from the report flow. */
export interface AiAnalysis {
  category: ComplaintCategory;
  categoryConfidence: number;
  severity: string;
  severityScore: number;
  safetyRisk: string;
  safetyRiskScore: number;
  evidenceQuality: number;
  summary: string;
  duplicateLikelihood: number;
  manipulationIndicators: string[];
  analysisVersion: string;
}
