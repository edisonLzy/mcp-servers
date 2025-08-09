import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { 
  CreateBlockRequest
} from '../../types/feishu.js';

// Block type constants
const BLOCK_TYPES = {
  PAGE: 1,
  TEXT: 2,
  HEADING1: 3,
  HEADING2: 4,
  HEADING3: 5,
  HEADING4: 6,
  HEADING5: 7,
  HEADING6: 8,
  HEADING7: 9,
  HEADING8: 10,
  HEADING9: 11,
  BULLET: 12,
  ORDERED: 13,
  CODE: 14,
  QUOTE: 15,
  TODO: 17,
  BITABLE: 18,
  CALLOUT: 19,
  CHAT_CARD: 20,
  DIAGRAM: 21,
  DIVIDER: 22,
  FILE: 23,
  GRID: 24,
  GRID_COLUMN: 25,
  IFRAME: 26,
  IMAGE: 27,
  ISV: 28,
  MINDNOTE: 29,
  SHEET: 30,
  TABLE: 31,
  TABLE_CELL: 32,
  VIEW: 33
} as const;

// Schema for creating document blocks
const createDocumentBlocksSchema = z.object({
  document_id: z.string().describe('The document ID to create blocks in'),
  content: z.string().describe('The content to add (supports Markdown format)'),
  parent_block_id: z.string().optional().describe('Parent block ID (if not provided, will append to document root)'),
  position: z.number().default(0).describe('Position index for inserting new blocks (0-based, default: append at end)'),
  document_revision_id: z.number().default(-1).describe('Document revision ID (-1 for latest)')
});

/**
 * Create simple text block as fallback
 */
function createSimpleTextBlock(content: string): CreateBlockRequest {
  return {
    block_type: BLOCK_TYPES.TEXT,
    text: {
      elements: [{
        text_run: {
          content: content.trim(),
          text_element_style: {}
        }
      }]
    }
  };
}

export function registerCreateDocumentBlocksTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'create-document-blocks',
    'Create new blocks in a Feishu wiki document. Automatically converts Markdown content to structured blocks using Feishu API.',
    createDocumentBlocksSchema.shape,
    async ({
      document_id,
      content,
      parent_block_id,
      position = 0,
      document_revision_id = -1
    }) => {
      try {
        let blocks: any[];
        let detectedType = 'text';
        
        // Detect if content is Markdown and use convertContentToBlocks API
        const isMarkdown = /^#{1,6}\s|^[-*+]\s|^\d+\.\s|^```|^>\s|^-\s*\[[ x]\]\s/.test(content.trim());
        
        if (isMarkdown) {
          detectedType = 'markdown';
          const convertRequest = {
            content_type: 'markdown' as const,
            content
          };
          
          const convertResult = await client.convertContentToBlocks(convertRequest);
          blocks = convertResult.blocks || [];
        } else {
          // Fallback for simple text content
          blocks = [createSimpleTextBlock(content)];
        }
        
        // Determine parent block ID
        let parentId = parent_block_id;
        if (!parentId) {
          // Get document blocks to find root
          const documentBlocks = await client.getDocumentBlocks(document_id);
          if (documentBlocks.items.length > 0) {
            parentId = documentBlocks.items[0].block_id; // Use first block as parent (usually page block)
          } else {
            throw new Error('Document has no blocks to use as parent');
          }
        }
        
        const createRequest = {
          index: position,
          children: blocks
        };
        
        const result = await client.createDocumentBlocks(document_id, parentId, createRequest, document_revision_id);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              operation: 'create',
              document_id,
              detected_content_type: detectedType,
              created_blocks: result.children.map((block: any) => ({
                block_id: block.block_id,
                block_type: block.block_type,
                parent_id: block.parent_id
              })),
              document_revision_id: result.document_revision_id
            }, null, 2)
          }]
        };
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: errorMessage,
              operation: 'create',
              document_id
            }, null, 2)
          }]
        };
      }
    }
  );
}