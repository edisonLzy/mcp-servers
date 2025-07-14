import { z } from 'zod';
import type { FeishuClient } from '../../client/feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const updateDocumentSchema = z.object({
  document_token: z.string().describe('The document token'),
  content: z.string().describe('New document content'),
  revision: z.number().optional().describe('Current document revision for conflict detection')
});

export function registerUpdateDocumentTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'update-document',
    'Update the content of a Feishu document',
    updateDocumentSchema.shape,
    async ({ document_token, content, revision }) => {
      try {
        // For simplicity, we'll create a basic text replacement request
        // In a real implementation, you'd need to parse the content and create proper update requests
        const updateRequests = [{
          type: 'replace_all_text',
          text: content
        }];

        const response = await client.updateDocument(document_token, {
          requests: updateRequests,
          revision
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              document_token,
              revision: response.revision,
              updated: true
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
                message: error.message || 'Failed to update document'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}