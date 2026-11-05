// Reads settings from .env (if present) and the process environment. Process environment wins,
// so CI/CD variables override a local .env. No dependencies.
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadEnv() {
  const file = join(ROOT, '.env');
  const fromFile = {};
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2];
      if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
      fromFile[m[1]] = v;
    }
  }
  return {...fromFile, ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined))};
}

/** The settings the browser receives in config.js. Nothing secret beyond the owner password hash belongs here. */
export function appConfig(env) {
  const list = v => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
  return {
    ownerUsername: String(env.OWNER_USERNAME || '').trim(),
    ownerAliases: list(env.OWNER_LOGIN_ALIASES),
    ownerDisplayName: String(env.OWNER_DISPLAY_NAME || '').trim(),
    ownerPasswordSha256: String(env.OWNER_PASSWORD_SHA256 || '').trim().toLowerCase(),
    creditName: String(env.CREDIT_NAME || '').trim(),
    creditTeam: String(env.CREDIT_TEAM || '').trim(),
  };
}
