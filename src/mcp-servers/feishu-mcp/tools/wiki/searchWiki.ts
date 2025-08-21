import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const searchWikiSchema = z.object({
  query: z.string().describe('Search keyword for Wiki documents'),
  space_id: z.string().optional().describe('Wiki space ID to search within (optional, searches all spaces if not provided)'),
  node_id: z.string().optional().describe('Node ID to search within (optional, searches all nodes if not provided)'),
  page_size: z.number().optional().default(20).describe('Number of results per page (1-50, default: 20)'),
  page_token: z.string().optional().describe('Page token for pagination')
});

export function registerSearchWikiTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'search-wiki',
    'Search Wiki documents by keyword. Users can only search Wiki documents they have access to.',
    searchWikiSchema.shape,
    async ({ query, space_id, node_id, page_size = 20, page_token }) => {
      return runWithExceptionHandler(
        async () => {
          const searchData = {
            query,
            ...(space_id && { space_id }),
            ...(node_id && { node_id })
          };

          const response = await client.searchWiki(searchData, page_token, page_size);
          
          const results = response.items.map(item => ({
            node_id: item.node_id,
            space_id: item.space_id,
            obj_type: item.obj_type,
            obj_token: item.obj_token,
            title: item.title,
            url: item.url,
            icon: item.icon,
            sort_id: item.sort_id
          }));

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                query,
                results,
                total: results.length,
                has_more: response.has_more,
                page_token: response.page_token,
                search_scope: {
                  space_id: space_id || 'all_spaces',
                  node_id: node_id || 'all_nodes'
                }
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}