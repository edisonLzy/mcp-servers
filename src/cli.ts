#!/usr/bin/env -S pnpx tsx

import { Command } from 'commander';
import { listAction } from './commands/list.js';
import { runAction } from './commands/run.js';
import { authAction } from './commands/auth.js';
import { inspectorAction } from './commands/inspector.js';

const program = new Command();

program
  .name('mcp-servers')
  .description('CLI for MCP Servers')
  .version('0.1.0');

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