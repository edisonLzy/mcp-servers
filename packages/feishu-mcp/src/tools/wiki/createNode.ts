import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const createWikiNodeSchema = z.object({
  space_id: z.string().describe('The Wiki space ID'),
  obj_type: z.enum(['docx', 'sheet', 'mindnote', 'bitable', 'file', 'slides']).describe('Document type - docx: new document, sheet: spreadsheet, mindnote: mind map, bitable: multi-dimensional table, file: file, slides: presentation'),
  node_type: z.enum(['origin', 'shortcut']).default('origin').describe('Node type - origin: entity node, shortcut: shortcut to existing node'),
  title: z.string().optional().describe('Node title'),
  parent_node_token: z.string().optional().describe('Parent node token - if empty, creates a top-level node'),
  origin_node_token: z.string().optional().describe('Original node token when creating a shortcut (required when node_type is shortcut)')
});

export function registerCreateWikiNodeTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'create-wiki-node',
    'Create a new node in a Wiki space',
    createWikiNodeSchema.shape,
    async ({ space_id, obj_type, node_type = 'origin', title, parent_node_token, origin_node_token }) => {
      try {
        // Validate shortcut parameters
        if (node_type === 'shortcut' && !origin_node_token) {
          throw new Error('origin_node_token is required when node_type is shortcut');
        }
        
        const response = await client.createWikiNode(space_id, {
          obj_type,
          node_type,
          title,
          parent_node_token,
          origin_node_token
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              space_id,
              node: {
                node_token: response.node_token,
                obj_token: response.obj_token,
                obj_type: response.obj_type,
                node_type: response.node_type,
                title: response.title,
                parent_node_token: response.parent_node_token,
                origin_node_token: response.origin_node_token,
                origin_space_id: response.origin_space_id,
                has_child: response.has_child,
                obj_create_time: response.obj_create_time,
                obj_edit_time: response.obj_edit_time,
                node_create_time: response.node_create_time,
                creator: response.creator,
                owner: response.owner,
                node_creator: response.node_creator
              }
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