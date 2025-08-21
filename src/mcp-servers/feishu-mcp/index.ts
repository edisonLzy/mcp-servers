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
import { TokenStore } from './auth/tokenStore.js';
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
  registerGetNodeInfoTool(server, feishuClient);
  registerGetDocumentBlocksTool(server, feishuClient);
  registerGetDocumentRawContentTool(server, feishuClient);
  registerUpdateDocumentBlockTool(server, feishuClient);
  registerDeleteDocumentBlocksTool(server, feishuClient);
  registerConvertContentToBlocksTool(server, feishuClient);
  registerCreateDocumentBlocksTool(server, feishuClient);
  registerBitableTools(server, feishuClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Feishu MCP Server started');
}

async function authFeishuMCP(): Promise<void> {
  console.log('🔧 Feishu MCP 认证配置');
  console.log('请前往飞书开放平台配置应用并获取 App ID 和 App Secret');
  console.log('https://open.feishu.cn/app');
  console.log('');
  console.log('需要配置的环境变量:');
  console.log('- FEISHU_APP_ID=your_app_id');
  console.log('- FEISHU_APP_SECRET=your_app_secret');
  console.log('');
  console.log('或者运行原有的认证流程:');
  console.log('feishu-mcp login');
}

const feishuMCPServer: MCPServerOptions = {
  name: 'feishu-mcp',
  description: 'Feishu/Lark integration with OAuth and CLI',
  run: runFeishuMCP,
  auth: authFeishuMCP,
  requiresAuth: true
};

export default feishuMCPServer;