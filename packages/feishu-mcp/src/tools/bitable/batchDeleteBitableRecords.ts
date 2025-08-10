import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const batchDeleteBitableRecordsSchema = z.object({
  app_token: z.string().describe('多维表格的 app_token。你需调用知识库相关获取知识空间节点信息接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。'),
  table_id: z.string().describe('数据表的 table_id，可通过"列出数据表"工具获取'),
  record_ids: z.array(z.string()).min(1).max(500).describe('要删除的记录 ID 列表，最多支持 500 条记录')
});

export function registerBatchDeleteBitableRecordsTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'batch-delete-bitable-records',
    '批量删除多维表格中的记录',
    batchDeleteBitableRecordsSchema.shape,
    async ({
      app_token,
      table_id,
      record_ids
    }) => {
      try {
        const response = await client.batchDeleteBitableRecords(
          app_token,
          table_id,
          { records: record_ids }
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              app_token,
              table_id,
              deleted_count: record_ids.length,
              record_ids,
              records: response.data.records
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
                message: error.message || 'Failed to batch delete bitable records',
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