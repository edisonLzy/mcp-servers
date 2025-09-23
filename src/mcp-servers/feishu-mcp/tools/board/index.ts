import { registerCreateBoardNodesTool } from './createBoardNodes.js';
import { registerGetBoardThemeTool } from './getBoardTheme.js';
import { registerGetBoardNodesTool } from './getBoardNodes.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { FeishuClient } from '../../feishuClient.js';

export function registerBoardTools(server: McpServer, client: FeishuClient) {
  registerCreateBoardNodesTool(server, client);
  registerGetBoardThemeTool(server, client);
  registerGetBoardNodesTool(server, client);
}