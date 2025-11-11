import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerSaveToFeishuPrompt(server: McpServer) {
  server.prompt(
    'save-to-feishu',
    'Save content to Feishu document and insert a record in Daily Note bitable',
    {},
    async () => {
      
      // Read the workflow content from markdown file
      const markdownPath = join(__dirname, 'save-to-feishu.md');
      const workflowContent = readFileSync(markdownPath, 'utf-8');

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: workflowContent
            }
          }
        ]
      };
    }
  );
}
