import type { PublicComplaint } from "@/lib/types";

/** Explore sort keys — applied client-side over the fetched dataset. */
export type SortKey = "newest" | "oldest" | "severity" | "support" | "priority";

/** Explore filter state ("" = all / unfiltered). */
export interface ExploreFilters {
  q: string;
  category: string;
  status: string;
  priority: string;
  area: string;
  sort: SortKey;
  from: string;
  to: string;
}

export const DEFAULT_FILTERS: ExploreFilters = {
  q: "",
  category: "",
  status: "",
  priority: "",
  area: "",
  sort: "newest",
  from: "",
  to: "",
};

/**
 * Statistics computed live from the actual fetched dataset
 * (never invented, never presented as real-world figures).
 */
export interface ExploreStats {
  total: number; // complaints in the current dataset
  active: number; // non-terminal statuses
  resolved: number; // status === RESOLVED
  disputedReopened: number; // DISPUTED + REOPENED
  evidenceBacked: number; // RESOLVED with resolution proof/note
  avgResolutionDays: number | null; // mean(created_at -> resolved_at); null when unsupported by data
  mode: "demo" | "live";
}

/** The district/ward portion of a location label ("MG Road, Central District" -> "Central District"). */
export function areaOf(c: PublicComplaint): string {
  const label = c.location_label;
  const idx = label.lastIndexOf(",");
  return idx >= 0 ? label.slice(idx + 1).trim() : label.trim();
}