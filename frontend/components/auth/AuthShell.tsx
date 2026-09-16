"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CitiFixLogoPlaceholder } from "@/components/ui/LogoPlaceholder";

/**
 * AuthShell — centered glass auth card over the citi-grid backdrop.
 * Shared by the login and signup screens.
 */
export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      {/* Ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(102,78,174,0.18),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(196,168,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(196,168,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-citi-violet/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center text-center">
            <CitiFixLogoPlaceholder variant="nav" />
            <h1 className="mt-6 font-sans text-2xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-2 text-sm text-white/55">{subtitle}</p>
          </div>

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-6 border-t border-white/10 pt-5 text-center">{footer}</div>
          ) : null}
        </div>

        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
          Identity stays private · No personal data on-chain
        </p>
      </motion.div>
    </div>
  );
}