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
  const request: ConvertContentToBlocksRequest = {
    content_type: args.content_type,
    content: args.content
  };

  return await client.convertContentToBlocks(request);
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
              blocks: result.blocks
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