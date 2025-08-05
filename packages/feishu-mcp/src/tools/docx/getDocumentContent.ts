import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DocumentBlock } from '../../types/feishu.js';

const getWikiDocumentContentSchema = z.object({
  document_id: z.string().describe('The document ID (obj_token when obj_type is docx)'),
  include_children: z.boolean().optional().default(true).describe('Whether to include child blocks'),
  format: z.enum(['structured', 'text']).optional().default('structured').describe('Output format: structured (full block data) or text (plain text content)')
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

export function registerGetWikiDocumentContentTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-wiki-document-content',
    'Get the content of a Feishu knowledge base document by document ID',
    getWikiDocumentContentSchema.shape,
    async ({ document_id, include_children = true, format = 'structured' }) => {
      try {
        // Get all blocks from the document
        const blocks = await getAllBlocks(client, document_id);
        
        if (format === 'text') {
          // Use the raw content API to get plain text content
          const rawContent = await client.getDocumentRawContent(document_id);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                document_id,
                format: 'text',
                content: rawContent.content
              }, null, 2)
            }]
          };
        } else {
          // Return structured block data
          const processedBlocks = include_children ? blocks : blocks.filter(block => !block.parent_id);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                document_id,
                format: 'structured',
                blocks: processedBlocks,
                block_count: processedBlocks.length,
                total_blocks: blocks.length
              }, null, 2)
            }]
          };
        }
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to get wiki document content'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}