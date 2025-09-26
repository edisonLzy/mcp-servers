import { z } from 'zod';
import { readWorkflowFile } from '../utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const RequirementWorkspaceCreateSchema = z.object({
  filePath: z.string().min(1, {
    message: '排期文档地址不能为空',
  }).describe('排期文档的绝对路径'),
  iteration: z.string().min(1, {
    message: '迭代号不能为空',
  }).describe('迭代号，对应Excel文件中的sheet名称'),
  conditions: z.string().optional().describe('筛选条件（字符串，使用英文逗号分隔，例如：FE = 李志宇, 优先级 = P0）'),
});

export function registerRequirementWorkspaceCreatePrompt(server: McpServer) {
  server.prompt(
    'requirement-workspace-create',
    '需求工作区创建 - 基于排期文档创建tmux工作区，为每个需求设置独立的git worktree开发环境',
    RequirementWorkspaceCreateSchema.shape,
    async (args) => {
      const validated = RequirementWorkspaceCreateSchema.parse(args);
      const { filePath, iteration, conditions } = validated;

      // 读取工作流程定义
      const workflowContent = await readWorkflowFile('requirement-workspace-create.md');

      // 处理筛选条件格式
      let conditionsText = '无（获取所有需求）';
      let conditionsArray: string[] = [];

      if (conditions && conditions.trim().length > 0) {
        conditionsArray = conditions.split(',').map(c => c.trim()).filter(c => c.length > 0);
        conditionsText = conditions;
      }

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照需求工作区创建工作流程来处理以下任务：

**输入参数：**
- 排期文档地址: ${filePath}
- 迭代号: ${iteration}
- 筛选条件: ${conditionsText}
- 筛选条件数组格式: ${JSON.stringify(conditionsArray)}

**工作流程定义：**
${workflowContent}

请严格按照工作流程文档执行，使用提供的参数调用相应的MCP工具。`,
            },
          },
        ],
      };
    },
  );
}