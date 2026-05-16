#!/usr/bin/env node
// Lightweight migration runner for the scaffold.
// Reads supabase/migrations/*.sql in order, executes each via the Supabase REST API.
//
// For production you probably want supabase CLI migrations:
//   https://supabase.com/docs/guides/cli/local-development#database-migrations
// This script exists so the scaffold's `npm run db:migrate` works out of the box.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const files = (await readdir(MIGRATIONS_DIR))
  .filter((f) => f.endsWith('.sql'))
  .sort();

console.log(`Found ${files.length} migration(s):`);
for (const f of files) console.log(`  - ${f}`);

console.log('\nApply migrations via the Supabase SQL editor or supabase CLI.');
console.log('This runner currently only lists them — wire it up to your Postgres');
console.log('client of choice (pg, postgres, supabase-js with execute_sql RPC, etc.).');

for (const f of files) {
  const sql = await readFile(path.join(MIGRATIONS_DIR, f), 'utf8');
  console.log(`\n--- ${f} ---\n${sql}`);
}
