import { z } from 'zod';
import { readWorkflowFile } from '../utils.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const RequirementTasksCreateSchema = z.object({
  inputStr: z.string().min(1, {
    message: '用户输入内容不能为空',
  }).describe('用户对需求的理解和所需的上下文信息等'),
});

export function registerRequirementTasksCreatePrompt(server: McpServer) {
  server.prompt(
    'requirement-tasks-create',
    '需求任务拆解 - 基于PRD文档和用户理解，将需求拆解为具体的开发任务',
    RequirementTasksCreateSchema.shape,
    async (args) => {
      const validated = RequirementTasksCreateSchema.parse(args);
      const { inputStr } = validated;

      // 读取工作流程定义
      const workflowContent = await readWorkflowFile('requirement-tasks-create.md');

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `请按照需求任务拆解工作流程来处理以下任务：

**用户输入内容：**
${inputStr}

**工作流程定义：**
${workflowContent}

**重要要求：**
1. 严格按照工作流程文档执行，完成PRD获取、接口文档获取（如有）、任务拆解三个阶段
2. 最终输出必须严格按照以下XML格式，不允许任何偏差：

\`\`\`xml
<Task>
<名称>{{任务名称}}</名称>
<描述>{{任务描述，说明该任务需要做什么}}</描述>
<上下文>
  <变更文件>
  {{文件变更清单}}
  </变更文件>
  <相关接口>
  {{接口详细信息，如果涉及接口开发}}
  </相关接口>
</上下文>
<实现步骤>
{{详细实现步骤}}
</实现步骤>
</Task>
\`\`\`

3. 每个任务都必须包含完整的XML结构
4. 如果没有相关接口，<相关接口>标签可以省略
5. 所有任务拆解完成后，必须询问用户是否需要补充信息，并根据用户反馈进行完善`,
            },
          },
        ],
      };
    },
  );
}