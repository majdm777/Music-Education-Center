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

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to check for schema drift');
  process.exit(1);
}

// --from-schema-datasource reads DATABASE_URL from the schema's datasource
// block, so the connection string never needs to be passed on the command line.
const pnpmEntry = process.env.npm_execpath;
if (!pnpmEntry) {
  console.error('Run this check through pnpm: pnpm db:drift');
  process.exit(1);
}

// Use the current Node binary and the pnpm entry point resolved by pnpm itself.
// Nothing is resolved through PATH, so a writable PATH entry cannot hijack it.
const result = spawnSync(
  process.execPath,
  [
    pnpmEntry,
    '--filter',
    '@mec/api',
    'exec',
    'prisma',
    'migrate',
    'diff',
    '--from-schema-datasource',
    'prisma/schema.prisma',
    '--to-schema-datamodel',
    'prisma/schema.prisma',
    '--exit-code',
  ],
  {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  },
);

if (result.error) {
  console.error('Could not run Prisma migrate diff:', result.error.message);
  process.exit(1);
}

if (result.status === 0) {
  console.log('No schema drift: the database matches prisma/schema.prisma');
  process.exit(0);
}

if (result.status === 2) {
  console.error(
    'Schema drift detected. The database or applied migrations do not match prisma/schema.prisma.',
  );
  process.exit(1);
}

process.exit(result.status ?? 1);
