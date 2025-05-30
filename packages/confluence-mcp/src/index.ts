import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGetPageContentTool } from './tools/getPageContent';

async function main() {
  // Create an MCP server
  const server = new McpServer(
    {
      name: 'Confluence',
      version: '1.0.0',
    },
    {
      capabilities: {
        // 目前cursor不支持resources
        tools: {},
      },
    },
  );

  // Add tools
  registerGetPageContentTool(server);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
