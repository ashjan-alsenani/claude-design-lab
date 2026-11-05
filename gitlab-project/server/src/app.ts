import express, { type Request, type Response, type NextFunction } from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from './config.js';
import { pool } from './db.js';
import { authRoutes, requireUser } from './auth.js';
import { DOCS, HttpError, applyChanges, readState, readVersions, resolveActor, type DocId } from './state.js';
import { log, who } from './log.js';

export const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; frame-src 'self' blob: data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

  app.use((_req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (config.cookieSecure) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    next();
  });

  // Probes for OpenShift: liveness doesn't touch the database; readiness does.
  app.get(['/healthz', `${config.basePath}healthz`], (_req, res) => res.type('text').send('ok'));
  app.get(['/readyz', `${config.basePath}readyz`], async (_req, res) => {
    try { await pool.query('SELECT 1'); res.type('text').send('ready'); } catch { res.status(503).type('text').send('database unavailable'); }
  });
  app.get('/', (_req, res) => res.redirect(config.basePath));

  const PgStore = pgSession(session);
  const base = express.Router();
  base.use(session({
    name: 'dtd.sid',
    store: new PgStore({ pool, tableName: 'session', createTableIfMissing: false, pruneSessionInterval: 900 }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true, // the idle timeout restarts with every request
    cookie: { httpOnly: true, sameSite: 'lax', secure: config.cookieSecure, path: config.basePath, maxAge: config.sessionIdleMinutes * 60_000 },
  }));
  base.use(express.urlencoded({ extended: false, limit: '16kb' }));
  base.use(express.json({ limit: '20mb' })); // backups with profile photos can be large

  // Requests that change something must come from this site's own pages.
  base.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    const self = new URL(config.publicUrl).origin;
    if (origin && origin !== self && origin !== `${req.protocol}://${req.get('host')}`) return res.status(403).json({ error: 'cross-site request refused' });
    if (req.path.startsWith('/api/') && req.get('x-dtd-request') !== '1') return res.status(403).json({ error: 'missing X-DTD-Request header' });
    next();
  });

  base.use('/auth', authRoutes());

  const api = express.Router();
  api.use(requireUser);
  // Resolve the account on every request, so role changes and deactivations apply immediately.
  api.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const u = req.session.user!;
      const actor = await resolveActor(u.email, u.name);
      if (!actor) return res.status(403).json({ error: 'not-registered', message: 'Your company account has not been added to the directory yet. Ask the directory administrator to add you in Users & access.' });
      res.locals.actor = actor;
      next();
    } catch (e) { next(e); }
  });
  const docOf = (req: Request): DocId => {
    const d = String(req.query.doc || req.body?.doc || 'main');
    if (!(DOCS as readonly string[]).includes(d)) throw new HttpError(400, { error: 'unknown doc' });
    return d as DocId;
  };
  api.get('/session', (_req, res) => {
    const a = res.locals.actor;
    res.json({ email: a.email, name: a.name, uid: a.uid, role: a.role, idleMinutes: config.sessionIdleMinutes });
  });
  api.get('/state', async (req, res, next) => { try { res.json(await readState(res.locals.actor, docOf(req))); } catch (e) { next(e); } });
  api.get('/state/versions', async (req, res, next) => { try { res.json(await readVersions(res.locals.actor, docOf(req))); } catch (e) { next(e); } });
  api.post('/state/changes', async (req, res, next) => {
    try { res.json(await applyChanges(res.locals.actor, docOf(req), req.body?.changes)); } catch (e) { next(e); }
  });
  api.get('/admin/changes', async (req, res, next) => {
    try {
      if (!res.locals.actor.admin) return res.status(403).json({ error: 'forbidden' });
      const r = await pool.query('SELECT id, at, actor, doc, part, action, detail FROM change_log ORDER BY id DESC LIMIT 500');
      res.json({ changes: r.rows });
    } catch (e) { next(e); }
  });
  api.use((_req, res) => res.status(404).json({ error: 'not found' }));
  base.use('/api', api);

  // The built web app. HTML, JS and CSS are always revalidated so a release reaches everyone.
  if (existsSync(join(config.staticDir, 'index.html'))) {
    base.use(express.static(config.staticDir, {
      index: 'index.html',
      setHeaders(res, p) {
        res.setHeader('Cache-Control', /\.(html|js|css|webmanifest)$/.test(p) && !/\/assets\/[^/]+-[\w-]{8}\.(js|css)$/.test(p) ? 'no-cache' : 'public, max-age=31536000, immutable');
        if (/\.(png|jpg|woff2)$/.test(p)) res.setHeader('Cache-Control', 'public, max-age=3600');
      },
    }));
  } else log('warn', 'static files not found; run "npm run build" first', { dir: config.staticDir });

  app.use(config.basePath, base);
  app.get(config.basePath.slice(0, -1), (_req, res) => res.redirect(config.basePath));

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.status).json(err.body);
    const e = err as Error & { type?: string };
    if (e?.type === 'entity.too.large') return res.status(413).json({ error: 'too large' });
    log('error', 'request failed', { path: req.path, method: req.method, error: e?.message, user: req.session?.user ? who(req.session.user.email) : undefined });
    res.status(500).json({ error: 'Something went wrong on the server. Try again; if it keeps happening, tell the directory administrator.' });
  });
  return app;
}
