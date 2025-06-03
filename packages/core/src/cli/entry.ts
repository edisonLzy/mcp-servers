#!/usr/bin/env -S pnpm tsx

import installCommand from './commands/install';
import { Cli } from '.';

const cli = new Cli({
  name: 'mcp-servers',
  version: '0.0.1',
  commands: [installCommand],
});

cli.run();