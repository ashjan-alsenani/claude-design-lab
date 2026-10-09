import { useCallback, useRef, useSyncExternalStore } from 'react';

export interface Store<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(fn: () => void): () => void;
  reset(): void;
}

export const storage = {
  read<T>(key: string): T | undefined {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  },
  write(key: string, value: unknown) {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked (private mode) — the session still works in memory */
    }
  },
  remove(key: string) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

/** A tiny external store persisted to localStorage under `key`. */
export function createPersistentStore<T>(key: string, initial: () => T, hydrate: (saved: unknown) => T): Store<T> {
  const saved = storage.read<unknown>(key);
  let state: T = saved === undefined ? initial() : hydrate(saved);
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  return {
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      storage.write(key, state);
      emit();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    reset() {
      state = initial();
      storage.write(key, state);
      emit();
    },
  };
}

export function useStore<T, S>(store: Store<T>, selector: (s: T) => S): S {
  // Cache by source-state identity so selectors may derive new arrays/objects safely.
  const cache = useRef<{ state: T; value: S } | null>(null);
  const sel = useRef(selector);
  sel.current = selector;
  const get = useCallback(() => {
    const state = store.get();
    if (!cache.current || cache.current.state !== state) cache.current = { state, value: sel.current(state) };
    return cache.current.value;
  }, [store]);
  return useSyncExternalStore(store.subscribe, get, get);
}

/** Same API, memory only. */
export function createMemoryStore<T>(initial: () => T): Store<T> {
  let state = initial();
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      listeners.forEach((l) => l());
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    reset() {
      state = initial();
      listeners.forEach((l) => l());
    },
  };
}
