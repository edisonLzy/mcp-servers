import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { FigmaClient } from './figmaClient.js';
// Import tool registrations
import { registerGetFileTool } from './tools/files/getFile.js';
import { registerListFilesTool } from './tools/files/listFiles.js';
import { registerGetNodeTool } from './tools/nodes/getNode.js';
import { registerGetNodesTool } from './tools/nodes/getNodes.js';
import { registerListTeamsTool } from './tools/teams/listTeams.js';
import { registerListProjectsTool } from './tools/teams/listProjects.js';
import type { MCPServerOptions } from '../../types.js';

dotenv.config();

async function runFigmaMCP(): Promise<void> {
  // Create an MCP server
  const server = new McpServer({
    name: 'figma-mcp',
    version: '0.1.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  // Initialize Figma client
  const figmaClient = new FigmaClient();

  // Register all tools
  registerGetFileTool(server, figmaClient);
  registerListFilesTool(server, figmaClient);
  registerGetNodeTool(server, figmaClient);
  registerGetNodesTool(server, figmaClient);
  registerListTeamsTool(server, figmaClient);
  registerListProjectsTool(server, figmaClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Figma MCP Server started successfully! Use the available tools to interact with Figma files and nodes.');
}

async function authFigmaMCP(): Promise<void> {
  const { Command } = await import('commander');
  const { cliAction } = await import('./cli.js');
  
  // Run the CLI auth setup
  const program = new Command();
  program
    .name('figma-mcp-auth')
    .description('Configure Figma MCP authentication')
    .action(cliAction);
  
  await program.parseAsync(['node', 'figma-mcp-auth']);
}

const figmaMCPServer: MCPServerOptions = {
  name: 'figma-mcp',
  description: 'Figma integration for files, nodes and team management',
  run: runFigmaMCP,
  auth: authFigmaMCP,
  requiresAuth: true
};

export default figmaMCPServer;