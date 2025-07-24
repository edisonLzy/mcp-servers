#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerCreateWorkflowTool } from './tools/createWorkflow.js';

async function main() {
  // Create an MCP server
  const server = new McpServer({
    name: 'workflows-mcp',
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Register all tools
  registerCreateWorkflowTool(server);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Workflows MCP Server started successfully! Use available tools to manage workflows.');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});