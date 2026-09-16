"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/format";
import { NAV_LINKS } from "@/lib/constants";

export { NAV_LINKS };

/** Desktop horizontal nav links. */
export function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="Primary">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors",
              "hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender",
              active && "bg-white/[0.06] text-white",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}