import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const updateBitableRecordSchema = z.object({
  app_token: z.string().describe('多维表格的 app_token。你需调用知识库相关获取知识空间节点信息接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。'),
  table_id: z.string().describe('数据表的 table_id，可通过"列出数据表"工具获取'),
  record_id: z.string().describe('要更新的记录 ID'),
  fields: z.record(z.any()).describe('要更新的字段数据，键为字段名，值为字段值。设置为 null 可清空字段'),
  user_id_type: z.enum(['open_id', 'union_id', 'user_id']).optional().describe('用户 ID 类型，默认为 open_id')
});

export function registerUpdateBitableRecordTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'update-bitable-record',
    '更新多维表格中的记录（增量更新）',
    updateBitableRecordSchema.shape,
    async ({
      app_token,
      table_id,
      record_id,
      fields,
      user_id_type
    }) => {
      return runWithExceptionHandler(
        async () => {
          const response = await client.updateBitableRecord(
            app_token,
            table_id,
            record_id,
            { fields },
            user_id_type
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                app_token,
                table_id,
                record_id,
                record: response.record
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}