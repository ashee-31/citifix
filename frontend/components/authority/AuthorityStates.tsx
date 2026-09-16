"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal } from "@/components/motion/SectionReveal";

export function AuthorityLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4 text-white/50">
        <Loader2 className="h-8 w-8 animate-spin text-citi-lavender" aria-hidden />
        <p className="font-mono text-xs uppercase tracking-[0.2em]">
          Computing authority intelligence…
        </p>
      </div>
    </div>
  );
}

export function AuthorityError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <GlassCard className="mx-auto max-w-md p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-300">
          <TriangleAlert className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold text-white">Intelligence unavailable</h2>
        <p className="text-sm text-white/55">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-xl border border-citi-lavender/40 bg-citi-lavender/10 px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-citi-lavender transition-colors hover:bg-citi-lavender/20"
        >
          Try again
        </button>
      </div>
    </GlassCard>
  );
}

export function AuthorityEmpty() {
  return (
    <SectionReveal>
      <GlassCard className="mx-auto max-w-lg p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-citi-lavender/25 bg-citi-lavender/10 text-citi-lavender">
            <span className="font-mono text-xl">00</span>
          </span>
          <h2 className="text-xl font-semibold text-white">No complaint data yet</h2>
          <p className="max-w-sm text-sm leading-relaxed text-white/55">
            Authority intelligence is computed from live complaint data. When
            citizens report issues, this console will surface priorities,
            safety risks, and resource recommendations.
          </p>
        </div>
      </GlassCard>
    </SectionReveal>
  );
}