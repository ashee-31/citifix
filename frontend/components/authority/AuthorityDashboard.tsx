"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Filter, Loader2, Play, ShieldCheck, UserPlus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard, GlassCardBody } from "@/components/ui/GlassCard";
import { CATEGORY_LABELS, COMPLAINT_CATEGORIES, type PublicComplaint } from "@/lib/types";
import { computePriority, PRIORITY_LABELS, PRIORITY_LEVELS, priorityReasons } from "@/lib/priority/engine";
import { STATUS_BADGE_LABELS, STATUS_TONES, STATUS_LABELS, COMPLAINT_STATUSES, type ComplaintStatus } from "@/lib/state/complaint-status";
import { timeAgo } from "@/lib/utils/format";
import { useAuth } from "@/lib/supabase/auth";
import { AuthorityStatsBand, type AuthorityMetrics } from "./AuthorityStatsBand";
import type { AuthorityComplaintResponse, AuthorityFilters, AuthorityOperation } from "./types";

const initialFilters: AuthorityFilters = { category: "", status: "", priority: "", area: "", date: "" };
const control = "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white";

function metricsFor(complaints: PublicComplaint[]): AuthorityMetrics {
  return {
    critical: complaints.filter((c) => c.priority === "CRITICAL").length, high: complaints.filter((c) => c.priority === "HIGH").length,
    overdue: complaints.filter((c) => c.overdue).length, inProgress: complaints.filter((c) => c.status === "IN_PROGRESS").length,
    awaitingEvidence: complaints.filter((c) => c.status === "RESOLUTION_EVIDENCE_REQUIRED").length, publicReview: complaints.filter((c) => c.status === "PUBLIC_REVIEW").length,
    disputed: complaints.filter((c) => c.status === "DISPUTED").length, reopened: complaints.filter((c) => c.status === "REOPENED").length,
  };
}

function StatusBadge({ status }: { status: ComplaintStatus }) {
  return <span className={`rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${STATUS_TONES[status]}`}>{STATUS_BADGE_LABELS[status]}</span>;
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return <GlassCard><GlassCardBody><h3 className="text-sm font-semibold text-white">{title}</h3><div className="mt-4 h-60">{children}</div></GlassCardBody></GlassCard>;
}

export function AuthorityDashboard() {
  const { accessToken, real } = useAuth();
  const [complaints, setComplaints] = useState<PublicComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const headers: HeadersInit = real && accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const response = await fetch("/api/authority/complaints", { headers });
      if (!response.ok) throw new Error("Could not load the operational queue.");
      const json = await response.json() as AuthorityComplaintResponse;
      setComplaints(json.complaints);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the operational queue."); }
    finally { setLoading(false); }
  }, [accessToken, real]);
  useEffect(() => { void load(); }, [load]);

  const areas = useMemo(() => [...new Set(complaints.map((c) => c.location_label).filter(Boolean))].sort(), [complaints]);
  const filtered = useMemo(() => complaints.filter((c) => {
    const from = filters.date ? new Date(filters.date).getTime() : 0;
    return (!filters.category || c.category === filters.category) && (!filters.status || c.status === filters.status) && (!filters.priority || c.priority === filters.priority) && (!filters.area || c.location_label === filters.area) && (!from || new Date(c.created_at).getTime() >= from);
  }).sort((a, b) => computePriority(b).total - computePriority(a).total || new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [complaints, filters]);
  const metrics = useMemo(() => metricsFor(complaints), [complaints]);
  const categoryData = useMemo(() => COMPLAINT_CATEGORIES.map((x) => ({ name: CATEGORY_LABELS[x], value: complaints.filter((c) => c.category === x).length })).filter((x) => x.value), [complaints]);
  const statusData = useMemo(() => COMPLAINT_STATUSES.map((x) => ({ name: STATUS_LABELS[x], value: complaints.filter((c) => c.status === x).length })).filter((x) => x.value), [complaints]);
  const backlogData = useMemo(() => ["0–7", "8–14", "15–30", "31+"].map((bucket, index) => ({ bucket, count: complaints.filter((c) => { const days = (Date.now() - new Date(c.created_at).getTime()) / 86400000; return c.status !== "RESOLVED" && (index === 0 ? days <= 7 : index === 1 ? days > 7 && days <= 14 : index === 2 ? days > 14 && days <= 30 : days > 30); }).length })), [complaints]);
  const trendData = useMemo(() => Array.from({ length: 7 }, (_, index) => { const d = new Date(); d.setDate(d.getDate() - (6 - index)); const day = d.toISOString().slice(0, 10); return { day: day.slice(5), reported: complaints.filter((c) => c.created_at.slice(0, 10) === day).length, resolved: complaints.filter((c) => c.resolved_at?.slice(0, 10) === day).length }; }), [complaints]);

  async function operate(complaint: PublicComplaint, operation: AuthorityOperation) {
    setBusy(`${complaint.id}:${operation}`);
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (real && accessToken) headers.Authorization = `Bearer ${accessToken}`;
      const res = await fetch(`/api/authority/complaints/${complaint.id}`, { method: "PATCH", headers, body: JSON.stringify({ operation }) });
      if (!res.ok) { const body = await res.json().catch(() => null) as { error?: string } | null; throw new Error(body?.error ?? "Operation failed."); }
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Operation failed."); }
    finally { setBusy(null); }
  }

  if (loading) return <div className="flex min-h-[45vh] items-center justify-center text-white/50"><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading operations…</div>;
  if (error && complaints.length === 0) return <GlassCard className="p-6"><p className="text-white/70">{error}</p><button onClick={() => void load()} className="mt-4 text-sm text-citi-lavender">Try again</button></GlassCard>;

  return <div className="space-y-8">
    <SectionHeading kicker="Authority operations" title="Citi operations command center" lede="Privacy-safe complaint operations. Reporter identity is never shown here." />
    {error ? <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
    {!real ? <p className="rounded-lg border border-citi-lavender/25 bg-citi-lavender/[0.06] px-4 py-3 text-xs text-white/65"><strong className="text-citi-lavender">DEMO / SEED DATA</strong> — metrics, trends, and operations reflect the seeded dataset.</p> : null}
    <AuthorityStatsBand stats={metrics} />
    {complaints.some((c) => c.status === "IN_PROGRESS" || c.status === "RESOLUTION_EVIDENCE_REQUIRED") ? <GlassCard><GlassCardBody><h2 className="text-base font-semibold text-white">Resolution evidence workflow</h2><p className="mt-1 text-sm text-white/55">Work must move to evidence collection before an authority can submit an after image. Resolution is never marked directly.</p><div className="mt-4 flex flex-wrap gap-2">{complaints.filter((c) => c.status === "IN_PROGRESS").map((c) => <button key={c.id} onClick={() => void operate(c, "requestEvidence")} disabled={Boolean(busy)} className="rounded-lg border border-citi-lavender/35 px-3 py-2 text-xs text-citi-lavender disabled:opacity-50">Request evidence · {c.complaint_number}</button>)}{complaints.filter((c) => c.status === "RESOLUTION_EVIDENCE_REQUIRED").map((c) => <Link key={c.id} href={`/authority/complaints/${c.id}`} className="rounded-lg border border-emerald-400/35 px-3 py-2 text-xs text-emerald-200">Submit after evidence · {c.complaint_number}</Link>)}</div></GlassCardBody></GlassCard> : null}
    <GlassCard><GlassCardBody><div className="mb-4 flex items-center gap-2"><Filter className="h-4 w-4 text-citi-lavender" /><h2 className="font-semibold text-white">Queue filters</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><select className={control} value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{COMPLAINT_CATEGORIES.map((x) => <option key={x} value={x}>{CATEGORY_LABELS[x]}</option>)}</select><select className={control} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option>{COMPLAINT_STATUSES.map((x) => <option key={x} value={x}>{STATUS_LABELS[x]}</option>)}</select><select className={control} value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}><option value="">All priorities</option>{PRIORITY_LEVELS.map((x) => <option key={x} value={x}>{PRIORITY_LABELS[x]}</option>)}</select><select className={control} value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })}><option value="">All recorded areas</option>{areas.map((x) => <option key={x} value={x}>{x}</option>)}</select><select className={`${control} cursor-not-allowed opacity-50`} disabled aria-label="Department filter unavailable"><option>Department not recorded</option></select><input className={control} type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} aria-label="Reported on or after" /></div><p className="mt-3 text-xs text-white/40">Department filtering is unavailable: the current complaint record has no department field. No inferred department is shown as operational data.</p></GlassCardBody></GlassCard>
    <section><div className="mb-4 flex items-baseline justify-between"><h2 className="text-lg font-semibold text-white">Priority queue</h2><span className="font-mono text-xs text-white/40">{filtered.length} shown · existing priority engine</span></div><div className="space-y-3">{filtered.map((c) => { const priority = computePriority(c); const isBusy = busy?.startsWith(`${c.id}:`); const operationClass = "inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/75 transition hover:border-citi-lavender/50 hover:text-citi-lavender disabled:cursor-not-allowed disabled:opacity-50"; return <GlassCard key={c.id}><GlassCardBody><div className="flex flex-col gap-4 xl:flex-row xl:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-citi-lavender">{c.complaint_number}</span><StatusBadge status={c.status} /><span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] uppercase text-white/60">{PRIORITY_LABELS[priority.level]} {priority.total}/100</span></div><p className="mt-2 text-sm font-semibold text-white">{c.description}</p><p className="mt-1 text-xs text-white/45">{c.location_label} · {CATEGORY_LABELS[c.category]} · reported {timeAgo(c.created_at)}</p><div className="mt-3 flex flex-wrap gap-2">{priorityReasons(priority).map((reason) => <span key={reason} className="rounded bg-white/[0.05] px-2 py-1 text-[11px] text-white/60">{reason}</span>)}</div><p className="mt-2 text-[11px] text-white/35">Signals: severity {c.ai_severity}; safety {c.safety_risk}; support {c.support_count}; affected {c.depth_impact > 0 ? c.depth_impact.toLocaleString() : "not recorded"}; repeated reports {c.report_count}; disputes/reopens {c.dispute_count + c.reopen_count}.</p></div><div className="flex shrink-0 flex-wrap content-start gap-2 xl:max-w-64">{c.status === "AI_VERIFIED" ? <button disabled={Boolean(isBusy)} onClick={() => void operate(c, "acknowledge")} className={operationClass}><ShieldCheck className="h-3.5 w-3.5" /> Acknowledge</button> : null}{(c.status === "ACKNOWLEDGED" || c.status === "REOPENED") ? <button disabled={Boolean(isBusy)} onClick={() => void operate(c, "assign")} className={operationClass}><UserPlus className="h-3.5 w-3.5" /> Assign</button> : null}{(c.status === "ASSIGNED" || c.status === "REOPENED") ? <button disabled={Boolean(isBusy)} onClick={() => void operate(c, "start")} className={operationClass}><Play className="h-3.5 w-3.5" /> Start work</button> : null}<Link href={`/complaints/${c.id}`} className={operationClass}><ArrowUpRight className="h-3.5 w-3.5" /> View</Link></div></div></GlassCardBody></GlassCard>; })}{filtered.length === 0 ? <GlassCard className="p-6 text-sm text-white/45">No complaints match these filters.</GlassCard> : null}</div></section>
    <section><h2 className="mb-4 text-lg font-semibold text-white">Operational analytics</h2><div className="grid gap-5 lg:grid-cols-2"><Chart title="Category distribution">{categoryData.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" fill="#a78bfa" label /><Tooltip /></PieChart></ResponsiveContainer> : <EmptyChart />}</Chart><Chart title="Status distribution">{statusData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={statusData}><CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false}/><XAxis dataKey="name" hide/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="#a78bfa" /></BarChart></ResponsiveContainer> : <EmptyChart />}</Chart><Chart title="Unresolved backlog by age">{backlogData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={backlogData}><CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false}/><XAxis dataKey="bucket"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#a78bfa" /></BarChart></ResponsiveContainer> : <EmptyChart />}</Chart><Chart title="Reported vs resolved · last 7 days"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false}/><XAxis dataKey="day"/><YAxis allowDecimals={false}/><Tooltip/><Line type="monotone" dataKey="reported" stroke="#a78bfa"/><Line type="monotone" dataKey="resolved" stroke="#34d399"/></LineChart></ResponsiveContainer></Chart></div></section>
    <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">Resolution evidence and public dispute actions are intentionally unavailable until those workflows are implemented.</p>
  </div>;
}

function EmptyChart() { return <p className="pt-20 text-center text-sm text-white/40">No recorded data.</p>; }
