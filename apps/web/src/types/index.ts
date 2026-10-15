export type RuleSeverity = "error" | "warning" | "info";
export type RuleCategory =
  | "style"
  | "architecture"
  | "security"
  | "performance";
export type AdrStatus = "proposed" | "accepted" | "deprecated";

export interface ReviewRule {
  id: string;
  team_id: string;
  category: RuleCategory;
  rule: string;
  severity: RuleSeverity;
  active: boolean;
}

export interface ReviewHistory {
  id: string;
  pr_url: string;
  pr_number: number;
  repo: string;
  review_summary: string | null;
  issues_found: number;
  reviewed_at: string;
}

export interface Adr {
  id: string;
  title: string;
  context: string;
  decision: string;
  status: AdrStatus;
  created_at: string;
}
