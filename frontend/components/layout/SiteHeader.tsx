"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { CitiFixLogoPlaceholder } from "@/components/ui/LogoPlaceholder";
import { AuthNav } from "@/components/auth/AuthNav";
import { NavLinks } from "./NavLinks";
import { MobileMenu } from "./MobileMenu";

/**
 * SiteHeader — responsive glass navbar.
 * Becomes slightly more opaque/compact on scroll. On mobile, a polished
 * menu overlay replaces inline links.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b border-white/10 bg-citi-black/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-citi-lavender"
            aria-label="CitiFix home"
          >
            <CitiFixLogoPlaceholder variant="nav" />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
                      <NavLinks />
                      <AuthNav className="ml-3" />
                    </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}