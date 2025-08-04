#!/usr/bin/env -S pnpm tsx

import { Command } from 'commander';
import { createInstallCommand } from '@mcp-servers/core';
import path from 'path';
import { fileURLToPath } from 'url';

const program = new Command();

program
  .name('prompts-mcp')
  .description('CLI for Prompts MCP Server')
  .version('0.1.0');

const entryPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'index.ts');
const installCommand = createInstallCommand({
  name: 'prompts-mcp',
  entryPath: entryPath,
  beforeInstall: async (options) => {
    console.log('🔧 Installing Prompts MCP Server...');
    console.log(`Client: ${options.client}, Global: ${options.global}`);
    
    // 可以在这里添加安装前的验证逻辑
    console.log('✅ 安装前检查完成');
    return true;
  },
});
program.addCommand(installCommand);

program.parse(); 