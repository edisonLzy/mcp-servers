import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGetRecordsFromSheetTool } from './tools/getRecordsFromSheet.js';
import { registerListSheetFromFileTool } from './tools/listSheetFromFile.js';
import type { MCPServerOptions } from '../../types.js';

const MCP_SERVER_NAME = 'xlsx-mcp';

async function run(): Promise<void> {
  // Create an MCP server
  const server = new McpServer({
    name: MCP_SERVER_NAME,
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Register all tools
  registerGetRecordsFromSheetTool(server);
  registerListSheetFromFileTool(server);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('XLSX MCP Server started successfully!');
}

const xlsxMCPServer: MCPServerOptions = {
  name: MCP_SERVER_NAME,
  description: 'Excel file reader with advanced querying capabilities for .xlsx files',
  run,
  requiresAuth: false
};

export default xlsxMCPServer;