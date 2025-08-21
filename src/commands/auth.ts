import { getMCPServer } from '../mcp-servers/index.js';

export async function authAction(serverName: string) {
  const server = await getMCPServer(serverName);
  
  if (!server) {
    console.error(`MCP server "${serverName}" not found.`);
    console.error('Run "mcp-servers list" to see available servers.');
    process.exit(1);
  }
  
  if (!server.requiresAuth) {
    console.log(`MCP server "${serverName}" does not require authentication.`);
    return;
  }
  
  if (!server.auth) {
    console.error(`MCP server "${serverName}" requires authentication but no auth method is configured.`);
    process.exit(1);
  }
  
  console.log(`Configuring authentication for MCP server: ${server.name}`);
  
  try {
    await server.auth();
    console.log(`Authentication configured successfully for "${serverName}".`);
  } catch (error) {
    console.error(`Failed to configure authentication for "${serverName}":`, error);
    process.exit(1);
  }
}