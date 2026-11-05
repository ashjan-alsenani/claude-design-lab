/** One JSON line per event on stdout (OpenShift collects it). Never log request bodies, tokens or personal data. */
import { config } from './config.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;
type Level = keyof typeof LEVELS;
const min = LEVELS[(config.logLevel as Level)] ?? 20;

export function log(level: Level, msg: string, fields: Record<string, unknown> = {}) {
  if (LEVELS[level] < min) return;
  const line = JSON.stringify({ t: new Date().toISOString(), level, msg, ...fields });
  (level === 'error' || level === 'warn' ? process.stderr : process.stdout).write(line + '\n');
}

/** Identify a user in logs without writing their email: a short one-way tag. */
export function who(email: string): string {
  let h = 2166136261;
  for (let i = 0; i < email.length; i++) h = Math.imul(h ^ email.charCodeAt(i), 16777619) >>> 0;
  return 'u' + h.toString(36);
}
