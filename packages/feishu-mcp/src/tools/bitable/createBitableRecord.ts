import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const createBitableRecordSchema = z.object({
  app_token: z.string().describe('多维表格的 app_token。你需调用知识库相关获取知识空间节点信息接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。'),
  table_id: z.string().describe('数据表的 table_id，可通过"列出数据表"工具获取'),
  fields: z.record(z.any()).describe('记录字段数据，键为字段名，值为字段值'),
  user_id_type: z.enum(['open_id', 'union_id', 'user_id']).optional().describe('用户 ID 类型，默认为 open_id'),
  client_token: z.string().optional().describe('幂等键，用于防重复提交')
});

export function registerCreateBitableRecordTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'create-bitable-record',
    '在多维表格中创建新记录',
    createBitableRecordSchema.shape,
    async ({
      app_token,
      table_id,
      fields,
      user_id_type,
      client_token
    }) => {
      return runWithExceptionHandler(
        async () => {
          const response = await client.createBitableRecord(
            app_token,
            table_id,
            { fields },
            user_id_type,
            client_token
          );

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                app_token,
                table_id,
                record: response.record,
                request_params: {
                  user_id_type,
                  client_token
                }
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}