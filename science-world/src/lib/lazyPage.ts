import { lazy, type ComponentType } from 'react';

const KEY = 'science-world.reloaded-for-update';

/**
 * Pages are loaded on demand. After a new version is published, a tab that was
 * already open may ask for page files that no longer exist. When that happens we
 * reload once to fetch the new version, instead of leaving the child on a blank page.
 */
export function lazyPage<T extends ComponentType<object>>(load: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await load();
      sessionStorage.removeItem(KEY);
      return mod;
    } catch (err) {
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, '1');
        window.location.reload();
        return new Promise<never>(() => {}); // wait for the reload
      }
      throw err;
    }
  });
}

/** Vite fires this when a preloaded file fails (same cause): reload once. */
export function reloadOnStaleAssets() {
  window.addEventListener('vite:preloadError', (event) => {
    if (sessionStorage.getItem(KEY)) return;
    event.preventDefault();
    sessionStorage.setItem(KEY, '1');
    window.location.reload();
  });
}
