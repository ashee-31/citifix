"use client";

import { Search, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import type { PublicComplaint } from "@/lib/types";
import { COMPLAINT_CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { COMPLAINT_STATUSES, STATUS_LABELS } from "@/lib/state/complaint-status";
import { PRIORITY_LEVELS, PRIORITY_LABELS } from "@/lib/priority/engine";
import { cn } from "@/lib/utils/format";
import { areaOf, type ExploreFilters, type SortKey } from "./types";

/**
 * ExploreFilterBar — search + category/status/priority/area + date + sort.
 * All filtering happens client-side over the fetched dataset; the API owns
 * the initial fetch (category / status / q are also understood server-side).
 */

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
  { key: "severity", label: "AI severity" },
  { key: "support", label: "Most supported" },
  { key: "priority", label: "Priority" },
];

const selectCls =
  "w-full appearance-none rounded-lg border border-white/10 bg-citi-violet/40 px-3 py-2.5 text-sm text-white/80 outline-none transition-colors " +
  "focus-visible:border-citi-lavender/60 focus-visible:ring-1 focus-visible:ring-citi-lavender/40 hover:border-white/20 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const labelCls = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40";

export function ExploreFilterBar({
  filters,
  complaints,
  onChange,
  onReset,
}: {
  filters: ExploreFilters;
  complaints: PublicComplaint[];
  onChange: (patch: Partial<ExploreFilters>) => void;
  onReset: () => void;
}) {
  const areas = [...new Set(complaints.map(areaOf))].sort((a, b) => a.localeCompare(b));

  return (
    <section
      aria-label="Explore filters"
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-citi-lavender/70" aria-hidden />
          <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Filters
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white/45 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          Reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="explore-search" className={labelCls}>
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              aria-hidden
            />
            <input
              id="explore-search"
              type="search"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              placeholder="Number, keyword, area…"
              className="w-full rounded-lg border border-white/10 bg-citi-violet/40 py-2.5 pl-9 pr-9 text-sm text-white/80 outline-none transition-colors placeholder:text-white/25 focus-visible:border-citi-lavender/60 focus-visible:ring-1 focus-visible:ring-citi-lavender/40"
            />
            {filters.q ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onChange({ q: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-white/40 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-citi-lavender"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="explore-category" className={labelCls}>
            Category
          </label>
          <select
            id="explore-category"
            className={selectCls}
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="explore-status" className={labelCls}>
            Status
          </label>
          <select
            id="explore-status"
            className={selectCls}
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="">All statuses</option>
            {COMPLAINT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="explore-priority" className={labelCls}>
            Priority
          </label>
          <select
            id="explore-priority"
            className={selectCls}
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
          >
            <option value="">All priorities</option>
            {PRIORITY_LEVELS.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        {/* Area */}
        <div>
          <label htmlFor="explore-area" className={labelCls}>
            Area / locality
          </label>
          <select
            id="explore-area"
            className={selectCls}
            value={filters.area}
            onChange={(e) => onChange({ area: e.target.value })}
          >
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label htmlFor="explore-sort" className={labelCls}>
            Sort by
          </label>
          <select
            id="explore-sort"
            className={selectCls}
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div>
          <label htmlFor="explore-from" className={labelCls}>
            Reported after
          </label>
          <input
            id="explore-from"
            type="date"
            className={cn(selectCls, "[color-scheme:dark]")}
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange({ from: e.target.value })}
          />
        </div>

        {/* Date to */}
        <div>
          <label htmlFor="explore-to" className={labelCls}>
            Reported before
          </label>
          <input
            id="explore-to"
            type="date"
            className={cn(selectCls, "[color-scheme:dark]")}
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange({ to: e.target.value })}
          />
        </div>
      </div>
    </section>
  );
}