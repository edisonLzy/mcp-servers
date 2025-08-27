import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import inquirer from 'inquirer';
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
  
  const figmaClient = new FigmaClient();
  
  console.log('Welcome to Figma MCP Server setup!');
  console.log('To get your Figma Personal Access Token:');
  console.log('1. Go to https://www.figma.com/developers/api#access-tokens');
  console.log('2. Click "Generate new token"');
  console.log('3. Copy your personal access token\n');

  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'Enter your Figma Personal Access Token:',
      validate: (input: string) => {
        if (!input.trim()) {
          return 'Token is required';
        }
        if (!input.startsWith('figd_')) {
          return 'Figma tokens should start with "figd_"';
        }
        return true;
      },
    },
  ]);

  const config = {
    personalAccessToken: token.trim(),
  };

  await figmaClient.setConfig(config);
  
  // Test the token
  try {
    const user = await figmaClient.getCurrentUser();
    console.log('\n✅ Authentication successful!');
    console.log(`Hello, ${user.handle} (${user.email})`);
  } catch {
    console.log('\n❌ Authentication failed. Please check your token.');
    await figmaClient.clearConfig();
    process.exit(1);
  }
}

const figmaMCPServer: MCPServerOptions = {
  name: 'figma-mcp',
  description: 'Figma integration for files, nodes and team management',
  run: runFigmaMCP,
  auth: authFigmaMCP,
  requiresAuth: true
};

export default figmaMCPServer;