import { describe, it, expect } from 'vitest';
import { listMCPServers } from '../src/mcp-servers/index.js';

describe('MCP Servers', () => {
  it('should list available MCP servers', async () => {
    const servers = await listMCPServers();
    
    // Should have at least the main servers
    expect(Object.keys(servers).length).toBeGreaterThan(0);
    
    // Check for expected servers
    const serverNames = Object.keys(servers);
    expect(serverNames).toContain('feishu-mcp');
    expect(serverNames).toContain('figma-mcp');
    expect(serverNames).toContain('prompts-mcp');
  });
  
  it('should have valid server configurations', async () => {
    const servers = await listMCPServers();
    
    for (const [name, config] of Object.entries(servers)) {
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('run');
      expect(typeof config.run).toBe('function');
      expect(config.name).toBe(name);
    }
  });
});