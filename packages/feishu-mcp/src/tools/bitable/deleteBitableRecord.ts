import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const deleteBitableRecordSchema = z.object({
  app_token: z.string().describe('多维表格的 app_token。你需调用知识库相关获取知识空间节点信息接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。'),
  table_id: z.string().describe('数据表的 table_id，可通过"列出数据表"工具获取'),
  record_id: z.string().describe('要删除的记录 ID')
});

export function registerDeleteBitableRecordTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'delete-bitable-record',
    '删除多维表格中的单条记录',
    deleteBitableRecordSchema.shape,
    async ({
      app_token,
      table_id,
      record_id
    }) => {
      try {
        const response = await client.deleteBitableRecord(
          app_token,
          table_id,
          record_id
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              app_token,
              table_id,
              record_id,
              deleted: response.data.deleted
            }, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: {
                message: error.message || 'Failed to delete bitable record',
                code: error.code || 'UNKNOWN_ERROR',
                details: error.details || error
              }
            }, null, 2)
          }]
        };
      }
    }
  );
}