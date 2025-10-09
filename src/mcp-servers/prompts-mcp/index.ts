import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerGhCreateMrPrompt } from './prompts/gh-create-mr.js';
import { registerGhCodeReviewPrompt } from './prompts/gh-code-review.js';
import { registerGhAutoMrFlowPrompt } from './prompts/gh-auto-mr-flow.js';
import { registerGitWorktreeDevelopmentPrompt } from './prompts/git-worktree-development.js';
import { registerGitCommitWorkflowPrompt } from './prompts/git-commit-workflow.js';
import type { MCPServerOptions } from '../../types.js';

async function runPromptsMCP(): Promise<void> {
  // Create an MCP server
  const server = new McpServer(
    {
      name: 'Prompts MCP Server',
      version: '1.0.0',
    },
    {
      capabilities: {
        prompts: {},
      },
    },
  );

  // Add prompts
  registerGhCreateMrPrompt(server);
  registerGhCodeReviewPrompt(server);
  registerGhAutoMrFlowPrompt(server);
  registerGitWorktreeDevelopmentPrompt(server);
  registerGitCommitWorkflowPrompt(server);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const promptsMCPServer: MCPServerOptions = {
  name: 'prompts-mcp',
  description: 'Git and GitHub workflow prompts plus requirement management for development',
  run: runPromptsMCP,
  requiresAuth: false
};

export default promptsMCPServer; 