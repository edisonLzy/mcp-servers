import { Command } from 'commander';

const command = new Command('inspector')
  .description('Start MCP Inspector')
  .action(() => {
    console.log('inspector');
  });

export default command;
