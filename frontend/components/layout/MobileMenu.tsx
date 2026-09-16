"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_LINKS } from "./NavLinks";
import { AuthNav } from "@/components/auth/AuthNav";

/** Accessible animated mobile menu overlay. */
export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.05 : 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-citi-black/95 backdrop-blur-xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-sans text-lg font-bold text-white">Menu</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduce ? 0 : 0.06 * i, duration: 0.25 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 text-lg font-medium text-white/85 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-white/10 pt-4">
              <AuthNav onNavigate={onClose} className="w-full justify-between" />
            </div>
          </nav>
          <div className="mt-auto border-t border-white/10 px-5 py-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-citi-lavender/60">
              Report · Track · Prove
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}