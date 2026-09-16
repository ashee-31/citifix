import { cn } from "@/lib/utils/format";
import { SectionReveal } from "@/components/motion/SectionReveal";
import type { ReactNode } from "react";

/**
 * SectionHeading — consistent section kicker + title + optional lede.
 * Used by every homepage section so the typographic rhythm stays uniform.
 */
export function SectionHeading({
  kicker,
  title,
  lede,
  align = "left",
  className,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <SectionReveal
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-citi-lavender/80">
        {kicker}
      </p>
      <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[2.6rem] md:leading-[1.15]">
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 text-base leading-relaxed text-white/65 sm:text-lg">
          {lede}
        </p>
      ) : null}
    </SectionReveal>
  );
}