import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSupabase } from "../lib/supabase.js";
import { READ_ONLY_ANNOTATIONS, UNTRUSTED_TOOL_HINT, untrustedResult } from "../lib/untrusted.js";

export function registerMetricsTools(server: McpServer) {
  server.registerTool(
    "get_review_metrics",
    {
      title: "Get Review Metrics",
      description:
        "Returns review metrics for a team: total reviews, average issues found, top repositories. " +
        "Use for context on quality trends before reviewing a PR." +
        UNTRUSTED_TOOL_HINT,
      inputSchema: {
        team_id: z
          .string()
          .uuid()
          .describe("UUID of the team (from the teams table)"),
        days: z
          .number()
          .int()
          .min(7)
          .max(90)
          .default(30)
          .describe("Look-back period in days (7-90, default: 30)"),
      },
      annotations: READ_ONLY_ANNOTATIONS,
    },
    async ({ team_id, days }) => {
      const since = new Date(Date.now() - days * 86_400_000).toISOString();

      const { data, error } = await getSupabase()
        .from("review_history")
        .select("issues_found, repo")
        .eq("team_id", team_id)
        .gte("reviewed_at", since);

      if (error) {
        throw new Error(`Failed to fetch review metrics: ${error.message}`);
      }

      const rows = data ?? [];
      const totalReviews = rows.length;
      const avgIssues =
        totalReviews > 0
          ? Number(
              (
                rows.reduce((sum, r) => sum + r.issues_found, 0) / totalReviews
              ).toFixed(1),
            )
          : 0;

      const byRepo = rows.reduce<Record<string, number>>((acc, r) => {
        acc[r.repo] = (acc[r.repo] ?? 0) + 1;
        return acc;
      }, {});
      const topRepos = Object.entries(byRepo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([repo, reviews]) => ({ repo, reviews }));

      return untrustedResult("review_history", {
        period_days: days,
        total_reviews: totalReviews,
        avg_issues_per_review: avgIssues,
        top_repos: topRepos,
      });
    },
  );
}
