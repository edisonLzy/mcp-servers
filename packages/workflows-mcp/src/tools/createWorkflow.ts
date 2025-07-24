import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const createWorkflowSchema = z.object({
  name: z.string().describe('工作流名称'),
  description: z.string().optional().describe('工作流描述'),
  steps: z.array(z.string()).describe('工作流步骤列表')
});

export function registerCreateWorkflowTool(server: McpServer) {
  server.tool(
    'create-workflow',
    '创建新的工作流',
    createWorkflowSchema.shape,
    async ({ name, description, steps }: { name: string; description?: string; steps: string[] }) => {
      try {
        // 创建工作流逻辑（这里只是示例结构）
        const workflow = {
          id: `workflow_${Date.now()}`,
          name,
          description: description || '',
          steps,
          createdAt: new Date().toISOString(),
          status: 'created'
        };

        return {
          content: [
            {
              type: 'text',
              mimeType: 'application/json',
              text: JSON.stringify({
                success: true,
                workflow
              }, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  code: error.code || 'UNKNOWN_ERROR',
                  message: error.message || 'Failed to create workflow'
                }
              }, null, 2)
            },
          ],
          isError: true
        };
      }
    },
  );
}