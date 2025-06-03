import z from 'zod';
import { Command } from 'commander';
import { runAction } from '../utils/runAction';

const optionsSchema = z.object({
  global: z.boolean().optional().default(false),
  remote: z.boolean().optional().default(false),
});
  
const command = new Command('install')
  .description('Install MCP Servers To Your MCP Client')
  .option('-g, --global', 'Install MCP Servers Globally')
  .option('-r, --remote', 'Install MCP Servers From Remote')
  .action((options) => {
     
    const parsedOptions = optionsSchema.parse(options);

    runAction(async () => {
      console.log(parsedOptions);
    });
  });

export default command;
