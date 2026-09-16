import { NextRequest } from "next/server";
import { apiError, apiOk, parseBody } from "@/lib/api/helpers";
import { addEvent, createNotification, createResolutionEvidence, getComplaint, updateComplaint } from "@/lib/repo";
import { analyzeEvidenceWithProvider, demoAnalysis } from "@/lib/ai/evidence";
import { hasAi, isDemoMode } from "@/lib/demo/mode";
import { createAdminClient } from "@/lib/supabase/server";

async function authorityId(request: NextRequest): Promise<string | null> {
  if (isDemoMode()) return "demo-authority";
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const admin = createAdminClient();
  const { data } = await admin.auth.getUser(token);
  if (!data.user) return null;
  const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  return profile?.role === "authority" || profile?.role === "admin" ? data.user.id : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const submitterId = await authorityId(request);
  if (!submitterId) return apiError("Authority access required", 403);
  const body = await parseBody<{ note?: string; evidenceUrl?: string; metadata?: string; location?: string }>(request);
  const note = body?.note?.trim();
  const evidenceUrl = body?.evidenceUrl?.trim();
  if (!note || note.length < 10) return apiError("A resolution note of at least 10 characters is required", 400);
  if (!evidenceUrl || !/^https?:\/\//i.test(evidenceUrl)) return apiError("A public HTTPS/HTTP after-image URL is required", 400);
  const { id } = await params;
  const complaint = await getComplaint(id);
  if (!complaint) return apiError("Complaint not found", 404);
  if (complaint.status !== "RESOLUTION_EVIDENCE_REQUIRED") return apiError("Resolution evidence is not permitted at the current status", 409);

  let assessment = null;
  try {
    // A deterministic demo assessment is allowed only in explicit demo mode.
    // In a live deployment a missing/failed provider remains unavailable; it
    // must not be represented as an AI success.
    assessment = isDemoMode()
      ? demoAnalysis({ description: `${complaint.description}\nResolution: ${note}`, imageUrl: evidenceUrl })
      : hasAi()
        ? (await analyzeEvidenceWithProvider({ description: `${complaint.description}\nBefore evidence: ${complaint.evidence_url ?? "not available"}\nResolution: ${note}`, imageUrl: evidenceUrl, latitude: complaint.latitude, longitude: complaint.longitude })).analysis
        : null;
  } catch { assessment = null; }
  await createResolutionEvidence({
    complaint_id: complaint.id,
    submitted_by: submitterId,
    kind: "resolved",
    description: note,
    evidence_url: evidenceUrl,
    ai_analysis: JSON.stringify({
      assessment,
      metadata: body?.metadata?.slice(0, 2000) ?? null,
      location: body?.location?.slice(0, 500) ?? null,
    }),
  });
  await updateComplaint(complaint.id, { status: "RESOLUTION_SUBMITTED", resolution_evidence_url: evidenceUrl, resolution_note: note });
  await addEvent(complaint.id, { type: "RESOLUTION_SUBMITTED", title: "Resolution evidence submitted", actor_role: "authority", description: body?.location ? `Location: ${body.location}` : null, entity_ref: null });
  await updateComplaint(complaint.id, { status: "AI_RESOLUTION_REVIEW" });
  await addEvent(complaint.id, { type: "AI_RESOLUTION_REVIEWED", title: assessment ? "AI reviewed resolution evidence" : "AI resolution review unavailable", actor_role: assessment ? "ai" : "system", description: assessment ? `Evidence quality ${assessment.evidenceQuality}/100. ${assessment.summary}` : "No AI conclusion was used; further human review is required.", entity_ref: null });
  const accepted = Boolean(assessment && assessment.evidenceQuality >= 60 && assessment.safetyRisk !== "High");
  const next = accepted ? "PUBLIC_REVIEW" : "RESOLUTION_EVIDENCE_REQUIRED";
  await updateComplaint(complaint.id, { status: next });
  await addEvent(complaint.id, { type: accepted ? "PUBLIC_REVIEW" : "RESOLUTION_EVIDENCE_REQUIRED", title: accepted ? "Opened for public review" : "Additional resolution evidence required", actor_role: accepted ? "system" : "ai", description: accepted ? "AI assessment supports public review; it is not a final resolution." : "Evidence was insufficient, questionable, low confidence, or AI was unavailable.", entity_ref: null });
  if (complaint.reporter_id && complaint.reporter_id !== "anonymous") {
    await createNotification(complaint.reporter_id, { title: accepted ? "Resolution ready for review" : "Additional evidence required", body: accepted ? `${complaint.complaint_number} is open for your review.` : `The submitted evidence for ${complaint.complaint_number} needs additional review.`, href: `/complaints/${complaint.id}` });
  }
  return apiOk({ status: next, assessment: assessment ? { evidenceQuality: assessment.evidenceQuality, summary: assessment.summary, analysisVersion: assessment.analysisVersion } : null });
}
