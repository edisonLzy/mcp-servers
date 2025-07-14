import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { z } from 'zod';
import type { FeishuClient } from '../client/feishuClient.js';

export abstract class MCPServerTool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputSchema: Record<string, z.ZodTypeAny>;

  abstract execute(client: FeishuClient, args: any): Promise<{
    content: Array<{
      type: 'text';
      text: string;
    }>;
    isError?: boolean;
  }>;

  register(server: McpServer, client: FeishuClient): void {
    server.tool(
      this.name,
      this.description,
      this.inputSchema,
      async (args: any) => {
        return await this.execute(client, args);
      }
    );
  }
}