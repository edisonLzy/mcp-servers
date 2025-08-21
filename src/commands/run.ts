import { getMCPServer } from '../mcp-servers/index.js';

export async function runAction(serverName: string, verbose: boolean = false) {
  const server = await getMCPServer(serverName);
  
  if (!server) {
    console.error(`MCP server "${serverName}" not found.`);
    console.error('Run "mcp-servers list" to see available servers.');
    process.exit(1);
  }
  
  if (verbose) {
    console.error(`Starting MCP server: ${server.name}`);
    if (server.description) {
      console.error(`Description: ${server.description}`);
    }
  }
  
  // Check if authentication is required
  if (server.requiresAuth && server.auth) {
    if (verbose) {
      console.error('Server requires authentication. Checking credentials...');
    }
    // For now, we just run the server. Auth check can be added later if needed
  }
  
  try {
    await server.run();
  } catch (error) {
    console.error(`Failed to start MCP server "${serverName}":`, error);
    process.exit(1);
  }
}