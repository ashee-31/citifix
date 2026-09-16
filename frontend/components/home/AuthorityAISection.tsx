"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Clock,
  DollarSign,
  Users,
  ArrowUpRight,
} from "lucide-react";

/**
 * AuthorityAISection — the authority-side AI intelligence.
 * Decision-support insights, not automatic actions.
 */

const INTEL_CARDS = [
  {
    icon: AlertTriangle,
    title: "Highest Safety Risks",
    detail: "Complaints flagged with critical safety scores requiring immediate attention",
    metric: "3 active",
    color: "text-red-400 border-red-500/25 bg-red-500/10",
  },
  {
    icon: TrendingUp,
    title: "Fastest-Growing Category",
    detail: "Water supply complaints up 34% this quarter — emerging pattern",
    metric: "+34%",
    color: "text-amber-400 border-amber-500/25 bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Biggest Backlog",
    detail: "Road maintenance has the longest unresolved queue — 18 cases",
    metric: "18 cases",
    color: "text-sky-400 border-sky-500/25 bg-sky-500/10",
  },
  {
    icon: Clock,
    title: "Needs Priority Review",
    detail: "Complaints exceeding expected resolution timelines without escalation",
    metric: "5 overdue",
    color: "text-orange-400 border-orange-500/25 bg-orange-500/10",
  },
  {
    icon: DollarSign,
    title: "Estimated Budget Impact",
    detail: "AI-assisted budget projection based on complaint categories and severity",
    metric: "Decision support",
    color: "text-citi-lavender border-citi-lavender/25 bg-citi-lavender/10",
  },
  {
    icon: Users,
    title: "Resource Allocation",
    detail: "Suggested deployment based on geographic density and complaint type",
    metric: "AI-assisted",
    color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  },
  {
    icon: ArrowUpRight,
    title: "Likely Escalations",
    detail: "Cases with high community support and repeated reports — likely to escalate",
    metric: "2 likely",
    color: "text-purple-400 border-purple-500/25 bg-purple-500/10",
  },
];

export function AuthorityAISection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="authority-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at 60% 30%, rgba(102,78,174,0.1) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Authority Intelligence"
          title="Decision support, not automatic action."
          lede="AI provides insights to help authorities allocate resources, prioritize risks, and identify emerging patterns. Every decision remains human."
        />

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" stagger={0.06}>
          {INTEL_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <StaggerItem key={card.title}>
                <GlassCard className="h-full">
                  <GlassCardBody className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.color}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <span className="font-mono text-[11px] font-medium text-white/35">
                        {card.metric}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90">
                        {card.title}
                      </p>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-white/40">
                        {card.detail}
                      </p>
                    </div>
                  </GlassCardBody>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </Stagger>

        <SectionReveal delay={0.3} className="mx-auto mt-10 max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">
            Decision-support insights — not automatic status changes or financial actions
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
