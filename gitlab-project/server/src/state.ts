/**
 * Reading and changing the directory data. Every read is filtered for the signed-in account and every change is
 * checked against policy.ts. Changes to record parts are merged record by record; a record someone else changed
 * since you loaded it is reported as a conflict instead of being overwritten.
 */
import type pg from 'pg';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APPEND_ONLY, RECORD_PARTS, fingerprint, fromRecords, join as joinParts, records, split, type Doc, type Json, type RecordOps } from '../../src/shared/parts.js';
import { POLICY, SERVER_OWNED, buildCtx, policyFor, type Actor, type Ctx } from './policy.js';
import { config, ROOT } from './config.js';
import { pool, tx } from './db.js';
import { log, who } from './log.js';

export const DOCS = ['main', 'vendors'] as const;
export type DocId = typeof DOCS[number];
type Rec = Record<string, Json>;
type Row = { part: string; value: Json; version: number };

export class HttpError extends Error {
  constructor(public status: number, public body: Record<string, unknown>) { super(String(body.error || status)); }
}

async function loadParts(c: pg.PoolClient | pg.Pool, doc: DocId, lock = false): Promise<Map<string, Row>> {
  const r = await c.query(`SELECT part, value, version FROM doc_parts WHERE doc = $1${lock ? ' FOR UPDATE' : ''}`, [doc]);
  return new Map(r.rows.map((x: Row) => [x.part, x]));
}

/* ------------------------------------------------------------------ accounts */

const SYNTH_BASE = 900000;
function synthId(email: string) { let h = 0; for (const ch of email) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return SYNTH_BASE + (h % 99999); }

/**
 * Turns a signed-in company account into an Actor using the Users & access list stored in the directory.
 * Accounts in ADMIN_EMAILS are administrators (and are added to the list on first sign-in).
 * Returns null when the account isn't allowed in (DEFAULT_ROLE=none and not in the list).
 */
export async function resolveActor(email: string, name: string): Promise<Actor | null> {
  const em = email.trim().toLowerCase();
  const parts = await loadParts(pool, 'main');
  const users = (parts.get('users')?.value as Rec[] | undefined) || [];
  let u = users.find(x => String(x.email || '').trim().toLowerCase() === em && x.active !== 0 && x.active !== false);
  const isAdmin = config.adminEmails.includes(em);
  if (!u && isAdmin) u = await addAdminAccount(em, name);
  if (!u) {
    if (config.defaultRole !== 'viewer') return null;
    return { email: em, name, uid: synthId(em), role: 'viewer', admin: false, perms: {}, scope: [], empId: null };
  }
  const role = isAdmin ? 'admin' : (u.role === 'admin' || u.role === 'manager' ? u.role : 'viewer') as Actor['role'];
  return {
    email: em, name: String(u.name || name), uid: Number(u.id), role, admin: role === 'admin',
    perms: role === 'manager' && u.perms && typeof u.perms === 'object' ? (u.perms as Record<string, unknown>) : {},
    scope: Array.isArray(u.scope) ? u.scope.map(String) : [],
    empId: u.empId === null || u.empId === undefined ? null : Number(u.empId),
  };
}

async function addAdminAccount(email: string, name: string): Promise<Rec> {
  return tx(async c => {
    const parts = await loadParts(c, 'main', true);
    const row = parts.get('users');
    const users = ((row?.value as Rec[]) || []).slice();
    const found = users.find(x => String(x.email || '').toLowerCase() === email);
    if (found) return found;
    const id = users.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
    const rec: Rec = { id, email, name: name || email, role: 'admin', active: 1, created_at: new Date().toISOString(), last_login: null };
    users.push(rec);
    await savePart(c, 'main', 'users', users, row ? row.version : 0, 'system');
    await c.query('INSERT INTO change_log(actor, doc, part, action, detail) VALUES ($1,$2,$3,$4,$5)', ['system', 'main', 'users', 'admin-added', { id, reason: 'ADMIN_EMAILS' }]);
    log('info', 'administrator account added from ADMIN_EMAILS', { user: who(email) });
    return rec;
  });
}

/* ------------------------------------------------------------------ reading */

function ctxFor(a: Actor, main: Map<string, Row>): Ctx {
  return buildCtx(a, main.get('employees')?.value ?? [], main.get('restricted')?.value ?? []);
}

function filterPart(a: Actor, part: string, value: Json, c: Ctx): Json {
  const kind = RECORD_PARTS[part];
  const p = policyFor(part);
  if (!kind) return value;
  const out: [string, Json][] = [];
  for (const [id, r] of records(kind, value)) {
    const rec = r as Rec;
    if (p.visible && !p.visible(a, rec, id, c)) continue;
    out.push([id, p.redact ? p.redact(a, rec, c) : rec]);
  }
  return fromRecords(kind, out);
}

export async function readState(a: Actor, doc: DocId) {
  const rows = await loadParts(pool, doc);
  const main = doc === 'main' ? rows : await loadParts(pool, 'main');
  const c = ctxFor(a, main);
  const parts = new Map<string, Json>(), versions: Record<string, number> = {}, writable: string[] = [];
  for (const [name, row] of rows) {
    if (SERVER_OWNED.has(name)) continue;
    const p = policyFor(name);
    if (!a.admin && !p.read(a, c)) {
      // Lists the account can't read are sent empty, so the app can still add to them (e.g. its activity log).
      const kind = RECORD_PARTS[name];
      if (kind && p.write(a, c)) { parts.set(name, kind === 'array' ? [] : {}); versions[name] = row.version; writable.push(name); }
      continue;
    }
    parts.set(name, filterPart(a, name, row.value, c));
    versions[name] = row.version;
    if (a.admin || p.write(a, c)) writable.push(name);
  }
  // Parts that don't exist yet but this account may create (e.g. the first nomination).
  for (const name of Object.keys(POLICY)) if (!rows.has(name) && (a.admin || POLICY[name].write(a, c))) writable.push(name);
  if (doc === 'main' && a.uid >= SYNTH_BASE) {
    // A default-role viewer who isn't in Users & access: give the app an account entry to work with.
    const users = (parts.get('users') as Rec[] | undefined) || [];
    parts.set('users', [...users, { id: a.uid, email: a.email, name: a.name, role: 'viewer', active: 1 }]);
  }
  parts.set('role', a.role);
  return { doc, initialized: rows.size > 0, data: rows.size ? joinParts(parts) : null, versions, writable, admin: a.admin };
}

export async function readVersions(a: Actor, doc: DocId) {
  const r = await pool.query('SELECT part, version FROM doc_parts WHERE doc = $1', [doc]);
  const main = await loadParts(pool, 'main');
  const c = ctxFor(a, main);
  const versions: Record<string, number> = {};
  for (const x of r.rows) if (!SERVER_OWNED.has(x.part) && (a.admin || policyFor(x.part).read(a, c))) versions[x.part] = x.version;
  return { doc, versions };
}

/* ------------------------------------------------------------------ writing */

export interface Change { part: string; base: number; value?: Json; ops?: RecordOps }

async function savePart(c: pg.PoolClient, doc: string, part: string, value: Json, prevVersion: number, by: string) {
  if (prevVersion === 0) await c.query('INSERT INTO doc_parts(doc, part, value, version, updated_by) VALUES ($1,$2,$3,1,$4)', [doc, part, JSON.stringify(value), by]);
  else await c.query('UPDATE doc_parts SET value = $3, version = version + 1, updated_at = now(), updated_by = $4 WHERE doc = $1 AND part = $2', [doc, part, JSON.stringify(value), by]);
}

/** Fields the actor can't see are kept from the stored record, so saving never erases them. */
function restoreHidden(a: Actor, part: string, before: Rec | null, after: Rec, c: Ctx): Rec {
  const p = policyFor(part);
  if (!before || !p.redact || a.admin) return after;
  const seen = p.redact(a, before, c);
  const out: Rec = { ...after };
  for (const k of Object.keys(before)) if (!(k in seen)) out[k] = before[k];
  if (part === 'employees' && typeof before.data === 'string' && typeof after.data === 'string' && before.data !== seen.data) {
    try {
      const full = JSON.parse(before.data) as Rec, shown = JSON.parse(String(seen.data)) as Rec, mine = JSON.parse(after.data) as Rec;
      for (const k of Object.keys(full)) if (!(k in shown)) mine[k] = full[k];
      out.data = JSON.stringify(mine);
    } catch {}
  }
  return out;
}

export async function applyChanges(a: Actor, doc: DocId, changes: Change[]) {
  if (!Array.isArray(changes) || !changes.length) return { versions: {}, parts: {} };
  return tx(async cl => {
    const rows = await loadParts(cl, doc, true);
    const main = doc === 'main' ? rows : await loadParts(cl, 'main');
    const c = ctxFor(a, main);
    const forbidden: string[] = [], conflicts: { part: string; ids?: string[] }[] = [];
    const saved: Record<string, number> = {}, after: Record<string, Json> = {};
    const actor = a.email;

    for (const ch of changes) {
      const part = String(ch.part || '');
      if (!part || part.length > 80 || SERVER_OWNED.has(part)) continue;
      const p = policyFor(part);
      if (!a.admin && !p.write(a, c)) { forbidden.push(part); continue; }
      const row = rows.get(part);
      const kind = RECORD_PARTS[part];

      if (!kind || !ch.ops) {
        if (kind && !a.admin) { forbidden.push(part); continue; } // record parts must be changed record by record
        if ((row?.version ?? 0) !== Number(ch.base)) { conflicts.push({ part }); continue; }
        await savePart(cl, doc, part, ch.value ?? null, row?.version ?? 0, actor);
        await cl.query('INSERT INTO change_log(actor, doc, part, action, detail) VALUES ($1,$2,$3,$4,$5)', [actor, doc, part, 'replace', null]);
        saved[part] = (row?.version ?? 0) + 1; after[part] = ch.value ?? null;
        continue;
      }

      const ops = ch.ops;
      const cur = new Map(records(kind, row?.value ?? (kind === 'array' ? [] : {})));
      const bad: string[] = [], clash: string[] = [];
      let added = 0, edited = 0, removed = 0;
      const canSee = (id: string, r: Json) => a.admin || !p.visible || p.visible(a, r as Rec, id, c);
      const seenFp = (id: string, r: Json) => fingerprint(p.redact && !a.admin ? p.redact(a, r as Rec, c) : r);
      const append = APPEND_ONLY.has(part);
      let nextNum = Math.max(0, ...[...cur.keys()].map(Number).filter(Number.isFinite)) + 1;
      const renamed = new Map<string, string>();

      for (const [id0, recNew] of Object.entries(ops.upsert || {})) {
        let id = id0;
        const before = cur.get(id) as Rec | undefined;
        if (append && (!a.admin || !before || !ops.base?.[id])) {
          // Append-only: always a new entry. If the id is already taken (by an entry this account can't see, or one a
          // colleague added a moment ago), it gets the next free id instead of replacing anything.
          if (before) { id = String(nextNum++); renamed.set(id0, id); }
          const r: Rec = { ...(recNew as Rec), id: kind === 'array' ? Number(id) || id : (recNew as Rec).id };
          if (part === 'audit' && !a.admin) r.user_name = `${a.name} <${a.email}>`;
          cur.set(id, r); added++;
          continue;
        }
        if (before !== undefined) {
          if (!canSee(id, before)) { bad.push(id); continue; }
          const merged = restoreHidden(a, part, before, recNew as Rec, c);
          if (!a.admin && p.recordWrite && !p.recordWrite(a, 'edit', before, merged, id, c)) { bad.push(id); continue; }
          if (ops.base?.[id] !== seenFp(id, before)) { clash.push(id); continue; }
          cur.set(id, merged); edited++;
        } else {
          if (ops.base?.[id]) { clash.push(id); continue; } // it existed when loaded but someone removed it
          if (!a.admin && p.recordWrite && !p.recordWrite(a, 'add', null, recNew as Rec, id, c)) { bad.push(id); continue; }
          cur.set(id, recNew); added++;
        }
      }
      for (const id of ops.remove || []) {
        const before = cur.get(id);
        if (before === undefined) continue; // already gone
        if (!canSee(id, before)) { bad.push(id); continue; }
        if (!a.admin && (append || (p.recordWrite && !p.recordWrite(a, 'remove', before as Rec, null, id, c)))) { bad.push(id); continue; }
        if (ops.base?.[id] !== seenFp(id, before)) { clash.push(id); continue; }
        cur.delete(id); removed++;
      }
      if (bad.length) forbidden.push(`${part} (${bad.length} record${bad.length > 1 ? 's' : ''})`);
      if (clash.length) conflicts.push({ part, ids: clash });
      if (bad.length || clash.length) continue;

      let list = [...cur.entries()];
      if (kind === 'array' && ops.order) {
        const want = ops.order.map(id => renamed.get(id) || id).filter(id => cur.has(id));
        const wantSet = new Set(want);
        list = [...want.map(id => [id, cur.get(id)!] as [string, Json]), ...list.filter(([id]) => !wantSet.has(id))];
      }
      const value = fromRecords(kind, list);
      await savePart(cl, doc, part, value, row?.version ?? 0, actor);
      await cl.query('INSERT INTO change_log(actor, doc, part, action, detail) VALUES ($1,$2,$3,$4,$5)', [actor, doc, part, 'records', { added, edited, removed }]);
      saved[part] = (row?.version ?? 0) + 1; after[part] = filterPart(a, part, value, c);
    }

    if (forbidden.length) throw new HttpError(403, { error: 'forbidden', parts: forbidden });
    if (conflicts.length) throw new HttpError(409, { error: 'conflict', conflicts });
    if (Object.keys(saved).length) log('info', 'data changed', { user: who(a.email), doc, parts: Object.keys(saved) });
    return { versions: saved, parts: after };
  });
}

/* ------------------------------------------------------------------ initial data */

export function sampleData(): Doc {
  return JSON.parse(readFileSync(join(ROOT, 'tools', 'sample-data.json'), 'utf8')).data as Doc;
}

/** The sample's settings and data-version flags, with every record list emptied: a clean production start. */
export function emptyData(): Doc {
  const d = sampleData();
  const parts = split(d);
  for (const [name, kind] of Object.entries(RECORD_PARTS)) if (parts.has(name)) parts.set(name, kind === 'array' ? [] : {});
  parts.set('nextId', 1);
  return joinParts(parts);
}

/** Writes a whole document (from a backup, the sample or the empty start). replace=true removes what was there. */
export async function seed(doc: DocId, data: Doc, by: string, replace = false) {
  return tx(async c => {
    if (replace) await c.query('DELETE FROM doc_parts WHERE doc = $1', [doc]);
    else if ((await c.query('SELECT 1 FROM doc_parts WHERE doc = $1 LIMIT 1', [doc])).rowCount) return false;
    for (const [part, value] of split(data)) {
      if (SERVER_OWNED.has(part)) continue;
      await c.query('INSERT INTO doc_parts(doc, part, value, version, updated_by) VALUES ($1,$2,$3,1,$4)', [doc, part, JSON.stringify(value), by]);
    }
    await c.query('INSERT INTO change_log(actor, doc, part, action, detail) VALUES ($1,$2,$3,$4,$5)', [by, doc, '*', replace ? 'restore' : 'seed', null]);
    return true;
  });
}
