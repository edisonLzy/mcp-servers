import { z } from 'zod';
import type { FigmaClient } from '../../figmaClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getFileSchema = z.object({
  file_key: z
    .string()
    .describe('The unique identifier for the Figma file (found in the URL)'),
});

export function registerGetFileTool(server: McpServer, client: FigmaClient) {
  server.tool(
    'get-file',
    'Get detailed information about a Figma file including its document structure',
    getFileSchema.shape,
    async ({ file_key }) => {
      try {
        const file = await client.getFile(file_key);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              file: {
                key: file_key,
                name: file.document.name,
                document: file.document,
                schemaVersion: file.schemaVersion,
                componentsCount: Object.keys(file.components).length,
                stylesCount: Object.keys(file.styles).length,
              }
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
                message: error.message || 'Failed to get file',
                file_key
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}