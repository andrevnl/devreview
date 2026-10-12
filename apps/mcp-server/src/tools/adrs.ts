import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getSupabase } from "../lib/supabase.js";

export function registerAdrTools(server: McpServer) {
  server.registerTool(
    "search_team_adrs",
    {
      title: "Search Team ADRs",
      description:
        "Searches accepted Architecture Decision Records by keyword. " +
        "Use when a PR touches architectural concerns (state management, auth, caching, etc.).",
      inputSchema: {
        team_id: z
          .string()
          .uuid()
          .describe("UUID of the team (from the teams table)"),
        // Vai para o filtro .or() do PostgREST: vírgula e parênteses quebram a
        // sintaxe, e % _ * viram curingas. Só letras, números, espaço, - e .
        keyword: z
          .string()
          .trim()
          .min(2)
          .max(50)
          .regex(/^[\p{L}\p{N} .-]+$/u, "Use only letters, numbers, spaces, '-' and '.'")
          .describe(
            'Search term matched against ADR title and decision (e.g., "redux", "cache", "auth")',
          ),
      },
    },
    async ({ team_id, keyword }) => {
      const { data, error } = await getSupabase()
        .from("adrs")
        .select("title, decision, status")
        .eq("team_id", team_id)
        .eq("status", "accepted")
        .or(`title.ilike.%${keyword}%,decision.ilike.%${keyword}%`);

      if (error) {
        throw new Error(`Failed to search ADRs: ${error.message}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              adrs: data ?? [],
              count: data?.length ?? 0,
            }),
          },
        ],
      };
    },
  );
}
