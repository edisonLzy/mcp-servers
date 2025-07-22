import { z } from 'zod';
import type { WeaponsClient } from '../weaponsClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getEndpointsSchema = z.object({
  catid: z
    .string()
    .describe(
      `The category ID of the weapons uri which extracted from the given url
      
       Example:
       input: https://weapons.xx.com/project/21048/interface/api/cat_316848
       output: 316848
      `
    ),
});

export function registerGetEndpointsTool(server: McpServer, client: WeaponsClient) {
  server.tool(
    'get-endpoints',
    'Get the API endpoints from a weapons category URI',
    getEndpointsSchema.shape,
    async ({ catid }) => {
      try {
        const endpoints = await client.getEndpoints(catid);

        return {
          content: endpoints.map(endpoint => ({
            type: 'text',
            mimeType: 'application/json',
            text: JSON.stringify(endpoint, null, 2),
          })),
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
                  message: error.message || `Failed to fetch endpoints for category ${catid}`
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