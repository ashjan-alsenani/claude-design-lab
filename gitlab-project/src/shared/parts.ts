/**
 * The directory's data is one JSON document (the "D" object of the application code). To share it between
 * employees safely, the document is split into parts that are stored, versioned and authorised separately.
 *
 * - Top-level keys become parts ("employees", "levels", …).
 * - Keys inside the container objects below become their own parts ("ui.mrate", "park.asg", …); whatever is
 *   left in a container is stored under the container's name ("park", "allow", …).
 * - Record parts (arrays of objects with an "id", or maps keyed by id) are merged record by record, so two people
 *   editing different employees never conflict.
 *
 * This file is shared by the browser bridge (src/bridge) and the server (server/src).
 */

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
export type Doc = Record<string, Json>;

/** Containers whose children are stored as separate parts. Every child of `ui` is its own part. */
export const CONTAINERS: Record<string, string[] | '*'> = {
  ui: '*',
  allow: ['recs'],
  park: ['spots', 'asg', 'wait', 'exc'],
  continuity: ['recs'],
  studio: ['issues'],
};

/** Parts merged record by record. "array" = array of objects with an id; "map" = object keyed by id. */
export const RECORD_PARTS: Record<string, 'array' | 'map'> = {
  employees: 'array',
  users: 'array',
  audit: 'array',
  importRecords: 'array',
  batches: 'array',
  corrections: 'array',
  vacancies: 'array',
  'allow.recs': 'array',
  'park.spots': 'array',
  'park.asg': 'array',
  'park.wait': 'array',
  'park.exc': 'array',
  'continuity.recs': 'array',
  'studio.issues': 'array',
  'ui.noms': 'array',
  'ui.awards': 'array',
  'ui.mrate': 'map',
  'ui.mnotes': 'map',
  'ui.idp': 'map',
  'ui.succ': 'map',
  'ui.followups': 'map',
};

/** Append-only parts: entries can be added but never changed or removed by anyone except through the server. */
export const APPEND_ONLY = new Set(['audit']);

const isObj = (v: unknown): v is Record<string, Json> => !!v && typeof v === 'object' && !Array.isArray(v);

export function split(doc: Doc): Map<string, Json> {
  const out = new Map<string, Json>();
  for (const [k, v] of Object.entries(doc)) {
    const spec = CONTAINERS[k];
    if (spec && isObj(v)) {
      const rest: Record<string, Json> = {};
      let hasRest = false;
      for (const [c, cv] of Object.entries(v)) {
        if (spec === '*' || spec.includes(c)) out.set(`${k}.${c}`, cv);
        else { rest[c] = cv; hasRest = true; }
      }
      if (hasRest || spec !== '*') out.set(k, rest);
    } else out.set(k, v);
  }
  return out;
}

export function join(parts: Map<string, Json> | Record<string, Json>): Doc {
  const doc: Doc = {};
  const entries = parts instanceof Map ? [...parts.entries()] : Object.entries(parts);
  // containers first, so child parts can be placed into them
  for (const [name, v] of entries) if (!name.includes('.')) doc[name] = CONTAINERS[name] && isObj(v) ? { ...v } : v;
  for (const [name, v] of entries) {
    const i = name.indexOf('.');
    if (i < 0) continue;
    const k = name.slice(0, i), c = name.slice(i + 1);
    if (!isObj(doc[k])) doc[k] = {};
    (doc[k] as Record<string, Json>)[c] = v;
  }
  return doc;
}

/** JSON with sorted keys, so the browser and the server (whose database reorders keys) hash records identically. */
export function stable(v: unknown): string {
  if (v === undefined) return 'null';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  return '{' + Object.keys(v as object).sort().filter(k => (v as Record<string, unknown>)[k] !== undefined)
    .map(k => JSON.stringify(k) + ':' + stable((v as Record<string, unknown>)[k])).join(',') + '}';
}

/** Short, fast fingerprint of a record (FNV-1a over the stable JSON). Used only to detect concurrent changes. */
export function fingerprint(v: unknown): string {
  const s = stable(v);
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
  }
  return h1.toString(36) + h2.toString(36) + s.length.toString(36);
}

/** Records of a record part as [id, record] pairs. */
export function records(kind: 'array' | 'map', v: Json): [string, Json][] {
  if (kind === 'array') return Array.isArray(v) ? v.filter(isObj).map(r => [String(r.id), r] as [string, Json]) : [];
  return isObj(v) ? Object.entries(v) : [];
}

export function fromRecords(kind: 'array' | 'map', recs: [string, Json][]): Json {
  return kind === 'array' ? recs.map(([, r]) => r) : Object.fromEntries(recs);
}

export interface RecordOps {
  /** Records added or changed, by id. */
  upsert: Record<string, Json>;
  /** Ids removed. */
  remove: string[];
  /** Fingerprint of each changed or removed record as the browser last received it (absent for new records). */
  base: Record<string, string>;
  /** For array parts: the order of ids after the change (so reordering is kept). */
  order?: string[];
}

/** What changed in a record part between the last copy received from the server and the current copy. */
export function diffRecords(kind: 'array' | 'map', before: Json, after: Json): RecordOps | null {
  const b = new Map(records(kind, before)), a = records(kind, after);
  const ops: RecordOps = { upsert: {}, remove: [], base: {} };
  let changed = false;
  const seen = new Set<string>();
  for (const [id, r] of a) {
    seen.add(id);
    const old = b.get(id);
    if (old === undefined) { ops.upsert[id] = r; changed = true; }
    else if (stable(old) !== stable(r)) { ops.upsert[id] = r; ops.base[id] = fingerprint(old); changed = true; }
  }
  for (const [id, r] of b) if (!seen.has(id)) { ops.remove.push(id); ops.base[id] = fingerprint(r); changed = true; }
  if (kind === 'array') {
    const order = a.map(([id]) => id);
    const prevOrder = [...b.keys()].filter(id => seen.has(id));
    if (order.filter(id => b.has(id)).join('\u0000') !== prevOrder.join('\u0000')) changed = true;
    ops.order = order;
  }
  return changed ? ops : null;
}
