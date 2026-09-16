"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * SectionReveal — scroll-triggered reveal wrapper.
 *
 * Respects prefers-reduced-motion: when reduced motion is requested, content
 * fades in with no translate/scale (opacity only) so the page stays usable
 * without vestibular discomfort.
 */

const REDUCED_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

const FULL_VARIANTS = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function SectionReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "header" | "footer" | "article" | "aside";
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={reduce ? REDUCED_VARIANTS : FULL_VARIANTS}
      transition={reduce ? undefined : { delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Alias kept for readability at call sites. */
export const Reveal = SectionReveal;