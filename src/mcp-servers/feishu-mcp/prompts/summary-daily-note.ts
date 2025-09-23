import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const summaryDailyNoteSchema = z.object({
  target_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'target_date must be in YYYY-MM-DD format'
    })
    .optional()
    .describe('Target date in YYYY-MM-DD format (optional, defaults to today)')
});

export function registerSummaryDailyNotePrompt(server: McpServer) {
  server.prompt(
    'summary-daily-note',
    'Generate a structured daily note document from scattered knowledge in Daily Note bitable',
    summaryDailyNoteSchema.shape,
    async (args) => {
      // Validate arguments using zod schema
      const validated = summaryDailyNoteSchema.parse(args);
      const { target_date } = validated;

      const currentDate = target_date || new Date().toISOString().split('T')[0];

      // Read the workflow content from markdown file
      const markdownPath = join(__dirname, 'summary-daily-note.md');
      let workflowContent = '';

      try {
        workflowContent = readFileSync(markdownPath, 'utf-8');
      } catch {
        workflowContent = 'Error: Could not load workflow content from summary-daily-note.md';
      }

      // Replace template variables in the content
      const processedContent = workflowContent.replace(/\{\{target_date\}\}/g, currentDate);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照以下Daily Note Summary Workflow执行，目标日期为: ${currentDate}

${processedContent}

请严格按照上述workflow的步骤执行，并在每个步骤完成后提供详细的反馈。确保最终输出包含可访问的文档链接。`
            }
          }
        ]
      };
    }
  );
}