import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_INSTRUCTIONS, SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { registerCodeReviewPrompt } from "./prompts/code-review.js";
import { registerReviewSchema } from "./resources/review-schema.js";
import { registerGetTeamReviewRules } from "./tools/get-team-review-rules.js";

/** Único lugar que registra as tools, resources e prompts do servidor. */
export function createServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: SERVER_INSTRUCTIONS }
  );
  registerGetTeamReviewRules(server);
  registerReviewSchema(server);
  registerCodeReviewPrompt(server);
  return server;
}
