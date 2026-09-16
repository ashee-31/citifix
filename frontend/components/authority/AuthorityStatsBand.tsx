"use client";

import { AlertTriangle, Clock3, Flame, RefreshCcw, ShieldAlert, Timer, UsersRound, Workflow } from "lucide-react";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { GlassCard } from "@/components/ui/GlassCard";

export interface AuthorityMetrics {
  critical: number; high: number; overdue: number; inProgress: number;
  awaitingEvidence: number; publicReview: number; disputed: number; reopened: number;
}

const cards = [
  ["critical", "Critical", Flame, "text-red-300"], ["high", "High priority", ShieldAlert, "text-orange-300"],
  ["overdue", "Overdue", Timer, "text-amber-300"], ["inProgress", "In progress", Workflow, "text-sky-300"],
  ["awaitingEvidence", "Awaiting evidence", Clock3, "text-violet-300"], ["publicReview", "Public review", UsersRound, "text-lime-300"],
  ["disputed", "Disputed", AlertTriangle, "text-rose-300"], ["reopened", "Reopened", RefreshCcw, "text-fuchsia-300"],
] as const;

export function AuthorityStatsBand({ stats }: { stats: AuthorityMetrics }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
    {cards.map(([key, label, Icon, tone]) => <GlassCard key={key} className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p><p className="mt-2 text-2xl font-bold text-white"><AnimatedCounter value={stats[key]} /></p></div><Icon className={`h-4 w-4 ${tone}`} aria-hidden /></div></GlassCard>)}
  </div>;
}
