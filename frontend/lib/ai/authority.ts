import type { Complaint, ComplaintCategory } from "@/lib/types";
import { COMPLAINT_CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import type { ComplaintStatus } from "@/lib/state/complaint-status";
import { ACTIVE_STATUSES } from "@/lib/state/complaint-status";
import type { PriorityLevel } from "@/lib/priority/engine";
import { computePriority, recalcPriority } from "@/lib/priority/engine";
import { isDemoMode } from "@/lib/demo/mode";

/**
 * Authority Intelligence AI — Decision Support.
 *
 * Responsibilities:
 * - Prioritise complaints (which to address first)
 * - Identify highest safety risks
 * - Forecast 30-day escalation / resolution impact
 * - Estimate per-area / per-category budget
 * - Identify biggest backlog
 * - Identify fastest-growing category
 * - Highlight disputed / reopened complaints
 * - Resource allocation recommendations
 *
 * CONSTRAINTS:
 * - Decision-support only. Never directly changes complaint statuses.
 * - Never exposes citizen identity or private data.
 * - Forecasts and budgets are estimates, not guarantees.
 * - When AI is unavailable, returns a computed (non-AI) summary.
 */

export interface AuthorityInsight {
  title: string;
  body: string;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  relatedComplaintIds: string[];
  confidence: number; // 0-100
}

export interface BudgetEstimate {
  category: string;
  label: string;
  estimatedCostINR: number;
  rangeMinINR: number;
  rangeMaxINR: number;
  complaintCount: number;
  avgSeverityScore: number;
  rationale: string;
}

export interface CategoryGrowth {
  category: string;
  label: string;
  currentCount: number;
  previousCount: number;
  growthPercent: number;
}

export interface ResourceAllocation {
  area: string;
  totalComplaints: number;
  criticalCount: number;
  highCount: number;
  avgPriority: number;
  suggestedFocus: string;
}

export interface AuthorityAiSummary {
  /** AI-generated summary text. */
  summary: string;
  /** AI provider used this call. */
  fromProvider: boolean;
  /** "unavailable" when AI could not run — UI must NOT display fake confidence. */
  analysisVersion: string;
}

export interface AuthorityAiResponse {
  summary: AuthorityAiSummary;
  insights: AuthorityInsight[];
  budget: BudgetEstimate[];
  categoryGrowth: CategoryGrowth[];
  resourceAllocation: ResourceAllocation[];
  safetyRisks: AuthorityInsight[];
  disputedReopened: Complaint[];
  escalatedCandidates: Complaint[];
  /** Computed from real complaint data. */
  totals: {
    active: number;
    resolved: number;
    disputed: number;
    reopened: number;
    overdue: number;
    avgSeverity: number;
    avgSafetyRisk: number;
    totalSupportCount: number;
    highSafetyRiskCount: number;
  };
}

// ---------------------------------------------------------------------------
// BUDGET ESTIMATION HEURISTICS (demo / non-AI fallback)
// ---------------------------------------------------------------------------

const BUDGET_BASE: Record<ComplaintCategory, number> = {
  ROADS: 85_000,
  WASTE: 12_000,
  STREETLIGHTS: 25_000,
  WATER: 95_000,
  DRAINAGE: 70_000,
  FOOTPATH: 40_000,
  OTHER: 15_000,
};

const SEVERITY_MULTIPLIER: Record<string, number> = {
  Critical: 1.6,
  High: 1.3,
  Medium: 1.0,
  Low: 0.7,
};

// ---------------------------------------------------------------------------
// DEMO / COMPUTED SUMMARY — works without AI provider
// ---------------------------------------------------------------------------

function computeComplaintStats(complaints: Complaint[]) {
  const active = complaints.filter((c) => ACTIVE_STATUSES.includes(c.status as ComplaintStatus));
  const resolved = complaints.filter((c) => c.status === "RESOLVED");
  const disputed = complaints.filter((c) => c.status === "DISPUTED");
  const reopened = complaints.filter((c) => c.status === "REOPENED");
  const overdue = complaints.filter((c) => c.overdue);

  const avgSeverity =
    complaints.length > 0
      ? Math.round(complaints.reduce((s, c) => s + c.ai_severity_score, 0) / complaints.length)
      : 0;
  const avgSafetyRisk =
    complaints.length > 0
      ? Math.round(complaints.reduce((s, c) => s + c.safety_risk_score, 0) / complaints.length)
      : 0;
  const totalSupportCount = complaints.reduce((s, c) => s + c.support_count, 0);
  const highSafetyRiskCount = complaints.filter((c) => c.safety_risk === "High" || c.safety_risk === "Critical").length;

  return {
    active: active.length,
    resolved: resolved.length,
    disputed: disputed.length,
    reopened: reopened.length,
    overdue: overdue.length,
    avgSeverity,
    avgSafetyRisk,
    totalSupportCount,
    highSafetyRiskCount,
  };
}

function buildSafetyRisks(complaints: Complaint[]): AuthorityInsight[] {
  return complaints
    .filter((c) => c.safety_risk === "High" || c.safety_risk === "Critical")
    .sort((a, b) => b.safety_risk_score - a.safety_risk_score)
    .slice(0, 5)
    .map((c) => ({
      title: `Safety risk: ${c.location_label}`,
      body: `${c.safety_risk} safety risk (${c.safety_risk_score}/100). ${c.description.slice(0, 120)}…`,
      severity: c.safety_risk === "Critical" ? ("critical" as const) : ("high" as const),
      category: c.category,
      relatedComplaintIds: [c.complaint_number],
      confidence: c.safety_risk_score,
    }));
}

function buildInsights(complaints: Complaint[]): AuthorityInsight[] {
  const insights: AuthorityInsight[] = [];
  const overdue = complaints.filter((c) => c.overdue);
  if (overdue.length > 0) {
    insights.push({
      title: `${overdue.length} overdue complaint${overdue.length > 1 ? "s" : ""} need priority review`,
      body: `These complaints have exceeded expected resolution timelines without escalation. Consider re-prioritising resource allocation.`,
      severity: "high",
      category: "OVERDUE",
      relatedComplaintIds: overdue.map((c) => c.complaint_number),
      confidence: 85,
    });
  }

  const highDispute = complaints.filter((c) => c.dispute_count > 0 || c.reopen_count > 0);
  if (highDispute.length > 0) {
    insights.push({
      title: `${highDispute.length} disputed or reopened complaint${highDispute.length > 1 ? "s" : ""}`,
      body: `Citizens questioned previous resolution evidence. These require stronger proof before re-resolution.`,
      severity: "high",
      category: "DISPUTED",
      relatedComplaintIds: highDispute.map((c) => c.complaint_number),
      confidence: 90,
    });
  }

  const highRepeat = complaints.filter((c) => c.report_count >= 2);
  if (highRepeat.length > 0) {
    insights.push({
      title: `${highRepeat.length} complaint${highRepeat.length > 1 ? "s have" : " has"} repeated reports`,
      body: `Multiple citizens reported the same or similar issues. This indicates an unresolved root cause or inadequate initial response.`,
      severity: "medium",
      category: "REPEATED",
      relatedComplaintIds: highRepeat.map((c) => c.complaint_number),
      confidence: 80,
    });
  }

  return insights;
}

function buildBudget(complaints: Complaint[]): BudgetEstimate[] {
  const categoryCounts: Record<string, { count: number; totalSeverity: number }> = {};
  for (const c of complaints) {
    if (!categoryCounts[c.category]) categoryCounts[c.category] = { count: 0, totalSeverity: 0 };
    categoryCounts[c.category].count++;
    categoryCounts[c.category].totalSeverity += c.ai_severity_score;
  }

  return Object.entries(categoryCounts)
    .map(([cat, data]) => {
      const base = BUDGET_BASE[cat as ComplaintCategory] ?? 15_000;
      const avgSeverity = data.totalSeverity / data.count;
      const sevKey = avgSeverity >= 80 ? "Critical" : avgSeverity >= 60 ? "High" : avgSeverity >= 40 ? "Medium" : "Low";
      const multiplier = SEVERITY_MULTIPLIER[sevKey] ?? 1.0;
      const estimated = Math.round(base * multiplier * data.count);
      const rangeMin = Math.round(estimated * 0.7);
      const rangeMax = Math.round(estimated * 1.5);
      return {
        category: cat,
        label: CATEGORY_LABELS[cat as ComplaintCategory] ?? cat,
        estimatedCostINR: estimated,
        rangeMinINR: rangeMin,
        rangeMaxINR: rangeMax,
        complaintCount: data.count,
        avgSeverityScore: Math.round(avgSeverity),
        rationale: `Based on ${data.count} ${CATEGORY_LABELS[cat as ComplaintCategory] ?? cat.toLowerCase()} complaints with avg severity ${Math.round(avgSeverity)}/100. Costs are AI-assisted estimates, not confirmed quotes.`,
      };
    })
    .sort((a, b) => b.estimatedCostINR - a.estimatedCostINR);
}

function buildCategoryGrowth(complaints: Complaint[]): CategoryGrowth[] {
  const now = Date.now();
  const THIRTY_DAYS = 30 * 86_400_000;
  const SIXTY_DAYS = 60 * 86_400_000;

  const recent = complaints.filter((c) => now - new Date(c.created_at).getTime() < THIRTY_DAYS);
  const previous = complaints.filter((c) => {
    const age = now - new Date(c.created_at).getTime();
    return age >= THIRTY_DAYS && age < SIXTY_DAYS;
  });

  const catRecent: Record<string, number> = {};
  const catPrevious: Record<string, number> = {};
  for (const c of recent) catRecent[c.category] = (catRecent[c.category] ?? 0) + 1;
  for (const c of previous) catPrevious[c.category] = (catPrevious[c.category] ?? 0) + 1;

  return COMPLAINT_CATEGORIES.map((cat) => {
    const curr = catRecent[cat] ?? 0;
    const prev = catPrevious[cat] ?? 1;
    const growth = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : curr > 0 ? 100 : 0;
    return {
      category: cat,
      label: CATEGORY_LABELS[cat],
      currentCount: curr,
      previousCount: prev,
      growthPercent: growth,
    };
  }).sort((a, b) => b.growthPercent - a.growthPercent);
}

function buildResourceAllocation(complaints: Complaint[]): ResourceAllocation[] {
  const areaMap: Record<string, { complaints: Complaint[]; critical: number; high: number; totalPriority: number }> = {};

  for (const c of complaints) {
    const area = c.location_label.split(",").pop()?.trim() ?? c.location_label;
    if (!areaMap[area]) areaMap[area] = { complaints: [], critical: 0, high: 0, totalPriority: 0 };
    areaMap[area].complaints.push(c);
    const { priority } = recalcPriority(c);
        if (priority === "CRITICAL") areaMap[area].critical++;
        if (priority === "HIGH" || priority === "CRITICAL") areaMap[area].high++;
    areaMap[area].totalPriority += c.priority_score;
  }

  return Object.entries(areaMap)
    .map(([area, data]) => {
      const total = data.complaints.length;
      const avgP = Math.round(data.totalPriority / total);
      let focus = "Standard maintenance";
      if (data.critical > 0) focus = `Critical safety issues (${data.critical} critical)`;
      else if (data.high > 2) focus = `Multiple high-priority cases (${data.high})`;
      else if (total > 3) focus = "High volume area — consider dedicated team";
      return {
        area,
        totalComplaints: total,
        criticalCount: data.critical,
        highCount: data.high,
        avgPriority: avgP,
        suggestedFocus: focus,
      };
    })
    .sort((a, b) => b.avgPriority - a.avgPriority);
}

function buildEscalatedCandidates(complaints: Complaint[]): Complaint[] {
  return complaints
    .filter((c) => c.support_count >= 20 && c.report_count >= 2 && ACTIVE_STATUSES.includes(c.status as ComplaintStatus))
    .sort((a, b) => b.support_count - a.support_count)
    .slice(0, 5);
}

/**
 * Generate the full authority AI response.
 * In demo mode or when AI is unavailable, returns computed (non-AI) summaries.
 * When real AI is configured, sends a structured prompt to the provider.
 */
export async function generateAuthorityInsights(
  complaints: Complaint[],
): Promise<AuthorityAiResponse> {
  const stats = computeComplaintStats(complaints);
  const safetyRisks = buildSafetyRisks(complaints);
  const insights = buildInsights(complaints);
  const budget = buildBudget(complaints);
  const categoryGrowth = buildCategoryGrowth(complaints);
  const resourceAllocation = buildResourceAllocation(complaints);
  const disputedReopened = complaints.filter(
    (c) => c.status === "DISPUTED" || c.status === "REOPENED",
  );
  const escalatedCandidates = buildEscalatedCandidates(complaints);

  // Attempt real AI summary if configured.
  if (hasRealAi() && !isDemoMode()) {
    try {
      const aiSummary = await callAuthorityAiProvider(complaints, stats);
      return {
        summary: aiSummary,
        insights,
        budget,
        categoryGrowth,
        resourceAllocation,
        safetyRisks,
        disputedReopened,
        escalatedCandidates,
        totals: stats,
      };
    } catch {
      // Fall through to computed summary
    }
  }

  return {
    summary: computeDemoSummary(complaints, stats),
    insights,
    budget,
    categoryGrowth,
    resourceAllocation,
    safetyRisks,
    disputedReopened,
    escalatedCandidates,
    totals: stats,
  };
}

function hasRealAi(): boolean {
  return Boolean(process.env.AI_PROVIDER_API_KEY && process.env.AI_MODEL);
}

// ---------------------------------------------------------------------------
// REAL AI PROVIDER CALL
// ---------------------------------------------------------------------------

const AUTHORITY_PROMPT = `You are the CitiFix Authority Intelligence AI. You receive a JSON array of citi complaints and must return ONLY a strict JSON object:
{
  "summary": "2-3 sentence overview of the current citi situation for the authority",
  "analysisVersion": "string"
}
Rules:
- You are decision support ONLY. Never suggest changing statuses or financial commitments.
- Never expose citizen names, emails, or phone numbers.
- Treat budgets and forecasts as estimates, not guarantees.
- Focus on actionable, evidence-based insights.`;

async function callAuthorityAiProvider(
  complaints: Complaint[],
  stats: ReturnType<typeof computeComplaintStats>,
): Promise<AuthorityAiSummary> {
  const apiKey = process.env.AI_PROVIDER_API_KEY!;
  const model = process.env.AI_MODEL!;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";

  // Send a privacy-safe summary of complaint data — never raw personal info.
  const safeComplaints = complaints.map((c) => ({
    number: c.complaint_number,
    category: c.category,
    status: c.status,
    severity: c.ai_severity,
    severityScore: c.ai_severity_score,
    safetyRisk: c.safety_risk,
    safetyRiskScore: c.safety_risk_score,
    priorityScore: c.priority_score,
    supportCount: c.support_count,
    daysAgo: Math.round((Date.now() - new Date(c.created_at).getTime()) / 86_400_000),
    overdue: c.overdue,
    reopened: c.reopen_count > 0,
    disputed: c.dispute_count > 0,
  }));

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: AUTHORITY_PROMPT },
        { role: "user", content: JSON.stringify({ complaints: safeComplaints, stats }) },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`AI provider error ${res.status}`);
  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("AI provider returned empty response");

  const cleaned = content.replace(/```(?:json)?/gi, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("AI output is not valid JSON");

  const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1)) as Record<string, unknown>;
  return {
    summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 1000) : "AI summary unavailable.",
    fromProvider: true,
    analysisVersion: typeof parsed.analysisVersion === "string" ? parsed.analysisVersion : "authority-ai-1.0",
  };
}

// ---------------------------------------------------------------------------
// COMPUTED (NON-AI) FALLBACK SUMMARY
// ---------------------------------------------------------------------------

function computeDemoSummary(
  complaints: Complaint[],
  stats: ReturnType<typeof computeComplaintStats>,
): AuthorityAiSummary {
  const catLabel = (cat: string) => CATEGORY_LABELS[cat as ComplaintCategory] ?? cat;

  // Find dominant category by count
  const catCounts: Record<string, number> = {};
  for (const c of complaints) catCounts[c.category] = (catCounts[c.category] ?? 0) + 1;
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  const parts: string[] = [];

  parts.push(
    `There are currently ${stats.active} active citi complaint${stats.active !== 1 ? "s" : ""} across ${Object.keys(catCounts).length} categories.`,
  );

  if (stats.highSafetyRiskCount > 0) {
    parts.push(
      `${stats.highSafetyRiskCount} complaint${stats.highSafetyRiskCount !== 1 ? "s" : ""} ${stats.highSafetyRiskCount !== 1 ? "have" : "has"} been flagged with high or critical safety risk.`,
    );
  }

  if (stats.overdue > 0) {
    parts.push(`${stats.overdue} ${stats.overdue !== 1 ? "are" : "is"} overdue and should be reviewed.`);
  }

  if (topCat) {
    parts.push(
      `${catLabel(topCat[0])} is the most reported category with ${topCat[1]} complaint${topCat[1] !== 1 ? "s" : ""}.`,
    );
  }

  if (stats.disputed + stats.reopened > 0) {
    parts.push(
      `${stats.disputed + stats.reopened} complaint${stats.disputed + stats.reopened !== 1 ? "s have" : " has"} been disputed or reopened — citizens questioned previous resolution evidence.`,
    );
  }

  parts.push("All figures are computed from complaint data. Budget and forecast values are estimates.");

  return {
    summary: parts.join(" "),
    fromProvider: false,
    analysisVersion: "authority-computed-1.0",
  };
}
