import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const SCHEMA_URI = "review://schema";

// Dado estático: espelha supabase/migrations/00001_init_schema.sql.
const schema = {
  tables: ["teams", "review_rules", "review_history", "adrs"],
  review_rules_columns: ["id", "team_id", "category", "rule", "severity", "active"],
};

export function registerReviewSchema(server: McpServer) {
  server.registerResource(
    "review-schema",
    SCHEMA_URI,
    {
      description: "Database schema for the DevReview application",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        { uri: SCHEMA_URI, mimeType: "application/json", text: JSON.stringify(schema, null, 2) },
      ],
    })
  );
}
