"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hash, Link2, ShieldCheck, Globe } from "lucide-react";

/**
 * BlockchainSection — the blockchain audit trail visual.
 * Hash flow: Citi event → SHA-256 → Blockchain → Transaction → Public verification
 */

const HASH_FLOW = [
  {
    icon: Hash,
    label: "Citi Event",
    detail: "A recorded action in the complaint lifecycle",
    color: "text-sky-400 border-sky-500/25 bg-sky-500/10",
  },
  {
    icon: Link2,
    label: "SHA-256 Hash",
    detail: "Cryptographic fingerprint of the event data",
    color: "text-amber-400 border-amber-500/25 bg-amber-500/10",
  },
  {
    icon: ShieldCheck,
    label: "Blockchain Anchor",
    detail: "Immutable record on a public ledger",
    color: "text-citi-lavender border-citi-lavender/25 bg-citi-lavender/10",
  },
  {
    icon: Globe,
    label: "Public Verification",
    detail: "Anyone can independently verify the audit trail",
    color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
  },
];

// Illustrative hashes — real-looking but not from actual chain
const DEMO_HASH = "0x6cde92ab8f3c71ab83d4e5f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0";

export function BlockchainSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="blockchain-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div className="citi-grid absolute inset-0 opacity-[0.025]" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Blockchain Audit Trail"
          title="Every action has an immutable proof."
          lede="Blockchain preserves the audit trail. No private citizen information goes on-chain."
        />

        {/* Hash flow visual */}
        <Stagger className="mt-14 flex flex-col items-center gap-3 sm:mt-16 sm:flex-row sm:justify-center sm:gap-0" stagger={0.12}>
          {HASH_FLOW.map((step, i) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.label} className="w-full sm:w-auto">
                <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg ${step.color}`}
                  >
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm font-bold text-white/90">
                      {step.label}
                    </p>
                    <p className="mt-1 max-w-[180px] text-[11px] text-white/40">
                      {step.detail}
                    </p>
                  </div>
                </div>
                {i < HASH_FLOW.length - 1 && (
                  <>
                    <div className="mx-4 hidden h-px w-8 bg-white/10 sm:block" aria-hidden />
                    <div className="ml-4 h-px w-8 bg-white/10 sm:hidden" aria-hidden />
                  </>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Hash display */}
        <SectionReveal delay={0.3} className="mx-auto mt-14 max-w-3xl">
          <GlassCard>
            <GlassCardBody className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                <span className="font-mono text-[11px] text-emerald-400/80">
                  BLOCKCHAIN ANCHORED
                </span>
              </div>
              <div className="w-full overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <p className="whitespace-nowrap font-mono text-xs text-citi-lavender/60">
                  {DEMO_HASH}
                </p>
              </div>
              <p className="text-xs text-white/40">
                Illustrative hash — real transactions anchor actual complaint events
              </p>
            </GlassCardBody>
          </GlassCard>
        </SectionReveal>

        {/* Privacy note */}
        <SectionReveal delay={0.4} className="mx-auto mt-8 max-w-2xl text-center">
          <p className="font-mono text-sm font-medium text-citi-lavender/70">
            No private citizen information goes on-chain.
          </p>
          <p className="mt-2 text-sm text-white/40">
            Blockchain stores proofs and hashes — not personal complaint data.
            Raw evidence remains off-chain, accessible only through authorized channels.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
