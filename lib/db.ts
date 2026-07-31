import { Pool } from 'pg';

// One database seam: plain Postgres over DATABASE_URL. Works identically
// against a local Postgres (docker/homebrew, no accounts, no provisioning)
// and Supabase (which is Postgres — use the connection string from your
// project's Connect panel; pick the transaction pooler string on Vercel).
//
// No ORM, no vendor client. Every query in the app goes through query().

const url = process.env.DATABASE_URL;

let pool: Pool | null = null;

function getPool(): Pool {
  if (!url) {
    throw new Error('DATABASE_URL is not set. See .env.example.');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 5,
      // Local Postgres speaks plaintext; hosted Postgres (Supabase, Neon,
      // RDS) wants TLS. Infer from the host so one env var covers both.
      ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const result = await getPool().query(sql, params);
  return result.rows as T[];
}
