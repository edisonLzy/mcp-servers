import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { FeishuClient } from './feishuClient.js';
import { registerListWikiSpacesTool } from './tools/wiki/listSpaces.js';
import { registerGetSpaceNodesTool } from './tools/wiki/getSpaceNodes.js';
import { registerCreateWikiNodeTool } from './tools/wiki/createNode.js';
import { registerSearchWikiTool } from './tools/wiki/searchWiki.js';
import { registerGetNodeInfoTool } from './tools/wiki/getNodeInfo.js';
import { registerGetDocumentBlocksTool } from './tools/docx/getDocumentBlocks.js';
import { registerGetDocumentRawContentTool } from './tools/docx/getDocumentRawContent.js';
import { registerUpdateDocumentBlockTool } from './tools/docx/updateDocumentBlock.js';
import { registerDeleteDocumentBlocksTool } from './tools/docx/deleteDocumentBlocks.js';
import { registerConvertContentToBlocksTool } from './tools/docx/convertContentToBlocks.js';
import { registerCreateDocumentBlocksTool } from './tools/docx/createDocumentBlocks.js';
import { registerBitableTools } from './tools/bitable/index.js';
import { registerBoardTools } from './tools/board/index.js';
import { authFeishuMCP } from './auth/index.js';
import type { MCPServerOptions } from '../../types.js';

dotenv.config();

async function runFeishuMCP(): Promise<void> {
  // Create an MCP server
  const server = new McpServer({
    name: 'feishu-mcp',
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Initialize Feishu client (credentials are read from token store)
  const feishuClient = new FeishuClient();

  // Register all tools
  registerListWikiSpacesTool(server, feishuClient);
  registerGetSpaceNodesTool(server, feishuClient);
  registerCreateWikiNodeTool(server, feishuClient);
  registerSearchWikiTool(server, feishuClient);
  registerGetNodeInfoTool(server, feishuClient);
  registerGetDocumentBlocksTool(server, feishuClient);
  registerGetDocumentRawContentTool(server, feishuClient);
  registerUpdateDocumentBlockTool(server, feishuClient);
  registerDeleteDocumentBlocksTool(server, feishuClient);
  registerConvertContentToBlocksTool(server, feishuClient);
  registerCreateDocumentBlocksTool(server, feishuClient);
  registerBitableTools(server, feishuClient);
  registerBoardTools(server, feishuClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Feishu MCP Server started');
}

const feishuMCPServer: MCPServerOptions = {
  name: 'feishu-mcp',
  description: 'Feishu/Lark integration with OAuth and CLI',
  run: runFeishuMCP,
  auth: authFeishuMCP,
  requiresAuth: true
};

export default feishuMCPServer;