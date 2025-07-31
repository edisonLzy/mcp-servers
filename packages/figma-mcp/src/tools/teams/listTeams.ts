import { z } from 'zod';
import type { FigmaClient } from '../../figmaClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listTeamsSchema = z.object({});

export function registerListTeamsTool(server: McpServer, client: FigmaClient) {
  server.tool(
    'list-teams',
    'Get list of all teams accessible to the authenticated user',
    listTeamsSchema.shape,
    async () => {
      try {
        const response = await client.getTeams();
        
        const teams = response.teams.map(team => ({
          id: team.id,
          name: team.name,
          organization_id: team.organization_id,
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              teams,
              total: teams.length
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
                message: error.message || 'Failed to list teams'
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}