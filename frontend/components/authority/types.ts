import type { PublicComplaint } from "@/lib/types";

// Retained for the existing, reusable authority insight components.
export type { AuthorityInsight, BudgetEstimate, CategoryGrowth, ResourceAllocation } from "@/lib/ai/authority";

export type AuthorityOperation = "acknowledge" | "assign" | "start" | "requestEvidence";

export interface AuthorityFilters {
  category: string;
  status: string;
  priority: string;
  area: string;
  date: string;
}

export interface AuthorityComplaintResponse {
  complaints: PublicComplaint[];
}
