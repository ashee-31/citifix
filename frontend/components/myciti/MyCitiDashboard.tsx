"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger } from "@/components/motion/Stagger";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import type { Complaint, ComplaintEvent, Notification } from "@/lib/types";
import { ACTIVE_STATUSES } from "@/lib/state/complaint-status";
import { formatShortDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/format";
import { MyCitiStatsBar } from "./MyCitiStats";
import { MyCitiComplaintCard } from "./MyCitiComplaintCard";
import { MyCitiTimeline } from "./MyCitiTimeline";
import { MyCitiNotifications } from "./MyCitiNotifications";
import { MyCitiLoading, MyCitiError, MyCitiEmpty } from "./MyCitiStates";
import type { MyCitiTab, MyCitiDetailItem } from "./types";

const TABS: { id: MyCitiTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "resolved", label: "Resolved" },
  { id: "disputed", label: "Disputed" },
];

function computeStats(items: Complaint[]) {
  const resolved = items.filter((c) => c.status === "RESOLVED").length;
  const disputed = items.filter(
    (c) => c.status === "DISPUTED" || c.status === "REOPENED",
  ).length;
  const withEvidence = items.filter((c) => Boolean(c.evidence_url)).length;
  const supportReceived = items.reduce((acc, c) => acc + c.support_count, 0);
  return {
    total: items.length,
    active: items.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
    resolved,
    disputed,
    withEvidence,
    supportReceived,
  };
}

export function MyCitiDashboard({
  initialComplaints,
}: {
  initialComplaints: Complaint[];
}) {
  const router = useRouter();
  const { user, accessToken, real, loading: authLoading, signOut } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<MyCitiTab>("all");
  const [detail, setDetail] = useState<MyCitiDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const stats = useMemo(() => computeStats(complaints), [complaints]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "active":
        return complaints.filter((c) => ACTIVE_STATUSES.includes(c.status));
      case "resolved":
        return complaints.filter((c) => c.status === "RESOLVED");
      case "disputed":
        return complaints.filter(
          (c) => c.status === "DISPUTED" || c.status === "REOPENED",
        );
      default:
        return complaints;
    }
  }, [complaints, tab]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = real && accessToken ? { 
Authorization: `Bearer ${accessToken}`
 } : {};
      const res = await fetch("/api/my-citi/complaints", { headers });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as { complaints: Complaint[] };
      setComplaints(json.complaints);

      const nres = await fetch("/api/my-citi/notifications", { headers });
      if (nres.ok) {
        const njson = (await nres.json()) as { notifications: Notification[] };
        setNotifications(njson.notifications);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [real, accessToken]);

  // Refresh once the auth state is known.
  useEffect(() => {
    if (authLoading) return;
    // In real mode, wait for the access token to be available.
    if (real && !accessToken) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, real, accessToken]);

  async function handleMarkRead(id: string) {
    const headers: HeadersInit =
      real && accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    try {
      await fetch(`/api/my-citi/notifications/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Leave unread; user can retry.
    }
  }

  function openDetail(complaint: Complaint) {
    setDetail({ complaint, events: [] });
    setDetailLoading(true);
    setDetailError(null);
    const headers: HeadersInit =
      real && accessToken ? { 
Authorization: `Bearer ${accessToken}`
 } : {};
    fetch(`/api/complaints/${complaint.id}/events`, { headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Failed (${r.status})`))))
      .then((json: { events: ComplaintEvent[] }) =>
        setDetail((d) => (d ? { ...d, events: json.events } : d)),
      )
      .catch((e) =>
        setDetailError(e instanceof Error ? e.message : "Could not load timeline"),
      )
      .finally(() => setDetailLoading(false));
  }
  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="max-w-md text-center font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          You must sign in to view your citi account.
        </p>
      </div>
    );
  }

  if (loading && complaints.length === 0) return <MyCitiLoading />;
  if (error && complaints.length === 0) return <MyCitiError message={error} onRetry={refresh} />;

  return (
    <div className="space-y-10">
      <SectionReveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            kicker="Private citizen account"
            title="My Citi"
            lede="Track every complaint you have submitted â€” from report to resolution proof."
          />
          <button
            type="button"
                      onClick={() => void handleLogout()}
            className="self-start rounded-xl border border-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-white/60 transition-colors hover:border-rose-400/40 hover:text-rose-300 sm:self-auto"
          >
            Sign out
          </button>
        </div>
      </SectionReveal>

      <SectionReveal>
        <MyCitiStatsBar stats={stats} />
      </SectionReveal>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
                    tab === t.id
                      ? "bg-citi-lavender/15 text-citi-lavender"
                      : "text-white/50 hover:text-white",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/35">
              {filtered.length} complaint{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6">
              <MyCitiEmpty />
            </div>
          ) : (
            <Stagger className="mt-6 grid gap-3 sm:grid-cols-2">
              {filtered.map((complaint) => (
                <MyCitiComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  onSelect={openDetail}
                />
              ))}
            </Stagger>
          )}
        </div>

        <div className="space-y-6">
                  <MyCitiNotifications
                    notifications={notifications}
                    onMarkRead={handleMarkRead}
                  />
                </div>
      </div>

      {detail ? (
        <GlassCard>
          <GlassCardBody className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-citi-lavender/80">
                  {detail.complaint.complaint_number}
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  {detail.complaint.category}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/50 transition-colors hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-wider text-white/45">
              <span>{formatShortDate(detail.complaint.created_at)}</span>
              <span>Â·</span>
              <span>{detail.complaint.support_count} supporters</span>
              {detail.complaint.evidence_url ? (
                <>
                  <span>Â·</span>
                  <span className="text-emerald-300/70">Evidence on file</span>
                </>
              ) : null}
              <span>Â·</span>
              <Link
                href={`/complaints/${detail.complaint.id}`}
                className="inline-flex items-center gap-1.5 text-citi-lavender/80 transition-colors hover:text-citi-lavender"
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden />
                View public page
              </Link>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-sm leading-relaxed text-white/70">
                {detail.complaint.description}
              </p>
            </div>
            {detailLoading ? (
              <p className="py-6 text-center font-mono text-xs uppercase tracking-wider text-white/40">
                Loading timelineâ€¦
              </p>
            ) : detailError ? (
              <p className="py-6 text-center text-sm text-rose-300/70">{detailError}</p>
            ) : (
              <MyCitiTimeline events={detail.events} />
            )}
          </GlassCardBody>
        </GlassCard>
      ) : null}
    </div>
  );
}
