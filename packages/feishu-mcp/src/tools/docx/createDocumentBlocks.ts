import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CreateBlocksRequest, CreateBlocksResponse, CreateBlockRequest } from '../../types/feishu.js';

// Text element schema
const textElementStyleSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  strikethrough: z.boolean().optional(),
  underline: z.boolean().optional(),
  inline_code: z.boolean().optional(),
  background_color: z.number().optional(),
  text_color: z.number().optional(),
  link: z.object({
    url: z.string(),
  }).optional(),
});

const textElementSchema = z.object({
  text_run: z.object({
    content: z.string(),
    text_element_style: textElementStyleSchema.optional(),
  }).optional(),
  mention_user: z.object({
    user_id: z.string(),
    text_element_style: textElementStyleSchema.optional(),
  }).optional(),
  equation: z.object({
    content: z.string(),
    text_element_style: textElementStyleSchema.optional(),
  }).optional(),
});

// Block style schema
const blockStyleSchema = z.object({
  align: z.number().optional(),
  folded: z.boolean().optional(),
  background_color: z.number().optional(),
  indent_level: z.number().optional(),
});

// Create block request schema (recursive)
const createBlockRequestSchema: z.ZodType<any> = z.lazy(() => z.object({
  block_type: z.number(),
  text: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading1: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading2: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading3: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading4: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading5: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading6: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading7: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading8: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  heading9: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  bullet: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  ordered: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  code: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
    language: z.number().optional(),
  }).optional(),
  quote: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  todo: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  table: z.object({
    property: z.object({
      row_size: z.number(),
      column_size: z.number(),
      column_width: z.array(z.number()).optional(),
      merge_info: z.array(z.object({
        row_span: z.number(),
        col_span: z.number(),
      })).optional(),
    }),
    children: z.array(createBlockRequestSchema).optional(),
  }).optional(),
  table_cell: z.object({
    elements: z.array(textElementSchema),
    style: blockStyleSchema.optional(),
  }).optional(),
  image: z.object({
    token: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  file: z.object({
    token: z.string(),
    name: z.string().optional(),
  }).optional(),
  sheet: z.object({
    token: z.string(),
    row_size: z.number().optional(),
    column_size: z.number().optional(),
  }).optional(),
  divider: z.record(z.never()).optional(),
  equation: z.object({
    content: z.string(),
  }).optional(),
  callout: z.object({
    background_color: z.number().optional(),
    border_color: z.number().optional(),
    text_color: z.number().optional(),
    emoji_id: z.string().optional(),
    elements: z.array(textElementSchema),
  }).optional(),
  column: z.object({
    columns: z.array(z.object({
      width_ratio: z.number(),
      children: z.array(createBlockRequestSchema).optional(),
    })),
  }).optional(),
  column_set: z.object({
    flex_mode: z.number(),
    background_style: z.object({
      color: z.number().optional(),
    }).optional(),
    children: z.array(createBlockRequestSchema).optional(),
  }).optional(),
}));

// Schema for creating document blocks
const createDocumentBlocksSchema = z.object({
  document_id: z.string().min(1).describe('The document ID where blocks will be created'),
  // TODO: 默认为 document_id
  block_id: z.string().min(1).describe('The parent block ID where new blocks will be inserted'),
  index: z.number().min(0).describe('The position index where blocks will be inserted (0-based)'),
  blocks: z.array(createBlockRequestSchema).min(1).describe('Array of block objects to create (usually from convert-content-to-blocks tool)'),
  document_revision_id: z.number().optional().default(-1).describe('Document revision ID for conflict detection (-1 for latest)')
});

export interface CreateDocumentBlocksArgs {
  document_id: string;
  block_id: string;
  index: number;
  blocks: CreateBlockRequest[];
  document_revision_id?: number;
}

export async function createDocumentBlocks(
  client: FeishuClient,
  args: CreateDocumentBlocksArgs
): Promise<CreateBlocksResponse> {
  const request: CreateBlocksRequest = {
    index: args.index,
    children: args.blocks
  };

  return await client.createDocumentBlocks(
    args.document_id,
    args.block_id,
    request,
    args.document_revision_id || -1
  );
}

export function registerCreateDocumentBlocksTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'create-document-blocks',
    'Create new blocks in a Feishu document at the specified position. This tool is typically used with blocks converted from content using the convert-content-to-blocks tool to insert structured content into documents.',
    createDocumentBlocksSchema.shape,
    async ({ document_id, block_id, index, blocks, document_revision_id }) => {
      try {
        const result = await createDocumentBlocks(client, {
          document_id,
          block_id,
          index,
          blocks,
          document_revision_id
        });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              operation: 'create-document-blocks',
              document_id,
              parent_block_id: block_id,
              insertion_index: index,
              created_blocks_count: result.children.length,
              document_revision_id: result.document_revision_id,
              created_blocks: result.children.map(block => ({
                block_id: block.block_id,
                block_type: block.block_type,
                parent_id: block.parent_id
              }))
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
              operation: 'create-document-blocks',
              document_id,
              parent_block_id: block_id
            }, null, 2)
          }]
        };
      }
    }
  );
}