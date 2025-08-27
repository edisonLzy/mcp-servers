import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { MCPServerOptions } from '../types.js';

// Get current file directory path (ESM environment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get all MCP server configuration objects from mcp-servers directory
 * @returns Promise<Record<string, MCPServerOptions>> Configuration object mapping with server name as key
 */
export async function listMCPServers(): Promise<Record<MCPServerOptions['name'], MCPServerOptions>> {
  const mcpServersDir = __dirname;
  const servers: Record<MCPServerOptions['name'], MCPServerOptions> = {};
  
  try {
    const entries = await fs.readdir(mcpServersDir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip non-directories and index.ts file
      if (!entry.isDirectory()) {
        continue;
      }
      
      const serverDir = path.join(mcpServersDir, entry.name);
      const indexPath = path.join(serverDir, 'index.ts');
      
      try {
        // Check if index.ts file exists
        await fs.access(indexPath);
        
        // Dynamically import MCP server module
        const serverModule = await import(indexPath);
        
        // Get default export configuration object
        const serverConfig = serverModule.default;
        
        if (!serverConfig || typeof serverConfig !== 'object') {
          console.error(`Invalid MCP server configuration in ${entry.name}/index.ts`);
          continue;
        }
        
        // Validate configuration object matches MCPServerOptions interface
        if (!serverConfig.name || typeof serverConfig.run !== 'function') {
          console.error(`MCP server ${entry.name} missing required properties (name, run)`);
          continue;
        }
        
        servers[entry.name] = serverConfig as MCPServerOptions;
      } catch (error) {
        console.error(`Error loading MCP server ${entry.name}:`, error);
        continue;
      }
    }
    
    return servers;
  } catch (error) {
    console.error('Error listing MCP servers:', error);
    return {};
  }
}

/**
 * Get specified MCP server configuration object by name
 * @param serverName MCP server name
 * @returns Promise<MCPServerOptions | null> MCP server configuration object, null if not exists
 */
export async function getMCPServer(serverName: MCPServerOptions['name']): Promise<MCPServerOptions | null> {
  const servers = await listMCPServers();
  return servers[serverName] || null;
}

/**
 * Get entry file path for specified MCP server
 * @param serverName MCP server name
 * @returns string Entry file path
 */
export async function getMCPServerEntry(serverName: MCPServerOptions['name']): Promise<string | null> {
  const mcpServersDir = __dirname;
  const serverDir = path.join(mcpServersDir, serverName);
  const indexPath = path.join(serverDir, 'index.ts');

  try {
    // Check if directory exists
    const dirStats = await fs.stat(serverDir);
    if (!dirStats.isDirectory()) {
      return null;
    }

    // Check if entry file exists
    await fs.access(indexPath);
    return indexPath;
  } catch {
    return null;
  }
}