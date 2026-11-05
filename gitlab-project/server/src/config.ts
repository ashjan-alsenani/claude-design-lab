/** All server settings come from environment variables (see .env.example). Invalid combinations stop the server. */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Project root: works from server/src (tsx) and server-dist/server/src (compiled).
const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = [resolve(here, '../..'), resolve(here, '../../..')].find(p => existsSync(join(p, 'package.json'))) || process.cwd();

// Local development: read .env if present. In OpenShift the variables come from the ConfigMap and Secret.
const envFile = join(ROOT, '.env');
if (existsSync(envFile) && process.env.NODE_ENV !== 'production') {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const env = process.env;
const list = (v?: string) => String(v || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const bool = (v: string | undefined, d: boolean) => (v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(v));

let basePath = env.BASE_PATH || '/employee-directory/';
if (!basePath.startsWith('/')) basePath = '/' + basePath;
if (!basePath.endsWith('/')) basePath += '/';

export const config = {
  production: env.NODE_ENV === 'production',
  port: Number(env.PORT || 8080),
  host: env.HOST || '0.0.0.0',
  basePath,
  /** Public address users open, e.g. https://directory.intranet.example. Needed for sign-in redirects. */
  publicUrl: (env.PUBLIC_URL || `http://localhost:${env.PORT || 8080}`).replace(/\/+$/, ''),
  staticDir: resolve(ROOT, env.STATIC_DIR || 'dist'),
  migrationsDir: resolve(ROOT, env.MIGRATIONS_DIR || 'server/migrations'),
  databaseUrl: env.DATABASE_URL || '',
  databaseSsl: env.DATABASE_SSL || 'disable', // disable | require | verify
  sessionSecret: env.SESSION_SECRET || '',
  sessionIdleMinutes: Number(env.SESSION_IDLE_MINUTES || 30),
  sessionMaxHours: Number(env.SESSION_MAX_HOURS || 10),
  cookieSecure: bool(env.COOKIE_SECURE, env.NODE_ENV === 'production'),
  trustProxy: env.TRUST_PROXY || (env.NODE_ENV === 'production' ? '1' : ''),
  authMode: (env.AUTH_MODE || 'oidc') as 'oidc' | 'dev',
  oidc: {
    issuer: env.OIDC_ISSUER_URL || '',
    clientId: env.OIDC_CLIENT_ID || '',
    clientSecret: env.OIDC_CLIENT_SECRET || '',
    scopes: env.OIDC_SCOPES || 'openid profile email',
    emailClaim: env.OIDC_EMAIL_CLAIM || 'email',
    nameClaim: env.OIDC_NAME_CLAIM || 'name',
    /** Optional: only tokens containing one of these values in the groups claim may sign in. */
    allowedGroups: list(env.OIDC_ALLOWED_GROUPS),
    groupsClaim: env.OIDC_GROUPS_CLAIM || 'groups',
  },
  /** Company accounts that are always administrators (bootstrap the first administrator here). */
  adminEmails: list(env.ADMIN_EMAILS),
  /** Role for a signed-in company account that hasn't been added in Users & access: none (blocked) or viewer. */
  defaultRole: (env.DEFAULT_ROLE || 'none') as 'none' | 'viewer',
  /** What an empty database starts with: empty (production) or sample (fictional data, for demos and staging). */
  initialData: (env.INITIAL_DATA || 'empty') as 'empty' | 'sample',
  logLevel: env.LOG_LEVEL || 'info',
};

export function validate(): string[] {
  const p: string[] = [];
  if (!config.databaseUrl) p.push('DATABASE_URL is required');
  if (!config.sessionSecret || config.sessionSecret.length < 32) p.push('SESSION_SECRET must be at least 32 random characters');
  if (config.authMode === 'dev' && config.production) p.push('AUTH_MODE=dev is for local development only and is refused when NODE_ENV=production');
  if (config.authMode === 'oidc' && (!config.oidc.issuer || !config.oidc.clientId)) p.push('OIDC_ISSUER_URL and OIDC_CLIENT_ID are required when AUTH_MODE=oidc');
  if (config.production && !config.publicUrl.startsWith('https://')) p.push('PUBLIC_URL must be an https:// address in production');
  if (!['empty', 'sample'].includes(config.initialData)) p.push('INITIAL_DATA must be empty or sample');
  if (!['none', 'viewer'].includes(config.defaultRole)) p.push('DEFAULT_ROLE must be none or viewer');
  return p;
}
