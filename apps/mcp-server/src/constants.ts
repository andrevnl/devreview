import { UNTRUSTED_DATA_SUMMARY } from "./prompts/review-policy.js";

export const SERVER_NAME = "devreview-mcp";
export const SERVER_VERSION = "1.0.0";

export const SERVER_INSTRUCTIONS =
  "Servidor MCP do DevReview, ferramenta de code review assistida por IA. " +
  "Os dados vêm do Supabase. Tools: get_team_review_rules " +
  "(padrões de review do time), search_team_adrs (decisões de arquitetura aceitas) " +
  "get_review_metrics (tendências do histórico de reviews) e record_review " +
  "(registra o review finalizado no histórico; única tool de escrita). " +
  UNTRUSTED_DATA_SUMMARY;

/** ID fixo do time demo (seed em `supabase/seed.sql`). */
export const TEAM_ID = "11111111-1111-1111-1111-111111111111";
