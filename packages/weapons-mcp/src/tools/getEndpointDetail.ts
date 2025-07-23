import { z } from 'zod';
import type { WeaponsClient } from '../weaponsClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const getEndpointDetailSchema = z.object({
  id: z
    .string()
    .describe(
      `The endpoint ID of the weapons uri which extracted from the given url
      
       Example:
       input: https://weapons.xx.com/project/17869/interface/api/1889830
       output: 1889830
      `
    ),
});

export function registerGetEndpointDetailTool(server: McpServer, client: WeaponsClient) {
  server.tool(
    'get-endpoint-detail',
    'Get Weapons Endpoint detailed information for the given url',
    getEndpointDetailSchema.shape,
    async ({ id }) => {
      try {
        const endpoint = await client.getEndpointDetail(id);

        return {
          content: [
            {
              type: 'text',
              mimeType: 'application/json',
              text: JSON.stringify({
                success: true,
                data: endpoint
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
                  message: error.message || `Failed to fetch endpoint detail for ID ${id}`
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