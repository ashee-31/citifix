"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Camera,
  Hammer,
  BrainCircuit,
  Eye,
  CircleCheckBig,
} from "lucide-react";

/**
 * ResolutionProofSection — "Don't just mark it resolved. Prove it."
 * Shows the before → work → after → AI review → public review → resolved flow.
 */

const PROOF_STEPS = [
  {
    icon: Camera,
    label: "Before Evidence",
    detail: "Initial state documented by the reporter",
    color: "text-sky-400",
    ring: "border-sky-500/25",
  },
  {
    icon: Hammer,
    label: "Work Performed",
    detail: "Authority performs and documents corrective action",
    color: "text-amber-400",
    ring: "border-amber-500/25",
  },
  {
    icon: Camera,
    label: "After Evidence",
    detail: "Resolution state documented with proof",
    color: "text-emerald-400",
    ring: "border-emerald-500/25",
  },
  {
    icon: BrainCircuit,
    label: "AI Review",
    detail: "Automated comparison of before/after and metadata",
    color: "text-citi-lavender",
    ring: "border-citi-lavender/25",
  },
  {
    icon: Eye,
    label: "Public Review",
    detail: "Community verifies the resolution evidence is credible",
    color: "text-purple-400",
    ring: "border-purple-500/25",
  },
  {
    icon: CircleCheckBig,
    label: "Resolved",
    detail: "Only after all steps are verified and complete",
    color: "text-emerald-300",
    ring: "border-emerald-400/25",
  },
];

export function ResolutionProofSection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="resolution-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div className="citi-grid absolute inset-0 opacity-[0.025]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Resolution Must Be Proven"
          title={
            <>
              Don&apos;t just mark it resolved.{" "}
              <span className="text-citi-lavender">Prove it.</span>
            </>
          }
          lede="A resolution is only accepted when evidence is submitted, AI-reviewed, and publicly verified."
        />

        {/* Proof flow */}
        <Stagger className="mt-14 grid grid-cols-2 gap-4 sm:mt-16 sm:gap-5 md:grid-cols-3 lg:grid-cols-6" stagger={0.08}>
          {PROOF_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.label}>
                <div
                  className={`group relative flex h-full flex-col items-center gap-4 rounded-xl border bg-white/[0.02] p-5 text-center transition-colors hover:bg-white/[0.04] ${step.ring}`}
                >
                  {/* Step number */}
                  <span className="absolute left-3 top-3 font-mono text-[10px] text-white/20">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border ${step.ring} bg-white/[0.03] transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`h-[1.375rem] w-[1.375rem] ${step.color}`} aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/90">
                      {step.label}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Bottom emphasis */}
        <SectionReveal delay={0.4} className="mt-12 text-center">
          <p className="font-mono text-sm font-medium tracking-wide text-citi-lavender/70">
            There is no shortcut to resolved.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
