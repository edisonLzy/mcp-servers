import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const GhCodeReviewSchema = z.object({
  prUrl: z.string().url().regex(/github\.com\/[^\/]+\/[^\/]+\/pull\/\d+/, {
    message: '必须是有效的 GitHub Pull Request URL (例如: https://github.com/owner/repo/pull/123)',
  }),
});

export function registerGhCodeReviewPrompt(server: McpServer) {
  server.prompt(
    'gh-code-review',
    'GitHub 代码审查 - 对指定的 Pull Request 进行详细的代码审查',
    GhCodeReviewSchema.shape,
    async (args) => {
      const validated = GhCodeReviewSchema.parse(args);
      const prUrl = validated.prUrl;

      // 读取工作流程定义
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const workflowPath = join(__dirname, '../workflows/ai-code-review-gh.mdc');
      const workflowContent = await readFile(workflowPath, 'utf-8');
      
      return { 
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照以下工作流程对 GitHub Pull Request 进行代码审查：

Pull Request URL: ${prUrl}

工作流程定义：
${workflowContent}

请严格按照工作流程中的步骤执行：
1. 首先检查 gh CLI 是否可用
2. 从 URL 中提取 Pull Request ID
3. 获取 Pull Request 的 diff
4. 分析 diff 并生成审查建议
5. 将可执行的建议作为评论添加到 Pull Request
6. 生成并展示代码审查概览

请开始执行代码审查流程。`,
            },
          },
        ],
      };
    },
  );
}