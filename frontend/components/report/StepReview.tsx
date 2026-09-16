"use client";

import { ArrowLeft, Loader2, Lock, Send, Sparkles, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/format";
import { CATEGORY_LABELS } from "@/lib/types";
import type { DraftState, AiResult } from "./ReportWizard";

/**
 * StepReview — summary + optional AI pre-check + submit.
 *
 * The preflight AI call (POST /api/ai/analyze) is honest: if it fails or
 * times out the UI says "AI assessment unavailable" and the complaint is
 * still submitted. We never fabricate confidence scores.
 */
export function StepReview({
  draft,
  onBack,
  onNext,
  submitting,
  aiLoading,
  aiResult,
  error,
  onPreflight,
}: {
  draft: DraftState;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
  aiLoading: boolean;
  aiResult: AiResult;
  error: string | null;
  onPreflight: () => void;
}) {
  const reduce = useReducedMotion();
  const locationLabel = `${draft.area}${draft.detail ? ` — ${draft.detail}` : ""}`;

  const aiStateLabel = aiResult.analysis
    ? aiResult.demo
      ? "Demo assessment ready — heuristic, not a live provider"
      : "Assessment ready"
    : aiResult.unavailable
      ? "AI assessment unavailable — submitted without it"
      : "Not run yet";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Review and submit
        </h2>
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-white/40">
          STEP 04 · REVIEW
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Everything below is public, permanent and tamper-resistant. That is
        why no personal information is collected.
      </p>

      {/* Summary */}
      <dl className="mt-7 space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Category
          </dt>
          <dd className="mt-1 text-[15px] font-medium text-white">
            {draft.category ? CATEGORY_LABELS[draft.category] : "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Description
          </dt>
          <dd className="mt-1 text-[15px] leading-relaxed text-white/85">
            {draft.description || "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Location
          </dt>
          <dd className="mt-1 text-[15px] font-medium text-white">
            {locationLabel || "—"}
          </dd>
          {draft.lat !== null && draft.lng !== null ? (
            <dd className="mt-1 font-mono text-xs text-white/45">
              {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
            </dd>
          ) : null}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5">
          <dt className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Evidence
          </dt>
          <dd className="mt-1 text-[15px] font-medium text-white">
            {draft.evidenceBase64 ? "Photo attached" : "No photo"}
          </dd>
        </div>
      </dl>

      {/* AI pre-check */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-citi-lavender/80" aria-hidden />
            <span className="text-sm font-medium text-white/80">
              Evidence AI pre-check
            </span>
          </div>
          <button
            type="button"
            onClick={onPreflight}
            disabled={aiLoading || submitting}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              aiResult.analysis || aiResult.unavailable
                ? "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
                : "border-citi-lavender/40 bg-citi-lavender/10 text-citi-lavender hover:bg-citi-lavender/20",
            )}
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Running
              </>
            ) : aiResult.analysis || aiResult.unavailable ? (
              "Rerun"
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" aria-hidden />
                Check evidence
              </>
            )}
          </button>
        </div>
        <p className="mt-2.5 text-sm text-white/55">
          {aiLoading ? (
            "Analyzing the description and evidence…"
          ) : aiResult.analysis ? (
            <>
              <span className="font-medium text-citi-lavender">
                {aiResult.analysis.severity} severity
              </span>{" "}
              (score {aiResult.analysis.severityScore}) · safety risk{" "}
              {aiResult.analysis.safetyRisk} · evidence quality{" "}
              {aiResult.analysis.evidenceQuality}.{" "}
              {aiResult.analysis.summary}
            </>
          ) : aiResult.unavailable ? (
            "Could not reach the assessment service. You can still submit — the record is proof in itself."
          ) : (
            "Optional. Runs a light assessment of your description and evidence before submission."
          )}
        </p>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-white/35">
          {aiLoading ? "Analyzing…" : aiStateLabel}
        </p>
      </div>

      {/* Privacy reminder */}
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-citi-lavender/15 bg-citi-lavender/[0.04] p-4">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-citi-lavender/80" aria-hidden />
        <p className="text-sm leading-relaxed text-white/60">
          <span className="font-semibold text-citi-lavender">Privacy by design.</span>{" "}
          No name, email or phone is collected anywhere in this flow. Your
          identity stays private even as the record becomes public and
          verifiable.
        </p>
      </div>

      {error ? (
        <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      {/* Footer nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <motion.button
          type="button"
          whileHover={reduce || submitting ? undefined : { y: -1 }}
          whileTap={reduce || submitting ? undefined : { scale: 0.98 }}
          onClick={onNext}
          disabled={submitting}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors",
            submitting
              ? "cursor-wait bg-white/5 text-white/40"
              : "bg-citi-lavender text-[#17101f] hover:bg-citi-lavender/90",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Submitting…
            </>
          ) : (
            <>
              Submit complaint
              <Send className="h-4 w-4" aria-hidden />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}