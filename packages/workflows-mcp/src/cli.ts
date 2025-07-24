#!/usr/bin/env -S pnpm tsx

import { Command } from 'commander';
import { installCommand } from './commands/install.js';

const program = new Command();

program
  .name('workflows-mcp')
  .description('Workflows MCP Server - Command Line Interface')
  .version('0.1.0');

// Install command
program
  .command('install')
  .description('安装 Workflows MCP Server')
  .option('-c, --client <client>', '目标 MCP 客户端 (cursor, gemini-cli)', 'cursor')
  .option('-g, --global', '全局安装 (默认为项目级别)', false)
  .action(installCommand);

// Parse command line arguments
program.parse();