import { z } from 'zod';
import { XlsxManager } from '../XlsxManager.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getRecordsFromSheetSchema = z.object({
  filePath: z
    .string()
    .describe('Path to the Excel file to read'),
  sheetName: z
    .string()
    .describe('Name of the sheet to query'),
  conditions: z
    .array(z.string())
    .optional()
    .describe('Optional array of filter conditions (e.g., ["FE = 李志宇", "优先级 = P0"]). Supports operators: =, !=')
});

export function registerGetRecordsFromSheetTool(server: McpServer) {
  server.tool(
    'get-records-from-sheet',
    'Query records from an Excel sheet that match specified conditions. Returns all columns for matching records.',
    getRecordsFromSheetSchema.shape,
    async ({ filePath, sheetName, conditions }) => {
      try {
        // Create XlsxManager instance
        const xlsxManager = new XlsxManager(filePath);

        // Load the specified worksheet
        const sheet = xlsxManager.loadWorksheet(sheetName);

        // Build query using the existing QueryBuilder
        let query = sheet.query();

        // Apply conditions if provided
        if (conditions && conditions.length > 0) {
          for (const condition of conditions) {
            query = query.where(condition);
          }
        }

        // Execute query and get results
        const result = query.execute();

        return {
          content: [
            {
              type: 'text',
              mimeType: 'application/json',
              text: JSON.stringify({
                success: true,
                sheetName,
                totalRecords: result.records.length,
                headers: result.headers,
                records: result.records
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
                  message: error.message || `Failed to query records from sheet ${sheetName} in file ${filePath}`
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