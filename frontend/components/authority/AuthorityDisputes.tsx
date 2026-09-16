"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowUpRight, ShieldAlert } from "lucide-react";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import type { Complaint } from "@/lib/types";
import { timeAgo } from "@/lib/utils/format";

export function DisputedComplaintsList({ complaints }: { complaints: Complaint[] }) {
  if (complaints.length === 0) {
    return (
      <GlassCard className="p-6">
        <p className="text-sm text-white/40">
          No disputed or reopened complaints right now.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="grid gap-3">
      {complaints.map((c) => (
        <GlassCard key={c.id} className="h-full">
          <GlassCardBody>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-citi-lavender">
                    {c.complaint_number}
                  </span>
                  {c.status === "DISPUTED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                      <AlertTriangle className="h-3 w-3" aria-hidden /> Disputed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-rose-300">
                      <RotateCcw className="h-3 w-3" aria-hidden /> Reopened
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug text-white/90">
                  {c.description.slice(0, 140)}
                  {c.description.length > 140 ? "…" : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-white/35">
                  <span>{c.location_label}</span>
                  <span>{c.category}</span>
                  <span>{timeAgo(c.created_at)}</span>
                </div>
                {c.safety_risk === "High" || c.safety_risk === "Critical" ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-red-300">
                    <ShieldAlert className="h-3 w-3" aria-hidden /> {c.safety_risk} safety risk
                  </span>
                ) : null}
              </div>
              <Link
                href={`/complaints/${c.id}`}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/70 transition-colors hover:border-citi-lavender/40 hover:text-citi-lavender"
              >
                Dossier <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </GlassCardBody>
        </GlassCard>
      ))}
    </div>
  );
}