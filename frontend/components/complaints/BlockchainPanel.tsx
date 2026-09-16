"use client";

import { useCallback, useState } from "react";
import {
  Box,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Link2,
  Hash,
  Fingerprint,
  Clock,
  Database,
  Scale,
} from "lucide-react";
import type { BlockchainProof } from "@/lib/types";
import { formatDateTime, shortHash } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";
import { isDemoMode, DEMO_MODE_LABEL } from "@/lib/demo/mode";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import {
  verifyComplaintProof,
  type ProofState,
  type ProofVerification,
} from "./types";

/**
 * BlockchainPanel — the anchored audit trail for one complaint.
 *
 * Truth rules:
 *  - No transaction hash is invented here; only `proof` fields from the API.
 *  - Verification runs the REAL recompute-and-compare endpoint
 *    (POST /api/blockchain/verify). The UI maps its result honestly:
 *      confirmed      → hash matches what is on-chain
 *      failed         → mismatch (tamper / drift) — NEVER shown as verified
 *      not-available  → no proof anchored, or verify endpoint unavailable
 *      pending        → verification in flight
 */

function Field({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 break-all text-sm text-white/70",
          mono ? "font-mono" : "",
        )}
      >
        {children}
      </p>
    </div>
  );
}

/** Ledger flow strip — Citi event → SHA-256 → Chain → Transaction. */
function LedgerFlow({ proof }: { proof: BlockchainProof }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        { label: "Citi event", value: "hashed" },
        { label: "Algorithm", value: "SHA-256" },
        { label: "Chain", value: proof.chain },
        { label: "Transaction", value: shortHash(proof.transaction_hash) },
      ].map((step) => (
        <div
          key={step.label}
          className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-center"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
            {step.label}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-citi-lavender/80">
            {step.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function BlockchainPanel({ proof }: { proof: BlockchainProof | null }) {
  const [state, setState] = useState<ProofState>("pending");
  const [result, setResult] = useState<ProofVerification | null>(null);

  const runVerify = useCallback(async () => {
    if (!proof) return;
    setState("pending");
    setResult(null);
    try {
      const res = await verifyComplaintProof(proof.complaint_id);
      setResult(res);
      setState(res.state);
    } catch {
      setState("not-available");
      setResult({
        state: "not-available",
        matches: null,
        verified: false,
        message: "Verification could not be completed right now.",
        onChainHash: null,
      });
    }
  }, [proof]);

  if (!proof) {
    return (
      <GlassCard>
        <GlassCardBody className="flex items-start gap-3">
          <Database className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden />
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
              Blockchain audit — not available
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              This complaint has no on-chain proof. No transaction hash is shown
              and nothing is claimed as verified. Depending on the environment,
              anchoring may be pending or disabled.
            </p>
          </div>
        </GlassCardBody>
      </GlassCard>
    );
  }

  const showResult = state !== "pending";

  return (
    <section aria-labelledby="blockchain-heading" className="space-y-4">
      <h2 id="blockchain-heading" className="sr-only">
        Blockchain audit trail
      </h2>

      <GlassCard>
        <GlassCardBody className="space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
              <Box className="h-3.5 w-3.5" aria-hidden />
              Blockchain audit trail
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
              {isDemoMode() ? `demo · ${DEMO_MODE_LABEL}` : "live"}
            </span>
          </div>

          {isDemoMode() ? (
            <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-3 py-2 text-xs leading-relaxed text-amber-200/70">
              Demo environment — chain and anchors are simulated. Verification
              still runs the real record-hash recompute, so a mismatch is
              reported honestly.
            </p>
          ) : null}

          {/* Lead-in line */}
          <p className="text-sm leading-relaxed text-white/55">
            Proving a resolution means a citi event produced a record, the
            record was hashed, and the hash was anchored to the chain. The
            proof below is the on-chain reference.{" "}
            <span className="text-white/75">
              No private citizen information is stored on-chain.
            </span>
          </p>

          {/* Ledger flow */}
          <LedgerFlow proof={proof} />

          {/* Fields */}
          <div className="grid gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2">
            <Field label="Chain" mono>
              {proof.chain}
            </Field>
            <Field label="Contract address" mono>
              {shortHash(proof.contract_address)}
            </Field>
            <Field label="Transaction hash" mono>
              {shortHash(proof.transaction_hash)}
            </Field>
            <Field label="Record hash" mono>
              {proof.record_hash}
            </Field>
            <Field label="Block" mono>
              {proof.block_number}
            </Field>
            <Field label="Anchored at">
              {formatDateTime(proof.anchored_at)}
            </Field>
            <div className="sm:col-span-2">
              <Field label="Canonical data (URI)" mono>
                {proof.data_uri}
              </Field>
            </div>
          </div>

          {/* Record hash visualization */}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
              <Fingerprint className="h-3.5 w-3.5" aria-hidden />
              Anchored record hash
            </p>
            <p className="mt-2 break-all font-mono text-sm leading-relaxed text-citi-lavender/90">
              {proof.record_hash}
            </p>
          </div>

          {/* Verify action + result */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runVerify}
                disabled={state === "pending"}
                className="inline-flex items-center gap-2 rounded-lg border border-citi-lavender/40 bg-citi-lavender/10 px-4 py-2.5 text-sm font-medium text-citi-lavender transition hover:bg-citi-lavender/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {state === "pending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Scale className="h-4 w-4" aria-hidden />
                )}
                {state === "pending" ? "Verifying…" : "Verify on chain"}
              </button>

              {state === "pending" ? (
                <p className="text-sm text-white/45">
                  Recomputing the record hash and comparing against the anchored
                  hash…
                </p>
              ) : null}
            </div>

            {showResult ? (
              <ResultBanner state={state} result={result} />
            ) : null}
          </div>
        </GlassCardBody>
      </GlassCard>
    </section>
  );
}

function ResultBanner({
  state,
  result,
}: {
  state: ProofState;
  result: ProofVerification | null;
}) {
  if (!result) return null;

  const confirmed =
    state === "confirmed" && result.matches === true && result.verified;
  const failed = state === "failed" || result.matches === false;

  if (confirmed) {
    return (
      <div className="mt-3 flex items-start gap-3 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-emerald-200">Verified on chain</p>
          <p className="mt-0.5 text-sm leading-relaxed text-white/55">
            {result.message}
          </p>
          {result.onChainHash ? (
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/35">
              on-chain hash: {result.onChainHash}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="mt-3 flex items-start gap-3 rounded-lg border border-red-400/25 bg-red-400/[0.06] px-3 py-2.5">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-red-200">Proof mismatch</p>
          <p className="mt-0.5 text-sm leading-relaxed text-white/55">
            {result.message ??
              "The recomputed record does not match the anchored hash."}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/35">
            Not verified — do not treat this complaint as verified.
          </p>
        </div>
      </div>
    );
  }

  // not-available
  return (
    <div className="mt-3 flex items-start gap-3 rounded-lg border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2.5">
      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-amber-200">
          Verification not available
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-white/55">
          {result.message ?? "The verification service could not be reached."}
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/35">
          Not verified — provisioning may be pending.
        </p>
      </div>
    </div>
  );
}