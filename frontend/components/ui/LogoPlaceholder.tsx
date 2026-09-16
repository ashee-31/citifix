import { cn } from "@/lib/utils/format";

/**
 * CitiFixLogoPlaceholder — reusable logo placeholder.
 *
 * The final CitiFix logo is not invented here. This component renders a
 * lockup-safe placeholder (a hex/e shield glyph + wordmark) that can be
 * swapped for the real logo later without touching every page.
 *
 * Variants: "nav" (compact, dark glass), "footer" (large, on dark),
 * "plain" (no background, for auth/loading contexts).
 */
export function CitiFixLogoPlaceholder({
  variant = "nav",
  className,
}: {
  variant?: "nav" | "footer" | "plain";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 select-none",
        variant === "footer" && "gap-3",
        className,
      )}
      aria-label="CitiFix"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/citifix-logo.png"
        alt=""
        aria-hidden
        className={cn(
          "h-9 w-9 shrink-0 object-contain",
          variant === "footer" && "h-12 w-12",
        )}
      />
      <span
        className={cn(
          "inline-flex flex-col leading-none",
          variant === "footer" && "gap-1",
        )}
      >
        <span
          className={cn(
            "font-sans text-lg font-bold tracking-tight text-white",
            variant === "footer" && "text-2xl",
          )}
        >
          CitiFix
        </span>
        {variant === "footer" ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-citi-lavender/60">
            Report · Track · Prove
          </span>
        ) : (
          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.24em] text-citi-lavender/50">
            Citi OS
          </span>
        )}
      </span>
    </span>
  );
}
