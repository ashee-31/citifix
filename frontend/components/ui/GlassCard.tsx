import { cn } from "@/lib/utils/format";
import type { HTMLAttributes } from "react";

/**
 * GlassCard — the standard CitiFix surface.
 * Restrained glassmorphism with a subtle border; use <Card> when you need a
 * stronger contained panel.
 */
export function GlassCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl",
        "transition-colors duration-300 hover:border-white/20",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Inner wrapper for consistent vertical padding inside GlassCard. */
export function GlassCardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}