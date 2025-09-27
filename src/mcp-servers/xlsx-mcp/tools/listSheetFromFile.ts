import { z } from 'zod';
import { XlsxManager } from '../XlsxManager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listSheetFromFileSchema = z.object({
  filePath: z
    .string()
    .describe('Path to the Excel file to read sheet names from'),
});

export function registerListSheetFromFileTool(server: McpServer) {
  server.tool(
    'list-sheet-from-file',
    'Get all sheet names from a specified .xlsx file',
    listSheetFromFileSchema.shape,
    async ({ filePath }) => {
      try {
        // Create XlsxManager instance
        const xlsxManager = new XlsxManager(filePath);

        // Get all sheet names
        const sheetNames = xlsxManager.getAvailableSheets();

        return {
          content: [
            {
              type: 'text',
              mimeType: 'application/json',
              text: JSON.stringify({
                success: true,
                filePath,
                totalSheets: sheetNames.length,
                sheetNames
              }, null, 2),
            }
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: {
                  code: error.code || 'UNKNOWN_ERROR',
                  message: error.message || `Failed to list sheets from file ${filePath}`
                }
              }, null, 2)
            },
          ],
          isError: true
        };
      }
    },
  );
}