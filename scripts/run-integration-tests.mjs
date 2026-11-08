#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { windowsPnpmArgs } from './windows-command.mjs';

// Load the repo-root .env when it exists. In CI the variables are already set.
const envFile = resolve(import.meta.dirname, '..', '.env');
if (existsSync(envFile)) {
  config({ path: envFile });
}

function deriveTestUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const database = url.pathname.replace(/^\//, '');
  if (!database) {
    throw new Error('DATABASE_URL has no database name');
  }
  if (!database.endsWith('_test')) {
    url.pathname = `/${database}_test`;
  }
  return url.toString();
}

function assertTestDatabase(testUrl) {
  const database = new URL(testUrl).pathname.replace(/^\//, '');
  if (!database.endsWith('_test')) {
    throw new Error('Refusing to run integration tests: the database name must end with _test.');
  }
}

function resolveTestUrl() {
  const baseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('TEST_DATABASE_URL or DATABASE_URL is required');
  }
  const testUrl = process.env.TEST_DATABASE_URL ? baseUrl : deriveTestUrl(baseUrl);
  assertTestDatabase(testUrl);
  return testUrl;
}

function runPnpm(args, env) {
  // Windows exposes pnpm as a .cmd shim. Launch its JavaScript entry point with
  // Node instead of a shell, so caller arguments are never re-parsed.
  const command = process.platform === 'win32' ? process.execPath : 'pnpm';
  const commandArgs = process.platform === 'win32' ? windowsPnpmArgs(args, env) : args;
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    env,
    shell: false,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const testUrl = resolveTestUrl();
  const env = {
    ...process.env,
    DATABASE_URL: testUrl,
    DIRECT_URL: testUrl,
    TEST_DATABASE_URL: testUrl,
    NODE_ENV: 'test',
  };

  // Prisma prints the target database name. Do not print a value derived from
  // the connection string here; it can contain credentials.
  console.log('Preparing the isolated test database');
  runPnpm(
    ['--filter', '@mec/api', 'exec', 'prisma', 'migrate', 'reset', '--force', '--skip-seed'],
    env,
  );
  runPnpm(['--filter', '@mec/api', 'test:integration'], env);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
