import { z } from 'zod';
import type { FigmaClient } from '../../figmaClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getNodesSchema = z.object({
  file_key: z
    .string()
    .describe('The unique identifier for the Figma file'),
  node_ids: z
    .array(z.string())
    .describe('Array of node IDs to retrieve'),
});

export function registerGetNodesTool(server: McpServer, client: FigmaClient) {
  server.tool(
    'get-nodes',
    'Get detailed information about multiple nodes in a Figma file',
    getNodesSchema.shape,
    async ({ file_key, node_ids }) => {
      try {
        const response = await client.getFileNodes(file_key, node_ids);
        
        const nodes = node_ids.map(nodeId => {
          const node = response.nodes[nodeId];
          return {
            id: nodeId,
            found: !!node,
            ...(node && {
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
            })
          };
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              nodes,
              summary: {
                requested: node_ids.length,
                found: nodes.filter(n => n.found).length,
                missing: nodes.filter(n => !n.found).length,
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
                message: error.message || 'Failed to get nodes',
                file_key,
                node_ids
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}