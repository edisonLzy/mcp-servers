#!/usr/bin/env -S pnpm tsx

import { Command } from 'commander';
import dotenv from 'dotenv';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';
import { installCommand } from './commands/install.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('feishu-mcp')
  .description('Feishu/Lark MCP Server - Command Line Interface')
  .version('0.1.0');

// Login command
program
  .command('login')
  .description('Login to Feishu using OAuth2 flow and store authentication credentials')
  .action(loginCommand);

// Logout command  
program
  .command("logout")
  .description('Clear all stored authentication credentials')
  .action(logoutCommand);

// Whoami command
program
  .command('whoami')
  .description('Show information about the currently logged in user')
  .action(whoamiCommand);

// Install command
program
  .command('install')
  .description('安装 Feishu MCP Server 到指定的 MCP 客户端')
  .requiredOption('-c, --client <client>', '指定 MCP 客户端 (cursor, gemini-cli)')
  .option('-g, --global', '全局安装 (默认为全局)', false)
  .addHelpText('after', `
使用示例:
  $ feishu-mcp install --client cursor
  $ feishu-mcp install --client gemini-cli

支持的客户端:
  cursor      - Cursor 编辑器
  gemini-cli  - Gemini CLI / Claude Desktop
`)
  .action(installCommand);

// Parse command line arguments
program.parse(); 