"use client";

import {
  Camera,
  ShieldCheck,
  Eye,
  ArrowRight,
  ImageOff,
  Sparkles,
  Lock,
  ScanLine,
} from "lucide-react";
import type { AiEvidenceReview, PublicComplaint, PublicResolutionEvidence } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/state/complaint-status";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";

/**
 * EvidencePanel — original evidence + resolution evidence for a complaint.
 *
 * Distinguishes three different concepts:
 *  - AI assessment (server-side evidence review; never absolute truth)
 *  - Blockchain proof (separate panel — see BlockchainPanel)
 *  - Community verification (public review state shown here when present)
 *
 * Only publicly-permitted images are rendered; private/raw evidence stays
 * off-chain and is never exposed.
 */

/** Public-safe image renderer — only shows when a public URL exists. */
function EvidenceImage({
  url,
  alt,
}: {
  url: string | null;
  alt: string;
}) {
  if (!url) {
    return (
      <div className="grid h-40 w-full place-items-center rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex flex-col items-center gap-2 text-white/30">
          <ImageOff className="h-5 w-5" aria-hidden />
          <p className="px-4 text-center font-mono text-[10px] uppercase tracking-wider">
            No public evidence image
          </p>
        </div>
      </div>
    );
  }
  // Only allow http(s) images — never javascript: or data: sinks.
  const safe = /^https?:\/\//i.test(url);
  if (!safe) {
    return (
      <div className="grid h-40 w-full place-items-center rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex flex-col items-center gap-2 text-white/30">
          <Lock className="h-5 w-5" aria-hidden />
          <p className="px-4 text-center font-mono text-[10px] uppercase tracking-wider">
            Evidence is private
          </p>
        </div>
      </div>
    );
  }
  return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="h-40 w-full rounded-xl border border-white/10 object-cover"
        />
      </>
    );
  }

function PanelLabel({
  icon: Icon,
  children,
  tone = "text-citi-lavender/80",
}: {
  icon: typeof Camera;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em]",
        tone,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </p>
  );
}

/** AI evidence assessment — displayed as assessment, never as absolute truth. */
function AiAssessment({ review }: { review: AiEvidenceReview | null }) {
  if (!review) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <PanelLabel icon={ScanLine} tone="text-amber-300/80">
          AI assessment unavailable
        </PanelLabel>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          The Evidence AI did not attach a review to this complaint. This does
          not mean the complaint is verified — no assessment is being claimed.
        </p>
      </div>
    );
  }

  const meter = (score: number, label: string, tone: string) => (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-white/55">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono text-sm text-white/80">{score}</span>
        <span
          className={cn("h-1.5 w-16 overflow-hidden rounded-full bg-white/10")}
          aria-hidden
        >
          <span
            className={cn("block h-full rounded-full", tone)}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </span>
      </span>
    </div>
  );

  const severityTone =
    review.severity_score >= 75
      ? "bg-red-400"
      : review.severity_score >= 50
        ? "bg-amber-400"
        : "bg-sky-400";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <PanelLabel icon={Sparkles} tone="text-violet-300/80">
        AI evidence assessment
      </PanelLabel>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/30">
        {review.analysis_version} · {formatDateTime(review.created_at)}
      </p>

      <div className="mt-4 space-y-2.5">
              {meter(review.severity_score, review.severity, severityTone)}
              {meter(
                review.safety_risk_score,
                `Safety risk · ${review.safety_risk}`,
                severityTone,
              )}
              {meter(review.evidence_quality, "Evidence quality", severityTone)}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-wider">
        <span className="text-white/45">
          Duplicate likelihood{" "}
          <span className="text-white/70">
            {Math.round(review.duplicate_likelihood * 100)}%
          </span>
        </span>
        {review.manipulation_indicators.length > 0 && (
          <span className="text-amber-300/80">
            ⚠ {review.manipulation_indicators.join(", ")}
          </span>
        )}
      </div>

      {review.summary ? (
        <p className="mt-3 text-sm leading-relaxed text-white/65">{review.summary}</p>
      ) : null}

      <p className="mt-4 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-wider text-white/30">
        AI assessment — insight, not absolute truth
      </p>
    </div>
  );
}

// Local alias so we can use it without importing the icon name collisions.

/**
 * EvidencePanel — original + resolution evidence.
 */
export function EvidencePanel({
  complaint,
  review,
  resolutionEvidence,
}: {
  complaint: PublicComplaint;
  review: AiEvidenceReview | null;
  resolutionEvidence: PublicResolutionEvidence[];
}) {
  const hasResolution = Boolean(
    complaint.resolution_evidence_url || complaint.resolution_note,
  );
  const publicReviewOpen =
    complaint.status === "PUBLIC_REVIEW" ||
    complaint.status === "RESOLVED" ||
    complaint.status === "DISPUTED" ||
    complaint.status === "REOPENED";
  const resolutionAssessment = resolutionEvidence.at(-1)?.ai_analysis;

  return (
    <section aria-labelledby="evidence-heading" className="space-y-4">
      <h2 id="evidence-heading" className="sr-only">
        Evidence and AI assessment
      </h2>

      {/* Original evidence */}
      <GlassCard>
        <GlassCardBody className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <PanelLabel icon={Camera}>Original evidence</PanelLabel>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/30">
              {formatDateTime(complaint.created_at)}
            </span>
          </div>
          <EvidenceImage url={complaint.evidence_url} alt="Original complaint evidence" />
        </GlassCardBody>
      </GlassCard>

      {/* AI assessment */}
      <GlassCard>
        <GlassCardBody>
          <AiAssessment review={review} />
        </GlassCardBody>
      </GlassCard>

      {/* Resolution evidence — only if it exists */}
      {hasResolution ? (
        <GlassCard>
          <GlassCardBody className="space-y-4">
            <PanelLabel icon={ShieldCheck} tone="text-emerald-300/80">
              Resolution evidence
            </PanelLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <EvidenceImage
                url={complaint.evidence_url}
                alt="Before — original complaint evidence"
              />
              <EvidenceImage
                url={complaint.resolution_evidence_url}
                alt="After — resolution evidence"
              />
            </div>

            <div className="flex items-center gap-2 text-white/40">
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Before → After
              </span>
            </div>

            {complaint.resolution_note ? (
              <p className="text-sm leading-relaxed text-white/65">
                {complaint.resolution_note}
              </p>
            ) : null}

            {resolutionAssessment ? (
              <ResolutionAssessment raw={resolutionAssessment} />
            ) : null}

            {/* Public review state */}
            {publicReviewOpen ? (
              <div className="flex items-center gap-2 rounded-lg border border-lime-400/20 bg-lime-400/[0.05] px-3 py-2">
                <Eye className="h-3.5 w-3.5 text-lime-300/80" aria-hidden />
                <span className="font-mono text-[11px] uppercase tracking-wider text-lime-200/80">
                  Open for public review
                </span>
                <span className="ml-auto text-white/40">
                  {STATUS_LABELS[complaint.status]}
                </span>
              </div>
            ) : null}
          </GlassCardBody>
        </GlassCard>
      ) : null}

      {/* Community verification callout — separate concept from AI + blockchain */}
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-citi-lavender/70" aria-hidden />
        <p className="text-sm leading-relaxed text-white/55">
          <span className="font-semibold text-white/80">Community verification</span> is
          separate from AI assessment and blockchain proof. Citizens can review
          resolution evidence and dispute questionable results — their identity
          always remains private.
        </p>
      </div>
    </section>
  );
}

function ResolutionAssessment({ raw }: { raw: string }) {
  try {
    const saved = JSON.parse(raw) as { assessment?: { evidenceQuality?: number; summary?: string; analysisVersion?: string } | null };
    if (!saved.assessment) return <p className="text-sm text-amber-200/70">Resolution AI assessment unavailable. Public review is not an AI approval.</p>;
    return <div className="rounded-lg border border-violet-400/20 bg-violet-400/[0.04] p-3"><PanelLabel icon={Sparkles} tone="text-violet-300/80">Resolution AI assessment</PanelLabel><p className="mt-2 text-sm text-white/65">{saved.assessment.summary || "Assessment completed."}</p><p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/40">Evidence quality {saved.assessment.evidenceQuality ?? "—"}/100 · {saved.assessment.analysisVersion ?? "AI review"} · assessment only</p></div>;
  } catch {
    return <p className="text-sm text-amber-200/70">Resolution AI assessment could not be read. No AI conclusion is claimed.</p>;
  }
}
