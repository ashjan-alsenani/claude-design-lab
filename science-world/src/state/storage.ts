/**
 * Persistence adapter. The first version stores progress in this browser only.
 * To add accounts later, implement ProgressStorage against an API
 * (load on sign-in, save debounced) and pass it to <ProgressProvider storage={...}>.
 */
export interface ProgressStorage {
  load(): unknown | null;
  save(data: unknown): void;
  clear(): void;
}

const KEY = 'science-world.progress.v1';

export const localProgressStorage: ProgressStorage = {
  load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked: progress simply stays in memory */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
