/** Small adjustments to the application's interface when it runs against the shared server. */

declare global {
  interface Window {
    __dtdStatus?: (state: string, msg?: string) => void;
    __dtdOnSave?: () => void;
    __dtdExportSite?: () => void;
  }
}

export function setSaveState(state: 'saving' | 'saved' | 'error' | 'local', msg?: string) {
  window.__dtdStatus?.(state, msg);
}

/** Uses the application's own toast area so messages look and behave like the rest of the app. */
export function notify(text: string, kind: 'success' | 'warning' | 'error' = 'success') {
  const host = document.getElementById('toasts');
  if (!host) return;
  const t = document.createElement('div');
  t.className = `toast toast-${kind} show`;
  t.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  const s = document.createElement('span');
  s.textContent = text;
  t.appendChild(s);
  host.appendChild(t);
  window.setTimeout(() => t.remove(), 9000);
}

export function applyServerUi(opts: { signOut: () => void }) {
  // Saving goes to the server: the app's "saved" moment is when the server confirms, not when the browser stores it.
  window.__dtdOnSave = () => setSaveState('saving');
  // Copies of the whole site with data can't be made from the shared version (it would take HR data offline).
  window.__dtdExportSite = () => notify(document.documentElement.lang === 'ar' ? 'هذه الميزة غير متاحة في النسخة المشتركة.' : 'This isn\'t available in the shared version.', 'warning');

  // "Sign out" and the inactivity sign-out both call the app's own /api/auth/logout: end the server session instead.
  let leaving = false;
  const appFetch = window.fetch;
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (/\/api\/auth\/logout$/.test(new URL(url, location.href).pathname)) {
      if (!leaving) { leaving = true; opts.signOut(); }
      return new Promise<Response>(() => {}); // the page is about to leave
    }
    return appFetch(input, init);
  }) as typeof fetch;
  new MutationObserver(() => {
    if (!leaving && document.querySelector('.login-form')) { leaving = true; opts.signOut(); }
  }).observe(document.body, { childList: true, subtree: true });
}
