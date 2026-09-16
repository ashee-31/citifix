import type { Complaint, PriorityBreakdown } from "@/lib/types";

export const PRIORITY_LEVELS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

/**
 * Deterministic priority engine.
 *
 * Priority considers: AI severity, safety risk, age, community support,
 * affected population, repeated reports, disputes and reopens.
 *
 * The logic is centralized here, is pure (no side effects), and produces an
 * identical score for identical input — which makes it testable and
 * explainable. Every complaint can display WHY it has its priority.
 */
const WEIGHTS = {
  severity: 30,
  safety: 25,
  age: 15,
  support: 12,
  affected: 10,
  repeat: 5,
  dispute: 3,
} as const;

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function scoreFromSeverity(severity: string): number {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return 100;
    case "HIGH":
      return 75;
    case "MEDIUM":
      return 50;
    case "LOW":
      return 25;
    default:
      return 50;
  }
}

export function levelFromScore(score: number): PriorityLevel {
  if (score >= 70) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

/**
 * Compute the priority breakdown for a complaint.
 * Every input contributes a bounded 0-100 score, weighted and summed.
 */
export function computePriority(
  c: Pick<
    Complaint,
    | "ai_severity"
    | "safety_risk"
    | "priority_score"
    | "created_at"
    | "support_count"
    | "depth_impact"
    | "report_count"
    | "reopen_count"
    | "dispute_count"
  >,
): PriorityBreakdown {
  const severityScore = scoreFromSeverity(c.ai_severity);
  const safetyScore = scoreFromSeverity(c.safety_risk);
  const ageScore = ageFactor(c.created_at);
  const supportScore = clamp(Math.round((c.support_count / 50) * 100));
  const affectedScore = clamp(Math.round((c.depth_impact / 10000) * 100));
  const repeatScore = clamp(Math.round(c.report_count * 10));
  const disputeScore = clamp(
    Math.round((c.dispute_count + c.reopen_count) * 25),
  );

  const total = clamp(
    Math.round(
      severityScore * WEIGHTS.severity +
        safetyScore * WEIGHTS.safety +
        ageScore * WEIGHTS.age +
        supportScore * WEIGHTS.support +
        affectedScore * WEIGHTS.affected +
        repeatScore * WEIGHTS.repeat +
        disputeScore * WEIGHTS.dispute,
    ) / 100,
  );

  return {
    severityScore,
    safetyScore,
    ageScore,
    supportScore,
    affectedScore,
    repeatScore,
    disputeScore,
    total,
    level: levelFromScore(total),
  };
}

/** 0-100: fresh = 0, older = higher urgency (max ~60 days). */
function ageFactor(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  const days = (Date.now() - created) / 86_400_000;
  return clamp(Math.round((days / 60) * 100));
}

/** Recompute and return the authoritative priority values for a complaint. */
export function recalcPriority(c: Complaint): {
  priority: PriorityLevel;
  priorityScore: number;
  breakdown: PriorityBreakdown;
} {
  const breakdown = computePriority(c);
  return {
    priority: breakdown.level,
    priorityScore: breakdown.total,
    breakdown,
  };
}

/** Human-readable reasons list for the UI ("WHY is this priority?"). */
export function priorityReasons(b: PriorityBreakdown): string[] {
  const reasons: string[] = [];
  if (b.severityScore >= 75) reasons.push("AI severity is high");
  if (b.safetyScore >= 75) reasons.push("Significant safety risk");
  if (b.ageScore >= 50) reasons.push("Long-standing issue (older than 30 days)");
  if (b.supportScore >= 40) reasons.push("Strong community support");
  if (b.affectedScore >= 40) reasons.push("Large affected population");
  if (b.repeatScore > 0) reasons.push("Multiple repeated reports");
  if (b.disputeScore > 0) reasons.push("Previously disputed or reopened");
  if (reasons.length === 0) reasons.push("Routine citi issue");
  return reasons;
}