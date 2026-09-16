"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { BlurInText } from "@/components/motion/BlurInText";
import { StepIssue } from "./StepIssue";
import { StepLocation } from "./StepLocation";
import { StepEvidence } from "./StepEvidence";
import { StepReview } from "./StepReview";
import { StepVerified } from "./StepVerified";
import { ReportStepper } from "./ReportStepper";

import type {
  AiAnalysis,
  Complaint,
} from "@/lib/types";
import { CATEGORY_LABELS, COMPLAINT_CATEGORIES } from "@/lib/types";
import type { ComplaintCategory } from "@/lib/types";

/**
 * /report multi-step wizard.
 *
 * Submit flow: Issue -> Location -> Evidence -> Review -> Verified.
 * - Uses the real POST /api/complaints + POST /api/ai/analyze contracts.
 * - No identity fields are collected or displayed (privacy by design).
 * - The AI assessment after submission is shown honestly: verified,
 *   unavailable (HTTP/network failure), or insufficient evidence.
 */

export const WIZARD_STEPS = [
  { id: "issue", label: "Issue" },
  { id: "location", label: "Location" },
  { id: "evidence", label: "Evidence" },
  { id: "review", label: "Review" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

/** Form screens — the four wizard steps plus the terminal "verified" result screen. */
export type WizardScreenId = WizardStepId | "verified";

/** Shape collected during the wizard (nothing identity-related). */
export interface DraftState {
  category: ComplaintCategory | null;
  description: string;
  area: string;
  detail: string;
  lat: number | null;
  lng: number | null;
  evidenceBase64: string | null;
  evidenceName: string | null;
}

export interface AiResult {
  /** analysis from POST /api/ai/analyze when it resolves */
  analysis: AiAnalysis | null;
  /** server's `demo` flag — analysis is heuristic, not a real provider */
  demo: boolean;
  /** true when analyze request failed / timed out *before* a response */
  unavailable: boolean;
}

export type SubmitState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "done"; complaint: Complaint }
  | { phase: "error"; message: string };

const EMPTY_DRAFT: DraftState = {
  category: null,
  description: "",
  area: "",
  detail: "",
  lat: null,
  lng: null,
  evidenceBase64: null,
  evidenceName: null,
};

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

export function ReportWizard() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<WizardScreenId>("issue");
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [aiResult, setAiResult] = useState<AiResult>({
    analysis: null,
    demo: false,
    unavailable: false,
  });
  const [submit, setSubmit] = useState<SubmitState>({ phase: "idle" });
  const [aiLoading, setAiLoading] = useState(false);
  const submitRef = useRef<HTMLDivElement>(null);

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step);

  const canProceed = useMemo(() => {
    if (step === "issue") {
      return Boolean(draft.category && draft.description.trim().length >= 10);
    }
    if (step === "location") {
      return Boolean(draft.area.trim() && draft.lat !== null && draft.lng !== null);
    }
    if (step === "evidence") return true;
    return false;
  }, [step, draft]);

  const descriptionValid = (draft.description.trim().length >= 10);
  const locationValid = Boolean(draft.area.trim() && draft.lat !== null && draft.lng !== null);

  /** Run a light pre-check of the AI before submission. */
  const preflightAi = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: draft.description,
          categoryHint: draft.category ?? undefined,
          latitude: draft.lat ?? undefined,
          longitude: draft.lng ?? undefined,
          evidenceBase64: draft.evidenceBase64 ?? undefined,
        }),
      });
      if (!res.ok) {
        setAiResult({ analysis: null, demo: false, unavailable: true });
        return;
      }
      const data = (await res.json()) as {
        analysis?: AiAnalysis | null;
        demo?: boolean;
      };
      setAiResult({
        analysis: data.analysis ?? null,
        demo: Boolean(data.demo),
        unavailable: false,
      });
    } catch {
      setAiResult({ analysis: null, demo: false, unavailable: true });
    } finally {
      setAiLoading(false);
    }
  }, [draft.description, draft.category, draft.lat, draft.lng, draft.evidenceBase64]);

  /** Submit the complaint; POST /api/complaints returns the created record. */
  const handleSubmit = useCallback(async () => {
    if (!draft.category || draft.lat === null || draft.lng === null) return;
    setSubmit({ phase: "submitting" });
    setAiResult({ analysis: null, demo: false, unavailable: false });
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: draft.description,
          category: draft.category,
          locationLabel: `${draft.area}${draft.detail ? ` — ${draft.detail}` : ""}`,
          latitude: draft.lat,
          longitude: draft.lng,
          evidenceBase64: draft.evidenceBase64 ?? undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setSubmit({
          phase: "error",
          message:
            (data && typeof data.error === "string" ? data.error : "Could not submit the complaint. Please try again."),
        });
        return;
      }
      const complaint = data?.complaint as Complaint | undefined;
      if (!complaint) {
        setSubmit({
          phase: "error",
          message: "The server did not return a complaint record. Please try again.",
        });
        return;
      }
      setSubmit({ phase: "done", complaint });
      setStep("verified");
    } catch {
      setSubmit({
        phase: "error",
        message: "Network error — the complaint could not be submitted. Please try again.",
      });
    }
  }, [draft]);

  /** Move to a step (used by the stepper / back buttons). */
  const go = useCallback((next: WizardStepId) => {
    setStep(next);
  }, []);

  // Move to the verified step whenever a submit completes.
  useEffect(() => {
    if (submit.phase === "done") setStep("verified");
  }, [submit]);

  // Scroll to top when the step changes (desktop + mobile friendly).
  useEffect(() => {
    if (reduce) {
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step, reduce]);

  // Focus management for a11y: announce step + form container.
  useEffect(() => {
    const region = submitRef.current;
    if (region) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          const first = region?.querySelector<HTMLElement>("input, select, textarea, button");
          first?.focus();
        }
      };
      region.addEventListener("keydown", handleKey);
      return () => region.removeEventListener("keydown", handleKey);
    }
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case "issue":
        return (
          <StepIssue
            draft={draft}
            setDraft={setDraft}
            onNext={() => go("location")}
            canProceed={canProceed}
          />
        );
      case "location":
        return (
          <StepLocation
            draft={draft}
            setDraft={setDraft}
            onBack={() => go("issue")}
            onNext={() => go("evidence")}
            canProceed={canProceed}
          />
        );
      case "evidence":
        return (
          <StepEvidence
            draft={draft}
            setDraft={setDraft}
            onBack={() => go("location")}
            onNext={() => go("review")}
            canProceed={canProceed}
          />
        );
      case "review":
        return (
          <StepReview
            draft={draft}
            onBack={() => go("evidence")}
            onNext={handleSubmit}
            submitting={submit.phase === "submitting"}
            aiLoading={aiLoading}
            aiResult={aiResult}
            error={submit.phase === "error" ? submit.message : null}
            onPreflight={preflightAi}
          />
        );
      case "verified":
        return submit.phase === "done" ? (
          <StepVerified
            complaint={submit.complaint}
            aiResult={aiResult}
            hasPhoto={Boolean(draft.evidenceBase64)}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* backdrop glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(102,78,174,0.22) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Heading */}
        <BlurInText
          as="div"
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-mono text-xs font-medium uppercase tracking-[0.28em] text-citi-lavender/80">
            Report
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Report a citi issue
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/65 sm:text-lg">
            Anonymously. Traceably. With AI-checked evidence — so it can&apos;t
            quietly disappear.
          </p>
        </BlurInText>

        {/* Stepper */}
                {submit.phase !== "done" && step !== "verified" && (
                  <ReportStepper
                    steps={WIZARD_STEPS}
                    current={step as WizardStepId}
                    onStepClick={go}
                  />
                )}

        {/* Step card */}
        <div
          ref={submitRef}
          role="region"
                  aria-label={
                    step === "verified"
                      ? "Submission complete"
                      : `Step ${stepIndex + 1} of ${WIZARD_STEPS.length}`
                  }
                  className="mt-8"
        >
          <GlassCard className={step === "verified" ? "border-citi-lavender/30" : undefined}>
            <div className="p-5 sm:p-8">{renderStep()}</div>
          </GlassCard>
        </div>

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center font-mono text-xs uppercase tracking-widest text-white/35"
        >
          No name. No email. No phone. Just the issue.
        </motion.p>
      </div>
    </div>
  );
}

export const CATEGORY_SELECT_OPTIONS = COMPLAINT_CATEGORIES;
export const CATEGORY_LABELS_MAP = CATEGORY_LABELS;