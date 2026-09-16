"use client";

import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import type { ExploreStats } from "./types";

/**
 * ExploreStatsBand — dashboard metrics computed live from the actual
 * fetched dataset. Numbers always reflect the real repository/API data
 * (demo or live); they are never invented.
 */

interface Metric {
  key: keyof ExploreStats;
  icon: typeof Activity;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  color: string;
}

function metricCells(stats: ExploreStats): Metric[] {
  const decimals = stats.avgResolutionDays !== null && stats.avgResolutionDays % 1 !== 0;
  return [
    {
      key: "total",
      icon: Database,
      label: "Complaints",
      value: stats.total,
      color: "text-citi-lavender border-citi-lavender/25 bg-citi-lavender/10",
    },
    {
      key: "active",
      icon: Activity,
      label: "Active",
      value: stats.active,
      color: "text-sky-400 border-sky-500/25 bg-sky-500/10",
    },
    {
      key: "resolved",
      icon: CheckCircle2,
      label: "Resolved",
      value: stats.resolved,
      color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
    },
    {
      key: "disputedReopened",
      icon: AlertTriangle,
      label: "Disputed / Reopened",
      value: stats.disputedReopened,
      color: "text-amber-400 border-amber-500/25 bg-amber-500/10",
    },
    {
      key: "evidenceBacked",
      icon: ShieldCheck,
      label: "Evidence-backed resolutions",
      value: stats.evidenceBacked,
      color: "text-purple-400 border-purple-500/25 bg-purple-500/10",
    },
    {
      key: "avgResolutionDays",
      icon: Clock,
      label: "Avg. resolution days",
      value: stats.avgResolutionDays ?? 0,
      decimals: decimals ? 1 : 0,
      suffix: stats.avgResolutionDays === null ? "—" : "d",
      color: "text-teal-400 border-teal-500/25 bg-teal-500/10",
    },
  ];
}

export function ExploreStatsBand({ stats }: { stats: ExploreStats }) {
  const cells = metricCells(stats);

  return (
    <SectionReveal>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {cells.map((cell, i) => {
          const Icon = cell.icon;
          return (
            <GlassCard key={cell.label} className="h-full">
              <GlassCardBody className="flex flex-col gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${cell.color}`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </div>
                <div>
                  {cell.suffix === "—" ? (
                    <p className="font-sans text-2xl font-bold text-white/50">—</p>
                  ) : (
                    <AnimatedCounter
                      value={cell.value}
                      decimals={cell.decimals ?? 0}
                      suffix={cell.suffix === "d" ? " d" : ""}
                      className="font-sans text-2xl font-bold text-white"
                    />
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/45">
                    {cell.label}
                  </p>
                </div>
              </GlassCardBody>
            </GlassCard>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">
          {stats.mode === "demo" ? "Demo dataset — not real-world statistics" : "Live dataset"}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">
          Computed from the current dataset
        </p>
      </div>
    </SectionReveal>
  );
}