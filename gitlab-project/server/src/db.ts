import pg from 'pg';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.js';
import { log } from './log.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl === 'disable' ? undefined : { rejectUnauthorized: config.databaseSsl === 'verify' },
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
});
pool.on('error', e => log('error', 'database pool error', { error: e.message }));

export async function tx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** Applies server/migrations/*.sql in name order, once each. Safe with several replicas starting at once. */
export async function migrate(): Promise<string[]> {
  const files = readdirSync(config.migrationsDir).filter(f => /^\d+_.+\.sql$/.test(f)).sort();
  const applied: string[] = [];
  await tx(async c => {
    await c.query('SELECT pg_advisory_xact_lock(724071)');
    await c.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    const done = new Set((await c.query('SELECT version FROM schema_migrations')).rows.map(r => r.version));
    for (const f of files) {
      if (done.has(f)) continue;
      await c.query(readFileSync(join(config.migrationsDir, f), 'utf8'));
      await c.query('INSERT INTO schema_migrations(version) VALUES ($1)', [f]);
      applied.push(f);
    }
  });
  if (applied.length) log('info', 'database migrations applied', { applied });
  return applied;
}
