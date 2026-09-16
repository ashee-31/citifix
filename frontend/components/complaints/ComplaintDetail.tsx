"use client";

import { useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShieldAlert,
  Users,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  User,
  IterationCw,
} from "lucide-react";
import {
  STATUS_BADGE_LABELS,
  STATUS_TONES,
  type ComplaintStatus,
} from "@/lib/state/complaint-status";
import { PRIORITY_LABELS } from "@/lib/priority/engine";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { SupportButton } from "@/components/support/SupportButton";
import { ComplaintTimeline } from "./ComplaintTimeline";
import { EvidencePanel } from "./EvidencePanel";
import { BlockchainPanel } from "./BlockchainPanel";
import { ResolutionReviewActions } from "./ResolutionReviewActions";
import {
  fetchComplaintDetail,
  NotFoundError,
  type ComplaintDetail,
} from "./types";

/**
 * ComplaintDetail — the public dossier for one citi complaint.
 *
 * A thin client orchestrator: fetches the real dossier from
 * GET /api/complaints/[id], then renders the header (privacy-safe facts),
 * the audit timeline, evidence + AI assessment, and the blockchain audit.
 *
 * Every displayed value comes from the repository — nothing is fabricated,
 * and reporter identity is never shown (the server strips reporter_id).
 */

function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider",
        STATUS_TONES[status],
      )}
    >
      {STATUS_BADGE_LABELS[status]}
    </span>
  );
}

/** Small privacy-safe fact cell used in the header stripe. */
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-citi-lavender/60" aria-hidden />
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-white/80">{value}</p>
      </div>
    </div>
  );
}

/**
 * Header — identity-safe summary of the complaint.
 * No reporter name/email/phone/user-id is ever rendered.
 */
function ComplaintHeader({ detail }: { detail: ComplaintDetail }) {
  const { complaint } = detail;

  return (
    <SectionReveal>
      <div className="space-y-5">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-white/45 transition hover:text-citi-lavender"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to Explore
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-citi-lavender/80">
              Accountability dossier
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              {complaint.complaint_number}
            </h1>
            <p className="mt-1 text-sm text-white/50">{complaint.category}</p>
          </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <SupportButton
                          complaintId={complaint.id}
                          initialCount={detail.supportCount}
                          className="self-start"
                        />
                        <StatusBadge status={complaint.status} />
                      </div>
                    </div>

        <GlassCard>
          <GlassCardBody className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Fact
              icon={MapPin}
              label="Location"
              value={complaint.location_label}
            />
            <Fact icon={AlertTriangle} label="Priority" value={PRIORITY_LABELS[complaint.priority]} />
            <Fact
              icon={ShieldAlert}
              label="Severity"
              value={complaint.ai_severity}
            />
            <Fact
              icon={Users}
              label="Community support"
              value={`${detail.supportCount} supporters`}
            />
            <Fact
              icon={Clock}
              label="Submitted"
              value={timeAgo(complaint.created_at)}
            />
            <Fact icon={User} label="Reporter" value="Anonymous" />
            {complaint.safety_risk ? (
              <Fact
                icon={ShieldAlert}
                label="Safety risk"
                value={complaint.safety_risk}
              />
            ) : null}
            {complaint.reopen_count > 0 ? (
              <Fact
                icon={IterationCw}
                label="Reopened"
                value={`${complaint.reopen_count}×`}
              />
            ) : null}
          </GlassCardBody>
        </GlassCard>

        {/* Description */}
        <GlassCard>
          <GlassCardBody>
            <p className="text-base leading-relaxed text-white/75">
                          {complaint.description}
                        </p>
                      </GlassCardBody>
                    </GlassCard>
      </div>
    </SectionReveal>
  );
}

/** Loading state while the dossier streams in. */
function LoadingState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-citi-lavender/70" aria-hidden />
      <div>
        <p className="text-base text-white/80">Loading complaint dossier…</p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/35">
          hitting /api/complaints/&#123;id&#125;
        </p>
      </div>
    </div>
  );
}

/** Error state with retry. */
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertCircle className="h-8 w-8 text-red-300/80" aria-hidden />
      <div>
        <p className="text-base font-semibold text-white">Couldn’t load this complaint</p>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-white/55">{error}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-citi-lavender/40 bg-citi-lavender/10 px-4 py-2 text-sm font-medium text-citi-lavender transition hover:bg-citi-lavender/20"
      >
        Try again
      </button>
    </div>
  );
}

export function ComplaintDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<ComplaintDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string>("");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setState("loading");
      setError("");
      try {
        const data = await fetchComplaintDetail(id, signal);
        setDetail(data);
        setState("ready");
      } catch (err) {
        if (err instanceof NotFoundError) {
          notFound();
          return;
        }
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error.");
        setState("error");
      }
    },
    [id],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const retry = useCallback(() => {
    void load();
  }, [load]);

  if (state === "loading" && !detail) return <LoadingState />;
  if (state === "error" && !detail) return <ErrorState error={error} onRetry={retry} />;
  if (!detail) return null;

  const { complaint, events, aiReview, proof, resolutionEvidence, supportCount } = detail;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <ComplaintHeader detail={detail} />

      {/* Sections */}
      <div className="mt-10 space-y-10">
        <section aria-labelledby="timeline-heading">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2
                id="timeline-heading"
                className="text-xl font-semibold text-white"
              >
                Audit timeline
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Every recorded event — nothing fabricated.
              </p>
            </div>
            <span className="hidden font-mono text-[11px] uppercase tracking-wider text-white/30 sm:block">
              {events.length} events
            </span>
          </div>
          <GlassCard>
            <GlassCardBody>
              <ComplaintTimeline events={events} />
            </GlassCardBody>
          </GlassCard>
        </section>

        <section aria-labelledby="evidence-heading">
          <div className="mb-5">
            <h2
              id="evidence-heading"
              className="text-xl font-semibold text-white"
            >
              Evidence &amp; AI assessment
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Original evidence, resolution proof, and the Evidence AI review —
              each distinctly labeled.
            </p>
          </div>
          <EvidencePanel complaint={complaint} review={aiReview} resolutionEvidence={resolutionEvidence} />
          <ResolutionReviewActions complaint={complaint} onComplete={retry} />
        </section>

        <BlockchainPanel proof={proof} />
      </div>
    </div>
  );
}
