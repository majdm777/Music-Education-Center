#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

// Load the repo-root .env when it exists. In CI the variables are already set,
// so a missing file is not an error.
const envFile = resolve(import.meta.dirname, '..', '.env');
if (existsSync(envFile)) {
  config({ path: envFile });
}

const [command, ...args] = process.argv.slice(2);

// Only the tooling commands used by package.json are allowed. The command is
// never passed to a shell, so a caller cannot inject a second command.
function start(executable, commandArgs) {
  const child = spawn(executable, commandArgs, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });

  child.on('error', (error) => {
    console.error('Failed to run command:', error.message);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });
}

switch (command) {
  case 'pnpm':
    start('pnpm', args);
    break;
  case 'node':
    start('node', args);
    break;
  case 'tsx':
    start('tsx', args);
    break;
  default:
    console.error('Usage: node scripts/with-env.mjs <pnpm|node|tsx> [...args]');
    process.exit(1);
}
