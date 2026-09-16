"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ShieldCheck, MapPin } from "lucide-react";

/**
 * FinalCTA — the closing cinematic call-to-action.
 * "Don't just mark it resolved. Prove it."
 */
export function FinalCTA() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden py-28 sm:py-36"
      aria-labelledby="cta-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div className="citi-grid absolute inset-0 opacity-[0.03]" aria-hidden />

      {/* Radial glow */}
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(196,168,255,0.08) 0%, rgba(102,78,174,0.04) 40%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <SectionReveal>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-citi-lavender/60">
            The future of citi accountability
          </p>
        </SectionReveal>

        <motion.h2
          id="cta-heading"
          className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(12px)" }}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          DON&apos;T JUST MARK IT
          <br />
          <span className="bg-gradient-to-r from-citi-lavender to-citi-purple bg-clip-text text-transparent">
            RESOLVED.
          </span>
        </motion.h2>

        <SectionReveal delay={0.25}>
          <p className="mt-6 text-3xl font-bold tracking-tight text-white/80 sm:text-4xl md:text-5xl">
            PROVE IT.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.45}>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/report"
              className="inline-flex items-center gap-2.5 rounded-xl border border-citi-lavender/40 bg-citi-lavender/10 px-8 py-4 text-sm font-semibold text-citi-lavender transition-all hover:bg-citi-lavender/20 hover:shadow-[0_0_30px_rgba(196,168,255,0.25)] focus-visible:outline-2 focus-visible:outline-citi-lavender"
            >
              <ShieldCheck className="h-[1.125rem] w-[1.125rem]" />
              Report an Issue
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-citi-lavender"
            >
              <MapPin className="h-[1.125rem] w-[1.125rem]" />
              Explore the City
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
