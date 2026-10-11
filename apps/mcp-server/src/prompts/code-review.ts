import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerCodeReviewPrompt(server: McpServer) {
  server.registerPrompt(
    "code-review",
    {
      description: "Template for reviewing a PR using team rules",
      argsSchema: {
        pr_number: z.string().describe("Number of the PR to review"),
        team_id: z.string().describe("UUID of the team"),
      },
    },
    ({ pr_number, team_id }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Review PR #${pr_number} using the coding standards of team ${team_id}. Check for violations of the team's review rules and relevant ADRs.`,
          },
        },
      ],
    })
  );
}
