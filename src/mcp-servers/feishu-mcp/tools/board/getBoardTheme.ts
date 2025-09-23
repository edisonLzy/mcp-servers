import { z } from 'zod';
import { runWithExceptionHandler } from '../../utils/errorHandler.js';
import type { FeishuClient } from '../../feishuClient.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BoardThemeResponse } from '../../types/feishu.js';

// Schema for getting board theme
const getBoardThemeSchema = z.object({
  whiteboard_id: z.string().min(1).describe('The board token/ID to get the theme for. This is the token field from board blocks.')
});

export interface GetBoardThemeArgs {
  whiteboard_id: string;
}

export async function getBoardTheme(
  client: FeishuClient,
  args: GetBoardThemeArgs
): Promise<BoardThemeResponse> {
  return await client.getBoardTheme(args.whiteboard_id);
}

export function registerGetBoardThemeTool(server: McpServer, client: FeishuClient) {
  server.tool(
    'get-board-theme',
    'Get the current theme of a Feishu board/whiteboard. Different themes provide different default color schemes and styling for board elements.',
    getBoardThemeSchema.shape,
    async ({ whiteboard_id }) => {
      return runWithExceptionHandler(
        async () => {
          const result = await getBoardTheme(client, { whiteboard_id });

          const themeDescriptions = {
            'classic': 'Classic theme with traditional colors and styling',
            'simple-gray': 'Minimalist gray theme for clean, professional boards',
            'retro': 'Retro theme with vintage color schemes',
            'colorful': 'Vibrant theme with bright, energetic colors',
            'simple-blue': 'Simple blue theme for calm, focused work',
            'default': 'Default system theme'
          };

          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                operation: 'get-board-theme',
                whiteboard_id,
                theme: {
                  name: result.theme,
                  description: themeDescriptions[result.theme] || 'Unknown theme'
                },
                available_themes: [
                  'classic',
                  'simple-gray',
                  'retro',
                  'colorful',
                  'simple-blue',
                  'default'
                ],
                message: `Board is currently using the '${result.theme}' theme.`
              }, null, 2)
            }]
          };
        }
      );
    }
  );
}