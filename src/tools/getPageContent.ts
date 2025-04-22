import { ConfluenceClient } from "../confluence.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const pageContentSchema = z.object({
  pageId: z
    .string()
    .describe(
      "The id of the confluence page which extracted from the give url",
    ),
});

export function registerGetPageContentTool(server: McpServer) {
  server.tool(
    "confluence page content",
    "Get the content of a confluence page by given a page link",
    pageContentSchema.shape,
    async ({ pageId }) => {
      const confluenceApi = new ConfluenceClient();
      try {
        const pageContent = await confluenceApi.getPageContent(pageId);
        const contentText =
          pageContent?.body?.storage?.value ??
          `Failed to fetch or parse content for ${pageId}`;

        return {
          content: [
            {
              type: "text",
              mimeType: "text/html",
              text: contentText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch or parse content for ${pageId}, error: ${error}`,
            },
          ],
        };
      }
    },
  );
}
