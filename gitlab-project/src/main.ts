/**
 * Entry point. Two builds come from this file:
 *  - dist/      (npm run build)       shared version: data, sign-in and permissions on the server
 *  - dist-test/ (npm run build:test)  standalone version: everything in the browser, fictional data, for tests
 *                                     and demos without a server
 */
import { startServerMode } from './bridge/server-mode';
import './srv.css';

declare const __STANDALONE__: boolean;
declare const __STANDALONE_CONFIG__: Record<string, unknown> | null;
declare global { interface Window { DTD_CONFIG?: Record<string, unknown> } }

// Keep the browser's own fetch: the application replaces window.fetch to answer its in-browser /api calls.
const realFetch = window.fetch.bind(window);

function loadScript(src: string): Promise<void> {
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => ok();
    s.onerror = () => fail(new Error('could not load ' + src));
    document.body.appendChild(s);
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}

async function start() {
  if (__STANDALONE__) {
    window.DTD_CONFIG = { ...(__STANDALONE_CONFIG__ || {}), mode: 'standalone' };
    await loadScript('assets/app.js');
    registerServiceWorker();
    return;
  }
  window.DTD_CONFIG = { mode: 'server' };
  if (await startServerMode(realFetch, () => loadScript('assets/app.js'))) registerServiceWorker();
}

start().catch(e => {
  console.error(e);
  document.body.textContent = 'The employee directory could not start. Refresh the page; if it keeps happening, tell the directory administrator.';
});
