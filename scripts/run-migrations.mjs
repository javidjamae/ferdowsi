#!/usr/bin/env node
// Migration runner: applies db/migrations/*.sql in filename order against
// DATABASE_URL, recording each in schema_migrations so re-runs are no-ops.
// Works the same against local Postgres and Supabase (it's all Postgres).
//
//   DATABASE_URL=postgres://... npm run db:migrate

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. See .env.example.');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
});

await client.connect();
await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`);

const applied = new Set(
  (await client.query('SELECT filename FROM schema_migrations')).rows.map((r) => r.filename)
);
const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();

let ran = 0;
for (const f of files) {
  if (applied.has(f)) continue;
  const sql = await readFile(path.join(MIGRATIONS_DIR, f), 'utf8');
  console.log(`migrate: applying ${f}`);
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
    await client.query('COMMIT');
    ran++;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`migrate: ${f} failed: ${err.message}`);
    await client.end();
    process.exit(1);
  }
}

console.log(ran ? `migrate: ${ran} applied, up to date` : 'migrate: up to date');
await client.end();
