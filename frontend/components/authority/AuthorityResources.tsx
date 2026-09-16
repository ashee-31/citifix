"use client";

import { MapPin, Siren, Flame } from "lucide-react";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import type { ResourceAllocation } from "./types";

export function ResourceAllocationSection({ allocations }: { allocations: ResourceAllocation[] }) {
  if (allocations.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm text-white/40">No resource allocation data.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <GlassCardBody>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-white">Resource allocation suggestions</h3>
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/30">
            Decision support — not automatic deployment
          </p>
        </div>

        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2" stagger={0.05}>
          {allocations.map((a) => (
            <StaggerItem key={`${a.area}-${a.totalComplaints}`}>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-citi-lavender" aria-hidden />
                  <p className="text-sm font-semibold text-white">{a.area}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/60">
                    {a.totalComplaints} complaints
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 font-mono text-[10px] text-red-300">
                    <Siren className="h-3 w-3" aria-hidden /> {a.criticalCount} critical
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-mono text-[10px] text-amber-300">
                    <Flame className="h-3 w-3" aria-hidden /> {a.highCount} high
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/35">
                    <span>Avg priority</span>
                    <span>{a.avgPriority}/100</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#664EAE] to-[#C4A8FF]"
                      style={{ width: `${Math.min(100, a.avgPriority)}%` }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-white/45">
                  <span className="text-white/60">Suggested focus:</span> {a.suggestedFocus}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </GlassCardBody>
    </GlassCard>
  );
}