import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { 
  TextElement, 
  TextElementStyle
} from '../../types/feishu.js';

// Style options schema
const textElementStyleSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  strikethrough: z.boolean().optional(),
  underline: z.boolean().optional(),
  inline_code: z.boolean().optional(),
  background_color: z.number().min(1).max(15).optional(),
  text_color: z.number().min(1).max(7).optional(),
  link_url: z.string().url().optional()
}).optional();

const blockStyleSchema = z.object({
  align: z.number().min(1).max(3).optional(), // 1: left, 2: center, 3: right
  folded: z.boolean().optional(),
  background_color: z.number().min(1).max(15).optional(),
  indent_level: z.number().min(0).max(7).optional()
}).optional();

// Schema for updating document block
const updateDocumentBlockSchema = z.object({
  document_id: z.string().describe('The document ID containing the block to update'),
  block_id: z.string().describe('The block ID to update'),
  content: z.string().optional().describe('The new content for the block'),
  text_style: textElementStyleSchema.describe('Text styling options'),
  block_style: blockStyleSchema.describe('Block styling options'),
  document_revision_id: z.number().default(-1).describe('Document revision ID (-1 for latest)'),
  auto_detect_content_type: z.boolean().default(true).describe('Automatically detect and clean content')
});

/**
 * Create text element with styling
 */
function createTextElement(content: string, style?: any): TextElement {
  const textStyle: TextElementStyle = {};
  
  if (style) {
    if (style.bold) textStyle.bold = true;
    if (style.italic) textStyle.italic = true;
    if (style.strikethrough) textStyle.strikethrough = true;
    if (style.underline) textStyle.underline = true;
    if (style.inline_code) textStyle.inline_code = true;
    if (style.background_color) textStyle.background_color = style.background_color;
    if (style.text_color) textStyle.text_color = style.text_color;
    if (style.link_url) textStyle.link = { url: style.link_url };
  }
  
  const element: TextElement = {
    text_run: {
      content,
      text_element_style: Object.keys(textStyle).length > 0 ? textStyle : undefined
    }
  };
  
  return element;
}

export function registerUpdateDocumentBlockTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'update-document-block',
    'Update a specific block in a Feishu wiki document with new content and styling',
    updateDocumentBlockSchema.shape,
    async ({
      document_id,
      block_id,
      content,
      text_style,
      block_style,
      document_revision_id = -1,
      auto_detect_content_type = true
    }) => {
      return runWithExceptionHandler(
        async () => {
          const updateRequest: any = {};
          
          if (content) {
            let elements: any[];
            
            // Use convertContentToBlocks for markdown/html content or auto-detection
            if (auto_detect_content_type) {
              // Detect if content looks like markdown or html
              const isMarkdown = /^#{1,6}\s|^[-*+]\s|^\d+\.\s|^```|^>\s|^-\s*\[[ x]\]\s/.test(content.trim());
              const isHtml = /<[^>]+>/.test(content.trim());
              
              if (isMarkdown || isHtml) {
                const convertRequest = {
                  content_type: isHtml ? 'html' as const : 'markdown' as const,
                  content
                };
                
                const convertResult = await client.convertContentToBlocks(convertRequest);
                // Extract text elements from converted blocks
                if (convertResult.blocks && convertResult.blocks.length > 0) {
                  const firstBlock = convertResult.blocks[0];
                  elements = firstBlock.text?.elements || [createTextElement(content, text_style)];
                } else {
                  elements = [createTextElement(content, text_style)];
                }
              } else {
                // Fallback to manual creation for simple text
                elements = [createTextElement(content, text_style)];
              }
            } else {
              // Use manual creation without auto-detection
              elements = [createTextElement(content, text_style)];
            }
            
            updateRequest.update_text_elements = { elements };
          }
          
          if (block_style) {
            updateRequest.update_text_style = {
              fields: [1], // Update alignment by default
              style: block_style
            };
          }
          
          const result = await client.updateDocumentBlock(document_id, block_id, updateRequest, document_revision_id);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                operation: 'update',
                document_id,
                block_id,
                document_revision_id: result.document_revision_id
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}