import Link from "next/link";
import { CitiFixLogoPlaceholder } from "@/components/ui/LogoPlaceholder";
import { NAV_LINKS } from "@/lib/constants";

/**
 * SiteFooter — persistent footer across the (main) route group.
 * Dark-on-dark design with citi grid background. Server component (no hooks).
 */
export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-citi-black">
      <div className="citi-grid absolute inset-0 opacity-[0.03]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="CitiFix home" className="inline-block">
              <CitiFixLogoPlaceholder variant="footer" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Every citi complaint gets a permanent, auditable history — with
              AI-verified evidence, authority intelligence, and blockchain proof.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-citi-lavender/60">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-citi-lavender/60">
              Resources
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-white/55 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
                >
                  Public Dashboard
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/30">API Docs</span>
              </li>
              <li>
                <span className="text-sm text-white/30">Status</span>
              </li>
            </ul>
          </div>

          {/* Accountability */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-citi-lavender/60">
              Accountability
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li className="text-sm text-white/55">
                Blockchain-anchored proof
              </li>
              <li className="text-sm text-white/55">
                AI-verified evidence
              </li>
              <li className="text-sm text-white/55">
                Public audit trail
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="font-mono text-[11px] text-white/30">
            &copy; {new Date().getFullYear()} CitiFix. Transparency is not optional.
          </p>
          <p className="font-mono text-[11px] text-white/30">
            Demo mode active — no real complaints processed
          </p>
        </div>
      </div>
    </footer>
  );
}
