import type { Metadata } from "next";
import { ReportWizard } from "@/components/report/ReportWizard";

export const metadata: Metadata = {
  title: "Report an Issue — CitiFix",
  description:
    "Report a citi issue anonymously. Describe the problem, mark its location, attach evidence, and let CitiFix's Evidence AI assess it — then track every step to a verifiable resolution.",
};

/**
 * /report — the citizen Report flow.
 *
 * The `(main)` route-group layout renders the shared SiteHeader + SiteFooter.
 * All state, API calls and the multi-step wizard live in ReportWizard (a
 * client component) so this page stays a thin static shell.
 */
export default function ReportPage() {
  return <ReportWizard />;
}