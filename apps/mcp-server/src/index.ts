#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

// No STDIO o stdout é o canal JSON-RPC: logs sempre via console.error.
async function main() {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  console.error("devreview-mcp rodando via stdio");
}

main().catch((error) => {
  console.error("Erro fatal no devreview-mcp:", error);
  process.exit(1);
});
