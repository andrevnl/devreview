import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { mockReviewRules } from "../mocks/review-rules.js";
import { reviewRuleSchema, type ReviewRule } from "../schemas.js";

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
        "Retrieves active code review rules for a team. Use when reviewing a PR to know the team's standards.",
      inputSchema: {
        team_id: z.string().uuid().describe("UUID of the team"),
      },
      outputSchema: {
        team_id: z.string().uuid(),
        total: z.number().int(),
        rules: z.array(reviewRuleSchema),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ team_id }) => {
      const rules = await getActiveRulesByTeam(team_id);
      const result = { team_id, total: rules.length, rules };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );
}
