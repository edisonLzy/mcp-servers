import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listBitableFieldsSchema = z.object({
  app_token: z.string().describe('多维表格的 app_token。你需调用知识库相关获取知识空间节点信息接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。'),
  table_id: z.string().describe('数据表的 table_id，可通过"列出数据表"工具获取'),
  view_id: z.string().optional().describe('视图ID，用于过滤字段（可选）'),
  text_field_as_array: z.boolean().optional().describe('控制字段描述数据的返回格式，默认为 false。true 表示 description 将以数组形式返回'),
  page_token: z.string().optional().describe('分页标记，第一次请求不填'),
  page_size: z.number().min(1).max(100).optional().default(20).describe('分页大小，默认20，最大100')
});

export function registerListBitableFieldsTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'list-bitable-fields',
    '列出多维表格数据表中的所有字段',
    listBitableFieldsSchema.shape,
    async ({ app_token, table_id, view_id, text_field_as_array, page_token, page_size }) => {
      try {
        const response = await client.listBitableFields(
          app_token,
          table_id,
          view_id,
          text_field_as_array,
          page_token,
          page_size
        );
        
        const fields = response.items.map(field => ({
          field_id: field.field_id,
          field_name: field.field_name,
          type: field.type,
          ui_type: field.ui_type,
          is_primary: field.is_primary,
          is_hidden: field.is_hidden || false,
          property: field.property,
          description: field.description
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              app_token,
              table_id,
              fields,
              total: response.total,
              has_more: response.has_more,
              page_token: response.page_token
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
                message: error.message || 'Failed to list bitable fields',
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