export const SERVER_NAME = "devreview-mcp";
export const SERVER_VERSION = "1.0.0";

export const SERVER_INSTRUCTIONS =
  "Servidor MCP do DevReview, ferramenta de code review assistida por IA. " +
  "Os dados vêm do Supabase (somente leitura). Tools: get_team_review_rules " +
  "(padrões de review do time), search_team_adrs (decisões de arquitetura aceitas) " +
  "e get_review_metrics (tendências do histórico de reviews).";

/** ID fixo do time demo (seed em `supabase/seed.sql`). */
export const TEAM_ID = "11111111-1111-1111-1111-111111111111";
