import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mockReviewRules } from "../mocks/review-rules.js";
import {
  reviewRuleSchema,
  ruleCategorySchema,
  ruleSeveritySchema,
  type ReviewRule,
} from "../schemas.js";

// Fonte de dados isolada: no Módulo 4 passa a consultar o Supabase.
async function getActiveRulesByTeam(teamId: string): Promise<ReviewRule[]> {
  return mockReviewRules.filter((rule) => rule.team_id === teamId && rule.active);
}

export function registerGetTeamReviewRules(server: McpServer) {
  server.registerTool(
    "get_team_review_rules",
    {
      title: "Get Team Review Rules",
      description:
        "Retrieves active code review rules for a team. " +
        "Use this when reviewing a PR to know what standards the team enforces. " +
        "Return rules grouped by category and severity.",
      inputSchema: {
        team_id: z.string().uuid().describe("UUID of the team (from the teams table)"),
        category: ruleCategorySchema
          .optional()
          .describe("Filter by category. Omit to get all categories."),
        severity: ruleSeveritySchema
          .optional()
          .describe(
            'Filter by severity. "error" = must fix, "warning" = should fix, "info" = good to have. Omit to get all severities.'
          ),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(20)
          .describe("Max rules to return (1-50, default 20)"),
      },
      outputSchema: {
        team_id: z.string().uuid(),
        total: z.number().int(),
        rules: z.array(reviewRuleSchema),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ team_id, category, severity, limit }) => {
      const rules = (await getActiveRulesByTeam(team_id))
        .filter((rule) => !category || rule.category === category)
        .filter((rule) => !severity || rule.severity === severity)
        .slice(0, limit);
      const result = { team_id, total: rules.length, rules };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );
}
