"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ScanEye,
  AlertTriangle,
  MapPin,
  Clock,
  Fingerprint,
  ThumbsUp,
} from "lucide-react";

/**
 * EvidenceAISection — the computer-vision/evidence system.
 * Scanning visual, signal cards, and the critical "AI assessment — not truth" disclaimer.
 */

const SIGNALS = [
  {
    icon: ThumbsUp,
    label: "Evidence Quality",
    detail: "Photo clarity, angle, and relevance assessment",
  },
  {
    icon: AlertTriangle,
    label: "Severity Risk",
    detail: "Safety hazard detection and urgency scoring",
  },
  {
    icon: MapPin,
    label: "Location Consistency",
    detail: "Cross-referencing reported location with evidence metadata",
  },
  {
    icon: Clock,
    label: "Timestamp Check",
    detail: "Metadata validation for freshness and manipulation",
  },
  {
    icon: Fingerprint,
    label: "Suspicious Signals",
    detail: "Duplicate, outdated, or manipulated evidence detection",
  },
  {
    icon: ScanEye,
    label: "Before/After Match",
    detail: "Visual consistency across complaint and resolution evidence",
  },
];

export function EvidenceAISection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="evidence-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at 70% 40%, rgba(196,168,255,0.08) 0%, transparent 55%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Evidence AI"
          title="Every piece of evidence is independently assessed."
          lede="AI evaluates quality, severity, and consistency — not to replace human judgment, but to make it informed."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          {/* Scanning visual */}
          <SectionReveal>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              {/* Fake "photo" with scan overlay */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-citi-violet/40 via-citi-black to-citi-violet/20">
                {/* Illustrative content blocks */}
                <div className="absolute inset-6 flex flex-col justify-end gap-2">
                  <div className="h-2 w-1/3 rounded-full bg-white/10" />
                  <div className="h-2 w-2/3 rounded-full bg-white/[0.06]" />
                  <div className="h-2 w-1/2 rounded-full bg-white/[0.04]" />
                </div>

                {/* Scan line */}
                <motion.div
                  className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-citi-lavender/50 to-transparent"
                  initial={reduce ? { opacity: 0.5 } : { top: "10%" }}
                  animate={
                    reduce
                      ? { opacity: 0.5 }
                      : { top: ["10%", "85%", "10%"] }
                  }
                  transition={
                    reduce
                      ? undefined
                      : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }
                />

                {/* Status overlay */}
                <div className="absolute right-4 top-4 rounded-lg border border-citi-lavender/20 bg-citi-black/80 px-3 py-1.5 font-mono text-[11px] text-citi-lavender/80 backdrop-blur-sm">
                  ANALYZING EVIDENCE
                </div>

                {/* Detection boxes */}
                <motion.div
                  className="absolute left-[15%] top-[25%] h-20 w-28 rounded border border-emerald-400/40"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={reduce ? { opacity: 0.6 } : { opacity: [0, 0.6, 0.3], scale: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <motion.div
                  className="absolute bottom-[30%] right-[20%] h-16 w-16 rounded border border-amber-400/40"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={reduce ? { opacity: 0.6 } : { opacity: [0, 0.6, 0.3], scale: 1 }}
                  transition={{ duration: 1.5, delay: 1.0 }}
                />
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                  <span className="font-mono text-[11px] text-emerald-400/80">
                    Quality: 87%
                  </span>
                </div>
                <span className="font-mono text-[11px] text-white/40">
                  Severity: HIGH · Safety: ELEVATED
                </span>
              </div>
            </div>
          </SectionReveal>

          {/* Signal cards */}
          <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1" stagger={0.08}>
            {SIGNALS.map((signal) => {
              const Icon = signal.icon;
              return (
                <StaggerItem key={signal.label}>
                  <GlassCard className="group">
                    <GlassCardBody className="flex items-start gap-3.5">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-citi-lavender/15 bg-citi-lavender/[0.06] transition-colors group-hover:border-citi-lavender/30">
                        <Icon className="h-[1.125rem] w-[1.125rem] text-citi-lavender/70" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/90">
                          {signal.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                          {signal.detail}
                        </p>
                      </div>
                    </GlassCardBody>
                  </GlassCard>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        {/* Disclaimer */}
        <SectionReveal delay={0.3} className="mx-auto mt-10 max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400/60">
            AI assessment — not absolute truth.
          </p>
          <p className="mt-2 text-sm text-white/40">
            The AI provides informed signals to support human decision-making.
            Final authority always rests with citizens and public review.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
