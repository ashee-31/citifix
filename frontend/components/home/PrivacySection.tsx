"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Lock, EyeOff, Server, Database, Shield } from "lucide-react";

/**
 * PrivacySection — strong privacy statement.
 * "Accountability doesn't require exposure."
 */

const PRIVACY_PILLARS = [
  {
    icon: Lock,
    title: "Citizen Identity Remains Private",
    detail:
      "Reporters are never publicly identified. Anonymous reporting is the default, not the exception.",
  },
  {
    icon: EyeOff,
    title: "Public Users See Nothing Personal",
    detail:
      "Community review shows complaint content and evidence — never the identity of who filed it.",
  },
  {
    icon: Server,
    title: "Authorities Receive Only What's Necessary",
    detail:
      "Location and complaint details are shared for resolution. Personal identity is not transmitted unless legally required.",
  },
  {
    icon: Database,
    title: "Blockchain Stores Proofs, Not Data",
    detail:
      "Only cryptographic hashes and event anchors go on-chain. No private complaint content, no personal information.",
  },
  {
    icon: Shield,
    title: "Raw Evidence Stays Off-Chain",
    detail:
      "Photos, documents, and detailed evidence remain in secure off-chain storage. Blockchain proves existence, not content.",
  },
];

export function PrivacySection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="privacy-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Privacy"
          title={
            <>
              Accountability doesn&apos;t require{" "}
              <span className="text-citi-lavender">exposure.</span>
            </>
          }
          lede="CitiFix is designed to maximize transparency while minimizing personal exposure."
          align="center"
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {PRIVACY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <StaggerItem key={pillar.title}>
                <GlassCard className="h-full">
                  <GlassCardBody className="flex flex-col gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-citi-lavender/15 bg-citi-lavender/[0.06]">
                      <Icon className="h-5 w-5 text-citi-lavender/70" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90">
                        {pillar.title}
                      </p>
                      <p className="mt-2 text-[11px] leading-relaxed text-white/40">
                        {pillar.detail}
                      </p>
                    </div>
                  </GlassCardBody>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Emphasis */}
        <SectionReveal delay={0.3} className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-citi-lavender/15 bg-citi-lavender/[0.05] px-6 py-3">
            <Lock className="h-4 w-4 text-citi-lavender/60" aria-hidden />
            <span className="font-mono text-xs font-medium tracking-wide text-citi-lavender/70">
              Transparency by design. Privacy by default.
            </span>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
