import type {
  Complaint,
  ComplaintEvent,
  AiEvidenceReview,
  BlockchainProof,
  Notification,
} from "@/lib/types";
import { demoHash } from "@/lib/chain/hash";
import { computePriority } from "@/lib/priority/engine";

/**
 * Realistic demo data. Seeded deterministically (fixed dates, fixed hashes)
 * so dashboards, charts and the tamper demo are stable across reloads.
 *
 * DEMO MODE ONLY — never used when real Supabase data is available.
 */

const DAY = 86_400_000;
const now = Date.now();
const iso = (daysAgo: number, hour = 10) =>
  new Date(now - daysAgo * DAY - (12 - hour) * 3_600_000).toISOString();

/** Days elapsed (minimum 0.1) since a complaint was created. */
function daysSince(createdAt: string): number {
  return Math.max(0.1, (Date.now() - new Date(createdAt).getTime()) / DAY);
}

export const DEMO_CITY_CENTER = { lat: 28.6139, lng: 77.209 };

interface SeedInput {
  number: string;
  category: Complaint["category"];
  description: string;
  location_label: string;
  latitude: number;
  longitude: number;
  status: Complaint["status"];
  aiSeverity: string;
  aiSeverityScore: number;
  safetyRisk: string;
  safetyRiskScore: number;
  evidenceQuality: number;
  aiSummary: string;
  supportCount: number;
  depthImpact: number;
  reportCount: number;
  daysAgo: number;
  reopenCount?: number;
  disputeCount?: number;
  resolutionNote?: string;
  resolvedAtDaysAgo?: number;
}

function seedComplaint(input: SeedInput): Complaint {
  const createdAt = iso(input.daysAgo);
  const resolvedAt = input.resolvedAtDaysAgo ? iso(input.resolvedAtDaysAgo) : null;
  const base: Complaint = {
    id: `demo-${input.number.toLowerCase().replace(/-/g, "")}`,
    complaint_number: input.number,
    reporter_id: "demo-reporter", // never exposed publicly
    category: input.category,
    description: input.description,
    location_label: input.location_label,
    latitude: input.latitude,
    longitude: input.longitude,
    status: input.status,
    priority: "MEDIUM",
    priority_score: 40,
    ai_severity: input.aiSeverity,
    ai_severity_score: input.aiSeverityScore,
    safety_risk: input.safetyRisk,
    safety_risk_score: input.safetyRiskScore,
    evidence_quality: input.evidenceQuality,
    ai_summary: input.aiSummary,
    evidence_url: null,
    resolution_evidence_url: null,
    resolution_note: input.resolutionNote ?? null,
    support_count: input.supportCount,
        depth_impact: input.depthImpact,
    overdue: false,
        report_count: input.reportCount,
    created_at: createdAt,
    updated_at: resolvedAt ?? createdAt,
    resolved_at: resolvedAt,
    reopen_count: input.reopenCount ?? 0,
    dispute_count: input.disputeCount ?? 0,
  };
      const { level, total } = computePriority(base);
      return { ...base, priority: level, priority_score: total, overdue: input.daysAgo > 14 && input.status !== "RESOLVED" };
}

export const DEMO_COMPLAINTS: Complaint[] = [
  seedComplaint({
    number: "CP-2026-0042",
    category: "ROADS",
    description: "Large dangerous pothole on MG Road near the bus stop. Vehicles swerve into oncoming traffic to avoid it. Already caused two bike falls this week.",
    location_label: "MG Road, Central District",
    latitude: DEMO_CITY_CENTER.lat + 0.012,
    longitude: DEMO_CITY_CENTER.lng - 0.008,
    status: "PUBLIC_REVIEW",
    aiSeverity: "Critical",
    aiSeverityScore: 92,
    safetyRisk: "High",
    safetyRiskScore: 88,
    evidenceQuality: 94,
    aiSummary: "Deep asphalt depression ~40cm wide with exposed aggregate. High vehicle damage risk and significant cyclist/bike hazard at evening traffic density.",
    supportCount: 47,
    depthImpact: 3200,
    reportCount: 3,
    daysAgo: 5,
  }),
  seedComplaint({
    number: "CP-2026-0041",
    category: "STREETLIGHTS",
    description: "Streetlight cluster on Park Avenue has been dark for three weeks. Entire stretch is pitch black after 7 PM; residents report increased fear at night.",
    location_label: "Park Avenue, North Ward",
    latitude: DEMO_CITY_CENTER.lat - 0.01,
    longitude: DEMO_CITY_CENTER.lng + 0.02,
    status: "IN_PROGRESS",
    aiSeverity: "High",
    aiSeverityScore: 78,
    safetyRisk: "High",
    safetyRiskScore: 74,
    evidenceQuality: 81,
    aiSummary: "Three consecutive lamp posts non-functional. Darkness on a pedestrian-heavy stretch correlates with elevated night-time safety risk.",
    supportCount: 31,
    depthImpact: 1900,
    reportCount: 2,
    daysAgo: 21,
  }),
  seedComplaint({
    number: "CP-2026-0040",
    category: "WASTE",
    description: "Garbage overflow at the community bin near Gandhi Market. Bins not collected for 6 days; overflow spilling onto the footpath.",
    location_label: "Gandhi Market, East Ward",
    latitude: DEMO_CITY_CENTER.lat + 0.021,
    longitude: DEMO_CITY_CENTER.lng + 0.006,
    status: "ASSIGNED",
    aiSeverity: "Medium",
    aiSeverityScore: 55,
    safetyRisk: "Medium",
    safetyRiskScore: 52,
    evidenceQuality: 88,
    aiSummary: "Solid waste overflow exceeding bin capacity. Stagnant material present; vector and odor risk moderate. Collection gap apparent.",
    supportCount: 19,
    depthImpact: 850,
    reportCount: 1,
    daysAgo: 6,
  }),
  seedComplaint({
    number: "CP-2026-0039",
    category: "WATER",
    description: "Visible water leak from underground main on Rose Street. Continuous flow for 4 days, waterlogging the pavement.",
    location_label: "Rose Street, Central District",
    latitude: DEMO_CITY_CENTER.lat + 0.005,
    longitude: DEMO_CITY_CENTER.lng - 0.012,
    status: "RESOLVED",
    aiSeverity: "High",
    aiSeverityScore: 82,
    safetyRisk: "Medium",
    safetyRiskScore: 65,
    evidenceQuality: 90,
    aiSummary: "Surface water discharge consistent with pipe leak. Risk of pavement scouring and slippery conditions.",
    supportCount: 26,
    depthImpact: 1400,
    reportCount: 1,
    daysAgo: 12,
    resolutionNote: "Leaking joint replaced by water utility; pavement patched.",
    resolvedAtDaysAgo: 2,
  }),
  seedComplaint({
    number: "CP-2026-0038",
    category: "DRAINAGE",
    description: "Storm drain blocked at the corner of Lotus Lane. Water gathers on the road after any rainfall — flooding half the lane.",
    location_label: "Lotus Lane, South Ward",
    latitude: DEMO_CITY_CENTER.lat - 0.018,
    longitude: DEMO_CITY_CENTER.lng - 0.004,
    status: "REOPENED",
    aiSeverity: "High",
    aiSeverityScore: 80,
    safetyRisk: "High",
    safetyRiskScore: 82,
    evidenceQuality: 76,
    aiSummary: "Drainage inlet fully obstructed. Accumulated debris; flooding risk on moderate rainfall. Previously marked resolved but issue persists.",
    supportCount: 22,
    depthImpact: 1100,
    reportCount: 2,
    daysAgo: 26,
    reopenCount: 1,
    disputeCount: 1,
  }),
  seedComplaint({
    number: "CP-2026-0037",
    category: "ROADS",
    description: "Unsafe road surface near the school crossing on Hill Road. Broken tarmac and loose gravel where children cross.",
    location_label: "Hill Road, West Ward",
    latitude: DEMO_CITY_CENTER.lat + 0.009,
    longitude: DEMO_CITY_CENTER.lng - 0.02,
    status: "RESOLUTION_SUBMITTED",
    aiSeverity: "Critical",
    aiSeverityScore: 90,
    safetyRisk: "High",
    safetyRiskScore: 91,
    evidenceQuality: 86,
    aiSummary: "Degraded surface adjacent to a school crossing. Loose material and edge drop present; elevated risk during school pick-up hours.",
    supportCount: 54,
    depthImpact: 2600,
    reportCount: 2,
    daysAgo: 9,
  }),
  seedComplaint({
    number: "CP-2026-0036",
    category: "FOOTPATH",
    description: "Footpath slabs broken along Citi Centre road; seniors and wheelchairs cannot pass safely.",
    location_label: "Citi Centre Road, Central",
    latitude: DEMO_CITY_CENTER.lat + 0.002,
    longitude: DEMO_CITY_CENTER.lng + 0.01,
    status: "DISPUTED",
    aiSeverity: "Medium",
    aiSeverityScore: 60,
    safetyRisk: "Medium",
    safetyRiskScore: 58,
    evidenceQuality: 72,
    aiSummary: "Multiple broken paving units with trip hazard. Accessibility impact high despite medium severity.",
    supportCount: 14,
    depthImpact: 600,
    reportCount: 1,
    daysAgo: 30,
    disputeCount: 1,
  }),
  seedComplaint({
    number: "CP-2026-0035",
    category: "WASTE",
    description: "Illegal dumping of construction debris on vacant plot opposite the park.",
    location_label: "Greenfield Plot, North Ward",
    latitude: DEMO_CITY_CENTER.lat + 0.03,
    longitude: DEMO_CITY_CENTER.lng + 0.015,
    status: "AI_VERIFIED",
    aiSeverity: "Low",
    aiSeverityScore: 38,
    safetyRisk: "Low",
    safetyRiskScore: 30,
    evidenceQuality: 83,
    aiSummary: "Construction rubble pile on private plot. Environmental nuisance; low immediate safety impact.",
    supportCount: 6,
    depthImpact: 300,
    reportCount: 1,
    daysAgo: 2,
  }),
  seedComplaint({
    number: "CP-2026-0034",
    category: "STREETLIGHTS",
    description: "Flickering streetlight near Metro station exit. Poses trip/strobe hazard to pedestrians at night.",
    location_label: "Metro Station South, East Ward",
    latitude: DEMO_CITY_CENTER.lat - 0.008,
    longitude: DEMO_CITY_CENTER.lng + 0.028,
    status: "RESOLVED",
    aiSeverity: "Medium",
    aiSeverityScore: 58,
    safetyRisk: "Medium",
    safetyRiskScore: 50,
    evidenceQuality: 79,
    aiSummary: "Intermittent luminaire operation. Strobing can disorient pedestrians; fixture replacement recommended.",
    supportCount: 11,
    depthImpact: 900,
    reportCount: 1,
    daysAgo: 18,
    resolutionNote: "Ballast replaced; lamp restored.",
    resolvedAtDaysAgo: 4,
  }),
  seedComplaint({
    number: "CP-2026-0033",
    category: "DRAINAGE",
    description: "Open manhole cover near bus depot. No warning markers. Children play nearby in the evening.",
    location_label: "Bus Depot Road, South Ward",
    latitude: DEMO_CITY_CENTER.lat - 0.024,
    longitude: DEMO_CITY_CENTER.lng + 0.009,
    status: "SUBMITTED",
    aiSeverity: "Critical",
    aiSeverityScore: 95,
    safetyRisk: "High",
    safetyRiskScore: 93,
    evidenceQuality: 68,
    aiSummary: "Uncovered drainage opening with no barrier. Immediate fall hazard, especially for children at play hours.",
    supportCount: 3,
    depthImpact: 750,
    reportCount: 1,
    daysAgo: 1,
  }),
  seedComplaint({
    number: "CP-2026-0032",
    category: "WATER",
    description: "Brown discolored water supply from taps in Lakeside apartments for past week.",
    location_label: "Lakeside Apartments, West Ward",
    latitude: DEMO_CITY_CENTER.lat + 0.014,
    longitude: DEMO_CITY_CENTER.lng - 0.015,
    status: "ACKNOWLEDGED",
    aiSeverity: "Medium",
    aiSeverityScore: 62,
    safetyRisk: "Medium",
    safetyRiskScore: 57,
    evidenceQuality: 71,
    aiSummary: "Suspended sediment in supply consistent with line disturbance. Potability question; utility acknowledged.",
    supportCount: 8,
    depthImpact: 2100,
    reportCount: 1,
    daysAgo: 7,
  }),
  seedComplaint({
    number: "CP-2026-0031",
    category: "ROADS",
    description: "Minor road damage — small cracks and a patch of missing asphalt near the roundabout.",
    location_label: "Roundabout, Central District",
    latitude: DEMO_CITY_CENTER.lat + 0.004,
    longitude: DEMO_CITY_CENTER.lng - 0.005,
    status: "AI_VERIFIED",
    aiSeverity: "Low",
    aiSeverityScore: 30,
    safetyRisk: "Low",
    safetyRiskScore: 25,
    evidenceQuality: 77,
    aiSummary: "Surface cracking within lane width. Low severity; scheduled maintenance appropriate.",
    supportCount: 2,
    depthImpact: 400,
    reportCount: 1,
    daysAgo: 3,
  }),
];

/** A stable sequence counter for new demo complaints. */
export function nextDemoSequence(): number {
  const maxNum = Math.max(
    ...DEMO_COMPLAINTS.map((c) =>
      parseInt(c.complaint_number.split("-")[2] ?? "0", 10),
    ),
  );
  return maxNum + 1;
}

/** Compose the audit events timeline for a demo complaint. */
export function demoEvents(c: Complaint): ComplaintEvent[] {
  const events: ComplaintEvent[] = [];
  const push = (
    type: ComplaintEvent["type"],
    title: string,
    daysAgo: number,
    actorRole: ComplaintEvent["actor_role"],
    entityRef: string | null = null,
  ) => events.push({
    id: `${c.id}-evt-${events.length}`,
    complaint_id: c.id,
    type,
    title,
    actor_role: actorRole,
    description: null,
    entity_ref: entityRef,
    created_at: iso(daysAgo),
  });

  push("COMPLAINT_SUBMITTED", "Complaint submitted", daysSince(c.created_at), "citizen");
    push("AI_EVIDENCE_VERIFIED", "AI evidence verified", daysSince(c.created_at), "ai");
    push("BLOCKCHAIN_ANCHORED", "Blockchain proof recorded", daysSince(c.created_at) + 0.01, "system", demoHash(c.complaint_number));

  const order: Complaint["status"][] = ["ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS", "RESOLUTION_SUBMITTED", "PUBLIC_REVIEW", "RESOLVED"];
  for (const s of order) {
    const idx = order.indexOf(s);
    const isReached =
      (c.status === "RESOLVED" && idx <= order.indexOf("RESOLVED")) ||
      (c.status === "PUBLIC_REVIEW" && idx <= order.indexOf("PUBLIC_REVIEW")) ||
      (c.status === "DISPUTED" || c.status === "REOPENED") && idx <= 3;
    if (!isReached) break;
    const days = Math.max(0.5, daysSince(c.created_at) - idx * 1.2);
    const map: Record<string, [ComplaintEvent["type"], string]> = {
      ACKNOWLEDGED: ["ACKNOWLEDGED", "Acknowledged by citi authority"],
      ASSIGNED: ["ASSIGNED", "Assigned to department"],
      IN_PROGRESS: ["WORK_STARTED", "Work started on site"],
      RESOLUTION_SUBMITTED: ["RESOLUTION_SUBMITTED", "Resolution evidence submitted"],
      PUBLIC_REVIEW: ["PUBLIC_REVIEW", "Opened for public review"],
      RESOLVED: ["RESOLVED", "Citizen approved — resolved"],
    };
    const [t, title] = map[s];
    push(t, title, days, s === "ASSIGNED" || s === "IN_PROGRESS" ? "authority" : "system");
  }

  if (c.status === "DISPUTED" || c.dispute_count > 0) {
    push("DISPUTED", "Citizen disputed resolution", 1.6, "citizen");
  }
  if (c.status === "REOPENED" || c.reopen_count > 0) {
    push("REOPENED", "Reopened after dispute", 1.2, "system");
  }

  return events;
}

export function demoAiReview(c: Complaint): AiEvidenceReview {
  return {
    id: `${c.id}-ai-review`,
    complaint_id: c.id,
    category: c.category,
    severity: c.ai_severity,
    severity_score: c.ai_severity_score,
    safety_risk: c.safety_risk,
    safety_risk_score: c.safety_risk_score,
    evidence_quality: c.evidence_quality,
    summary: c.ai_summary,
    duplicate_likelihood: c.report_count > 1 ? 0.42 : 0.08,
    manipulation_indicators:
      c.evidence_quality >= 85 ? [] : ["Possible timestamp inconsistency"],
    analysis_version: "citi-vision-2.1",
    created_at: c.created_at,
  };
}

export function demoBlockchainProof(c: Complaint): BlockchainProof {
  const hash = demoHash(
    `${c.complaint_number}|${c.description}|demo-photo|${c.latitude}|${c.longitude}|${c.created_at}`,
  );
  return {
    id: `${c.id}-proof`,
    complaint_id: c.id,
    chain: "polygon-amoy-demo",
    contract_address: "0x000000000000000000000000000000000000d3m0",
    transaction_hash: `0x${demoHash(c.complaint_number + c.created_at).repeat(4).slice(0, 64)}`,
    record_hash: hash,
    block_number: 4_120_000 + (parseInt(c.complaint_number.split("-")[2] ?? "0", 10) % 9000),
    data_uri: `ipfs://citifix-demo/${c.complaint_number}`,
    anchored_at: c.created_at,
  };
}

export function demoNotifications(userId: string): Notification[] {
  return [
    {
      id: "n1",
      user_id: userId,
      title: "Your complaint entered public review",
      body: "CP-2026-0042 resolution evidence is ready for your review. Approve it or request a reopen.",
      href: "/complaints/CP-2026-0042",
      read: false,
      created_at: iso(0.3),
    },
    {
      id: "n2",
      user_id: userId,
      title: "New support on CP-2026-0037",
      body: "12 more citizens supported the school crossing issue.",
      href: "/complaints/CP-2026-0037",
      read: false,
      created_at: iso(1),
    },
    {
          id: "n3",
          user_id: userId,
          title: "Welcome to CitiFix",
          body: "Report. Track. Verify. Your city's accountability loop starts here.",
          href: "/explore",
          read: true,
          created_at: iso(2),
        },
      ];
    }