"use client";

import { Inbox, Loader2, RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Explore feed states — loading, error, and empty conditions for the
 * public complaint feed. Honest states: no fake data, no fake success.
 */

export function ExploreFeedLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-[240px] place-items-center rounded-2xl border border-white/10 bg-white/[0.02]"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-citi-lavender/70" aria-hidden />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/45">
          Loading public complaints…
        </p>
      </div>
    </div>
  );
}

export function ExploreFeedError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="grid min-h-[240px] place-items-center rounded-2xl border border-red-500/20 bg-red-500/[0.04]"
    >
      <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
        <TriangleAlert className="h-6 w-6 text-red-300/80" aria-hidden />
        <p className="text-sm leading-relaxed text-white/70">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-white/70 transition-colors hover:border-citi-lavender/40 hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Try again
        </button>
      </div>
    </div>
  );
}

export function ExploreFeedEmpty({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
        <Inbox className="h-6 w-6 text-white/25" aria-hidden />
        <p className="text-sm leading-relaxed text-white/60">
          {hasFilters
            ? "No complaints match the current filters."
            : "No public complaints yet."}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-white/70 transition-colors hover:border-citi-lavender/40 hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Reset filters
          </button>
        ) : null}
      </div>
    </div>
  );
}