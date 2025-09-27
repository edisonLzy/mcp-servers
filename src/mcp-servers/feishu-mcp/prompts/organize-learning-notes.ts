import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OrganizeLearningNotesArgsSchema = z.object({
  scattered_knowledge: z.string().describe('用户记录的零散知识点或问题'),
  space_id: z.string().describe('飞书知识空间ID'),
  parent_node_token: z.string().optional().describe('父文档节点token（可选）'),
  document_title: z.string().optional().describe('文档标题（可选，默认使用当前日期）')
});

export function registerOrganizeLearningNotesPrompt(server: McpServer) {
  server.prompt(
    'organize-learning-notes',
    'Organize scattered knowledge points into comprehensive learning notes and save to Feishu document with web search enhancement',
    OrganizeLearningNotesArgsSchema.shape,
    async (args) => {
      const validatedArgs = OrganizeLearningNotesArgsSchema.parse(args);

      // Read the workflow content from markdown file
      const markdownPath = join(__dirname, 'organize-learning-notes.md');
      const workflowContent = readFileSync(markdownPath, 'utf-8');

      const currentDate = new Date().toISOString().split('T')[0];
      const documentTitle = validatedArgs.document_title || currentDate;

      // Replace placeholders in the workflow content
      const processedContent = workflowContent
        .replace(/\{\{scattered_knowledge\}\}/g, validatedArgs.scattered_knowledge)
        .replace(/\{\{space_id\}\}/g, validatedArgs.space_id)
        .replace(/\{\{parent_node_token\}\}/g, validatedArgs.parent_node_token || '')
        .replace(/\{\{document_title\}\}/g, documentTitle)
        .replace(/\{\{current_date\}\}/g, currentDate);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照以下学习笔记整理工作流执行，将零散知识点整理成完善的学习笔记：

${processedContent}

请严格按照上述workflow的步骤执行，确保：
1. 充分利用web search进行深度研究
2. 扮演相应领域的专家角色
3. 生成高质量、结构化的学习笔记
4. 在每个步骤完成后提供详细的反馈
5. 最终输出包含可访问的文档链接`
            }
          }
        ]
      };
    }
  );
}