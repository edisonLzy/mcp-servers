import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listWikiSpacesSchema = z.object({});

export function registerListWikiSpacesTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'list-wiki-spaces',
    'Get list of all Wiki spaces accessible to the authenticated user',
    listWikiSpacesSchema.shape,
    async () => {
      return runWithExceptionHandler(
        async () => {
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
                items: spaces,
                total: spaces.length
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}