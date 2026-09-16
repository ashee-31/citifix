"use client";

import { Lightbulb, AlertTriangle, ShieldAlert, RotateCcw, Repeat2, TrendingUp } from "lucide-react";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { AuthorityInsight } from "./types";

const ICONS = { Lightbulb, AlertTriangle, ShieldAlert, RotateCcw, Repeat2, TrendingUp } as const;

const SEVERITY_TONE: Record<AuthorityInsight["severity"], string> = {
  critical: "text-red-400 border-red-500/25 bg-red-500/10",
  high: "text-amber-400 border-amber-500/25 bg-amber-500/10",
  medium: "text-sky-400 border-sky-500/25 bg-sky-500/10",
  low: "text-white/40 border-white/15 bg-white/5",
};

export function InsightList({ insights }: { insights: AuthorityInsight[] }) {
  if (insights.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm text-white/40">No significant insights right now.</p>
      </GlassCard>
    );
  }

  return (
    <Stagger className="grid gap-3 sm:grid-cols-2" stagger={0.05}>
      {insights.map((insight, i) => {
        const Icon = ([Lightbulb, AlertTriangle, ShieldAlert, RotateCcw, Repeat2, TrendingUp] as const)[i % 6];
        return (
          <StaggerItem key={`${insight.title}-${i}`}>
            <GlassCard className="h-full">
              <GlassCardBody>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${SEVERITY_TONE[insight.severity]}`}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90">{insight.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/50">{insight.body}</p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/30">
                      Confidence {insight.confidence}% · {insight.category}
                    </p>
                  </div>
                </div>
              </GlassCardBody>
            </GlassCard>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}