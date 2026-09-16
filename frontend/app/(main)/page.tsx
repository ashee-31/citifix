import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { ProblemSection } from "@/components/home/ProblemSection";
import { AnswerSection } from "@/components/home/AnswerSection";
import { EvidenceAISection } from "@/components/home/EvidenceAISection";
import { ResolutionProofSection } from "@/components/home/ResolutionProofSection";
import { CommunitySection } from "@/components/home/CommunitySection";
import { BlockchainSection } from "@/components/home/BlockchainSection";
import { AuthorityAISection } from "@/components/home/AuthorityAISection";
import { CitiPulseSection } from "@/components/home/CitiPulseSection";
import { AuditTrailSection } from "@/components/home/AuditTrailSection";
import { PrivacySection } from "@/components/home/PrivacySection";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "CitiFix — Report it. Track it. Verify it.",
  description:
    "CitiFix makes every citi complaint traceable, every resolution provable, and every important action auditable. AI-verified evidence, community accountability, blockchain proof.",
};

/**
 * Homepage — the complete CitiFix visual experience.
 *
 * Narrative flow:
 * 1. Hero — headline + CTAs
 * 2. The Problem — accountability gap
 * 3. The Answer — CitiFix core loop
 * 4. Evidence AI — computer vision / evidence system
 * 5. Resolution Proof — "prove it" flow
 * 6. Community Verification — citizen role
 * 7. Blockchain Audit Trail — immutable proof
 * 8. Authority Intelligence — decision support
 * 9. Live Citi Pulse — data metrics
 * 10. The Audit Trail — cinematic timeline
 * 11. Privacy — accountability without exposure
 * 12. Final CTA — closing statement
 *
 * Footer is provided by the (main)/layout.tsx — not duplicated here.
 */
export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* Divider glow */}
      <div
        className="h-px w-full opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,168,255,0.3) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <ProblemSection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(102,78,174,0.4) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <AnswerSection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,168,255,0.2) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <EvidenceAISection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(102,78,174,0.3) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <ResolutionProofSection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,168,255,0.2) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <CommunitySection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(102,78,174,0.3) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <BlockchainSection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,168,255,0.2) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <AuthorityAISection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(102,78,174,0.3) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <CitiPulseSection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,168,255,0.2) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <AuditTrailSection />

      <div
        className="h-px w-full opacity-20"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(102,78,174,0.3) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <PrivacySection />

      <div
        className="h-px w-full opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,168,255,0.3) 50%, transparent 100%)",
        }}
        aria-hidden
      />

      <FinalCTA />
    </>
  );
}
