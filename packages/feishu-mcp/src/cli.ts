#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';

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
  .command('logout')
  .description('Clear all stored authentication credentials')
  .action(logoutCommand);

// Whoami command
program
  .command('whoami')
  .description('Show information about the currently logged in user')
  .action(whoamiCommand);

// Parse command line arguments
program.parse(); 