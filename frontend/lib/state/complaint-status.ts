/**
 * Complaint state machine.
 *
 * SUBMITTED -> AI_VERIFIED -> ACKNOWLEDGED -> ASSIGNED -> IN_PROGRESS
 *   -> RESOLUTION_EVIDENCE_REQUIRED -> RESOLUTION_SUBMITTED
 *   -> AI_RESOLUTION_REVIEW -> PUBLIC_REVIEW -> RESOLVED
 *
 * Alternative path from PUBLIC_REVIEW:
 *   -> DISPUTED -> REOPENED -> ASSIGNED / IN_PROGRESS
 *
 * The backend MUST reject invalid transitions. There is NO direct
 * "SUBMITTED -> RESOLVED" shortcut.
 */

export const COMPLAINT_STATUSES = [
  "SUBMITTED",
  "AI_VERIFIED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLUTION_EVIDENCE_REQUIRED",
  "RESOLUTION_SUBMITTED",
  "AI_RESOLUTION_REVIEW",
  "PUBLIC_REVIEW",
  "RESOLVED",
  "DISPUTED",
  "REOPENED",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  SUBMITTED: ["AI_VERIFIED"],
  AI_VERIFIED: ["ACKNOWLEDGED"],
  ACKNOWLEDGED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLUTION_EVIDENCE_REQUIRED"],
  RESOLUTION_EVIDENCE_REQUIRED: ["RESOLUTION_SUBMITTED"],
  RESOLUTION_SUBMITTED: ["AI_RESOLUTION_REVIEW"],
  AI_RESOLUTION_REVIEW: ["PUBLIC_REVIEW"],
  PUBLIC_REVIEW: ["RESOLVED", "DISPUTED"],
  RESOLVED: [],
  DISPUTED: ["REOPENED"],
  REOPENED: ["ASSIGNED", "IN_PROGRESS"],
};

/** States still considered actively unresolved (not terminal). */
export const ACTIVE_STATUSES: ComplaintStatus[] = [
  "SUBMITTED",
  "AI_VERIFIED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLUTION_EVIDENCE_REQUIRED",
  "RESOLUTION_SUBMITTED",
  "AI_RESOLUTION_REVIEW",
  "PUBLIC_REVIEW",
  "DISPUTED",
  "REOPENED",
];

export function canTransition(
  from: ComplaintStatus,
  to: ComplaintStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminal(status: ComplaintStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}

/** Human-friendly label used across the UI. */
export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: "Submitted",
  AI_VERIFIED: "AI Verified",
  ACKNOWLEDGED: "Acknowledged",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLUTION_EVIDENCE_REQUIRED: "Evidence Required",
  RESOLUTION_SUBMITTED: "Resolution Submitted",
  AI_RESOLUTION_REVIEW: "AI Review",
  PUBLIC_REVIEW: "Public Review",
  RESOLVED: "Resolved",
  DISPUTED: "Disputed",
  REOPENED: "Reopened",
};

/** Short badge label. */
export const STATUS_BADGE_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: "Submitted",
  AI_VERIFIED: "AI Verified",
  ACKNOWLEDGED: "Acknowledged",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLUTION_EVIDENCE_REQUIRED: "Evidence Required",
  RESOLUTION_SUBMITTED: "Resolution Submitted",
  AI_RESOLUTION_REVIEW: "AI Review",
  PUBLIC_REVIEW: "Awaiting Review",
  RESOLVED: "Resolved",
  DISPUTED: "Disputed",
  REOPENED: "Reopened",
};

/** Tailwind badge accent per status for UI consistency. */
export const STATUS_TONES: Record<ComplaintStatus, string> = {
  SUBMITTED: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  AI_VERIFIED: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  ACKNOWLEDGED: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  ASSIGNED: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  IN_PROGRESS: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  RESOLUTION_EVIDENCE_REQUIRED: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  RESOLUTION_SUBMITTED: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  AI_RESOLUTION_REVIEW: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  PUBLIC_REVIEW: "bg-lime-500/15 text-lime-300 border-lime-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  DISPUTED: "bg-red-500/15 text-red-300 border-red-500/30",
  REOPENED: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

/** Events recorded on the audit timeline. */
export const EVENT_TYPES = [
  "COMPLAINT_SUBMITTED",
  "AI_EVIDENCE_VERIFIED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "WORK_STARTED",
  "RESOLUTION_EVIDENCE_REQUIRED",
  "RESOLUTION_SUBMITTED",
  "AI_RESOLUTION_REVIEWED",
  "PUBLIC_REVIEW",
  "RESOLVED",
  "DISPUTED",
  "REOPENED",
  "BLOCKCHAIN_ANCHORED",
  "SUPPORTED",
  "NOTE",
] as const;

export type ComplaintEventType = (typeof EVENT_TYPES)[number];

export const EVENT_LABELS: Record<ComplaintEventType, string> = {
  COMPLAINT_SUBMITTED: "Complaint submitted",
  AI_EVIDENCE_VERIFIED: "AI evidence verified",
  ACKNOWLEDGED: "Acknowledged",
  ASSIGNED: "Assigned",
  WORK_STARTED: "Work started",
  RESOLUTION_EVIDENCE_REQUIRED: "Resolution evidence required",
  RESOLUTION_SUBMITTED: "Resolution evidence submitted",
  AI_RESOLUTION_REVIEWED: "AI resolution reviewed",
  PUBLIC_REVIEW: "Opened for public review",
  RESOLVED: "Citizen approved — resolved",
  DISPUTED: "Citizen disputed resolution",
  REOPENED: "Reopened",
  BLOCKCHAIN_ANCHORED: "Blockchain proof recorded",
  SUPPORTED: "Community support increased",
  NOTE: "Note",
};