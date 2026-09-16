"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, ImagePlus, Scan } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/format";
import type { DraftState } from "./ReportWizard";

const MAX_MB = 8;
const MAX_BYTES = MAX_MB * 1024 * 1024;

/**
 * StepEvidence — photo evidence upload.
 *
 * - Reads the file client-side and stores a base64 preview in the draft
 *   (plain <img>, never next/image — remotePatterns don't allow data: URIs).
 * - Evidence is analyzed by Evidence AI after submission; the user is told
 *   that clearly and honestly (assessment, not absolute truth).
 * - No identity is attached to the evidence.
 */
export function StepEvidence({
  draft,
  setDraft,
  onBack,
  onNext,
  canProceed,
}: {
  draft: DraftState;
  setDraft: React.Dispatch<React.SetStateAction<DraftState>>;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
}) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined | null) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. Please upload a photo (JPG, PNG, WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That image is larger than ${MAX_MB} MB. Please choose a smaller photo.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setDraft((d) => ({
        ...d,
        evidenceBase64: result,
        evidenceName: file.name,
      }));
    };
    reader.onerror = () => setError("Could not read that file. Please try another photo.");
    reader.readAsDataURL(file);
  };

  const clearPhoto = () =>
    setDraft((d) => ({ ...d, evidenceBase64: null, evidenceName: null }));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">
          Add evidence
        </h2>
        <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-white/40">
          STEP 03 · EVIDENCE
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/55">
        A photo helps prove the issue exists. It is analyzed by{" "}
        <span className="text-citi-lavender">Evidence AI</span> — an
        assessment, not absolute truth. Your identity never travels with it.
      </p>

      {/* Upload area */}
      <div className="mt-7">
        <input
          ref={inputRef}
          id="report-evidence"
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
          className="sr-only"
        />

        {draft.evidenceBase64 ? (
          <div className="overflow-hidden rounded-xl border border-citi-lavender/30 bg-white/[0.02]">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.evidenceBase64}
                alt="Your uploaded evidence photo"
                className="max-h-80 w-full object-contain"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute right-2 top-2 rounded-lg border border-white/15 bg-[#0c0b13]/85 px-3 py-1.5 text-xs font-medium text-white/75 backdrop-blur transition-colors hover:border-white/30 hover:text-white"
              >
                Remove
              </button>
            </div>
            {draft.evidenceName ? (
              <p className="border-t border-white/10 px-4 py-2.5 font-mono text-xs text-white/45">
                {draft.evidenceName}
              </p>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "group flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center transition-colors",
              error
                ? "border-amber-400/50"
                : "border-white/20 bg-white/[0.02] hover:border-citi-lavender/50 hover:bg-citi-lavender/[0.04]",
            )}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-citi-lavender transition-transform group-hover:scale-105">
              <ImagePlus className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-sm font-semibold text-white/85">
              Click to upload a photo
            </span>
            <span className="font-mono text-xs text-white/40">
              JPG · PNG · WEBP — up to {MAX_MB} MB
            </span>
          </button>
        )}

        {error ? (
          <p role="alert" className="mt-2 text-sm text-amber-300">
            {error}
          </p>
        ) : null}
      </div>

      {/* Evidence guidance */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-citi-lavender/80">
          <Camera className="h-4 w-4" aria-hidden />
          Good evidence is
        </div>
        <ul className="mt-3 grid gap-2 text-sm text-white/60 sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-citi-lavender/70" aria-hidden />
            In focus, daylight if possible
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-citi-lavender/70" aria-hidden />
            Showing the issue in context
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-citi-lavender/70" aria-hidden />
            One clear subject
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-citi-lavender/70" aria-hidden />
            Faces and plates not required
          </li>
        </ul>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-citi-lavender/15 bg-citi-lavender/[0.04] p-4 text-sm text-white/60">
        <Scan className="mt-0.5 h-4 w-4 shrink-0 text-citi-lavender/80" aria-hidden />
        <p>
          Evidence AI checks quality, severity, safety risk and before/after
          consistency. Its assessment helps prioritise — it never decides the
          outcome alone.
        </p>
      </div>

      {/* Footer nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-white/25 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <motion.button
          type="button"
          whileHover={reduce ? undefined : { y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors",
            canProceed
              ? "bg-citi-lavender text-[#17101f] hover:bg-citi-lavender/90"
              : "cursor-not-allowed bg-white/5 text-white/30",
          )}
        >
          Continue
          <ArrowRight className="h-4 w-4" aria-hidden />
        </motion.button>
      </div>
    </div>
  );
}