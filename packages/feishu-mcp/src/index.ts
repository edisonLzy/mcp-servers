#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { FeishuClient } from './feishuClient.js';
import { registerListWikiSpacesTool } from './tools/wiki/listSpaces.js';
import { registerGetSpaceNodesTool } from './tools/wiki/getSpaceNodes.js';
import { registerCreateWikiNodeTool } from './tools/wiki/createNode.js';
import { registerSearchWikiTool } from './tools/wiki/searchWiki.js';
import { registerGetDocumentBlocksTool } from './tools/docx/getDocumentBlocks.js';
import { registerGetDocumentRawContentTool } from './tools/docx/getDocumentRawContent.js';
import { registerUpdateDocumentBlockTool } from './tools/docx/updateDocumentBlock.js';
import { registerDeleteDocumentBlocksTool } from './tools/docx/deleteDocumentBlocks.js';
import { registerConvertContentToBlocksTool } from './tools/docx/convertContentToBlocks.js';
import { registerCreateDocumentBlocksTool } from './tools/docx/createDocumentBlocks.js';
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
  registerSearchWikiTool(server, feishuClient);
  registerGetDocumentBlocksTool(server, feishuClient);
  registerGetDocumentRawContentTool(server, feishuClient);
  registerUpdateDocumentBlockTool(server, feishuClient);
  registerDeleteDocumentBlocksTool(server, feishuClient);
  registerConvertContentToBlocksTool(server, feishuClient);
  registerCreateDocumentBlocksTool(server, feishuClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Feishu MCP Server started');
}

// Start the server
main().catch(console.error);