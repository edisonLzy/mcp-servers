#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { FeishuClient } from './client/feishuClient.js';
import { registerListWikiSpacesTool } from './tools/wiki/listSpaces.js';
import { registerGetSpaceNodesTool } from './tools/wiki/getSpaceNodes.js';
import { registerCreateWikiNodeTool } from './tools/wiki/createNode.js';
import { registerCreateDocumentTool } from './tools/docs/createDoc.js';
import { registerGetDocumentContentTool } from './tools/docs/getDocContent.js';
import { registerUpdateDocumentTool } from './tools/docs/updateDoc.js';

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

  // Initialize Feishu client
  const feishuClient = new FeishuClient({
    appId: process.env.FEISHU_APP_ID || '',
    appSecret: process.env.FEISHU_APP_SECRET || '',
    baseURL: process.env.FEISHU_API_BASE_URL || 'https://open.feishu.cn/open-apis'
  });

  // Register all tools
  registerListWikiSpacesTool(server, feishuClient);
  registerGetSpaceNodesTool(server, feishuClient);
  registerCreateWikiNodeTool(server, feishuClient);
  registerCreateDocumentTool(server, feishuClient);
  registerGetDocumentContentTool(server, feishuClient);
  registerUpdateDocumentTool(server, feishuClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Feishu MCP Server started');
}

// Start the server
main().catch(console.error);