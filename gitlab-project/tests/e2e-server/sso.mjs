// Company sign-in (OpenID Connect, authorization code + PKCE) end to end, against a local standards-compliant
// identity provider (oidc-provider) standing in for Entra ID. Starts its own app server with AUTH_MODE=oidc.
import { chromium } from 'playwright';
import Provider from 'oidc-provider';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DB = process.env.E2E_DATABASE_URL;
if (!DB) { console.log('SKIP sign-in test: set E2E_DATABASE_URL'); process.exit(0); }
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const IDP = 'http://127.0.0.1:9091', APP_PORT = 8097, APP = `http://127.0.0.1:${APP_PORT}/employee-directory/`;
let fail = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };

const provider = new Provider(IDP, {
  clients: [{
    client_id: 'employee-directory', client_secret: 'test-client-secret',
    redirect_uris: [`${APP}auth/callback`], post_logout_redirect_uris: [APP],
    grant_types: ['authorization_code'], response_types: ['code'],
  }],
  pkce: { required: () => true },
  claims: { openid: ['sub'], email: ['email', 'email_verified'], profile: ['name'] },
  findAccount: async (_ctx, id) => ({ accountId: id, claims: async () => ({ sub: id, email: id, email_verified: true, name: 'SSO ' + id.split('@')[0] }) }),
  cookies: { keys: ['test-only-key'] },
  features: { devInteractions: { enabled: true }, rpInitiatedLogout: { enabled: true } },
});
const idp = provider.listen(9091);

const server = spawn(process.execPath, ['server-dist/server/src/index.js'], {
  cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'],
  env: {
    ...process.env, NODE_ENV: 'test', DATABASE_URL: DB, PORT: String(APP_PORT), HOST: '127.0.0.1', BASE_PATH: '/employee-directory/',
    PUBLIC_URL: `http://127.0.0.1:${APP_PORT}`, SESSION_SECRET: 'sso-secret-sso-secret-sso-secret-sso', AUTH_MODE: 'oidc',
    OIDC_ISSUER_URL: IDP, OIDC_CLIENT_ID: 'employee-directory', OIDC_CLIENT_SECRET: 'test-client-secret',
    ADMIN_EMAILS: 'sso.admin@example.com', DEFAULT_ROLE: 'none', INITIAL_DATA: 'sample', LOG_LEVEL: 'warn',
  },
});
for (let i = 0; i < 60; i++) { try { if ((await fetch(APP)).ok) break; } catch {} await new Promise(r => setTimeout(r, 500)); }

const b = await chromium.launch();
try {
  const c = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await c.addInitScript(() => localStorage.setItem('dtd-lang', 'en'));
  const p = await c.newPage();
  const errors = [], visited = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('framenavigated', f => { if (f === p.mainFrame()) visited.push(f.url()); });
  p.on('request', r => { if (r.isNavigationRequest()) visited.push('> ' + r.url()); });

  await p.goto(APP + '#/employee/6');
  await p.waitForURL(u => u.href.startsWith(IDP), { timeout: 15000 });
  const authReq = visited.find(u => u.startsWith('> ' + IDP + '/auth')) || '';
  ok(!!authReq, 'opening the directory sends you to the company sign-in page');
  ok(/code_challenge_method=S256/.test(authReq) && /state=/.test(authReq) && /nonce=/.test(authReq), 'sign-in request uses PKCE, state and nonce');
  await p.fill('input[name=login]', 'sso.admin@example.com');
  await p.fill('input[name=password]', 'anything');
  await p.locator('button[type=submit]').click();
  // consent screen of the test provider
  const consent = p.locator('button[type=submit]');
  if (await consent.count() && p.url().startsWith(IDP)) await consent.click();
  await p.waitForURL(u => u.href.startsWith(APP), { timeout: 15000 });
  await p.waitForTimeout(2500);
  ok(/#\/employee\/6$/.test(p.url()), 'after company sign-in you land on the page you opened');
  ok((await p.locator('h1').first().textContent()).includes('Noura'), 'the directory loads with your company account');
  ok(/SSO sso\.admin|Administrator/.test(await p.locator('#userBtn').innerText()), 'signed in as the administrator from ADMIN_EMAILS');
  const cookies = await c.cookies(APP);
  const sid = cookies.find(x => x.name === 'dtd.sid');
  ok(sid && sid.httpOnly && sid.sameSite === 'Lax' && sid.path === '/employee-directory/', 'session cookie is HttpOnly, SameSite=Lax and limited to the app path');

  // sign out: ends the app session and the identity provider session
  await p.click('#userBtn'); await p.waitForTimeout(300);
  await p.locator('#userPop').getByText(/Sign out/).first().click();
  await p.waitForURL(u => u.href.startsWith(IDP), { timeout: 15000 });
  ok(/session\/end/.test(p.url()), 'sign out continues to the company sign-out page');
  const yes = p.locator('button[autofocus], button[type=submit]').first();
  if (await yes.count()) await yes.click();
  await p.waitForTimeout(1500);
  const st = (await c.request.get(APP + 'api/session', { headers: { 'X-DTD-Request': '1' } })).status();
  ok(st === 401, 'after sign out the app session is gone');
  await p.goto(APP + '#/home');
  await p.waitForURL(u => u.href.startsWith(IDP + '/interaction'), { timeout: 15000 });
  ok(await p.locator('input[name=login]').count() === 1, 'opening the directory again asks for company sign-in (the provider session ended too)');
  ok(errors.length === 0, 'no JavaScript errors ' + errors.join(' | '));
} catch (e) {
  ok(false, 'sign-in flow: ' + e.message.split('\n')[0]);
} finally {
  await b.close();
  server.kill('SIGTERM');
  idp.close();
}
console.log(fail ? fail + ' FAILED' : 'ALL PASS');
process.exit(fail ? 1 : 0);
