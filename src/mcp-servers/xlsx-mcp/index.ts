import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGetRecordsFromSheetTool } from './tools/getRecordsFromSheet.js';
import { registerListSheetFromFileTool } from './tools/listSheetFromFile.js';
import type { MCPServerOptions } from '../../types.js';

async function runXlsxMCP(): Promise<void> {
  // Create an MCP server
  const server = new McpServer({
    name: 'xlsx-mcp',
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
}

const xlsxMCPServer: MCPServerOptions = {
  name: 'xlsx-mcp',
  description: 'Excel file reader with advanced querying capabilities for .xlsx files',
  run: runXlsxMCP,
  requiresAuth: false
};

export default xlsxMCPServer;