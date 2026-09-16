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
import { cn } from "@/lib/utils/format";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

/**
 * ComplaintTimeline — the audit trail for one complaint.
 *
 * Every event shown comes from the real repository (server-side). No event
 * is fabricated. Each event type maps to an icon + accent so the progression
 * COMPLAINT_SUBMITTED → … → RESOLVED reads as a cinematic vertical spine.
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
  COMPLAINT_SUBMITTED: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  AI_EVIDENCE_VERIFIED: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  ACKNOWLEDGED: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300",
  ASSIGNED: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  WORK_STARTED: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  RESOLUTION_EVIDENCE_REQUIRED: "border-orange-400/40 bg-orange-400/10 text-orange-300",
  RESOLUTION_SUBMITTED: "border-purple-400/40 bg-purple-400/10 text-purple-300",
  AI_RESOLUTION_REVIEWED: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300",
  PUBLIC_REVIEW: "border-lime-400/40 bg-lime-400/10 text-lime-300",
  RESOLVED: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  DISPUTED: "border-red-400/40 bg-red-400/10 text-red-300",
  REOPENED: "border-rose-400/40 bg-rose-400/10 text-rose-300",
  BLOCKCHAIN_ANCHORED: "border-purple-400/40 bg-purple-400/10 text-purple-300",
  SUPPORTED: "border-teal-400/40 bg-teal-400/10 text-teal-300",
  NOTE: "border-white/20 bg-white/10 text-white/70",
};

export function ComplaintTimeline({ events }: { events: ComplaintEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/50">
        No audit events are recorded for this complaint yet.
      </div>
    );
  }

  return (
    <ol className="relative space-y-0 pl-1">
      {/* vertical spine */}
      <div
        aria-hidden
        className="absolute left-[21px] top-2 bottom-2 w-px bg-gradient-to-b from-citi-lavender/40 via-white/10 to-transparent"
      />
      <Stagger stagger={0.08} className="relative">
        {events.map((event) => {
          const Icon = EVENT_ICONS[event.type] ?? FileText;
          const tone = EVENT_TONE[event.type] ?? "border-white/20 bg-white/10 text-white/70";
          const isLatest = event === events[events.length - 1];
          return (
            <StaggerItem key={event.id} className="relative flex gap-4 py-3 pl-0">
              {/* Node */}
              <span
                className={cn(
                  "relative z-10 mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border",
                  isLatest ? "ring-2 ring-citi-lavender/30" : "",
                  tone,
                )}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>

              {/* Body */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-semibold text-white">
                    {EVENT_LABELS[event.type] ?? event.title}
                  </p>
                  <time
                    dateTime={event.created_at}
                    className="font-mono text-[11px] uppercase tracking-wider text-white/35"
                  >
                    {formatDateTime(event.created_at)}
                  </time>
                </div>

                {event.description ? (
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    {event.description}
                  </p>
                ) : null}

                <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/30">
                  <span>actor: {event.actor_role}</span>
                  {event.entity_ref ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-citi-lavender/70">
                      ref: {event.entity_ref}
                    </span>
                  ) : null}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </ol>
  );
}