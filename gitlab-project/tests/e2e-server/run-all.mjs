// Starts the built server against a fresh test database, then runs the shared-version browser tests.
//   E2E_DATABASE_URL=postgres://user:pass@localhost:5432/directory_e2e npm run test:e2e:server
// The database is wiped first: never point this at real data.
import { spawn, spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DB = process.env.E2E_DATABASE_URL;
if (!DB) { console.log('SKIP shared-version browser tests: set E2E_DATABASE_URL'); process.exit(0); }
const PORT = process.env.E2E_PORT || '8099';
const env = {
  ...process.env, NODE_ENV: 'test', DATABASE_URL: DB, PORT, HOST: '127.0.0.1', BASE_PATH: '/employee-directory/',
  PUBLIC_URL: `http://127.0.0.1:${PORT}`, SESSION_SECRET: 'e2e-secret-e2e-secret-e2e-secret-e2e', AUTH_MODE: 'dev',
  ADMIN_EMAILS: 'admin@example.com,admin2@example.com', DEFAULT_ROLE: 'none', INITIAL_DATA: 'sample', LOG_LEVEL: 'warn',
};
const reset = spawnSync(process.execPath, ['server-dist/tools/db.js', 'reset', '--yes'], { cwd: ROOT, env, stdio: 'inherit' });
if (reset.status) process.exit(1);
const server = spawn(process.execPath, ['server-dist/server/src/index.js'], { cwd: ROOT, env, stdio: ['ignore', 'inherit', 'inherit'] });
const base = `http://127.0.0.1:${PORT}/employee-directory/`;
for (let i = 0; i < 60; i++) { try { if ((await fetch(base)).ok) break; } catch {} await new Promise(r => setTimeout(r, 500)); }

let failed = [];
for (const f of readdirSync(dirname(fileURLToPath(import.meta.url))).filter(f => f.endsWith('.mjs') && f !== 'run-all.mjs').sort()) {
  console.log(`\n== ${f}`);
  const r = spawnSync(process.execPath, [join('tests/e2e-server', f)], { cwd: ROOT, env: { ...process.env, BASE_URL: base, E2E_DATABASE_URL: DB }, stdio: 'inherit' });
  if (r.status) failed.push(f);
}
server.kill('SIGTERM');
console.log(failed.length ? `\nFAILED: ${failed.join(', ')}` : '\nALL FILES PASSED');
process.exit(failed.length ? 1 : 0);
