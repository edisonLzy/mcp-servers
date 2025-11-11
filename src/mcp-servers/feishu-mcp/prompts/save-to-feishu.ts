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
      
      const today = new Date().toISOString().split('T')[0];
      const todayTimestamp = new Date(today).getTime();
      const currentDatetime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      
      const processedContent = workflowContent
        .replace(/\{\{current_date_timestamp\}\}/g, `${todayTimestamp}`)
        .replace(/\{\{current_datetime\}\}/g, currentDatetime);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照以下Save to Feishu Workflow执行

${processedContent}

请严格按照上述workflow的步骤执行，在每个步骤完成后提供详细的反馈。

特别注意：
1. 如果用户未指定保存路径，先使用list-wiki-spaces获取知识空间列表并向用户澄清
2. 确保文档成功创建后再插入多维表格记录
3. 即使多维表格记录创建失败，也要提供文档的访问链接
4. 保持内容块的正确顺序

请开始执行工作流程，首先询问用户需要保存的内容和标题。`
            }
          }
        ]
      };
    }
  );
}
