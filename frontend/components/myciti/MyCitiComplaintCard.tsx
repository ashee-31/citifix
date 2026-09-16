"use client";

import { MapPin, ArrowRight, Clock, Users, CircleAlert, ShieldCheck } from "lucide-react";
import type { Complaint } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { STATUS_BADGE_LABELS, STATUS_TONES } from "@/lib/state/complaint-status";
import { PRIORITY_LABELS } from "@/lib/priority/engine";
import { timeAgo } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";

/**
 * MyCitiComplaintCard — a complaint owned by the current citizen.
 *
 * Includes private info (reporter identity, full description) since this is
 * only shown to the authenticated owner. The public Explore cards strip
 * this information.
 */

function SeverityDot({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-red-400"
      : score >= 50
        ? "bg-amber-400"
        : score >= 30
          ? "bg-sky-400"
          : "bg-white/30";
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} aria-hidden />
      <span className="text-white/55">
        Severity {score}
      </span>
    </span>
  );
}

export function MyCitiComplaintCard({
  complaint,
  onSelect,
}: {
  complaint: Complaint;
  onSelect: (c: Complaint) => void;
}) {
  const hasEvidence =
    Boolean(complaint.evidence_url) ||
    complaint.evidence_quality > 0;
  const hasResolutionProof = Boolean(
    complaint.resolution_evidence_url || complaint.resolution_note,
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(complaint)}
      className="group w-full rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all duration-300 hover:border-citi-lavender/30 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-citi-lavender sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold tracking-wider text-citi-lavender/90">
            {complaint.complaint_number}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/30">
            {timeAgo(complaint.created_at)}
          </span>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider",
            STATUS_TONES[complaint.status],
          )}
        >
          {STATUS_BADGE_LABELS[complaint.status]}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">
          {CATEGORY_LABELS[complaint.category]}
        </p>
        <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-white/80">
          {complaint.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-1.5 text-sm text-white/55">
          <MapPin className="h-3.5 w-3.5 text-citi-lavender/70" aria-hidden />
          {complaint.location_label}
        </span>
        <SeverityDot score={complaint.ai_severity_score} />
        <span className="flex items-center gap-1.5 text-sm text-white/55">
          <CircleAlert className="h-3.5 w-3.5 text-amber-400/70" aria-hidden />
          {PRIORITY_LABELS[complaint.priority]} priority
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/45">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {complaint.support_count} supporter{complaint.support_count === 1 ? "" : "s"}
          </span>
          {hasEvidence ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-300/70">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Evidence
            </span>
          ) : null}
          {hasResolutionProof ? (
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-purple-300/70">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Resolution proof
            </span>
          ) : null}
        </div>
        <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-citi-lavender/70 opacity-0 transition-opacity group-hover:opacity-100">
          View <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </button>
  );
}