#!/usr/bin/env -S pnpm tsx

import { Cli } from './cli';
import installCommand from './commands/install';

const cli = new Cli({
  name: 'mcp-servers',
  version: '0.0.1',
  commands: [installCommand],
});

cli.run();