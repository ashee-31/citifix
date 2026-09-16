"use client";

import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Users, List } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { GlassCard } from "@/components/ui/GlassCard";
import type { MyCitiStats } from "./types";

const STATS: {
  key: keyof MyCitiStats;
  icon: typeof Activity;
  label: string;
  color: string;
  decimals?: boolean;
}[] = [
  { key: "total", icon: List, label: "Total submitted", color: "text-citi-lavender border-citi-lavender/25 bg-citi-lavender/10" },
  { key: "active", icon: Activity, label: "In progress", color: "text-sky-400 border-sky-500/25 bg-sky-500/10" },
  { key: "resolved", icon: CheckCircle2, label: "Resolved", color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10" },
  { key: "disputed", icon: AlertTriangle, label: "Disputed", color: "text-amber-400 border-amber-500/25 bg-amber-500/10" },
  { key: "withEvidence", icon: ShieldCheck, label: "Evidence-backed", color: "text-purple-400 border-purple-500/25 bg-purple-500/10" },
  { key: "supportReceived", icon: Users, label: "Community support", color: "text-teal-400 border-teal-500/25 bg-teal-500/10" },
];

export function MyCitiStatsBar({ stats }: { stats: MyCitiStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STATS.map((s) => {
        const Icon = s.icon;
        const val = stats[s.key];
        return (
          <GlassCard key={s.key} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {s.label}
                </p>
                <p className="mt-2 font-sans text-2xl font-bold text-white">
                  <AnimatedCounter
                    value={typeof val === "number" ? val : 0}
                    decimals={s.decimals ? 1 : 0}
                  />
                </p>
              </div>
              <div
                className={`rounded-lg border p-2 ${s.color}`}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}