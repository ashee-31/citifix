"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/format";
import { CATEGORY_LABELS, COMPLAINT_CATEGORIES } from "@/lib/types";
import type { ComplaintCategory } from "@/lib/types";
import type { DraftState } from "./ReportWizard";

const MIN_DESCRIPTION = 10;

/**
 * StepIssue — category + description.
 *
 * Collects only the issue itself. No identity fields anywhere in this flow.
 */
export function StepIssue({
  draft,
  setDraft,
  onNext,
  canProceed,
}: {
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  onNext: () => void;
  canProceed: boolean;
}) {
  const reduce = useReducedMotion();
  const descLength = draft.description.trim().length;
  const descValid = descLength >= MIN_DESCRIPTION;

  const pickCategory = (c: ComplaintCategory) =>
    setDraft((d) => ({ ...d, category: c }));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Describe the issue
        </h2>
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-white/40">
          STEP 01 · ISSUE
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        What&apos;s wrong? Pick a category and describe what you saw. This
        becomes the permanent record — make it clear.
      </p>

      {/* Category */}
      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-white/80">
          Category <span className="text-white/40">(required)</span>
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {COMPLAINT_CATEGORIES.map((c) => {
            const selected = draft.category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => pickCategory(c)}
                aria-pressed={selected}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  selected
                    ? "border-citi-lavender/70 bg-citi-lavender/10 text-citi-lavender shadow-[0_0_16px_rgba(196,168,255,0.18)]"
                    : "border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25 hover:text-white",
                )}
              >
                {CATEGORY_LABELS[c]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Description */}
      <div className="mt-8">
        <label
          htmlFor="report-description"
          className="text-sm font-medium text-white/80"
        >
          What happened? <span className="text-white/40">(at least {MIN_DESCRIPTION} characters)</span>
        </label>
        <textarea
          id="report-description"
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          rows={5}
          placeholder="e.g. A deep pothole on the main road near the bus stop has damaged two vehicles this week. It is unmarked even after dark."
          aria-describedby="report-description-hint report-description-status"
          className={cn(
            "mt-2 w-full resize-y rounded-xl border bg-white/[0.03] px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-citi-lavender/60",
            descValid || descLength === 0
              ? "border-white/10"
              : "border-amber-400/50",
          )}
        />
        <div
          id="report-description-status"
          className={cn(
            "mt-1.5 flex items-center justify-between font-mono text-xs",
            descValid ? "text-emerald-300/80" : "text-white/40",
          )}
        >
          <span id="report-description-hint">
            {descValid
              ? "Good — that is a clear record."
              : descLength === 0
                ? "Be specific: what, where, and how it affects people."
                : `${MIN_DESCRIPTION - descLength} more character${MIN_DESCRIPTION - descLength === 1 ? "" : "s"} needed`}
          </span>
          <span>{descLength}/{MIN_DESCRIPTION} min</span>
        </div>
      </div>

      {/* Footer nav */}
      <div className="mt-10 flex items-center justify-end">
        <motion.button
          type="button"
          whileHover={reduce || !canProceed ? undefined : { y: -1 }}
          whileTap={reduce || !canProceed ? undefined : { scale: 0.98 }}
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors",
            canProceed
              ? "bg-citi-lavender text-[#17101f] hover:bg-citi-lavender/90"
              : "cursor-not-allowed bg-white/5 text-white/30",
          )}
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden />
        </motion.button>
      </div>
    </div>
  );
}