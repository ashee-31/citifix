"use client";

import { useState } from "react";
import { CheckCircle2, Flag, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";
import type { PublicComplaint } from "@/lib/types";

export function ResolutionReviewActions({ complaint, onComplete }: { complaint: PublicComplaint; onComplete: () => void }) {
  const { user, accessToken, real } = useAuth();
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [busy, setBusy] = useState<"approved" | "disputed" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  if (complaint.status !== "PUBLIC_REVIEW") return null;
  async function submit(decision: "approved" | "disputed") {
    if (!user) { setMessage("Sign in as a citizen to review this resolution."); return; }
    setBusy(decision); setMessage(null);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (real && accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const res = await fetch(`/api/complaints/${complaint.id}/review`, { method: "POST", headers, body: JSON.stringify({ decision, reason, evidenceUrl: evidenceUrl || undefined }) });
      const json = await res.json().catch(() => null) as { error?: string } | null;
      if (!res.ok) throw new Error(json?.error ?? "Unable to save review.");
      setMessage(decision === "approved" ? "Resolution approved. The complaint is resolved." : "Dispute recorded. The complaint has been reopened.");
      onComplete();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save review."); }
    finally { setBusy(null); }
  }
  return <section className="rounded-xl border border-lime-400/25 bg-lime-400/[0.05] p-5" aria-labelledby="review-actions-heading">
    <h2 id="review-actions-heading" className="text-base font-semibold text-white">Community resolution review</h2>
    <p className="mt-1 text-sm text-white/60">AI assessment, blockchain proof, and your community decision are separate. Review the before/after evidence before acting.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><button disabled={Boolean(busy)} onClick={() => void submit("approved")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-100 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{busy === "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve resolution"}</button><button disabled={Boolean(busy)} onClick={() => void submit("disputed")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-400/35 bg-rose-400/10 px-4 py-2.5 text-sm font-medium text-rose-100 disabled:opacity-50"><Flag className="h-4 w-4" />Request reopening</button></div>
    <label className="mt-4 block text-xs text-white/60">Reason required for a dispute<textarea value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 min-h-20 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white" placeholder="Explain what remains unresolved or questionable." /></label>
    <label className="mt-3 block text-xs text-white/60">Optional public supporting-image URL<input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white" placeholder="https://…" /></label>
    {message ? <p role="status" className="mt-3 text-sm text-white/75">{message}</p> : null}
  </section>;
}
