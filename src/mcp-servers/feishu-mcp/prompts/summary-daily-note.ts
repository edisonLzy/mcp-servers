import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function registerSummaryDailyNotePrompt(server: McpServer) {
  server.prompt(
    'summary-daily-note',
    'Generate a structured daily note document from scattered knowledge in Daily Note bitable for today',
    {},
    async () => {
      
      // Read the workflow content from markdown file
      const markdownPath = join(__dirname, 'summary-daily-note.md');
      const workflowContent = readFileSync(markdownPath, 'utf-8');
      
      const today = new Date().toISOString().split('T')[0];
      const todayTimestamp = new Date(today).getTime();
      const processedContent = workflowContent.replace('{{target_date}}', today).replace('{{today_timestamp}}', `${todayTimestamp}`);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照以下Daily Note Summary Workflow执行

${processedContent}

请严格按照上述workflow的步骤执行，并在每个步骤完成后提供详细的反馈。确保最终输出包含可访问的文档链接。`
            }
          }
        ]
      };
    }
  );
}