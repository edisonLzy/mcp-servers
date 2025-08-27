import { spawn } from 'child_process';
import { getMCPServerEntry } from '../mcp-servers/index.js';

export async function inspectorAction(serverName: string) {
  const serverEntry = await getMCPServerEntry(serverName);
  
  if (!serverEntry) {
    console.error(`MCP server "${serverName}" not found.`);
    console.error('Run "mcp-servers list" to see available servers.');
    process.exit(1);
  }
  
  console.log(`Starting MCP Inspector for: ${serverName}`);
  
  // Use npx to run the MCP inspector
  const inspectorProcess = spawn('npx', [
    '@modelcontextprotocol/inspector',
    'tsx',
    serverEntry
  ], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  inspectorProcess.on('error', (error) => {
    console.error('Failed to start inspector:', error);
    process.exit(1);
  });
  
  inspectorProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Inspector exited with code ${code}`);
      process.exit(code || 1);
    }
  });
}