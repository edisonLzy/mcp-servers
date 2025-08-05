import { z } from 'zod';
import type { FigmaClient } from '../../figmaClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getNodeSchema = z.object({
  file_key: z
    .string()
    .describe('The unique identifier for the Figma file'),
  node_id: z
    .string()
    .describe('The ID of the node to retrieve'),
});

export function registerGetNodeTool(server: McpServer, client: FigmaClient) {
  server.tool(
    'get-node',
    'Get detailed information about a specific node in a Figma file',
    getNodeSchema.shape,
    async ({ file_key, node_id }) => {
      try {
        const response = await client.getFileNodes(file_key, [node_id]);
        
        if (!response.nodes[node_id]) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  message: 'Node not found',
                  file_key,
                  node_id
                }
              }, null, 2)
            }],
            isError: true
          };
        }

        const node = response.nodes[node_id];

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              node: {
                id: node.id,
                name: node.name,
                type: node.type,
                visible: node.visible,
                locked: node.locked,
                absoluteBoundingBox: node.absoluteBoundingBox,
                // Include type-specific properties
                ...(node.type === 'TEXT' && {
                  characters: (node as any).characters,
                  fontSize: (node as any).fontSize,
                  fontFamily: (node as any).fontFamily,
                }),
                ...(node.type === 'FRAME' && {
                  children: (node as any).children?.map((child: any) => ({
                    id: child.id,
                    name: child.name,
                    type: child.type,
                  })),
                }),
                // Add other common properties
                fills: node.fills,
                strokes: node.strokes,
                strokeWeight: node.strokeWeight,
                cornerRadius: node.cornerRadius,
                opacity: node.opacity,
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
                message: error.message || 'Failed to get node',
                file_key,
                node_id
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}