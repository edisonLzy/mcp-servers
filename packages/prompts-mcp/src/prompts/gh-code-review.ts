import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';


export function registerExamplePrompt(server: McpServer) {
  server.prompt(
    'gh-code-review',
    'github 代码审查',
    async () => {
      try {

        return {
          content: [
            {
              type: 'text',
              text: 'github 代码审查',
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
} 
