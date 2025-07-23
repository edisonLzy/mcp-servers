import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const createWikiNodeSchema = z.object({
  space_id: z.string().describe('The Wiki space ID'),
  obj_type: z.enum(['doc', 'folder', 'sheet', 'bitable']).describe('Node type'),
  title: z.string().describe('Node title'),
  parent_node_token: z.string().optional().describe('Parent node token')
});

export function registerCreateWikiNodeTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'create-wiki-node',
    'Create a new node in a Wiki space',
    createWikiNodeSchema.shape,
    async ({ space_id, obj_type, title, parent_node_token }) => {
      try {
        const response = await client.createWikiNode(space_id, {
          obj_type,
          title,
          parent_node_token
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              space_id,
              node_token: response.node_token,
              obj_token: response.obj_token,
              obj_type,
              title,
              parent_node_token
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
                message: error.message || 'Failed to create wiki node'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}