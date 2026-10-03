import fs from "node:fs";
import path from "node:path";
import { emptyDb, type LicensingDb } from "./types";

/**
 * Persistence for the licensing engine. Every write runs as one atomic transaction over
 * a working copy: if the callback throws, nothing is saved.
 *
 * - MemoryLicensingStore: unit tests.
 * - FileLicensingStore: local SANDBOX only (git-ignored .data/licensing.json).
 * - UnavailableLicensingStore: production until the database is connected. It fails
 *   closed: nobody can sign in and every protected request is denied.
 *
 * Production target: Supabase Postgres (supabase/migrations/20261003000000_licensing_engine.sql)
 * accessed only from the server with the service role, behind Row Level Security.
 */
export interface LicensingStore {
  readonly mode: "memory" | "local-sandbox" | "unavailable";
  read<T>(fn: (db: Readonly<LicensingDb>) => T): Promise<T>;
  write<T>(fn: (db: LicensingDb) => T): Promise<T>;
}

const MAX_LOGS = 5000;

function trim(db: LicensingDb) {
  if (db.accessLogs.length > MAX_LOGS) db.accessLogs.splice(0, db.accessLogs.length - MAX_LOGS);
  if (db.audit.length > MAX_LOGS) db.audit.splice(0, db.audit.length - MAX_LOGS);
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

export class UnavailableLicensingStore implements LicensingStore {
  readonly mode = "unavailable" as const;
  async read<T>(fn: (db: Readonly<LicensingDb>) => T) {
    return fn(emptyDb());
  }
  async write<T>(): Promise<T> {
    throw new Error("LICENSING_STORE_NOT_CONNECTED");
  }
}
