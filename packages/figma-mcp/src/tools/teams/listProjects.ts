import { z } from 'zod';
import type { FigmaClient } from '../../figmaClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listProjectsSchema = z.object({
  team_id: z
    .string()
    .describe('The ID of the team to list projects for'),
});

export function registerListProjectsTool(server: McpServer, client: FigmaClient) {
  server.tool(
    'list-projects',
    'Get list of all projects for a specific team',
    listProjectsSchema.shape,
    async ({ team_id }) => {
      try {
        const response = await client.getTeamProjects(team_id);
        
        const projects = response.projects.map(project => ({
          id: project.id,
          name: project.name,
          team_id: project.team_id,
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              projects,
              total: projects.length,
              team_id
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
                message: error.message || 'Failed to list projects',
                team_id
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}