import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DocumentBlock } from '../../types/feishu.js';

const getDocumentBlocksSchema = z.object({
  document_id: z.string().describe('The document ID (obj_token when obj_type is docx)'),
  include_children: z.boolean().optional().default(true).describe('Whether to include child blocks')
});

// Helper function to get all blocks recursively
async function getAllBlocks(client: FeishuClient, documentId: string): Promise<DocumentBlock[]> {
  const allBlocks: DocumentBlock[] = [];
  let pageToken: string | undefined;
  
  do {
    const response = await client.getDocumentBlocks(documentId, pageToken);
    allBlocks.push(...response.items);
    pageToken = response.has_more ? response.page_token : undefined;
  } while (pageToken);
  
  return allBlocks;
}

export function registerGetDocumentBlocksTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-document-blocks',
    'Get the structured blocks of a Feishu knowledge base document by document ID',
    getDocumentBlocksSchema.shape,
    async ({ document_id, include_children = true }) => {
      return runWithExceptionHandler(
        async () => {
          // Get all blocks from the document
          const blocks = await getAllBlocks(client, document_id);
          
          // Return structured block data
          const processedBlocks = include_children ? blocks : blocks.filter(block => !block.parent_id);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                document_id,
                blocks: processedBlocks,
                block_count: processedBlocks.length,
                total_blocks: blocks.length
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}