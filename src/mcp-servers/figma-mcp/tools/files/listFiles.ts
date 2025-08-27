import { z } from 'zod';
import type { FigmaClient } from '../../figmaClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const listFilesSchema = z.object({
  team_id: z
    .string()
    .optional()
    .describe('Filter files by team ID (optional)'),
  project_id: z
    .string()
    .optional()
    .describe('Filter files by project ID (optional)'),
});

export function registerListFilesTool(server: McpServer, client: FigmaClient) {
  server.tool(
    'list-files',
    'List Figma files accessible to the authenticated user, with optional filtering',
    listFilesSchema.shape,
    async ({ team_id, project_id }) => {
      try {
        let files;
        
        if (project_id) {
          files = await client.getProjectFiles(project_id);
        } else if (team_id) {
          files = await client.getTeamFiles(team_id);
        } else {
          files = await client.getFiles();
        }

        const fileList = files.files.map(file => ({
          key: file.key,
          name: file.name,
          thumbnail_url: file.thumbnail_url,
          last_modified: file.last_modified,
        }));

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              files: fileList,
              total: fileList.length,
              filters: {
                team_id: team_id || null,
                project_id: project_id || null,
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
                message: error.message || 'Failed to list files',
                filters: {
                  team_id: team_id || null,
                  project_id: project_id || null,
                }
              }
            }, null, 2)
          }],
          isError: true
        };
      }
    }
  );
}