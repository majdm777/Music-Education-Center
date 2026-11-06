#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';

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
    throw new Error(
      `Refusing to run integration tests against "${database}". ` +
        'The test database name must end with _test.',
    );
  }
}

function run(command, args, env) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32',
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

let testUrl;
try {
  const baseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('TEST_DATABASE_URL or DATABASE_URL is required');
  }
  testUrl = process.env.TEST_DATABASE_URL ? baseUrl : deriveTestUrl(baseUrl);
  assertTestDatabase(testUrl);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: testUrl,
  DIRECT_URL: testUrl,
  TEST_DATABASE_URL: testUrl,
  NODE_ENV: 'test',
};

console.log(`Preparing isolated test database: ${new URL(testUrl).pathname.slice(1)}`);
run(
  'pnpm',
  ['--filter', '@mec/api', 'exec', 'prisma', 'migrate', 'reset', '--force', '--skip-seed'],
  env,
);
run('pnpm', ['--filter', '@mec/api', 'test:integration'], env);
