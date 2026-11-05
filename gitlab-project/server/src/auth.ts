/**
 * Sign-in with the company identity provider (OpenID Connect, authorization code + PKCE): Microsoft Entra ID,
 * ADFS, Keycloak, Okta, … AUTH_MODE=dev adds a local "type your email" sign-in for development only.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { Issuer, generators, type Client } from 'openid-client';
import { config } from './config.js';
import { log, who } from './log.js';

export interface SessionUser { email: string; name: string; sub: string; at: number; idToken?: string }
declare module 'express-session' {
  interface SessionData { user?: SessionUser; oidc?: { state: string; nonce: string; verifier: string; returnTo: string } }
}

let client: Client | null = null;
async function oidc(): Promise<Client> {
  if (client) return client;
  const issuer = await Issuer.discover(config.oidc.issuer);
  client = new issuer.Client({
    client_id: config.oidc.clientId,
    client_secret: config.oidc.clientSecret || undefined,
    token_endpoint_auth_method: config.oidc.clientSecret ? 'client_secret_basic' : 'none',
    redirect_uris: [callbackUrl()],
    response_types: ['code'],
  });
  return client;
}
const callbackUrl = () => `${config.publicUrl}${config.basePath}auth/callback`;
/** Only return to a place inside the app (a #/route), never to another site. */
const safeReturn = (v: unknown) => (typeof v === 'string' && /^#\/[\w\-/?=&%.]*$/.test(v) ? v : '');
const home = (returnTo = '') => `${config.basePath}${returnTo}`;

function regenerate(req: Request): Promise<void> {
  return new Promise((ok, no) => req.session.regenerate(e => (e ? no(e) : ok())));
}
/** Write the session to the database before redirecting, so the next request already finds it. */
function persist(req: Request): Promise<void> {
  return new Promise((ok, no) => req.session.save(e => (e ? no(e) : ok())));
}

export function authRoutes(): Router {
  const r = Router();

  r.get('/login', async (req, res, next) => {
    try {
      const returnTo = safeReturn(req.query.returnTo);
      if (config.authMode === 'dev') return res.type('html').send(devLoginPage(returnTo));
      const c = await oidc();
      const state = generators.state(), nonce = generators.nonce(), verifier = generators.codeVerifier();
      req.session.oidc = { state, nonce, verifier, returnTo };
      await persist(req);
      res.redirect(c.authorizationUrl({
        scope: config.oidc.scopes, state, nonce,
        code_challenge: generators.codeChallenge(verifier), code_challenge_method: 'S256',
      }));
    } catch (e) { next(e); }
  });

  r.get('/callback', async (req, res, next) => {
    try {
      const pending = req.session.oidc;
      if (!pending) return res.redirect(`${config.basePath}auth/login`);
      const c = await oidc();
      const tokens = await c.callback(callbackUrl(), c.callbackParams(req), { state: pending.state, nonce: pending.nonce, code_verifier: pending.verifier });
      let claims = tokens.claims() as Record<string, unknown>;
      // Some providers put email and name only in the userinfo response, not in the ID token: ask for them.
      if (!claims[config.oidc.emailClaim] && !claims.preferred_username && !claims.upn && tokens.access_token) {
        try { claims = { ...(await c.userinfo(tokens.access_token)), ...claims }; } catch (e) { log('warn', 'userinfo request failed', { error: (e as Error).message }); }
      }
      const email = String(claims[config.oidc.emailClaim] || claims.preferred_username || claims.upn || '').trim().toLowerCase();
      const name = String(claims[config.oidc.nameClaim] || claims.name || email);
      if (!email) return res.status(403).type('text').send('Your sign-in did not include an email address. Ask IT to add the email claim.');
      if (config.oidc.allowedGroups.length) {
        const g = ([] as unknown[]).concat(claims[config.oidc.groupsClaim] || []).map(x => String(x).toLowerCase());
        if (!g.some(x => config.oidc.allowedGroups.includes(x))) {
          log('warn', 'sign-in refused: not in an allowed group', { user: who(email) });
          return res.status(403).type('text').send('Your account is not in a group allowed to use the employee directory.');
        }
      }
      await regenerate(req); // new session id after sign-in
      req.session.user = { email, name, sub: String(claims.sub || ''), at: Date.now(), idToken: tokens.id_token };
      log('info', 'signed in', { user: who(email) });
      await persist(req);
      res.redirect(home(pending.returnTo));
    } catch (e) { next(e); }
  });

  r.post('/logout', async (req, res) => {
    const idToken = req.session.user?.idToken;
    const email = req.session.user?.email;
    await new Promise<void>(ok => req.session.destroy(() => ok()));
    res.clearCookie('dtd.sid', { path: config.basePath });
    if (email) log('info', 'signed out', { user: who(email) });
    let next = `${config.publicUrl}${config.basePath}`;
    if (config.authMode === 'oidc') {
      try {
        const c = await oidc();
        if (c.issuer.metadata.end_session_endpoint) next = c.endSessionUrl({ id_token_hint: idToken, post_logout_redirect_uri: next });
      } catch {}
    }
    res.json({ next });
  });

  if (config.authMode === 'dev') {
    r.post('/dev-login', async (req, res) => {
      const email = String(req.body?.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+$/.test(email)) return res.status(400).type('html').send(devLoginPage('', 'Enter an email address.'));
      await regenerate(req);
      req.session.user = { email, name: String(req.body?.name || email.split('@')[0]), sub: 'dev:' + email, at: Date.now() };
      await persist(req);
      res.redirect(home(safeReturn(req.body?.returnTo)));
    });
  }
  return r;
}

/** API guard: a signed-in session that hasn't passed its absolute lifetime. */
export function requireUser(req: Request, res: Response, next: NextFunction) {
  const u = req.session.user;
  if (u && Date.now() - u.at > config.sessionMaxHours * 3600_000) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'signin', reason: 'expired', login: `${config.basePath}auth/login` });
  }
  if (!u) return res.status(401).json({ error: 'signin', login: `${config.basePath}auth/login` });
  next();
}

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
function devLoginPage(returnTo: string, error = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Development sign-in</title><style>body{font:16px system-ui,sans-serif;max-width:420px;margin:12vh auto;padding:0 16px;color:#172133}
label{display:block;margin:14px 0 6px;font-weight:600}input{width:100%;padding:10px;border:1px solid #94a3b8;border-radius:8px;font:inherit}
button{margin-top:18px;padding:10px 16px;border:0;border-radius:8px;background:#0b7d78;color:#fff;font:600 16px system-ui}.n{background:#fef3c7;padding:10px 12px;border-radius:8px}.e{color:#b91c1c}</style></head>
<body><h1>Development sign-in</h1><p class="n">AUTH_MODE=dev: anyone can sign in as any email. Never use this outside your own computer.</p>
${error ? `<p class="e" role="alert">${esc(error)}</p>` : ''}
<form method="post" action="${config.basePath}auth/dev-login"><input type="hidden" name="returnTo" value="${esc(returnTo)}">
<label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required autofocus>
<label for="name">Name (optional)</label><input id="name" name="name" autocomplete="name">
<button type="submit">Sign in</button></form></body></html>`;
}
