"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BlurInText } from "@/components/motion/BlurInText";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ShieldCheck, MapPin } from "lucide-react";

/**
 * HomeHero — the opening cinematic section.
 * Full viewport height, atmospheric background, headline with blur-in,
 * dual CTAs. "Citi problems shouldn't disappear."
 */
export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative flex min-h-[92vh] items-center justify-center overflow-hidden"
      aria-label="CitiFix homepage hero"
    >
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-citi-black" aria-hidden />

      {/* Grid pattern */}
      <div className="citi-grid absolute inset-0 opacity-[0.04]" aria-hidden />

      {/* Radial glow */}
      <div
        className="absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(102,78,174,0.4) 0%, rgba(26,5,84,0.2) 40%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Floating nodes — abstract citi network */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {[
          { x: "12%", y: "25%", delay: 0, size: 3 },
          { x: "82%", y: "18%", delay: 0.4, size: 2 },
          { x: "28%", y: "72%", delay: 0.8, size: 2.5 },
          { x: "75%", y: "65%", delay: 1.2, size: 2 },
          { x: "55%", y: "85%", delay: 1.6, size: 1.5 },
          { x: "8%", y: "55%", delay: 2.0, size: 2 },
          { x: "92%", y: "42%", delay: 0.6, size: 1.5 },
          { x: "42%", y: "12%", delay: 1.0, size: 2.5 },
        ].map((node, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-citi-lavender/20 bg-citi-lavender/10"
            style={{
              left: node.x,
              top: node.y,
              width: node.size * 8,
              height: node.size * 8,
            }}
            initial={reduce ? { opacity: 0.3 } : { opacity: 0, scale: 0 }}
            animate={
              reduce
                ? { opacity: 0.3 }
                : {
                    opacity: [0, 0.5, 0.3],
                    scale: [0, 1.1, 1],
                  }
            }
            transition={{
              duration: 1.8,
              delay: node.delay,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Connecting lines (decorative SVG) */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.06]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <motion.line
            x1="12" y1="25" x2="28" y2="72"
            stroke="#C4A8FF" strokeWidth="0.15"
            initial={reduce ? {} : { pathLength: 0 }}
            animate={reduce ? {} : { pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />
          <motion.line
            x1="28" y1="72" x2="55" y2="85"
            stroke="#C4A8FF" strokeWidth="0.15"
            initial={reduce ? {} : { pathLength: 0 }}
            animate={reduce ? {} : { pathLength: 1 }}
            transition={{ duration: 2, delay: 0.9 }}
          />
          <motion.line
            x1="55" y1="85" x2="75" y2="65"
            stroke="#C4A8FF" strokeWidth="0.15"
            initial={reduce ? {} : { pathLength: 0 }}
            animate={reduce ? {} : { pathLength: 1 }}
            transition={{ duration: 2, delay: 1.3 }}
          />
          <motion.line
            x1="75" y1="65" x2="82" y2="18"
            stroke="#C4A8FF" strokeWidth="0.15"
            initial={reduce ? {} : { pathLength: 0 }}
            animate={reduce ? {} : { pathLength: 1 }}
            transition={{ duration: 2, delay: 1.7 }}
          />
          <motion.line
            x1="82" y1="18" x2="42" y2="12"
            stroke="#C4A8FF" strokeWidth="0.15"
            initial={reduce ? {} : { pathLength: 0 }}
            animate={reduce ? {} : { pathLength: 1 }}
            transition={{ duration: 2, delay: 2.1 }}
          />
          <motion.line
            x1="12" y1="25" x2="8" y2="55"
            stroke="#C4A8FF" strokeWidth="0.15"
            initial={reduce ? {} : { pathLength: 0 }}
            animate={reduce ? {} : { pathLength: 1 }}
            transition={{ duration: 2, delay: 1.1 }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
        <SectionReveal delay={0.1}>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-citi-lavender/60 sm:text-sm">
            AI-Powered Citi Accountability
          </p>
        </SectionReveal>

        <BlurInText
          as="h1"
          className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          CITI PROBLEMS
          <br />
          <span className="bg-gradient-to-r from-citi-lavender to-citi-purple bg-clip-text text-transparent">
            SHOULDN&apos;T DISAPPEAR.
          </span>
        </BlurInText>

        <BlurInText
          as="p"
          delay={0.2}
          className="mt-4 text-2xl font-bold tracking-tight text-white/80 sm:text-3xl md:text-4xl lg:text-5xl"
        >
          THEIR HISTORY SHOULDN&apos;T EITHER.
        </BlurInText>

        <SectionReveal delay={0.5}>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-white/55 sm:text-xl">
            CitiFix makes every citi complaint traceable, every resolution
            provable, and every important action auditable.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.65}>
          <p className="mt-4 font-mono text-sm tracking-wide text-citi-lavender/70">
            Report it. Track it. Verify it.
          </p>
        </SectionReveal>

        <SectionReveal delay={0.8}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/report"
              className="inline-flex items-center gap-2.5 rounded-xl border border-citi-lavender/40 bg-citi-lavender/10 px-7 py-3.5 text-sm font-semibold text-citi-lavender transition-all hover:bg-citi-lavender/20 hover:shadow-[0_0_30px_rgba(196,168,255,0.25)] focus-visible:outline-2 focus-visible:outline-citi-lavender"
            >
              <ShieldCheck className="h-[1.125rem] w-[1.125rem]" />
              Report an Issue
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-white/80 transition-all hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-citi-lavender"
            >
              <MapPin className="h-[1.125rem] w-[1.125rem]" />
              Explore the City
            </Link>
          </div>
        </SectionReveal>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-citi-black to-transparent"
        aria-hidden
      />
    </section>
  );
}
