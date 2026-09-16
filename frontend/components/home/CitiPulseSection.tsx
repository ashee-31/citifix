"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Clock,
  Users,
} from "lucide-react";

/**
 * CitiPulseSection — the live citi pulse.
 * Data-rich visual section with demo metrics and counters.
 */

const METRICS = [
  {
    icon: FileText,
    label: "Active Complaints",
    value: 47,
    color: "text-sky-400 border-sky-500/25 bg-sky-500/10",
  },
  {
    icon: ShieldCheck,
    label: "Evidence-Backed Resolutions",
    value: 128,
    color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  },
  {
    icon: AlertCircle,
    label: "Disputed Resolutions",
    value: 12,
    color: "text-amber-400 border-amber-500/25 bg-amber-500/10",
  },
  {
    icon: RotateCcw,
    label: "Reopened Cases",
    value: 8,
    color: "text-orange-400 border-orange-500/25 bg-orange-500/10",
  },
  {
    icon: Clock,
    label: "Avg. Resolution Days",
    value: 6.3,
    decimals: 1,
    color: "text-citi-lavender border-citi-lavender/25 bg-citi-lavender/10",
  },
  {
    icon: Users,
    label: "Community Supporters",
    value: 892,
    color: "text-purple-400 border-purple-500/25 bg-purple-500/10",
  },
];

export function CitiPulseSection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="pulse-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div className="citi-grid absolute inset-0 opacity-[0.03]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Live Citi Pulse"
          title="The city speaks through its data."
          lede="Real-time citi accountability metrics. Demo data shown — real deployments reflect actual complaint activity."
          align="center"
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:mt-16 sm:gap-5 md:grid-cols-3">
          {METRICS.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <SectionReveal key={metric.label} delay={i * 0.08}>
                <GlassCard className="h-full">
                  <GlassCardBody className="flex flex-col items-center gap-3 text-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border ${metric.color}`}
                    >
                      <Icon className="h-[1.375rem] w-[1.375rem]" aria-hidden />
                    </div>
                    <div>
                      <AnimatedCounter
                        value={metric.value}
                        decimals={metric.decimals ?? 0}
                        duration={1.6}
                        className="font-sans text-3xl font-bold text-white sm:text-4xl"
                      />
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-white/45">
                        {metric.label}
                      </p>
                    </div>
                  </GlassCardBody>
                </GlassCard>
              </SectionReveal>
            );
          })}
        </div>

        <SectionReveal delay={0.5} className="mt-8 text-center">
          <p className="font-mono text-[11px] text-white/25">
            Demo data — not real-world statistics
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
