import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGhCreateMrPrompt } from './prompts/gh-create-mr.js';
import { registerGhCodeReviewPrompt } from './prompts/gh-code-review.js';
import { registerGhAutoMrFlowPrompt } from './prompts/gh-auto-mr-flow.js';

async function main() {
  // Create an MCP server
  const server = new McpServer(
    {
      name: 'Prompts MCP Server',
      version: '1.0.0',
    },
    {
      capabilities: {
        prompts: {},
      },
    },
  );

  // Add prompts
  registerGhCreateMrPrompt(server);
  registerGhCodeReviewPrompt(server);
  registerGhAutoMrFlowPrompt(server);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error); 