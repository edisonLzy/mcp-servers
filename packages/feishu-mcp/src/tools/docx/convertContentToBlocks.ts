import { z } from 'zod';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ConvertContentToBlocksRequest, ConvertContentToBlocksResponse } from '../../types/feishu.js';

// Schema for converting content to blocks
const convertContentToBlocksSchema = z.object({
  content_type: z.enum(['markdown', 'html']).describe('The format of the input content'),
  content: z.string().min(1).max(10485760).describe('The content to convert (1-10485760 characters)')
});

export interface ConvertContentToBlocksArgs {
  content_type: 'markdown' | 'html';
  content: string;
}

export async function convertContentToBlocks(
  client: FeishuClient,
  args: ConvertContentToBlocksArgs
): Promise<ConvertContentToBlocksResponse> {
  try {
    // Validate input
    if (!args.content || args.content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    if (!['markdown', 'html'].includes(args.content_type)) {
      throw new Error('Content type must be either "markdown" or "html"');
    }

    // Check content length (API limit is 10485760 characters)
    if (args.content.length > 10485760) {
      throw new Error('Content exceeds maximum length of 10485760 characters');
    }

    const request: ConvertContentToBlocksRequest = {
      content_type: args.content_type,
      content: args.content
    };

    const response = await client.convertContentToBlocks(request);
    
    return response;
  } catch (error) {
    throw new Error(`Failed to convert content to blocks: ${error}`);
  }
}

export function registerConvertContentToBlocksTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'convert-content-to-blocks',
    'Convert Markdown or HTML content to Feishu document blocks. This tool converts text content in Markdown or HTML format into structured document blocks that can be used with other document operations.',
    convertContentToBlocksSchema.shape,
    async ({ content_type, content }) => {
      try {
        const result = await convertContentToBlocks(client, { content_type, content });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              operation: 'convert-content-to-blocks',
              content_type,
              converted_blocks: result.blocks.length,
              first_level_block_ids: result.first_level_block_ids,
              blocks: result.blocks.map(block => ({
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
              operation: 'convert-content-to-blocks',
              content_type
            }, null, 2)
          }]
        };
      }
    }
  );
}