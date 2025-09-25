import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getBitableRecordsSchema = z.object({
  app_token: z.string().describe('多维表格的 app_token。你需调用知识库相关获取知识空间节点信息接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。'),
  table_id: z.string().describe('数据表的 table_id，可通过"列出数据表"工具获取'),
  view_id: z.string().optional().describe('Optional view ID to filter records'),
  field_names: z.array(z.string()).optional().describe('Specific field names to return'),
  page_size: z.number().min(1).max(500).optional().default(20).describe('Number of records to return per page (max 500)'),
  page_token: z.string().optional().describe('Page token for pagination, leave empty for first page'),
  include_automatic_fields: z.boolean().optional().default(false).describe('Whether to include automatic fields like created_time, modified_time, etc.'),
  sort_field: z.string().optional().describe('Field name to sort by'),
  sort_desc: z.boolean().optional().default(false).describe('Whether to sort in descending order'),
  filter_field: z.string().optional().describe('Field name to filter by'),
  filter_operator: z.enum(['is', 'isNot', 'contains', 'doesNotContain', 'isEmpty', 'isNotEmpty', 'isGreater', 'isGreaterEqual', 'isLess', 'isLessEqual']).optional().describe('Filter operator'),
  filter_value: z.string().optional().describe('Filter value')
});

export function registerGetBitableRecordsTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-bitable-records',
    'Get all records from a Feishu bitable (multi-dimensional table) with optional filtering and sorting',
    getBitableRecordsSchema.shape,
    async ({
      app_token,
      table_id,
      view_id,
      field_names,
      page_size = 20,
      page_token,
      include_automatic_fields = false,
      sort_field,
      sort_desc = false,
      filter_field,
      filter_operator,
      filter_value
    }) => {
      
      return runWithExceptionHandler(async () => {
        // Build request data
        const requestData: any = {
          automatic_fields: include_automatic_fields
        };
        
        if (view_id) {
          requestData.view_id = view_id;
        }
        
        if (field_names && field_names.length > 0) {
          requestData.field_names = field_names;
        }
        
        // Add sorting if specified
        if (sort_field) {
          requestData.sort = [{
            field_name: sort_field,
            desc: sort_desc
          }];
        }
        
        // Add filtering if specified
        if (filter_field && filter_operator && filter_value !== undefined) {
          requestData.filter = {
            conjunction: 'and',
            conditions: [{
              field_name: filter_field,
              operator: filter_operator,
              value: [filter_value]
            }]
          };
        }
        
        // Get records with single page
        const response = await client.searchBitableRecords(app_token, table_id, requestData, page_token, page_size);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              app_token,
              table_id,
              records: response.items,
              has_more: response.has_more,
              page_token: response.page_token,
              total: response.total,
              request_params: {
                view_id,
                field_names,
                page_size,
                page_token,
                include_automatic_fields,
                sort_field,
                sort_desc,
                filter_field,
                filter_operator,
                filter_value
              }
            }, null, 2)
          }]
        };
      });
    }
  );
}