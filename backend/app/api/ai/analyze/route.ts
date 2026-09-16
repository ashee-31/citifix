import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { analyzeEvidenceWithProvider, demoAnalysis } from "@/lib/ai/evidence";
import { isDemoMode, hasAi } from "@/lib/demo/mode";

export const runtime = "nodejs";

/**
 * POST /api/ai/analyze — run (or mock) AI evidence analysis on a complaint draft.
 * Body: { description, categoryHint?, latitude?, longitude?, evidenceBase64? }
 */
export async function POST(req: NextRequest) {
  const body = await parseBody<{
    description: string;
    categoryHint?: string;
    latitude?: number;
    longitude?: number;
    evidenceBase64?: string | null;
    imageUrl?: string | null;
  }>(req);
  if (!body) return apiError("Invalid JSON body", 400);
  if (!body.description || typeof body.description !== "string") {
    return apiError("description is required", 400);
  }

  // Prefer the real AI provider; throw-safe fallback to demo analysis.
  let analysis;
  let fromProvider = false;
  if (hasAi() && !isDemoMode()) {
    try {
      const result = await analyzeEvidenceWithProvider({
        description: body.description,
        categoryHint: body.categoryHint,
        latitude: body.latitude,
        longitude: body.longitude,
        evidenceBase64: body.evidenceBase64,
        imageUrl: body.imageUrl,
      });
      analysis = result.analysis;
      fromProvider = result.fromProvider;
    } catch {
      analysis = demoAnalysis({
        description: body.description,
        categoryHint: body.categoryHint,
        latitude: body.latitude,
        longitude: body.longitude,
        evidenceBase64: body.evidenceBase64,
        imageUrl: body.imageUrl,
      });
    }
  } else {
    analysis = demoAnalysis({
      description: body.description,
      categoryHint: body.categoryHint,
      latitude: body.latitude,
      longitude: body.longitude,
      evidenceBase64: body.evidenceBase64,
      imageUrl: body.imageUrl,
    });
  }

  return apiOk({
    analysis,
    fromProvider,
    demo: isDemoMode(),
    analysisVersion: analysis.analysisVersion,
    unavailable: false,
  });
}