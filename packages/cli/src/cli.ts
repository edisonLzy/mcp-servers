import { program } from 'commander';
import pc from 'picocolors';
import type { Command, HelpConfiguration } from 'commander';

interface CliOptions {
  name: string;
  version: string;
  commands: Command[];
}

export class Cli {

  private program: Command;

  constructor(private options: CliOptions){

    const { name, version, commands } = options;

    this.program = program;

    this.program.name(name).version(version, '-v, --version').configureHelp(this.helpConfig);

    for (const command of commands) {
      command.configureHelp(this.helpConfig);
      this.program.addCommand(command);
    }
  }

  get helpConfig(): HelpConfiguration{
    return {
      styleTitle: (str) => pc.underline(str),
      styleCommandText: (str) => pc.red(str),
      styleDescriptionText: (str) => pc.gray(str),
      styleOptionText: (str) => pc.white(str),
      styleArgumentText: (str) => pc.white(str),
      styleSubcommandText: (str) => pc.red(str)
    };
  }

  run(): void{
    // TODO: Add error handling
    this.program.parse();
  }
}
