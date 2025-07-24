import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listWorkflowsSchema = z.object({
  status: z.string().optional().describe('按状态过滤工作流 (created, running, completed, failed)'),
  limit: z.number().optional().describe('返回结果数量限制')
});

export function registerListWorkflowsTool(server: McpServer) {
  server.tool(
    'list-workflows',
    '列出所有工作流',
    listWorkflowsSchema.shape,
    async ({ status, limit }: { status?: string; limit?: number }) => {
      try {
        // 获取工作流列表逻辑（这里只是示例结构）
        const workflows = [
          {
            id: 'workflow_1',
            name: 'Example Workflow 1',
            description: 'A sample workflow',
            status: 'completed',
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'workflow_2',
            name: 'Example Workflow 2',
            description: 'Another sample workflow',
            status: 'running',
            createdAt: '2024-01-02T00:00:00Z'
          }
        ];

        // 应用过滤器
        let filteredWorkflows = workflows;
        if (status) {
          filteredWorkflows = workflows.filter(w => w.status === status);
        }
        if (limit) {
          filteredWorkflows = filteredWorkflows.slice(0, limit);
        }

        return {
          content: [
            {
              type: 'text',
              mimeType: 'application/json',
              text: JSON.stringify({
                success: true,
                workflows: filteredWorkflows,
                total: filteredWorkflows.length
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
                  message: error.message || 'Failed to list workflows'
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