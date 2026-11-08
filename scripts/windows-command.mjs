import { existsSync } from 'node:fs';
import { win32 } from 'node:path';

// Run the JavaScript entry point with Node: .cmd shims require cmd.exe, which
// interprets metacharacters in caller arguments even when spawn receives an array.
export function windowsPnpmArgs(args, env = process.env, exists = existsSync) {
  const candidates = [
    env.npm_execpath,
    ...(env.PATH ?? env.Path ?? '')
      .split(';')
      .flatMap((directory) => [
        win32.join(directory, 'node_modules/pnpm/bin/pnpm.cjs'),
        win32.join(directory, 'node_modules/corepack/dist/pnpm.js'),
        win32.join(directory, 'pnpm.cjs'),
      ]),
  ];
  const entry = candidates.find(
    (candidate) =>
      candidate && /(?:^|[\\/])pnpm\.(?:cjs|js)$/i.test(candidate) && exists(candidate),
  );
  if (!entry) {
    throw new Error(
      'Cannot locate the pnpm JavaScript entry point. Run this command through pnpm.',
    );
  }
  return [entry, ...args];
}
