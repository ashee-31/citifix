"use client";

import { motion, useReducedMotion } from "framer-motion";
import { SectionReveal } from "@/components/motion/SectionReveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  FileText,
  BrainCircuit,
  UserCheck,
  Hammer,
  Camera,
  Eye,
  ThumbsUp,
  CircleCheckBig,
  Link2,
} from "lucide-react";

/**
 * AuditTrailSection — cinematic timeline showing the full complaint lifecycle.
 * Each event animates in sequence.
 */

const TIMELINE_EVENTS = [
  {
    icon: FileText,
    label: "Complaint Submitted",
    detail: "Citizen files a report with evidence",
    color: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    line: "from-sky-500/40",
  },
  {
    icon: BrainCircuit,
    label: "AI Verified",
    detail: "Evidence quality and severity assessed",
    color: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    line: "from-violet-500/40",
  },
  {
    icon: UserCheck,
    label: "Assigned",
    detail: "Authority team receives the case",
    color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    line: "from-cyan-500/40",
  },
  {
    icon: Hammer,
    label: "Work Started",
    detail: "Corrective action begins",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    line: "from-amber-500/40",
  },
  {
    icon: Camera,
    label: "Resolution Evidence Submitted",
    detail: "After-state documentation provided",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    line: "from-emerald-500/40",
  },
  {
    icon: BrainCircuit,
    label: "AI Resolution Reviewed",
    detail: "Before/after comparison and metadata check",
    color: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    line: "from-fuchsia-500/40",
  },
  {
    icon: Eye,
    label: "Public Review",
    detail: "Community examines the resolution evidence",
    color: "bg-lime-500/15 text-lime-300 border-lime-500/30",
    line: "from-lime-500/40",
  },
  {
    icon: ThumbsUp,
    label: "Citizen Approved",
    detail: "Resolution evidence verified as credible",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    line: "from-emerald-500/40",
  },
  {
    icon: Link2,
    label: "Blockchain Anchored",
    detail: "Audit trail permanently recorded",
    color: "bg-citi-lavender/15 text-citi-lavender border-citi-lavender/30",
    line: "from-citi-lavender/40",
  },
  {
    icon: CircleCheckBig,
    label: "Resolved",
    detail: "Every step verified and complete",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    line: "from-emerald-500/40",
  },
];

export function AuditTrailSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      aria-labelledby="audit-heading"
    >
      <div className="absolute inset-0 bg-citi-black" aria-hidden />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(102,78,174,0.1) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="The Audit Trail"
          title="Every event. Every timestamp. Permanent."
          lede="A complete, chronological history that cannot be edited, deleted, or quietly ignored."
          align="center"
        />

        {/* Timeline */}
        <Stagger className="relative mt-16" stagger={0.1}>
          {/* Central vertical line */}
          <div
            className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-sky-500/30 via-citi-lavender/20 to-emerald-500/30 sm:left-1/2 sm:-translate-x-px"
            aria-hidden
          />

          {TIMELINE_EVENTS.map((event, i) => {
            const Icon = event.icon;
            const isRight = i % 2 === 1;
            return (
              <StaggerItem key={event.label}>
                <div
                  className={`relative mb-10 flex items-start gap-4 sm:mb-12 ${
                    isRight ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  {/* Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border shadow-lg ${event.color}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 sm:w-1/2 ${
                      isRight ? "sm:pl-10" : "sm:pr-10 sm:text-right"
                    }`}
                  >
                    <p className="text-sm font-bold text-white/90">
                      {event.label}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {event.detail}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
