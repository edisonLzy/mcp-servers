import { z } from 'zod';
import type { FeishuClient } from '../../client/feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const createDocumentSchema = z.object({
  title: z.string().describe('Document title'),
  content: z.string().optional().describe('Initial document content'),
  folder_token: z.string().optional().describe('Folder to create document in')
});

export function registerCreateDocumentTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'create-document',
    'Create a new Feishu document',
    createDocumentSchema.shape,
    async ({ title, content, folder_token }) => {
      try {
        const response = await client.createDocument({
          title,
          content,
          folder_token
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              document_token: response.document_token,
              title: response.title,
              url: response.url,
              revision: response.revision
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
                message: error.message || 'Failed to create document'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}