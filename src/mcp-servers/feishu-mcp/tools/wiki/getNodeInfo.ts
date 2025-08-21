import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getNodeInfoSchema = z.object({
  token: z.string().describe('The node token or document token'),
  obj_type: z.enum(['doc', 'docx', 'sheet', 'mindnote', 'bitable', 'file', 'slides', 'wiki']).optional().describe('The document type (defaults to wiki if not specified)')
});

export function registerGetNodeInfoTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-node-info',
    'Get detailed information about a specific Wiki node or document',
    getNodeInfoSchema.shape,
    async ({ token, obj_type }) => {
      return runWithExceptionHandler(
        async () => {
          const nodeInfo = await client.getWikiNodeInfo(token, obj_type);
          
          const node = nodeInfo.node;
          const result = {
            space_id: node.space_id,
            node_token: node.node_token,
            obj_token: node.obj_token,
            obj_type: node.obj_type,
            title: node.title,
            node_type: node.node_type,
            has_child: node.has_child,
            parent_node_token: node.parent_node_token,
            origin_node_token: node.origin_node_token,
            origin_space_id: node.origin_space_id,
            obj_create_time: node.obj_create_time,
            obj_edit_time: node.obj_edit_time,
            node_create_time: node.node_create_time,
            creator: node.creator,
            owner: node.owner,
            node_creator: node.node_creator
          };

          return {
            content: [
              {
                type: 'text',
                text: 'Successfully retrieved node information:\n\n' +
                       `**Title:** ${result.title}\n` +
                       `**Node Token:** ${result.node_token}\n` +
                       `**Object Token:** ${result.obj_token}\n` +
                       `**Object Type:** ${result.obj_type}\n` +
                       `**Node Type:** ${result.node_type}\n` +
                       `**Space ID:** ${result.space_id}\n` +
                       `**Has Child:** ${result.has_child}\n` +
                       `**Parent Node Token:** ${result.parent_node_token || 'None (root level)'}\n` +
                       `**Creator:** ${result.creator || 'Unknown'}\n` +
                       `**Owner:** ${result.owner || 'Unknown'}\n` +
                       `**Node Creator:** ${result.node_creator || 'Unknown'}\n` +
                       `**Object Create Time:** ${result.obj_create_time || 'Unknown'}\n` +
                       `**Object Edit Time:** ${result.obj_edit_time || 'Unknown'}\n` +
                       `**Node Create Time:** ${result.node_create_time || 'Unknown'}\n\n` +
                       `**Full JSON:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
              }
            ]
          };
        }
      );
    }
  );
}