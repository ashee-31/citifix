import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { createComplaint, listComplaints, createNotification } from "@/lib/repo";
import { toPublicComplaint } from "@/lib/repo";
import { analyzeEvidenceWithProvider, demoAnalysis } from "@/lib/ai/evidence";
import { isDemoMode, hasAi } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";
import { complaintCreatedNotification } from "@/lib/notifications/engine";

export const runtime = "nodejs";

/**
 * GET /api/complaints — list complaints with optional filters.
 * ?category=ROADS&status=IN_PROGRESS&priority=HIGH&q=pothole
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") ?? undefined;
  const status = sp.get("status") ?? undefined;
  const q = sp.get("q") ?? undefined;
  const limit = Number(sp.get("limit") ?? "50");
  const complaints = await listComplaints({
    category: category as never,
    status: status as never,
    q,
    limit,
  });
  return apiOk({ complaints: complaints.map(toPublicComplaint) });
}

/**
 * POST /api/complaints — create a complaint.
 * Body: { description, category, locationLabel, latitude, longitude, evidenceBase64? }
 */
export async function POST(req: NextRequest) {
  const body = await parseBody<{
    description: string;
    category: string;
    locationLabel: string;
    latitude: number;
    longitude: number;
    evidenceBase64?: string | null;
  }>(req);
  if (!body) return apiError("Invalid JSON body", 400);

  const { description, category, locationLabel, latitude, longitude, evidenceBase64 } = body;
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return apiError("Description must be at least 10 characters", 400);
  }
  if (!locationLabel || typeof locationLabel !== "string") {
    return apiError("Location label is required", 400);
  }
  if (typeof latitude !== "number" || typeof longitude !== "number" || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return apiError("Valid latitude/longitude are required", 400);
  }

  // Run AI evidence analysis (real provider if configured, else demo heuristic).
  let analysis;
  if (hasAi() && !isDemoMode()) {
    try {
      const result = await analyzeEvidenceWithProvider({
        description,
        imageUrl: evidenceBase64 ? "uploaded" : null,
        latitude,
        longitude,
      });
      analysis = result.analysis;
    } catch {
      analysis = demoAnalysis({ description, latitude, longitude });
    }
  } else {
    analysis = demoAnalysis({ description, latitude, longitude });
  }

  const complaint = await createComplaint({
    description: description.trim(),
    category: analysis.category,
    locationLabel: locationLabel.trim(),
    latitude,
    longitude,
    aiSeverity: analysis.severity,
    aiSeverityScore: analysis.severityScore,
    safetyRisk: analysis.safetyRisk,
    safetyRiskScore: analysis.safetyRiskScore,
    evidenceQuality: analysis.evidenceQuality,
    aiSummary: analysis.summary,
    depthImpact: Math.round(latitude * longitude * 0) + 100, // placeholder until geo lookup
  });

    // Notify the reporter (demo: demo citizen). Public reports may be
      // submitted anonymously — if no authenticated user is detected, the
      // notification is skipped so we never guess an identity.
      try {
        let reporterId: string | null = null;
        if (isDemoMode()) {
          reporterId = "demo-reporter";
        } else {
          const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
          if (token) {
            const admin = createAdminClient();
            const { data } = await admin.auth.getUser(token);
            reporterId = data.user?.id ?? null;
          }
        }
        if (reporterId) {
          const note = complaintCreatedNotification(complaint);
          await createNotification(reporterId, note);
        }
      } catch {
        // Notification failures must never block a successful report.
      }

      return apiOk({ complaint: toPublicComplaint(complaint) }, 201);
    }