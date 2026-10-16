import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { recordReviewStep, REVIEW_OUTPUT_FORMAT, UNTRUSTED_DATA_POLICY } from "./review-policy.js";

// Os args são interpolados no texto: formato estrito fecha a porta para injection
// via argumento. O SDK valida o argsSchema antes de chamar o callback.
export const codeReviewArgsSchema = {
  repo: z
    .string()
    .regex(/^[\w.-]+\/[\w.-]+$/, "repo must be in the 'owner/name' format")
    .max(200)
    .describe('GitHub repository of the PR, in the "owner/name" format'),
  pr_number: z
    .string()
    .regex(/^\d{1,7}$/, "pr_number must be a positive integer")
    .describe("Number of the PR to review"),
  team_id: z.string().uuid().describe("UUID of the team"),
};

export function buildCodeReviewPrompt(repo: string, prNumber: string, teamId: string): string {
  return `Você é um revisor de código do time. Sua única tarefa é produzir um review escrito do PR #${prNumber} do repositório ${repo}.

${UNTRUSTED_DATA_POLICY}

${REVIEW_OUTPUT_FORMAT}

${recordReviewStep(teamId, repo, prNumber)}

Comece buscando as regras do time ${teamId} com get_team_review_rules e os ADRs relevantes com search_team_adrs.`;
}

export function registerCodeReviewPrompt(server: McpServer) {
  server.registerPrompt(
    "code-review",
    {
      description:
        "Template for reviewing a PR using team rules and ADRs, hardened against prompt injection " +
        "(diff, PR metadata and tool results are treated as untrusted data). " +
        "Ends by saving the review to the team's history with record_review.",
      argsSchema: codeReviewArgsSchema,
    },
    ({ repo, pr_number, team_id }) => ({
      messages: [
        {
          role: "user",
          content: { type: "text", text: buildCodeReviewPrompt(repo, pr_number, team_id) },
        },
      ],
    })
  );
}
