#!/usr/bin/env -S pnpm tsx

import { Command } from 'commander';
import dotenv from 'dotenv';
import { installCommand } from './commands/install.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('weapons-mcp')
  .description('Weapons MCP Server - Command Line Interface')
  .version('0.1.0');

// Install command
program
  .command('install')
  .description('配置 Weapons 访问凭据并安装 MCP Server')
  .option('-c, --client <client>', '目标 MCP 客户端 (cursor, gemini-cli)', 'cursor')
  .option('-g, --global', '全局安装 (默认为项目级别)', false)
  .action(installCommand);

// Parse command line arguments
program.parse(); 