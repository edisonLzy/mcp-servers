import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getDocumentRawContentSchema = z.object({
  document_id: z.string().describe('The document ID (obj_token when obj_type is docx)'),
  lang: z.number().optional().default(0).describe('Language code for content (0 for default language, 1 for Chinese, 2 for English, etc.)')
});

export function registerGetDocumentRawContentTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-document-raw-content',
    'Get the plain text content of a Feishu knowledge base document by document ID',
    getDocumentRawContentSchema.shape,
    async ({ document_id, lang }) => {
      return runWithExceptionHandler(
        async () => {
          // Use the raw content API to get plain text content
          const rawContent = await client.getDocumentRawContent(document_id, lang);
          
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                document_id,
                lang: lang || 'default',
                content: rawContent.content,
                content_length: rawContent.content.length
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}