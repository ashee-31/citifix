"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicComplaint } from "@/lib/types";
import { ACTIVE_STATUSES } from "@/lib/state/complaint-status";
import { PRIORITY_LEVELS } from "@/lib/priority/engine";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { ExploreMap } from "./ExploreMap";
import { ExploreStatsBand } from "./ExploreStatsBand";
import { ExploreFilterBar } from "./ExploreFilterBar";
import { ComplaintCard } from "./ComplaintCard";
import {
  ExploreFeedLoading,
  ExploreFeedError,
  ExploreFeedEmpty,
} from "./ExploreFeedStates";
import {
  areaOf,
  DEFAULT_FILTERS,
  type ExploreFilters,
  type ExploreStats,
  type SortKey,
} from "./types";

/**
 * ExploreDashboard — the public citi command center.
 *
 * Fetches the public complaint dataset from GET /api/complaints, then lets
 * users search, filter, sort, and explore on the map. All stats are computed
 * from the actual dataset; demo mode is surfaced honestly.
 */

const DAY_MS = 86_400_000;

function isActive(status: string): boolean {
  return (ACTIVE_STATUSES as readonly string[]).includes(status);
}

/** Sort a fetched set client-side. */
function sortComplaints(list: PublicComplaint[], sort: SortKey): PublicComplaint[] {
  const sorted = [...list];
  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    case "severity":
      return sorted.sort((a, b) => b.ai_severity_score - a.ai_severity_score);
    case "support":
      return sorted.sort((a, b) => b.support_count - a.support_count);
    case "priority":
      return sorted.sort((a, b) => {
        const score = (lvl: string) =>
          PRIORITY_LEVELS.indexOf(lvl as (typeof PRIORITY_LEVELS)[number]);
        return score(b.priority) - score(a.priority);
      });
  }
}

function computeStats(list: PublicComplaint[], mode: "demo" | "live"): ExploreStats {
  const resolved = list.filter((c) => c.status === "RESOLVED").length;
  const evidenceBacked = list.filter(
    (c) => c.status === "RESOLVED" && Boolean(c.resolution_evidence_url || c.resolution_note),
  ).length;
  const withResolutionTime = list
    .filter((c) => c.resolved_at)
    .map((c) => new Date(c.resolved_at as string).getTime() - new Date(c.created_at).getTime())
    .filter((t) => !Number.isNaN(t));
  const avgResolutionDays =
    withResolutionTime.length > 0
      ? Math.round(
          (withResolutionTime.reduce((a, b) => a + b, 0) / withResolutionTime.length / DAY_MS) *
            10,
        ) / 10
      : null;
  return {
    total: list.length,
    active: list.filter((c) => isActive(c.status)).length,
    resolved,
    disputedReopened: list.filter(
      (c) => c.status === "DISPUTED" || c.status === "REOPENED",
    ).length,
    evidenceBacked,
    avgResolutionDays,
    mode,
  };
}

/** Apply search + filters client-side over the fetched dataset. */
function applyFilters(
  base: PublicComplaint[],
  f: ExploreFilters,
  areas: string[],
): PublicComplaint[] {
  let list = base;
  const q = f.q.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.complaint_number.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location_label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }
  if (f.category) list = list.filter((c) => c.category === f.category);
  if (f.status) list = list.filter((c) => c.status === f.status);
  if (f.priority) list = list.filter((c) => c.priority === f.priority);
  if (f.area) list = list.filter((c) => areaOf(c) === f.area);
  if (f.from) {
    const from = new Date(`${f.from}T00:00:00`).getTime();
    list = list.filter((c) => new Date(c.created_at).getTime() >= from);
  }
  if (f.to) {
    const to = new Date(`${f.to}T23:59:59.999`).getTime();
    list = list.filter((c) => new Date(c.created_at).getTime() <= to);
  }
  return sortComplaints(list, f.sort);
}

export function ExploreDashboard() {
  const [dataset, setDataset] = useState<PublicComplaint[]>([]);
  const [allAreas, setAllAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<PublicComplaint | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/complaints?limit=200", { cache: "no-store" });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(
          detail?.error
            ? `Unable to load complaints: ${detail.error}`
            : "Unable to load public complaints right now.",
        );
      }
      const data = (await res.json()) as { complaints: PublicComplaint[] };
      const complaints = Array.isArray(data.complaints) ? data.complaints : [];
      setDataset(complaints);
      setAllAreas([...new Set(complaints.map(areaOf))].sort((a, b) => a.localeCompare(b)));
      const health = await fetch("/api/health", { cache: "no-store" }).catch(() => null);
      const healthJson = health ? ((await health.json()) as { mode?: string }) : null;
      setMode(healthJson?.mode === "live" ? "live" : "demo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load public complaints.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filtered = useMemo(
    () => applyFilters(dataset, filters, allAreas),
    [dataset, filters, allAreas],
  );

  const stats = useMemo(
    () => computeStats(dataset, mode),
    [dataset, mode],
  );

  const setFilter = useCallback((patch: Partial<ExploreFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const handleSelect = useCallback((c: PublicComplaint) => {
    setSelected(c);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const hasFilters = useMemo(() => {
    return (
      filters.q !== "" ||
      filters.category !== "" ||
      filters.status !== "" ||
      filters.priority !== "" ||
      filters.area !== "" ||
      filters.from !== "" ||
      filters.to !== ""
    );
  }, [filters]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      {/* Header */}
      <SectionReveal className="pt-10 sm:pt-14">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-citi-lavender/80">
          Public Citi Dashboard
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[2.6rem] md:leading-[1.15]">
          Explore the city&apos;s citi issues.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
          Every public complaint is privacy-safe. No names, no contact details,
          no private metadata — just the issue, its location, its evidence, and
          its path to a provable resolution.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full border border-citi-lavender/25 bg-citi-lavender/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-citi-lavender/80">
            {mode === "demo" ? "Demo dataset" : "Live dataset"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Reporter: Anonymous
          </span>
        </div>
      </SectionReveal>

      {/* Stats */}
      {!loading && !error ? <ExploreStatsBand stats={stats} /> : null}

      {/* Map */}
      {!loading && !error && dataset.length > 0 ? (
        <SectionReveal className="mt-8">
          <ExploreMap complaints={dataset} mode={mode} />
        </SectionReveal>
      ) : null}

      {/* Filters + feed */}
      <div className="mt-10">
        <ExploreFilterBar
          filters={filters}
          complaints={dataset}
          onChange={setFilter}
          onReset={resetFilters}
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            {loading ? "Loading…" : `${filtered.length} complaint${filtered.length === 1 ? "" : "s"}`}
          </p>
          {selected ? (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="font-mono text-[11px] uppercase tracking-wider text-citi-lavender/70 transition-colors hover:text-citi-lavender focus-visible:outline-2 focus-visible:outline-citi-lavender"
            >
              Clear selection
            </button>
          ) : null}
        </div>

        <div ref={listRef} className="mt-4 space-y-3">
          {loading ? (
            <ExploreFeedLoading />
          ) : error ? (
            <ExploreFeedError message={error} onRetry={() => void fetchData()} />
          ) : filtered.length === 0 ? (
            <ExploreFeedEmpty hasFilters={hasFilters} onReset={resetFilters} />
          ) : (
            filtered.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}