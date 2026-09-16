"use client";

import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Users,
  ThumbsUp,
  ShieldQuestion,
  RotateCcw,
  Lock,
} from "lucide-react";

/**
 * CommunitySection — citizens as part of the accountability loop.
 * Shows support, review, dispute, and privacy protection.
 */

const CAPABILITIES = [
  {
    icon: ThumbsUp,
    title: "Support Complaints",
    detail:
      "Citizens can add community support to active complaints, signaling urgency without exposing their identity.",
  },
  {
    icon: ShieldQuestion,
    title: "Review Resolution Evidence",
    detail:
      "Anyone can examine submitted proof — before photos, after photos, AI assessments, and metadata.",
  },
  {
    icon: RotateCcw,
    title: "Dispute Questionable Proof",
    detail:
      "If resolution evidence seems outdated, insufficient, or suspicious, citizens can trigger a formal dispute that reopens the case.",
  },
  {
    icon: Lock,
    title: "Identity Always Protected",
    detail:
      "Support, review, and dispute actions never expose citizen identity. Transparency does not require exposure.",
  },
];

export function CommunitySection() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="community-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(196,168,255,0.07) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Community Verification"
          title="Citizens are part of the accountability loop."
          lede="Not bystanders. Active participants who can support, review, and dispute — while remaining anonymous."
        />

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <StaggerItem key={cap.title}>
                <GlassCard className="h-full">
                  <GlassCardBody className="flex flex-col gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-citi-lavender/15 bg-citi-lavender/[0.06]">
                      <Icon className="h-5 w-5 text-citi-lavender/70" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90">
                        {cap.title}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-white/45">
                        {cap.detail}
                      </p>
                    </div>
                  </GlassCardBody>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Emphasis */}
        <SectionReveal delay={0.4} className="mx-auto mt-12 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5">
            <Users className="h-4 w-4 text-citi-lavender/60" aria-hidden />
            <span className="font-mono text-xs text-white/50">
              Do NOT expose citizen identity. Ever.
            </span>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
