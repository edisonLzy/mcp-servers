#!/usr/bin/env -S pnpm tsx

import { Command } from 'commander';
import { installCommand } from './commands/install';

const program = new Command();

program
  .name('weapons-mcp')
  .description('Weapons MCP Server - Command Line Interface')
  .version('0.1.0');

program.addCommand(installCommand);

program.parse(); 