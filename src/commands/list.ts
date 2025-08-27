import { listMCPServers } from '../mcp-servers/index.js';

export async function listAction() {
  console.log('Available MCP Servers:');
  console.log('==================');
  
  const servers = await listMCPServers();
  
  if (Object.keys(servers).length === 0) {
    console.log('No MCP servers found.');
    return;
  }
  
  for (const [serverName, config] of Object.entries(servers)) {
    console.log(`• ${serverName}`);
    if (config.description) {
      console.log(`  ${config.description}`);
    }
    if (config.requiresAuth) {
      console.log('  🔐 Requires authentication');
    }
    console.log('');
  }
  
  console.log('Usage:');
  console.log('  mcp-servers <server-name>     Run MCP server');
  console.log('  mcp-servers auth <server-name> Authenticate server');
  console.log('  mcp-servers inspector <server-name> Run with inspector');
}