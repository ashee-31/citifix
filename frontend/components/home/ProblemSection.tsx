"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { AlertTriangle, Clock, CheckCircle2, ShieldOff } from "lucide-react";

/**
 * ProblemSection — the citi accountability gap.
 * Shows a visual "Reported → Forgotten → Resolved → No Proof" flow
 * with strong visual cues and atmospheric styling.
 */

const STEPS = [
  {
    icon: AlertTriangle,
    label: "Reported",
    description: "A citizen files a complaint. It enters a system nobody trusts.",
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    glow: "shadow-amber-500/10",
  },
  {
    icon: Clock,
    label: "Forgotten",
    description:
      "Days pass. No updates. No accountability. The system is designed to forget.",
    accent: "text-white/50 border-white/10 bg-white/[0.03]",
    glow: "",
  },
  {
    icon: CheckCircle2,
    label: "Marked Resolved",
    description:
      "An authority clicks \"resolved.\" No evidence. No proof. No verification.",
    accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    glow: "shadow-sky-500/10",
  },
  {
    icon: ShieldOff,
    label: "No Proof",
    description:
      "The complaint disappears. No public record. No audit trail. Nothing to challenge.",
    accent: "text-red-400 border-red-500/30 bg-red-500/10",
    glow: "shadow-red-500/10",
  },
];

export function ProblemSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" aria-labelledby="problem-heading">
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div className="citi-grid absolute inset-0 opacity-[0.03]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionReveal className="mb-16 max-w-2xl sm:mb-20">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-citi-lavender/80">
            The Problem
          </p>
          <h2
            id="problem-heading"
            className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[2.6rem] md:leading-[1.15]"
          >
            The citi accountability gap.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">
            Most complaints are filed, forgotten, and never seen again. A single
            click — &quot;resolved&quot; — with no proof, no evidence, and no
            way for citizens to verify what actually happened.
          </p>
        </SectionReveal>

        {/* Vertical flow line + steps */}
        <Stagger className="relative" stagger={0.15}>
          {/* Vertical connector */}
          <div
            className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/30 via-white/10 to-red-500/30 sm:left-1/2 sm:-translate-x-px"
            aria-hidden
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isRight = i % 2 === 1;
            return (
              <StaggerItem key={step.label}>
                <div
                  className={`relative mb-12 flex items-start gap-5 sm:mb-16 ${
                    isRight ? "sm:flex-row-reverse" : ""
                  } sm:items-center sm:gap-0`}
                >
                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl border shadow-lg ${step.accent} ${step.glow}`}
                    >
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 sm:w-1/2 ${
                      isRight
                        ? "sm:pl-16 sm:text-right"
                        : "sm:pr-16"
                    }`}
                  >
                    <h3 className="text-lg font-bold text-white sm:text-xl">
                      {step.label}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/55">
                      {step.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
