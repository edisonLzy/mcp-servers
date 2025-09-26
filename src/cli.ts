#!/usr/bin/env -S pnpx tsx

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Command } from 'commander';
import { listAction } from './commands/list.js';
import { runAction } from './commands/run.js';
import { authAction } from './commands/auth.js';
import { inspectorAction } from './commands/inspector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('mcp-servers')
  .description('CLI for MCP Servers')
  .version(packageJson.version);

// List command to show available MCP servers
program
  .command('list')
  .description('List available MCP servers')
  .action(listAction);

// Auth command to authenticate MCP server
program
  .command('auth <server-name>')
  .description('Authenticate and configure specified MCP server')
  .action(authAction);

// Inspector command to run MCP server with inspector
program
  .command('inspector <server-name>')
  .description('Run MCP server with inspector for debugging')
  .action(inspectorAction);

// Generic command to run any MCP server
program
  .argument('<server-name>', 'MCP server name (e.g., feishu-mcp, figma-mcp, prompts-mcp)')
  .description('Run specified MCP server')
  .option('-v, --verbose', 'Enable verbose logging')
  .action((serverName, options) => runAction(serverName, options.verbose));

program.parse(process.argv);