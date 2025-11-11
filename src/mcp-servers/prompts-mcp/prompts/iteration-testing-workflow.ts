import { readWorkflowFile } from '../utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerIterationTestingWorkflowPrompt(server: McpServer) {
  server.prompt(
    'iteration-testing-workflow',
    '迭代测试工作流 - 分析迭代分支变更并修复提测阶段发现的问题',
    async () => {
      const workflowContent = await readWorkflowFile('iteration-testing-workflow.md');
      
      return { 
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照以下工作流程分析代码变更并修复问题：

工作流程定义：
${workflowContent}

请严格按照工作流程中的步骤执行：
1. 确认环境信息（当前分支、基线分支、问题描述）
2. 分析代码变更（获取变更文件列表和详细内容）
3. 问题定位（关联分析变更内容与问题描述）
4. 提供修复方案（详细的修复步骤和代码示例）
5. 风险评估（评估修复的影响范围）

**重要提示**：
- 修复方案必须基于实际的代码变更分析
- 需要提供详细的问题定位过程
- 修复方案要包含具体的代码修改示例
- 必须评估修复可能带来的影响

现在，请告诉我你遇到的问题描述，我会帮你分析并提供修复方案。`,
            },
          },
        ],
      };
    },
  );
}
