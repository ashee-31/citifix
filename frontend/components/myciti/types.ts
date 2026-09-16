import type { Complaint, ComplaintEvent } from "@/lib/types";

export interface MyCitiStats {
  total: number;
  active: number;
  resolved: number;
  disputed: number;
  withEvidence: number;
  supportReceived: number;
}

export interface MyCitiComplaintItem {
  complaint: Complaint;
}

export interface MyCitiDetailItem {
  complaint: Complaint;
  events: ComplaintEvent[];
}

export type MyCitiTab = "all" | "active" | "resolved" | "disputed";
