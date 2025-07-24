import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const createWorkflowSchema = z.object({
  name: z.string().describe('工作流名称')
});

const WORKFLOWS_DIR = path.join(process.cwd(), 'packages/workflows-mcp/workflows');

export function registerCreateWorkflowTool(server: McpServer) {
  server.tool(
    'create-mcp-server',
    'the rule about how to create a MCP server in current workspace',
    createWorkflowSchema.shape,
    async ({ name }) => {
      try {
        // 确保工作流目录存在
        if (!fs.existsSync(WORKFLOWS_DIR)) {
          fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });
        }

        // 生成工作流 ID
        const workflowId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const timestamp = new Date().toISOString();

        // 保存工作流文件
        const workflowFile = path.join(WORKFLOWS_DIR, `${workflowId}.json`);
        fs.writeFileSync(workflowFile, JSON.stringify(workflow, null, 2), 'utf8');

        return {
          content: [
            {
              type: 'text',
              mimeType: 'application/json',
              text: JSON.stringify({
                success: true,
                workflow: {
                  id: workflowId,
                  name,
                  description,
                  file_path: workflowFile,
                  created_at: timestamp
                },
                message: `工作流 '${name}' 已成功创建，保存在 ${workflowFile}`
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