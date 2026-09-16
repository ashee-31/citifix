"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/supabase/auth";
import { cn } from "@/lib/utils/format";

/**
 * Community support button — one support per authenticated citizen per complaint.
 *
 * When not signed in, links to /login with the complaint context as a return
 * destination. When signed in, sends a POST to the support API endpoint.
 * Optimistically disables after success; prevents duplicate support.
 */
export function SupportButton({
  complaintId,
  initialCount,
  className,
}: {
  complaintId: string;
  initialCount: number;
  className?: string;
}) {
  const { user, loading: authLoading, real, accessToken } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [supported, setSupported] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSupport = useCallback(async () => {
    if (!user || supported || busy) return;
    setBusy(true);
    setError(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (real && accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      const res = await fetch(`/api/complaints/${complaintId}/support`, {
        method: "POST",
        headers,
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Support failed (${res.status})`);
      }
      const data = (await res.json()) as { ok: boolean; count: number };
      setCount(data.count);
      if (data.ok) setSupported(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Support failed");
    } finally {
      setBusy(false);
    }
  }, [complaintId, user, supported, busy, real, accessToken]);

  // Not signed in — show login prompt
  if (!authLoading && !user) {
    return (
      <a
        href={`/login?next=${encodeURIComponent(`/complaints/${complaintId}`)}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white/60 transition-colors hover:border-citi-lavender/40 hover:text-citi-lavender",
          className,
        )}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-citi-lavender/30" />
        Support
        <span className="ml-1 text-white/40">{count}</span>
      </a>
    );
  }

  // Signed in and already supported
  if (supported) {
    return (
      <span
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-citi-lavender/25 bg-citi-lavender/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-citi-lavender/80",
                className,
              )}
              role="status"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-citi-lavender" />
              Supported
              <span className="ml-1">{count}</span>
            </span>
    );
  }

  // Signed in, can support
  return (
    <div className={cn("inline-flex flex-col gap-1", className)}>
      <button
        type="button"
        onClick={() => void handleSupport()}
        disabled={busy}
        aria-label={`Support this complaint. Current count: ${count}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors",
          busy
            ? "cursor-wait text-white/40"
            : "text-white/60 hover:border-citi-lavender/40 hover:text-citi-lavender",
        )}
      >
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full transition-colors",
            busy ? "bg-citi-lavender/30 animate-pulse" : "bg-citi-lavender/40",
          )}
        />
        {busy ? "Supporting…" : "Support"}
        <span className="ml-1 text-white/40">{count}</span>
      </button>
      {error ? (
        <span className="font-mono text-[10px] text-rose-300/70">{error}</span>
      ) : null}
    </div>
  );
}
