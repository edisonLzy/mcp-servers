import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

// Schema validation is handled inline in the tool registration

export function registerDeleteDocumentBlocksTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'delete-document-blocks',
    'Delete a range of child blocks from a parent block in a Feishu wiki document',
    {
      document_id: z.string().describe('The document ID containing the blocks to delete'),
      parent_block_id: z.string().describe('The parent block ID containing the child blocks to delete'),
      start_index: z.number().min(0).describe('Start index for deleting child blocks (0-based, inclusive)'),
      end_index: z.number().min(0).describe('End index for deleting child blocks (0-based, exclusive)'),
      document_revision_id: z.number().default(-1).describe('Document revision ID (-1 for latest)')
    },
    async ({
      document_id,
      parent_block_id,
      start_index,
      end_index,
      document_revision_id = -1
    }: {
      document_id: string;
      parent_block_id: string;
      start_index: number;
      end_index: number;
      document_revision_id?: number;
    }) => {
      return runWithExceptionHandler(
        async () => {
          const deleteRequest = {
            start_index,
            end_index
          };
          
          const result = await client.deleteDocumentBlocks(document_id, parent_block_id, deleteRequest, document_revision_id);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                operation: 'delete',
                document_id,
                parent_block_id,
                deleted_range: `${start_index}-${end_index}`,
                deleted_count: end_index - start_index,
                document_revision_id: result.document_revision_id
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}