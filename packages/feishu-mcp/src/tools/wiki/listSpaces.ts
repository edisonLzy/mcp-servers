import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listWikiSpacesSchema = z.object({});

export function registerListWikiSpacesTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'list-wiki-spaces',
    'Get list of all Wiki spaces accessible to the authenticated user',
    listWikiSpacesSchema.shape,
    async () => {
      try {
        const response = await client.listWikiSpaces();
        
        const spaces = response.items.map(space => ({
          space_id: space.space_id,
          name: space.name,
          description: space.description || ''
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              spaces,
              total: spaces.length
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
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to list wiki spaces'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}