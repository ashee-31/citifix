"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  PenLine,
  Route,
  ShieldCheck,
  Eye,
  CircleCheckBig,
} from "lucide-react";

/**
 * AnswerSection — introduces the CitiFix core loop:
 * Report → Track → Prove → Verify → Resolve
 */

const FLOW = [
  {
    icon: PenLine,
    step: "Report",
    color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  {
    icon: Route,
    step: "Track",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    icon: ShieldCheck,
    step: "Prove",
    color: "text-citi-lavender border-citi-lavender/30 bg-citi-lavender/10",
  },
  {
    icon: Eye,
    step: "Verify",
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    icon: CircleCheckBig,
    step: "Resolve",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
];

export function AnswerSection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="answer-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(102,78,174,0.15) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="The Answer"
          title="CitiFix changes what &quot;resolved&quot; means."
          lede="Not an authority click. A verifiable, auditable, publicly accountable process."
        />

        {/* Flow */}
        <Stagger className="mt-14 flex flex-col items-center gap-4 sm:mt-16 sm:flex-row sm:justify-center sm:gap-0" stagger={0.1}>
          {FLOW.map((item, i) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.step} className="flex items-center">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg ${item.color}`}
                  >
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white/70">
                    {item.step}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <div className="mx-3 hidden h-px w-8 bg-white/15 sm:block" aria-hidden />
                )}
                {i < FLOW.length - 1 && (
                  <div className="my-1 h-px w-8 bg-white/15 sm:hidden" aria-hidden />
                )}
              </StaggerItem>
            );
          })}
        </Stagger>

        <SectionReveal delay={0.3} className="mx-auto mt-14 max-w-3xl">
          <GlassCard>
            <GlassCardBody className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-citi-lavender/20 bg-citi-lavender/10">
                <ShieldCheck className="h-6 w-6 text-citi-lavender" aria-hidden />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  Every status change is recorded, timestamped, and anchored.
                </p>
                <p className="mt-1 text-sm text-white/50">
                  There is no shortcut to &quot;resolved.&quot; Evidence must be
                  submitted, AI-reviewed, and publicly verified before a
                  complaint can be closed.
                </p>
              </div>
            </GlassCardBody>
          </GlassCard>
        </SectionReveal>
      </div>
    </section>
  );
}
