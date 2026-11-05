/**
 * Who may read and change each part of the directory. This is the server-side access control: the browser
 * hides buttons, but only what this file allows is ever sent to, or accepted from, a user.
 *
 * Administrators can read and change everything. Every other account is limited by its role and permissions
 * (set in the app under Data management → Users & access) and by its departments or "My team".
 */
import type { Json } from '../../src/shared/parts.js';

export interface Actor {
  email: string;
  name: string;
  uid: number;
  role: 'admin' | 'manager' | 'viewer';
  admin: boolean;
  perms: Record<string, unknown>;
  /** Departments the account is limited to. Empty = all departments. */
  scope: string[];
  /** The account's own employee record, used for "My team". */
  empId: number | null;
}

export interface Ctx {
  /** Employee id → department and reporting line (read from the stored employees part). */
  emp: Map<number, { dept: string; mgr: number | null }>;
  /** The actor's own staff: everyone reporting to them, directly or indirectly. */
  team: Set<number>;
  /** Field keys hidden from accounts without the "sensitive" permission. */
  restricted: string[];
}

type Rec = Record<string, Json>;
export type Op = 'add' | 'edit' | 'remove';

export interface PartPolicy {
  /** May the actor see this part at all? */
  read(a: Actor, c: Ctx): boolean;
  /** May the actor change this part (value parts) or any record in it (record parts)? */
  write(a: Actor, c: Ctx): boolean;
  /** Record parts: is this record visible to the actor? */
  visible?(a: Actor, rec: Rec, id: string, c: Ctx): boolean;
  /** Record parts: remove fields the actor must not see. The server puts them back when the actor saves. */
  redact?(a: Actor, rec: Rec, c: Ctx): Rec;
  /** Record parts: may the actor add, change or remove this record? */
  recordWrite?(a: Actor, op: Op, before: Rec | null, after: Rec | null, id: string, c: Ctx): boolean;
}

const can = (a: Actor, ...p: string[]) => a.admin || p.some(k => !!a.perms[k]);
const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));

/** Is an employee inside the actor's departments (or team, for "My team only" accounts)? */
export function inScope(a: Actor, empId: unknown, c: Ctx): boolean {
  if (a.admin) return true;
  const id = num(empId);
  if (id === null) return false;
  if (a.perms.teamOnly) return id === a.empId || c.team.has(id);
  if (!a.scope.length) return true;
  const e = c.emp.get(id);
  return !!e && a.scope.includes(e.dept);
}

export function employeeDept(rec: Rec | null): string {
  if (!rec) return '';
  try { return String((JSON.parse(String(rec.data || '{}')) as Rec).department || ''); } catch { return ''; }
}

const all = () => true;
const adminOnly: PartPolicy = { read: a => a.admin, write: a => a.admin };
const readAllAdminWrite: PartPolicy = { read: all, write: a => a.admin };
const scopedRecords = (readPerms: string[], writePerms: string[], empField: string, hide: (a: Actor) => string[] = () => []): PartPolicy => ({
  read: a => can(a, ...readPerms, ...writePerms),
  write: a => can(a, ...writePerms),
  visible: (a, r, _id, c) => inScope(a, r[empField], c),
  redact: (a, r) => { const h = hide(a); if (!h.length) return r; const o = { ...r }; for (const k of h) delete o[k]; return o; },
  recordWrite: (a, _op, b, n, _id, c) => can(a, ...writePerms) && (!b || inScope(a, b[empField], c)) && (!n || inScope(a, n[empField], c)),
});
/** Map parts keyed by employee id (ratings, notes, plans, succession). */
const scopedMap = (readPerms: string[], writePerms: string[], teamOnly = false): PartPolicy => ({
  read: a => can(a, ...readPerms, ...writePerms),
  write: a => can(a, ...writePerms),
  visible: (a, _r, id, c) => a.admin || (teamOnly ? c.team.has(Number(id)) && can(a, 'team') || can(a, ...readPerms.filter(p => p !== 'team')) && inScope(a, id, c) : inScope(a, id, c)),
  recordWrite: (a, _op, _b, _n, id, c) => can(a, ...writePerms) && (teamOnly ? a.admin || c.team.has(Number(id)) : inScope(a, id, c)),
});

/** Settings and data-version flags the application needs on every page. Readable by all, changed by administrators. */
const SHARED_READ = ['levels', 'restricted', 'customFields', 'orgV', 'statusV', 'roleV', 'secV', 'secV2', 'rtV', 'supV1', 'pkSmp1', 'vacSeed',
  'ui.siteAr', 'ui.siteEn', 'ui.logo', 'ui.hiddenPages', 'ui.hiddenCharts', 'ui.hiddenKpis', 'ui.chartOrder', 'ui.kpiOrder', 'ui.customCharts',
  'ui.customKpis', 'ui.extraUnits', 'ui.autoRules', 'ui.replyEmail', 'ui.msg', 'ui.greet', 'ui.lastBackup'];

export const POLICY: Record<string, PartPolicy> = {
  ...Object.fromEntries(SHARED_READ.map(k => [k, readAllAdminWrite])),
  nextId: { read: all, write: a => can(a, 'add') },
  'ui.dismissed': { read: all, write: all },
  'ui.greetSent': { read: all, write: all },
  'ui.critRoles': { read: a => can(a, 'criticality', 'succession'), write: a => can(a, 'criticality') },
  verify: adminOnly,
  importRecords: adminOnly,
  batches: adminOnly,

  users: {
    read: all, write: a => a.admin,
    visible: (a, r) => a.admin || Number(r.id) === a.uid,
    redact: (_a, r) => { const o = { ...r }; delete o.pw; return o; },
    recordWrite: a => a.admin,
  },

  employees: {
    read: all,
    write: a => can(a, 'edit', 'add', 'del'),
    visible: (a, r, _id, c) => a.admin || !a.perms.teamOnly || inScope(a, r.id, c),
    redact: (a, r, c) => {
      if (can(a, 'sensitive') || !c.restricted.length) return r;
      try {
        const d = JSON.parse(String(r.data || '{}')) as Rec;
        for (const k of c.restricted) delete d[k];
        return { ...r, data: JSON.stringify(d) };
      } catch { return r; }
    },
    recordWrite: (a, op, b, n, _id, c) => {
      if (a.admin) return true;
      const ok = (rec: Rec | null) => !rec || !a.scope.length || a.scope.includes(employeeDept(rec));
      if (op === 'add') return can(a, 'add') && ok(n);
      if (op === 'remove') return can(a, 'del') && ok(b) && (!a.perms.teamOnly || inScope(a, b?.id, c));
      return can(a, 'edit') && ok(b) && ok(n) && (!a.perms.teamOnly || inScope(a, b?.id, c));
    },
  },

  // Append-only: everyone can add entries for their own actions; only the server and administrators read them.
  audit: { read: a => a.admin, write: all, visible: a => a.admin, recordWrite: (a, op) => op === 'add' || a.admin },

  corrections: {
    read: all, write: all,
    visible: (a, r, _id, c) => a.admin || Number(r.by) === a.uid || (can(a, 'edit') && inScope(a, r.empId, c)),
    recordWrite: (a, op, b, n, _id, c) => a.admin
      || (op === 'add' && !!n && Number(n.by) === a.uid)
      || (op === 'edit' && can(a, 'edit') && inScope(a, b?.empId, c)),
  },

  vacancies: { read: a => can(a, 'vacancies'), write: a => can(a, 'vacancies') },

  allow: { read: a => can(a, 'allowView', 'allowEdit', 'allowRules', 'allowImport'), write: a => can(a, 'allowRules', 'allowImport', 'allowEdit') },
  'allow.recs': scopedRecords(['allowView'], ['allowEdit', 'allowImport'], 'emp', a => (can(a, 'allowAmounts') ? [] : ['amt'])),

  park: { read: a => can(a, 'parkView', 'parkManage', 'parkRules', 'parkImport'), write: a => can(a, 'parkManage', 'parkRules', 'parkImport') },
  'park.spots': { read: a => can(a, 'parkView', 'parkManage', 'parkRules', 'parkImport'), write: a => can(a, 'parkManage', 'parkImport') },
  'park.exc': scopedRecords(['parkView', 'parkManage'], ['parkRules', 'parkManage'], 'emp'),
  'park.asg': scopedRecords(['parkView'], ['parkManage', 'parkImport'], 'emp', a => (can(a, 'parkManage') ? [] : ['plate'])),
  'park.wait': scopedRecords(['parkView'], ['parkManage', 'parkImport'], 'emp'),

  continuity: { read: a => can(a, 'continuity'), write: a => can(a, 'continuity') },
  'continuity.recs': { read: a => can(a, 'continuity'), write: a => can(a, 'continuity') },

  studio: { read: a => can(a, 'recognition', 'studioApprove'), write: a => can(a, 'recognition', 'studioApprove') },
  'studio.issues': { read: a => can(a, 'recognition', 'studioApprove'), write: a => can(a, 'recognition', 'studioApprove') },

  'ui.awards': { read: all, write: a => can(a, 'recognition') },
  'ui.noms': {
    read: a => can(a, 'recognition', 'team'), write: a => can(a, 'recognition', 'team'),
    visible: (a, r, _id, c) => can(a, 'recognition') || Number(r.byId) === a.uid || c.team.has(Number(r.emp)),
    recordWrite: (a, op, b, n, _id, c) => can(a, 'recognition')
      || (op === 'add' && !!n && Number(n.byId) === a.uid && c.team.has(Number(n.emp)))
      || (op === 'edit' && !!b && Number(b.byId) === a.uid && !!n && n.status === 'dismissed'),
  },
  'ui.mrate': scopedMap(['team', 'recognition'], ['team'], true),
  'ui.mnotes': scopedMap(['team'], ['team'], true),
  'ui.idp': scopedMap(['plans'], ['plans']),
  'ui.followups': scopedMap(['plans', 'attention'], ['plans', 'attention']),
  'ui.succ': scopedMap(['succession'], ['succession']),
};

/** Parts the server fills in itself and never takes from the browser. */
export const SERVER_OWNED = new Set(['role']);

/** Anything not listed above (for example a module added later) is visible to and editable by administrators only. */
export const policyFor = (part: string): PartPolicy => POLICY[part] || adminOnly;

export function buildCtx(a: Actor, employees: Json, restricted: Json): Ctx {
  const emp = new Map<number, { dept: string; mgr: number | null }>();
  if (Array.isArray(employees)) for (const r of employees) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) continue;
    let d: Rec = {};
    try { d = JSON.parse(String((r as Rec).data || '{}')); } catch {}
    emp.set(Number((r as Rec).id), { dept: String(d.department || ''), mgr: num(d.reportingToId) });
  }
  const team = new Set<number>();
  if (a.empId !== null) {
    const kids = new Map<number, number[]>();
    for (const [id, e] of emp) if (e.mgr !== null) (kids.get(e.mgr) || kids.set(e.mgr, []).get(e.mgr)!).push(id);
    const stack = [...(kids.get(a.empId) || [])];
    while (stack.length) { const id = stack.pop()!; if (team.has(id)) continue; team.add(id); stack.push(...(kids.get(id) || [])); }
  }
  return { emp, team, restricted: Array.isArray(restricted) ? restricted.map(String) : [] };
}
