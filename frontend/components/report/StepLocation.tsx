"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/format";
import type { MapPosition } from "./DarkLeafletMap";
import type { DraftState } from "./ReportWizard";

/**
 * react-leaflet requires `window`, so the map is loaded client-only
 * (ssr: false). The loading fallback keeps the layout stable during
 * hydration and for reduced-motion / no-JS users.
 */
const DarkLeafletMap = dynamic(() => import("./DarkLeafletMap"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="grid h-64 w-full place-items-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-xs uppercase tracking-widest text-white/35 sm:h-72"
    >
      Map loads here…
    </div>
  ),
});

/** Demo city center (New Delhi) — the same anchor used by the demo seed. */
const DEFAULT_CENTER: MapPosition = { lat: 28.6139, lng: 77.209 };

/**
 * StepLocation — where is the issue?
 *
 * Area + optional detail text plus an interactive map. No personal identity
 * is collected — only a public place description.
 */
export function StepLocation({
  draft,
  setDraft,
  onBack,
  onNext,
  canProceed,
}: {
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  const reduce = useReducedMotion();
  const position: MapPosition | null = useMemo(
    () =>
      draft.lat !== null && draft.lng !== null
        ? { lat: draft.lat, lng: draft.lng }
        : null,
    [draft.lat, draft.lng],
  );

  const handleMapChange = (pos: MapPosition) =>
    setDraft((d) => ({ ...d, lat: pos.lat, lng: pos.lng }));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Where is it?
        </h2>
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-white/40">
          STEP 02 · LOCATION
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        Place the pin on the map and add the area name. Authorities only ever
        see the place — never who you are.
      </p>

      {/* Map */}
      <div className="mt-7">
        <DarkLeafletMap
          center={DEFAULT_CENTER}
          position={position}
          onChange={handleMapChange}
        />
      </div>

      {/* Area */}
      <div className="mt-6">
        <label
          htmlFor="report-area"
          className="text-sm font-medium text-white/80"
        >
          Area / locality <span className="text-white/40">(required)</span>
        </label>
        <input
          id="report-area"
          type="text"
          value={draft.area}
          onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
          placeholder="e.g. MG Road, Central District"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-citi-lavender/60"
        />
      </div>

      {/* Detail */}
      <div className="mt-5">
        <label
          htmlFor="report-detail"
          className="text-sm font-medium text-white/80"
        >
          Location detail <span className="text-white/40">(optional)</span>
        </label>
        <input
          id="report-detail"
          type="text"
          value={draft.detail}
          onChange={(e) => setDraft((d) => ({ ...d, detail: e.target.value }))}
          placeholder="e.g. Opposite the blue water tank, 50m past the bus stop"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-citi-lavender/60"
        />
      </div>

      {/* Coordinates */}
      <div className="mt-4 flex items-center gap-2 font-mono text-xs text-white/45">
        <MapPin className="h-3.5 w-3.5 text-citi-lavender/70" aria-hidden />
        {position
          ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
          : "No pin placed yet"}
        {position ? (
          <span className="text-emerald-300/80">· pin set</span>
        ) : null}
      </div>

      {/* Footer nav */}
      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-white/25 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <motion.button
          type="button"
          whileHover={reduce || !canProceed ? undefined : { y: -1 }}
          whileTap={reduce || !canProceed ? undefined : { scale: 0.98 }}
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors",
            canProceed
              ? "bg-citi-lavender text-[#17101f] hover:bg-citi-lavender/90"
              : "cursor-not-allowed bg-white/5 text-white/30",
          )}
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden />
        </motion.button>
      </div>
    </div>
  );
}