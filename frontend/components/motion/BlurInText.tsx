"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * BlurInText — large headline that sharpens from a blurred state as it
 * enters the viewport. Used for the hero and key narrative moments.
 *
 * Reduced motion: plain opacity fade (no blur/transform).
 */
export function BlurInText({
  children,
  className,
  delay = 0,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "span" | "div" | "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
    const MotionTag = {
      span: motion.span,
      div: motion.div,
      h1: motion.h1,
      h2: motion.h2,
      h3: motion.h3,
      p: motion.p,
    }[Tag];

    return (
      <MotionTag
      initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(12px)", y: 12 }}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, filter: "blur(0px)", y: 0 }
      }
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
          </MotionTag>
  );
}