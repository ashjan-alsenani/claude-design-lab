import fs from "node:fs";
import path from "node:path";
import { emptyDb, type AccessLog, type AuditEntry, type LicensingDb } from "./types";
import { eq, expectOk, type Rest } from "../supabase/rest";

/**
 * Persistence for the licensing engine. Every write runs as one atomic transaction over
 * a working copy: if the callback throws, nothing is saved.
 *
 * - MemoryLicensingStore: unit tests.
 * - FileLicensingStore: local SANDBOX only (git-ignored .data/licensing.json).
 * - SupabaseLicensingStore: production. Supabase Postgres, reached only from the server with the
 *   service role (supabase/migrations/20261004000000_server_store.sql).
 * - UnavailableLicensingStore: when the database is not configured. It fails closed: nobody can
 *   sign in and every protected request is denied.
 */
export interface LicensingStore {
  readonly mode: "memory" | "local-sandbox" | "database" | "unavailable";
  read<T>(fn: (db: Readonly<LicensingDb>) => T): Promise<T>;
  write<T>(fn: (db: LicensingDb) => T): Promise<T>;
}

const MAX_LOGS = 5000;

function trim(db: LicensingDb, maxLogs = MAX_LOGS) {
  if (db.accessLogs.length > maxLogs) db.accessLogs.splice(0, db.accessLogs.length - maxLogs);
  if (db.audit.length > maxLogs) db.audit.splice(0, db.audit.length - maxLogs);
  const cutoff = Date.now() - 2 * 24 * 3600 * 1000;
  // Verification challenges are short-lived; keep two days for rate limiting and forensics.
  db.challenges = db.challenges.filter((c) => new Date(c.createdAt).getTime() > cutoff);
}

export class MemoryLicensingStore implements LicensingStore {
  readonly mode = "memory" as const;
  private db: LicensingDb;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(initial?: LicensingDb) {
    this.db = initial ?? emptyDb();
  }
  async read<T>(fn: (db: Readonly<LicensingDb>) => T) {
    return fn(this.db);
  }
  write<T>(fn: (db: LicensingDb) => T): Promise<T> {
    const run = this.queue.then(() => {
      const draft = structuredClone(this.db);
      const result = fn(draft);
      trim(draft);
      this.db = draft;
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
  snapshot() {
    return structuredClone(this.db);
  }
}

export class FileLicensingStore implements LicensingStore {
  readonly mode = "local-sandbox" as const;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private file: string) {}
  private load(): LicensingDb {
    try {
      return { ...emptyDb(), ...JSON.parse(fs.readFileSync(this.file, "utf8")) };
    } catch {
      return emptyDb();
    }
  }
  async read<T>(fn: (db: Readonly<LicensingDb>) => T) {
    await this.queue;
    return fn(this.load());
  }
  write<T>(fn: (db: LicensingDb) => T): Promise<T> {
    const run = this.queue.then(() => {
      const draft = this.load();
      const result = fn(draft);
      trim(draft);
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(draft));
      fs.renameSync(tmp, this.file);
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }
}

type StateRow = { version: number; doc?: Partial<LicensingDb> };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Supabase-backed store. Each write reads the current record set, applies the engine's change to a
 * copy, then saves it only if nobody else saved in between (compare-and-swap on `version`); on a
 * clash it retries from fresh data, so writes stay atomic across server instances. Reads check the
 * version first and reuse this instance's copy when nothing changed.
 * New access and audit entries are also appended to `oc_licensing_events` (full history); the working
 * record keeps the latest `maxDocLogs` of each so it stays small.
 */
export class SupabaseLicensingStore implements LicensingStore {
  readonly mode = "database" as const;
  private cache: { version: number; db: LicensingDb } | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(
    private rest: Rest,
    private opts: { maxDocLogs?: number; retries?: number } = {}
  ) {}

  private async fetchState(): Promise<{ version: number; db: LicensingDb }> {
    const r = await this.rest(`oc_licensing_state?id=eq.1&select=version,doc`);
    expectOk(r, "STATE_READ");
    const row = (r.data as StateRow[])[0];
    return row ? { version: Number(row.version), db: { ...emptyDb(), ...row.doc } } : { version: 0, db: emptyDb() };
  }

  private async current(): Promise<{ version: number; db: LicensingDb }> {
    if (this.cache) {
      const r = await this.rest(`oc_licensing_state?id=eq.1&select=version`);
      expectOk(r, "STATE_VERSION");
      const v = (r.data as StateRow[])[0]?.version;
      if (v !== undefined && Number(v) === this.cache.version) return this.cache;
    }
    this.cache = await this.fetchState();
    return this.cache;
  }

  async read<T>(fn: (db: Readonly<LicensingDb>) => T) {
    await this.queue;
    return fn(structuredClone((await this.current()).db));
  }

  write<T>(fn: (db: LicensingDb) => T): Promise<T> {
    const run = this.queue.then(() => this.commit(fn));
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async commit<T>(fn: (db: LicensingDb) => T): Promise<T> {
    const retries = this.opts.retries ?? 6;
    for (let attempt = 0; attempt < retries; attempt++) {
      const cur = await this.fetchState();
      const draft = cur.db;
      const seenAccess = new Set(draft.accessLogs.map((x) => x.id));
      const seenAudit = new Set(draft.audit.map((x) => x.id));
      const result = fn(draft);
      const events = [
        ...draft.accessLogs.filter((x: AccessLog) => !seenAccess.has(x.id)).map((e) => ({ kind: "access", at: e.at, entry: e })),
        ...draft.audit.filter((x: AuditEntry) => !seenAudit.has(x.id)).map((e) => ({ kind: "audit", at: e.at, entry: e })),
      ];
      trim(draft, this.opts.maxDocLogs ?? 1000);
      const next = cur.version + 1;
      let saved: boolean;
      if (cur.version === 0) {
        const r = await this.rest("oc_licensing_state", { method: "POST", body: { id: 1, version: next, doc: draft }, prefer: "return=minimal" });
        saved = r.status === 201;
        if (!saved && r.status !== 409) expectOk(r, "STATE_CREATE");
      } else {
        const r = await this.rest(`oc_licensing_state?id=eq.1&version=${eq(String(cur.version))}&select=version`, {
          method: "PATCH",
          body: { version: next, doc: draft, updated_at: new Date().toISOString() },
          prefer: "return=representation",
        });
        expectOk(r, "STATE_UPDATE");
        saved = Array.isArray(r.data) && r.data.length === 1;
      }
      if (saved) {
        this.cache = { version: next, db: draft };
        if (events.length) {
          // History is best effort: a failure here never undoes the committed change.
          await this.rest("oc_licensing_events", { method: "POST", body: events, prefer: "return=minimal" }).catch(() => undefined);
        }
        return result;
      }
      await sleep(15 * 2 ** attempt + Math.random() * 25);
    }
    throw new Error("LICENSING_STORE_BUSY");
  }
}

export class UnavailableLicensingStore implements LicensingStore {
  readonly mode = "unavailable" as const;
  async read<T>(fn: (db: Readonly<LicensingDb>) => T) {
    return fn(emptyDb());
  }
  async write<T>(): Promise<T> {
    throw new Error("LICENSING_STORE_NOT_CONNECTED");
  }
}
