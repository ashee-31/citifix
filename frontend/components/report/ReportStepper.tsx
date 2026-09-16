"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/format";
import type { WizardStepId } from "./ReportWizard";

/**
 * ReportStepper — the wizard progress rail.
 *
 * Completed steps become clickable (navigation back is fine), the current
 * step is highlighted with the CitiFix lavender glow, and future steps
 * stay muted. Respects prefers-reduced-motion.
 */
export function ReportStepper({
  steps,
  current,
  onStepClick,
}: {
  steps: readonly { id: WizardStepId; label: string }[];
  current: WizardStepId;
  onStepClick: (next: WizardStepId) => void;
}) {
  const reduce = useReducedMotion();
  const currentIndex = steps.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Report progress" className="mt-10">
      <ol className="flex items-start justify-between gap-2 sm:gap-4">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step.id} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <span
                  aria-hidden
                  className={cn(
                    "h-px flex-1",
                    i === 0
                      ? "opacity-0"
                      : done || active
                        ? "bg-citi-lavender/50"
                        : "bg-white/10",
                  )}
                />
                <button
                  type="button"
                  onClick={() => (done ? onStepClick(step.id) : undefined)}
                  disabled={!done}
                  aria-current={active ? "step" : undefined}
                  aria-label={`${step.label}${done ? " (completed)" : ""}${active ? " (current)" : ""}`}
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border text-[13px] font-semibold transition-colors",
                    active
                      ? "border-citi-lavender/70 bg-citi-violet text-citi-lavender shadow-[0_0_20px_rgba(196,168,255,0.25)]"
                      : done
                        ? "border-citi-lavender/40 bg-citi-lavender/10 text-citi-lavender hover:border-citi-lavender/60"
                        : "border-white/15 bg-white/[0.03] text-white/35",
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </button>
                <span
                  aria-hidden
                  className={cn(
                    "h-px flex-1",
                    i === steps.length - 1
                      ? "opacity-0"
                      : done
                        ? "bg-citi-lavender/50"
                        : "bg-white/10",
                  )}
                />
              </div>
              <motion.span
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{
                  opacity: active ? 1 : done ? 0.75 : 0.45,
                  y: 0,
                }}
                className={cn(
                  "text-[11px] font-medium uppercase tracking-wider sm:text-xs",
                  active ? "text-citi-lavender" : done ? "text-white/70" : "text-white/40",
                )}
              >
                {step.label}
              </motion.span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}