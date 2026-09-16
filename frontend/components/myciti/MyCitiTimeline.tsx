"use client";

import {
  FileText,
  ScanLine,
  Fingerprint,
  UserCheck,
  Wrench,
  ClipboardCheck,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Box,
  Users,
  MessageSquare,
} from "lucide-react";
import type { ComplaintEvent } from "@/lib/types";
import { EVENT_LABELS } from "@/lib/state/complaint-status";
import { formatDateTime } from "@/lib/utils/format";

/**
 * MyCitiTimeline — the citizen's private view of their complaint's audit trail.
 *
 * Mirrors the event contracts used by ComplaintTimeline but keeps the
 * event name from the EVENT_LABELS mapping so it stays consistent if
 * event types change.
 */

const EVENT_ICONS: Record<string, typeof FileText> = {
  COMPLAINT_SUBMITTED: FileText,
  AI_EVIDENCE_VERIFIED: ScanLine,
  ACKNOWLEDGED: UserCheck,
  ASSIGNED: Fingerprint,
  WORK_STARTED: Wrench,
  RESOLUTION_EVIDENCE_REQUIRED: ClipboardCheck,
  RESOLUTION_SUBMITTED: ClipboardCheck,
  AI_RESOLUTION_REVIEWED: ScanLine,
  PUBLIC_REVIEW: Eye,
  RESOLVED: CheckCircle2,
  DISPUTED: AlertTriangle,
  REOPENED: RotateCcw,
  BLOCKCHAIN_ANCHORED: Box,
  SUPPORTED: Users,
  NOTE: MessageSquare,
};

const EVENT_TONE: Record<string, string> = {
  COMPLAINT_SUBMITTED: "border-white/20 bg-white/[0.05] text-white/60",
  AI_EVIDENCE_VERIFIED: "border-purple-400/30 bg-purple-500/10 text-purple-300",
  ACKNOWLEDGED: "border-indigo-400/30 bg-indigo-500/10 text-indigo-300",
  ASSIGNED: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  WORK_STARTED: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  RESOLUTION_EVIDENCE_REQUIRED: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  RESOLUTION_SUBMITTED: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  AI_RESOLUTION_REVIEWED: "border-purple-400/30 bg-purple-500/10 text-purple-300",
  PUBLIC_REVIEW: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  RESOLVED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  DISPUTED: "border-rose-400/30 bg-rose-500/10 text-rose-300",
  REOPENED: "border-rose-400/30 bg-rose-500/10 text-rose-300",
  BLOCKCHAIN_ANCHORED: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  SUPPORTED: "border-teal-400/30 bg-teal-500/10 text-teal-300",
  NOTE: "border-white/15 bg-white/[0.03] text-white/55",
};

export function MyCitiTimeline({ events }: { events: ComplaintEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/40">
        No audit events recorded yet.
      </p>
    );
  }

  return (
    <ol
      className="relative ml-3 border-l border-white/10 pl-6"
      aria-label="Complaint timeline"
    >
      {sorted.map((ev, i) => {
        const Icon = EVENT_ICONS[ev.type] ?? FileText;
        const tone = EVENT_TONE[ev.type] ?? "border-white/15 bg-white/[0.03] text-white/55";
        const label = EVENT_LABELS[ev.type] ?? ev.title ?? ev.type;

        return (
          <li key={ev.id ?? i} className="relative pb-8 last:pb-0">
            <span
              className={`absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${tone}`}
              aria-hidden
            >
              <Icon className="h-2.5 w-2.5" />
            </span>
            <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              {formatDateTime(ev.created_at)}
            </p>
            <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
            {ev.description ? (
              <p className="mt-1 text-sm text-white/55">{ev.description}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}