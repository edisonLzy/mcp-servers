import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { WikiNode } from '../../types/feishu.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getSpaceNodesSchema = z.object({
  space_id: z.string().describe('The Wiki space ID'),
  recursive: z.boolean().optional().default(false).describe('Whether to get all child nodes recursively')
});

async function getAllNodesRecursively(client: FeishuClient, spaceId: string, parentNodeToken?: string): Promise<WikiNode[]> {
  const response = await client.getSpaceNodes(spaceId, parentNodeToken);
  let allNodes = [...response.items];

  // Recursively get child nodes for nodes that have children
  for (const node of response.items) {
    if (node.has_child) {
      const childNodes = await getAllNodesRecursively(client, spaceId, node.node_token);
      allNodes = allNodes.concat(childNodes);
    }
  }

  return allNodes;
}

export function registerGetSpaceNodesTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-space-nodes',
    'Get all document nodes in a specific Wiki space',
    getSpaceNodesSchema.shape,
    async ({ space_id, recursive = false }) => {
      try {
        let allNodes: WikiNode[] = [];
        
        if (recursive) {
          // Recursively get all nodes
          allNodes = await getAllNodesRecursively(client, space_id);
        } else {
          // Get only root level nodes
          const response = await client.getSpaceNodes(space_id);
          allNodes = response.items;
        }

        const nodes = allNodes.map(node => ({
          node_token: node.node_token,
          obj_token: node.obj_token,
          obj_type: node.obj_type,
          title: node.title,
          has_child: node.has_child || false,
          parent_node_token: node.parent_node_token
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              space_id,
              nodes,
              total: nodes.length,
              recursive
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
                message: error.message || 'Failed to get space nodes'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}