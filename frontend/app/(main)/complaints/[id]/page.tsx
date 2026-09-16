import type { Metadata } from "next";
import { ComplaintDetail } from "@/components/complaints/ComplaintDetail";

export const metadata: Metadata = {
  title: "Complaint Dossier — CitiFix",
  description:
    "The public accountability dossier for a citi complaint: privacy-safe facts, audit timeline, evidence, AI assessment and blockchain audit trail.",
};

/**
 * /complaints/[id] — the public complaint dossier.
 *
 * Thin server shell matching the report/explore pattern. All data fetching
 * and rendering happens client-side against the real public API
 * (GET /api/complaints/[id]) so one honest data path serves both explore
 * and this dossier. 404s render next's notFound().
 */
export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ComplaintDetail id={id} />;
}