#!/usr/bin/env node

import { Command } from 'commander';
import { createInstallCommand } from '@mcp-servers/core';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const program = new Command();

program
  .name('confluence-mcp')
  .description('Confluence MCP Server CLI')
  .version('0.0.1');

// Add install command with confluence-specific configuration
const installCommand = createInstallCommand({
  name: 'confluence-mcp',
  entryPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)),'index.ts'),
  beforeInstall: async (options) => {
    console.log('🔧 Installing Confluence MCP Server...');
    console.log(`Client: ${options.client}, Global: ${options.global}`);
    
    // Check for required environment variables
    const requiredEnvVars = ['CONFLUENCE_URL', 'CONFLUENCE_USERNAME', 'CONFLUENCE_API_TOKEN'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
      console.error('Please set these environment variables before installing.');
      return false;
    }
    
    return true;
  }
});

program.addCommand(installCommand);

program.parse();