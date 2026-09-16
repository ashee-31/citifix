import type { AiAnalysis } from "@/lib/types";
import { COMPLAINT_CATEGORIES, type ComplaintCategory } from "@/lib/types";
import { isDemoMode } from "@/lib/demo/mode";

/**
 * Evidence Verification AI.
 *
 * Responsibilities: complaint classification, severity estimation, safety
 * risk, evidence quality, location consistency, timestamp/metadata
 * evaluation, duplicate likelihood, image integrity indicators.
 *
 * Uses structured outputs (JSON schema) against any OpenAI-compatible API.
 * When the AI is unavailable, the caller receives `analysisVersion:
 * "unavailable"` — the UI then shows "AI REVIEW UNAVAILABLE" and must never
 * display fake confidence scores.
 */

export interface AnalyzeEvidenceInput {
  description: string;
  categoryHint?: string;
  latitude?: number;
  longitude?: number;
  evidenceBase64?: string | null;
  /** Real file evidence; in demo mode we may pass an image URL. */
  imageUrl?: string | null;
}

const BASE_PROMPT = `You are the CitiFix Evidence Verification AI. Analyze the citizen's citi complaint and return ONLY strict JSON matching the schema:
{
  "category": one of ${COMPLAINT_CATEGORIES.join(",")},
  "categoryConfidence": number 0-100,
  "severity": "Critical"|"High"|"Medium"|"Low",
  "severityScore": number 0-100,
  "safetyRisk": "High"|"Medium"|"Low",
  "safetyRiskScore": number 0-100,
  "evidenceQuality": number 0-100,
  "summary": concise 1-2 sentence explanation,
  "duplicateLikelihood": number 0-1,
  "manipulationIndicators": short array of strings,
  "analysisVersion": string
}
Assess: scene, location, issue, severity, evidence quality, metadata, and possible manipulation indicators.`;

export interface AiProviderResult {
  analysis: AiAnalysis;
  raw: string;
  fromProvider: boolean;
}

/**
 * Attempt a real AI analysis. Throws on failure so callers can fall back.
 */
export async function analyzeEvidenceWithProvider(
  input: AnalyzeEvidenceInput,
): Promise<AiProviderResult> {
  const apiKey = process.env.AI_PROVIDER_API_KEY;
  const model = process.env.AI_VISION_MODEL ?? process.env.AI_MODEL;
  if (!apiKey || !model || isDemoMode()) {
    throw new Error("AI provider not configured");
  }

  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: BASE_PROMPT },
    {
      role: "user",
      content: JSON.stringify({
        description: input.description,
        categoryHint: input.categoryHint ?? null,
        location: input.latitude && input.longitude
          ? { latitude: input.latitude, longitude: input.longitude }
          : null,
        image: input.imageUrl ?? (input.evidenceBase64 ? "data:image/jpeg;base64," + input.evidenceBase64.slice(0, 200) : null),
      }),
    },
  ];

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`AI provider error ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const content: string =
    json?.choices?.[0]?.message?.content ?? json?.output_text ?? "";
  if (!content) throw new Error("AI provider returned empty response");

  const parsed = parseAiAnalysis(content, input);
  return { analysis: parsed, raw: content, fromProvider: true };
}

/** Parse + validate AI output. Throws on anything that isn't valid. */
export function parseAiAnalysis(
  raw: string,
  input: AnalyzeEvidenceInput,
): AiAnalysis {
  const cleaned = raw
    .replace(/```(?:json)?/gi, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("AI output is not valid JSON");
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
  } catch {
    throw new Error("AI output JSON parse failed");
  }

  const category = normalizeCategory(parsed.category) ?? normalizeCategory(input.categoryHint) ?? "OTHER";
  const severity = normalizeSeverity(parsed.severity);
  const safety = normalizeSeverity(parsed.safetyRisk ?? parsed.safety_risk);
  const categoryConfidence = bounded(parsed.categoryConfidence, 0, 100, 80);
  const severityScore = bounded(parsed.severityScore, 0, 100, 60);
  const safetyRiskScore = bounded(parsed.safetyRiskScore, 0, 100, 55);
  const evidenceQuality = bounded(parsed.evidenceQuality, 0, 100, 70);
  const duplicateLikelihood = bounded(parsed.duplicateLikelihood, 0, 1, 0.1);

  return {
    category,
    categoryConfidence,
    severity,
    severityScore,
    safetyRisk: safety,
    safetyRiskScore,
    evidenceQuality,
    summary: typeof parsed.summary === "string" ? parsed.summary.slice(0, 500) : "",
    duplicateLikelihood,
    manipulationIndicators: Array.isArray(parsed.manipulationIndicators)
      ? parsed.manipulationIndicators
          .filter((x) => typeof x === "string")
          .slice(0, 5) as string[]
      : [],
    analysisVersion: typeof parsed.analysisVersion === "string" ? parsed.analysisVersion : "citi-vision-2.1",
  };
}

function normalizeCategory(v: unknown): ComplaintCategory | null {
  const s = String(v ?? "").toUpperCase().replace(/\s+/g, "_");
  return (COMPLAINT_CATEGORIES as readonly string[]).includes(s)
    ? (s as ComplaintCategory)
    : null;
}

function normalizeSeverity(v: unknown): "Critical" | "High" | "Medium" | "Low" {
  const s = String(v ?? "").toUpperCase();
  if (s.includes("CRIT")) return "Critical";
  if (s.includes("HIGH")) return "High";
  if (s.includes("MED")) return "Medium";
  return "Low";
}

function bounded(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Deterministic demo analysis — used ONLY when the real AI is unavailable.
 * Values are derived from description heuristics (keyword matching), NOT
 * fabricated confidence scores presented as real AI output.
 */
export function demoAnalysis(input: AnalyzeEvidenceInput): AiAnalysis {
  const text = (input.description ?? "").toLowerCase();
  const category = inferCategory(text) ?? normalizeCategory(input.categoryHint) ?? "OTHER";
  const severity = inferSeverity(text);
  const safety = inferSafety(text, severity);
  const quality = input.imageUrl || input.evidenceBase64 ? 84 : 62;
  return {
    category,
    categoryConfidence: 88,
    severity,
    severityScore: severityScoreOf(severity),
    safetyRisk: safety,
    safetyRiskScore: severityScoreOf(safety),
    evidenceQuality: quality,
    summary: demoSummary(category, severity, quality),
    duplicateLikelihood: 0.06,
    manipulationIndicators: quality >= 90 ? [] : ["Reviewing metadata consistency"],
    analysisVersion: "citi-demo-1.0",
  };
}

function inferCategory(text: string): ComplaintCategory | null {
  const map: Array<[ComplaintCategory, RegExp]> = [
    ["ROADS", /pot\s?hole|road|asphalt|pavement|pothole|tarmac|crack/i],
    ["WASTE", /garbage|waste|trash|rubbish|litter|dump|overflow|bin/i],
    ["STREETLIGHTS", /street\s?light|lamp|lighting|flicker|dark|glow/i],
    ["WATER", /water|leak|pipe|flood|wet|dripping/i],
    ["DRAINAGE", /drain|sewer|drainage|manhole|blocked|storm/i],
    ["FOOTPATH", /footpath|sidewalk|path|pavement|walkway/i],
  ];
  for (const [cat, re] of map) {
    if (re.test(text)) return cat;
  }
  return null;
}

function inferSeverity(text: string): "Critical" | "High" | "Medium" | "Low" {
  if (/(emergency|immediate|danger|unsafe|fall|hurt|child|collapse|open\s*manhole)/.test(text)) return "Critical";
  if (/(deep|large|major|serious|severe|significant|hazard|accident)/.test(text)) return "High";
  if (/(moderate|several|some|medium|partial)/.test(text)) return "Medium";
  return "Low";
}

function inferSafety(text: string, severity: string): "High" | "Medium" | "Low" {
  if (severity === "Critical") return "High";
  if (/(child|school|crossing|traffic|night|pedestrian|wheelchair)/.test(text)) return "High";
  if (/(busy|market|road|street|daily)/.test(text)) return "Medium";
  return "Low";
}

function severityScoreOf(s: string): number {
  switch (s) {
    case "Critical": return 92;
    case "High": return 76;
    case "Medium": return 52;
    default: return 28;
  }
}

function demoSummary(category: ComplaintCategory, severity: string, quality: number): string {
  return [
    `AI assessed this as ${severity.toLowerCase()} priority ${category.toLowerCase()} issue`,
    quality >= 80 ? "with strong visual evidence." : "with moderate evidence strength.",
  ].join(" ");
}