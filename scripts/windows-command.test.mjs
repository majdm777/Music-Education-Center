import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { windowsPnpmArgs } from './windows-command.mjs';

test('Windows pnpm launch preserves every argument without a shell', () => {
  const entry = 'C:\\tools\\pnpm.cjs';
  const args = ['exec', 'tool', 'a&b', 'two words', '"quoted"', '%PATH%', '|', '', '^'];
  assert.deepEqual(
    windowsPnpmArgs(args, { npm_execpath: entry }, () => true),
    [entry, ...args],
  );
});

test('finds npm-installed pnpm when invoked directly with node', () => {
  const entry = 'C:\\tools\\node_modules\\pnpm\\bin\\pnpm.cjs';
  assert.deepEqual(
    windowsPnpmArgs(['build'], { Path: 'C:\\tools' }, (file) => file === entry),
    [entry, 'build'],
  );
});

test('fails rather than using a shell when no pnpm entry point exists', () => {
  assert.throws(() => windowsPnpmArgs([], {}, () => false), /Cannot locate/);
});
