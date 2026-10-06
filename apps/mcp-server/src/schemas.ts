import { z } from "zod";

// Espelham as check constraints de supabase/migrations/00001_init_schema.sql
// e os tipos de apps/web/src/types/index.ts.

export const ruleCategorySchema = z.enum([
  "style",
  "architecture",
  "security",
  "performance",
]);

export const ruleSeveritySchema = z.enum(["error", "warning", "info"]);

export const adrStatusSchema = z.enum(["proposed", "accepted", "deprecated"]);

export const reviewRuleSchema = z.object({
  id: z.string().uuid(),
  team_id: z.string().uuid(),
  category: ruleCategorySchema,
  rule: z.string(),
  severity: ruleSeveritySchema,
  active: z.boolean(),
});

export type RuleCategory = z.infer<typeof ruleCategorySchema>;
export type RuleSeverity = z.infer<typeof ruleSeveritySchema>;
export type AdrStatus = z.infer<typeof adrStatusSchema>;
export type ReviewRule = z.infer<typeof reviewRuleSchema>;
