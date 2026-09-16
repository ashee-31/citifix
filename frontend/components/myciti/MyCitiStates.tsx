"use client";

import { Loader2, TriangleAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionReveal } from "@/components/motion/SectionReveal";

export function MyCitiLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4 text-white/50">
        <Loader2 className="h-8 w-8 animate-spin text-citi-lavender" aria-hidden />
        <p className="font-mono text-xs uppercase tracking-[0.2em]">
          Syncing your citi account…
        </p>
      </div>
    </div>
  );
}

export function MyCitiError({
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
        <h2 className="text-lg font-semibold text-white">We couldn&apos;t load your dashboard</h2>
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

export function MyCitiEmpty() {
  return (
    <SectionReveal>
      <GlassCard className="mx-auto max-w-lg p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-citi-lavender/25 bg-citi-lavender/10 text-citi-lavender">
            <span className="font-mono text-xl">01</span>
          </span>
          <h2 className="text-xl font-semibold text-white">No complaints yet</h2>
          <p className="max-w-sm text-sm leading-relaxed text-white/55">
            When you report an issue, it will appear here with its full
            accountability timeline — AI assessment, resolution proof, and
            community verification.
          </p>
          <a
            href="/report"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-citi-lavender px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#0C0B13] transition-opacity hover:opacity-90"
          >
            Report an issue
          </a>
        </div>
      </GlassCard>
    </SectionReveal>
  );
}

export function MyCitiUnauthenticated() {
  return (
    <SectionReveal>
      <GlassCard className="mx-auto max-w-md p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-citi-lavender/30 bg-citi-lavender/10 text-citi-lavender">
            <span className="font-mono text-lg">01</span>
          </span>
          <h2 className="text-xl font-semibold text-white">Sign in to view your citi account</h2>
          <p className="text-sm leading-relaxed text-white/55">
            Your complaints, status updates, and resolution reviews are private
            to you. Sign in to continue.
          </p>
          <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-citi-lavender px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#0C0B13] transition-opacity hover:opacity-90"
            >
              Sign in
            </a>
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-mono text-xs uppercase tracking-wider text-white/70 transition-colors hover:border-citi-lavender/40 hover:text-citi-lavender"
            >
              Create an account
            </a>
          </div>
        </div>
      </GlassCard>
    </SectionReveal>
  );
}