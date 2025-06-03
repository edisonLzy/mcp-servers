import * as p from '@clack/prompts';
import pc from 'picocolors';

type MaybePromise = () => Promise<void> | void;

export async function runAction(action: MaybePromise): Promise<void> {
  try {
    p.intro(`👏 Welcome to the ${pc.underline('Clirk')} !!!`);
    await action();
    p.outro('You\'re all set!');
  } catch (e) {
    if (e instanceof Error) {
      p.log.error(e.stack ?? String(e));
      p.log.message();
    }
    p.cancel('Operation failed.');
  }
}