#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { FeishuClient } from './feishuClient.js';
import { registerListWikiSpacesTool } from './tools/wiki/listSpaces.js';
import { registerGetSpaceNodesTool } from './tools/wiki/getSpaceNodes.js';
import { registerCreateWikiNodeTool } from './tools/wiki/createNode.js';
import { registerGetWikiDocumentContentTool } from './tools/docx/getDocumentContent.js';
import { TokenStore } from './auth/tokenStore.js';

dotenv.config();

async function main() {
  // Create an MCP server
  const server = new McpServer({
    name: 'feishu-mcp',
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Initialize token store
  const tokenStore = TokenStore.create();
  // Initialize Feishu client
  const feishuClient = new FeishuClient(
    tokenStore
  );

  // Register all tools
  registerListWikiSpacesTool(server, feishuClient);
  registerGetSpaceNodesTool(server, feishuClient);
  registerCreateWikiNodeTool(server, feishuClient);
  registerGetWikiDocumentContentTool(server, feishuClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Feishu MCP Server started');
}

// Start the server
main().catch(console.error);