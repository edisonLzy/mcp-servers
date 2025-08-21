import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listBitableTablesSchema = z.object({
  app_token: z.string().describe('多维表格的 app_token。你需调用知识库相关获取知识空间节点信息接口获取多维表格的 app_token。当 obj_type 的值为 bitable 时，obj_token 字段的值才是多维表格的 app_token。'),
  page_token: z.string().optional().describe('Page token for pagination (optional)'),
  page_size: z.number().optional().describe('Number of tables to return per page (optional, max 100)')
});

export function registerListBitableTablesTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'list-bitable-tables',
    'List all tables in a Feishu bitable (multi-dimensional table)',
    listBitableTablesSchema.shape,
    async ({ app_token, page_token, page_size }) => {
      return runWithExceptionHandler(
        async () => {
          const response = await client.listBitableTables(
            app_token,
            page_token,
            page_size
          );
          
          const tables = response.items.map(table => ({
            table_id: table.table_id,
            name: table.name,
            revision: table.revision
          }));

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                items: tables,
                total: tables.length,
                app_token,
                page_token: response.page_token,
                has_more: response.has_more
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}