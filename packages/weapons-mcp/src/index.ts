#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { WeaponsClient } from './weaponsClient.js';
import { registerGetEndpointsTool } from './tools/getEndpoints.js';
import { registerGetEndpointDetailTool } from './tools/getEndpointDetail.js';

dotenv.config();

async function main() {
  // Create an MCP server
  const server = new McpServer({
    name: 'weapons-mcp',
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Initialize Weapons client
  const weaponsClient = new WeaponsClient();

  // Register all tools
  registerGetEndpointsTool(server, weaponsClient);
  registerGetEndpointDetailTool(server, weaponsClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Weapons MCP Server started successfully! Use get-endpoints and get-endpoint-detail tools to interact with Weapons API.');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 