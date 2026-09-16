"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PublicComplaint } from "@/lib/types";
import { formatShortDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";

/**
 * ExploreMap — a privacy-safe public complaint map.
 *
 * Only the complaint's general area is shown: coordinates are rounded to
 * ~110 m so no exact reporting location is revealed. Points are rendered as
 * small glow dots with a popup of public-only details. The map is loaded
 * client-only (react-leaflet needs `window`), mirroring the report flow.
 */

// Rounded to ~110 m — the data model does not authorize exact public precision.
export function roundPosition(lat: number, lng: number): { lat: number; lng: number } {
  return { lat: Math.round(lat * 1000) / 1000, lng: Math.round(lng * 1000) / 1000 };
}

const ExploreMapInner = dynamic(() => import("./ExploreMapInner"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="grid h-full min-h-[280px] w-full place-items-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-xs uppercase tracking-widest text-white/35"
    >
      Command map loads here…
    </div>
  ),
});

export function ExploreMap({
  complaints,
  mode,
}: {
  complaints: PublicComplaint[];
  mode: "demo" | "live";
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // fitBounds-compatible data
  const bounded = useMemo(
    () => complaints.map((c) => ({ ...c, ...roundPosition(c.latitude, c.longitude) })),
    [complaints],
  );

  return (
    <div className="relative">
      <div
        className={cn(
          "relative h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 sm:h-[420px]",
          !mounted && "bg-white/[0.03]",
        )}
      >
        {mounted ? (
          <ExploreMapInner complaints={bounded} />
        ) : (
          <div
            aria-hidden
            className="grid h-full w-full place-items-center font-mono text-xs uppercase tracking-widest text-white/35"
          >
            Command map loads here…
          </div>
        )}
      </div>

      {/* Legend / privacy note */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] bg-gradient-to-t from-[#0c0b13]/90 to-transparent px-4 pb-3 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          <span className="text-citi-lavender/80">●</span>{" "}
          {bounded.length} complaint{bounded.length === 1 ? "" : "s"} — general area only
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          Privacy-safe: exact coordinates are never shown publicly
        </p>
      </div>
      {mode === "demo" ? (
        <p className="mt-2 px-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">
                Demo data — not real-world statistics
        </p>
      ) : null}
    </div>
  );
}