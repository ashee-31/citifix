"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Calendar,
  Eye,
  FileCheck,
  Lock,
  MapPin,
  Route,
  Scan,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/format";
import { CATEGORY_LABELS } from "@/lib/types";
import { STATUS_BADGE_LABELS, STATUS_TONES } from "@/lib/state/complaint-status";
import type { Complaint } from "@/lib/types";
import type { AiResult } from "./ReportWizard";

/**
 * StepVerified — post-submission state.
 *
 * Presents the REAL returned record (complaint number, category, status,
 * server-attached AI fields) with four honest AI states:
 *  - assessment present (with the demo flag made visible)
 *  - assessment unavailable (request failed before a response)
 *  - no evidence / low-quality (the UI cannot fake confidence)
 *
 * The complaint detail route does not exist yet, so the ID is displayed
 * safely without inventing a link.
 */
export function StepVerified({
  complaint,
  aiResult,
  hasPhoto,
}: {
  complaint: Complaint;
  aiResult: AiResult;
  hasPhoto: boolean;
}) {
  const reduce = useReducedMotion();
  const statusTone = STATUS_TONES[complaint.status] ?? "";
  const statusLabel = STATUS_BADGE_LABELS[complaint.status] ?? complaint.status;

  return (
    <div>
      {/* Success header */}
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="grid h-16 w-16 place-items-center rounded-full border border-citi-lavender/40 bg-citi-lavender/10 text-citi-lavender shadow-[0_0_30px_rgba(196,168,255,0.3)]"
        >
          <BadgeCheck className="h-8 w-8" aria-hidden />
        </motion.span>
        <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
          Complaint submitted
        </h2>
        <p className="mt-2 text-sm text-white/55">
          It is now part of the permanent citi record — and it cannot quietly
          disappear.
        </p>
      </div>

      {/* Record card */}
      <div className="mt-8 overflow-hidden rounded-xl border border-citi-lavender/20 bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">
              Complaint ID
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-wide text-citi-lavender">
              {complaint.complaint_number}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
              statusTone,
            )}
          >
            {statusLabel}
          </span>
        </div>

        <dl className="divide-y divide-white/5">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Category
            </dt>
            <dd className="text-sm font-medium text-white">
              {CATEGORY_LABELS[complaint.category] ?? complaint.category}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              Location
            </dt>
            <dd className="max-w-[60%] truncate text-right text-sm text-white/80">
              {complaint.location_label}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <dt className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/40">
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              Submitted
            </dt>
            <dd className="text-sm text-white/80">{formatDate(complaint.created_at)}</dd>
          </div>
        </dl>
      </div>

      {/* AI evidence assessment */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2.5">
          <Scan className="h-4 w-4 text-citi-lavender/80" aria-hidden />
          <h3 className="text-sm font-semibold text-white">
            Evidence AI assessment
          </h3>
        </div>

        {aiResult.analysis ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Severity
                </p>
                <p className="mt-1 text-sm font-semibold text-citi-lavender">
                  {aiResult.analysis.severity}
                </p>
                <p className="font-mono text-[11px] text-white/40">
                  {aiResult.analysis.severityScore}/100
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Safety risk
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {aiResult.analysis.safetyRisk}
                </p>
                <p className="font-mono text-[11px] text-white/40">
                  {aiResult.analysis.safetyRiskScore}/100
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  Evidence
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {aiResult.analysis.evidenceQuality}/100
                </p>
                <p className="font-mono text-[11px] text-white/40">quality</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              {aiResult.analysis.summary}
            </p>
            {aiResult.demo ? (
              <p className="rounded-lg border border-citi-lavender/20 bg-citi-lavender/[0.05] px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-citi-lavender/70">
                Demo mode — heuristic assessment shown for preview
              </p>
            ) : null}
          </div>
        ) : aiResult.unavailable ? (
          <div className="mt-4 space-y-3">
            <p className="flex items-start gap-2.5 text-sm leading-relaxed text-white/60">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden />
              The assessment service could not be reached, so no AI assessment
              was attached. Your complaint is still filed and your record is
              intact — the assessment can run once the service is available.
            </p>
          </div>
        ) : hasPhoto ? (
          <div className="mt-4 space-y-3">
            <p className="flex items-start gap-2.5 text-sm leading-relaxed text-white/60">
              <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden />
              The assessment did not run before submission. The record was
              created with the evidence attached; assessment status is not
              shown because no result was returned.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="flex items-start gap-2.5 text-sm leading-relaxed text-white/60">
              <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-white/35" aria-hidden />
              No photo was attached, so there is minimal evidence for the AI
              to assess. Your written record is still filed and auditable.
            </p>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center gap-2.5">
          <Route className="h-4 w-4 text-citi-lavender/80" aria-hidden />
          <h3 className="text-sm font-semibold text-white">What happens next</h3>
        </div>
        <ol className="mt-4 space-y-3 text-sm text-white/60">
          {[
                      "Authorities can see the complaint with its AI-backed evidence.",
                      "The record cannot be silently changed — every update leaves a trace.",
                      "When work is done, resolution must be proven with evidence, not just marked.",
                      `You can revisit ID ${complaint.complaint_number} later to track it — keep it safe.`,
                    ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-citi-lavender/30 bg-citi-lavender/10 font-mono text-[10px] font-semibold text-citi-lavender">
                {i + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-3 text-sm text-white/50">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-citi-lavender/70" aria-hidden />
          Tracking this case later does not require logging in or sharing who
          you are.
        </p>
      </div>

      {/* Copy ID */}
      <div className="mt-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-white/40">
          Save your ID — it is your only key
        </p>
        <p className="mt-1 font-mono text-lg font-semibold text-citi-lavender">
          {complaint.complaint_number}
        </p>
      </div>
    </div>
  );
}