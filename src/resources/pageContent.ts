import {  ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { URL } from 'node:url'
import { ConfluenceApi } from "../confluenceApi.js";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { UriTemplate } from "@modelcontextprotocol/sdk/shared/uriTemplate.js";

function parsePageId(url: string) {
    try {
        const parsedUrl = new URL(url);
        const pageId = parsedUrl.searchParams.get('pageId');
        return pageId ?? null;
    } catch (error) {
        console.error('Error parsing page ID:', error);
        return null;
    }
}

export function setupPageContentResource(server: McpServer) {

    // confluence page content
    const uriTemplate = new UriTemplate('https://wiki.lianjia.com/pages/viewpage.action?pageId={pageId}')
    server.resource(
        'confluence page content',
        new ResourceTemplate(uriTemplate, { list: undefined }),
        { mimeType: 'text/html', description: `Get the content of a confluence page` },
        async (uri, { pageId }) => {

            const confluenceApi = new ConfluenceApi();
            const pageIdString = pageId as string;
            
            try {
                const pageContent = await confluenceApi.getPageContent(pageIdString);
                const contentText = pageContent?.body?.storage?.value ?? `Failed to fetch or parse content for ${pageIdString}`;
                const result: ReadResourceResult = {
                    contents: [{ uri: uri.href, text: contentText }],
                }
                return result
            } catch (error) {
                console.error('Error fetching page content:', error);
                return {
                    contents: [{ uri: uri.href, text: `Failed to fetch or parse content for ${pageIdString}` }],
                }
            }
        }
    )
}