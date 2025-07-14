import { z } from 'zod';
import type { FeishuClient } from '../../client/feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getDocumentContentSchema = z.object({
  document_token: z.string().describe('The document token'),
  format: z.enum(['rich', 'plain']).optional().default('rich').describe('Content format')
});

export function registerGetDocumentContentTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-document-content',
    'Get the content of a Feishu document',
    getDocumentContentSchema.shape,
    async ({ document_token, format = 'rich' }) => {
      try {
        const response = await client.getDocumentContent(document_token, format);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              document_token: response.document_token,
              title: response.title,
              content: response.content,
              revision: response.revision,
              format
            }, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'Failed to get document content'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}