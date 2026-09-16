import type { Metadata } from "next";
import { ExploreDashboard } from "@/components/explore/ExploreDashboard";

export const metadata: Metadata = {
  title: "Explore — CitiFix",
  description:
    "Explore the public CitiFix dashboard: privacy-safe citi complaints mapped, filtered, and tracked from report to verifiable resolution.",
};

/**
 * /explore — the public citi command center.
 *
 * The `(main)` route-group layout provides SiteHeader + SiteFooter.
 * All data fetching, filtering, mapping and feed rendering live in
 * ExploreDashboard (client component); this page stays a thin static shell.
 */
export default function ExplorePage() {
  return <ExploreDashboard />;
}