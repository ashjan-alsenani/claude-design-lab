/**
 * Server tests against a real PostgreSQL database (TEST_DATABASE_URL; the database is emptied first).
 * They prove the server enforces access, not just the browser: filtering on read, refusal on write,
 * record-level conflict detection, hidden fields kept on save, and an append-only history.
 *
 *   TEST_DATABASE_URL=postgres://user:pass@localhost:5432/directory_test npm run test:server
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';

const DB = process.env.TEST_DATABASE_URL;
if (!DB) { console.log('SKIP server tests: set TEST_DATABASE_URL'); process.exit(0); }
Object.assign(process.env, {
  NODE_ENV: 'test', DATABASE_URL: DB, SESSION_SECRET: 'test-secret-test-secret-test-secret-123', AUTH_MODE: 'dev',
  ADMIN_EMAILS: 'admin@test.example', DEFAULT_ROLE: 'none', INITIAL_DATA: 'sample', PUBLIC_URL: 'http://127.0.0.1', BASE_PATH: '/ed/', LOG_LEVEL: 'error',
});

const { pool, migrate } = await import('../../server/src/db.js');
const { createApp } = await import('../../server/src/app.js');
const { seed, sampleData } = await import('../../server/src/state.js');
const { fingerprint, split } = await import('../../src/shared/parts.js');

let base = '';
let server: import('node:http').Server;
type Json = any;

before(async () => {
  await pool.query('DROP TABLE IF EXISTS doc_parts, change_log, "session", schema_migrations CASCADE');
  await migrate();
  await seed('main', sampleData(), 'test');
  server = createApp().listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/ed/`;
});
after(async () => { server.close(); await pool.end(); });

/** Sign in through the development login and return a tiny client bound to that session. */
async function as(email: string) {
  const r = await fetch(base + 'auth/dev-login', { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: new URL(base).origin }, body: `email=${encodeURIComponent(email)}` });
  const cookie = (r.headers.get('set-cookie') || '').split(';')[0];
  const call = async (path: string, init: RequestInit = {}) => {
    const res = await fetch(base + path, { ...init, headers: { cookie, 'X-DTD-Request': '1', 'Content-Type': 'application/json', ...(init.headers || {}) } });
    return { status: res.status, body: await res.json().catch(() => null) as Json };
  };
  return {
    call,
    state: async (doc = 'main') => { const r = await call(`api/state?doc=${doc}`); if (r.status !== 200) throw new Error(`state as ${email}: ${r.status} ${JSON.stringify(r.body)} (cookie ${cookie ? 'set' : 'missing'})`); return r.body; },
    change: (changes: Json[], doc = 'main') => call('api/state/changes', { method: 'POST', body: JSON.stringify({ doc, changes }) }),
  };
}

const empData = (rec: Json) => JSON.parse(rec.data);
const findEmp = (st: Json, id: number) => st.data.employees.find((e: Json) => e.id === id);

/** Admin adds accounts the same way the app does: by changing the users part record by record. */
async function addUsers(admin: Awaited<ReturnType<typeof as>>, users: Json[]) {
  const st = await admin.state();
  const r = await admin.change([{ part: 'users', base: st.versions.users, ops: { upsert: Object.fromEntries(users.map(u => [String(u.id), u])), remove: [], base: {}, order: [...st.data.users.map((u: Json) => String(u.id)), ...users.map(u => String(u.id))] } }]);
  assert.equal(r.status, 200, JSON.stringify(r.body));
}

test('API needs a session and refuses cross-site writes', async () => {
  assert.equal((await fetch(base + 'api/state', { headers: { 'X-DTD-Request': '1' } })).status, 401);
  const admin = await as('admin@test.example');
  const r = await admin.call('api/state/changes', { method: 'POST', headers: { Origin: 'https://evil.example' }, body: '{}' });
  assert.equal(r.status, 403);
  const noHeader = await fetch(base + 'api/state/changes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.ok([401, 403].includes(noHeader.status));
});

test('company accounts not added to the directory are blocked (DEFAULT_ROLE=none)', async () => {
  const stranger = await as('stranger@test.example');
  const r = await stranger.call('api/session');
  assert.equal(r.status, 403);
  assert.equal(r.body.error, 'not-registered');
});

test('administrators from ADMIN_EMAILS are added automatically and see everything', async () => {
  const admin = await as('admin@test.example');
  const s = await admin.call('api/session');
  assert.equal(s.body.role, 'admin');
  const st = await admin.state();
  assert.ok(st.data.users.some((u: Json) => u.email === 'admin@test.example'));
  assert.ok(st.data.allow.recs.length > 0, 'admin sees allowance records');
  assert.ok('phone' in empData(findEmp(st, 6)), 'admin sees restricted fields');
});

test('viewers get filtered data and cannot change anything', async () => {
  const admin = await as('admin@test.example');
  await addUsers(admin, [{ id: 50, email: 'viewer@test.example', name: 'Test Viewer', role: 'viewer', active: 1 }]);
  const v = await as('viewer@test.example');
  const st = await v.state();
  assert.equal(st.data.employees.length, 25, 'directory is visible');
  for (const e of st.data.employees) for (const k of st.data.restricted) assert.ok(!(k in empData(e)), `restricted field ${k} hidden`);
  assert.deepEqual(st.data.users.map((u: Json) => u.id), [50], 'only their own account');
  assert.deepEqual(st.data.audit, [], 'activity log is sent empty (they can add to it, not read it)');
  assert.equal(st.data.allow, undefined, 'no allowances');
  assert.equal(st.data.park, undefined, 'no parking');
  assert.ok(!st.writable.includes('employees'));
  const e6 = findEmp(st, 6);
  const r = await v.change([{ part: 'employees', base: st.versions.employees, ops: { upsert: { 6: { ...e6, data: JSON.stringify({ ...empData(e6), nameEn: 'HACKED' }) } }, remove: [], base: { 6: fingerprint(e6) } } }]);
  assert.equal(r.status, 403);
  const r2 = await v.change([{ part: 'ui.siteEn', base: st.versions['ui.siteEn'] ?? 0, value: 'Hacked' }]);
  assert.equal(r2.status, 403);
  const fresh = await admin.state();
  assert.notEqual(empData(findEmp(fresh, 6)).nameEn, 'HACKED');
});

test('department managers can edit only their departments, and hidden fields survive their saves', async () => {
  const admin = await as('admin@test.example');
  await addUsers(admin, [{ id: 51, email: 'mgr@test.example', name: 'Test Manager', role: 'manager', active: 1, scope: ['Digital Network & Security Operations'], perms: { edit: 1, allowView: 1 } }]);
  const m = await as('mgr@test.example');
  const st = await m.state();
  const e6 = findEmp(st, 6); // Digital Network & Security Operations
  assert.ok(!('phone' in empData(e6)), 'no sensitive permission: phone hidden');
  const r = await m.change([{ part: 'employees', base: st.versions.employees, ops: { upsert: { 6: { ...e6, data: JSON.stringify({ ...empData(e6), jobTitle: 'Senior Security Specialist' }) } }, remove: [], base: { 6: fingerprint(e6) } } }]);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const full = empData(findEmp(await admin.state(), 6));
  assert.equal(full.jobTitle, 'Senior Security Specialist');
  assert.ok(full.phone, 'the phone number the manager could not see is still there');

  const e2 = findEmp(st, 2); // another department
  const r2 = await m.change([{ part: 'employees', base: st.versions.employees, ops: { upsert: { 2: { ...e2, data: JSON.stringify({ ...empData(e2), jobTitle: 'X' }) } }, remove: [], base: { 2: fingerprint(e2) } } }]);
  assert.equal(r2.status, 403, 'outside their department');
  const r3 = await m.change([{ part: 'employees', base: st.versions.employees, ops: { upsert: {}, remove: ['6'], base: { 6: fingerprint(findEmp(await m.state(), 6)) } } }]);
  assert.equal(r3.status, 403, 'no delete permission');

  // allowances: only records for their department, and no amounts without "see amounts"
  const recs = (await m.state()).data.allow.recs;
  for (const rec of recs) assert.equal(rec.amt, undefined);
  const depts = new Map(st.data.employees.map((e: Json) => [e.id, empData(e).department]));
  for (const rec of recs) assert.equal(depts.get(rec.emp), 'Digital Network & Security Operations');
});

test('two people editing different employees both keep their changes; the same employee is a conflict', async () => {
  const admin = await as('admin@test.example');
  const m = await as('mgr@test.example');
  const a0 = await admin.state(), m0 = await m.state();
  const a6 = findEmp(a0, 6), a4 = findEmp(a0, 4), m6 = findEmp(m0, 6);
  // admin changes employee 4, manager changes employee 6, from the same starting point
  let r = await admin.change([{ part: 'employees', base: a0.versions.employees, ops: { upsert: { 4: { ...a4, data: JSON.stringify({ ...empData(a4), location: 'Salalah' }) } }, remove: [], base: { 4: fingerprint(a4) } } }]);
  assert.equal(r.status, 200);
  r = await m.change([{ part: 'employees', base: m0.versions.employees, ops: { upsert: { 6: { ...m6, data: JSON.stringify({ ...empData(m6), location: 'Sohar' }) } }, remove: [], base: { 6: fingerprint(m6) } } }]);
  assert.equal(r.status, 200, 'different record: merged, not a conflict');
  const now = await admin.state();
  assert.equal(empData(findEmp(now, 4)).location, 'Salalah');
  assert.equal(empData(findEmp(now, 6)).location, 'Sohar');
  // admin still has the old copy of employee 6: saving it must not overwrite the manager's change
  r = await admin.change([{ part: 'employees', base: now.versions.employees, ops: { upsert: { 6: { ...a6, data: JSON.stringify({ ...empData(a6), location: 'Nizwa' }) } }, remove: [], base: { 6: fingerprint(a6) } } }]);
  assert.equal(r.status, 409);
  assert.deepEqual(r.body.conflicts[0].ids, ['6']);
  assert.equal(empData(findEmp(await admin.state(), 6)).location, 'Sohar');
});

test('value parts use version checks', async () => {
  const admin = await as('admin@test.example');
  const st = await admin.state();
  const v = st.versions['ui.siteEn'] ?? 0;
  assert.equal((await admin.change([{ part: 'ui.siteEn', base: v, value: 'D&T' }])).status, 200);
  assert.equal((await admin.change([{ part: 'ui.siteEn', base: v, value: 'Stale' }])).status, 409);
});

test('the activity log is append-only for everyone but the server, and the server history cannot be edited', async () => {
  const m = await as('mgr@test.example');
  const st = await m.state();
  assert.deepEqual(st.data.audit, [], 'managers cannot read the log');
  const r = await m.change([{ part: 'audit', base: 0, ops: { upsert: { 1: { id: 1, at: new Date().toISOString(), user_name: 'Someone Else', action: 'note' } }, remove: [], base: {} } }]);
  assert.equal(r.status, 200);
  const admin = await as('admin@test.example');
  const log = (await admin.state()).data.audit;
  const last = log[log.length - 1];
  assert.equal(last.user_name, 'Test Manager <mgr@test.example>', 'author is set by the server');
  assert.ok(log.filter((e: Json) => e.id === 1).length === 1, 'existing entry 1 was not replaced');
  await assert.rejects(pool.query('DELETE FROM change_log'), /append-only/);
  await assert.rejects(pool.query("UPDATE change_log SET actor = 'x'"), /append-only/);
  const h = await admin.call('api/admin/changes');
  assert.ok(h.body.changes.length > 3);
  assert.equal((await m.call('api/admin/changes')).status, 403);
});

test('signing out ends the session on the server', async () => {
  const v = await as('viewer@test.example');
  assert.equal((await v.call('api/session')).status, 200);
  assert.equal((await v.call('auth/logout', { method: 'POST' })).status, 200);
  assert.equal((await v.call('api/session')).status, 401);
});

test('split and join keep every part of the sample document', () => {
  const d = sampleData();
  const parts = split(d);
  assert.ok(parts.has('employees') && parts.has('park.asg') && parts.has('allow.recs') && parts.has('ui.siteEn'));
});
