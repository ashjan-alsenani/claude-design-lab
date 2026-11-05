// Fast static checks (no browser): JavaScript syntax, manifest, offline-cache file list,
// external URLs, and secrets accidentally committed. Run after "npm run build".
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {join, relative, extname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT} from './env.mjs';

const problems = [];
const walk = dir => readdirSync(dir).flatMap(f => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist');

// 1. JavaScript parses
for (const f of walk(SRC).filter(f => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', f], {stdio: 'pipe'}); } catch (e) { problems.push(`syntax error in ${relative(ROOT, f)}: ${e.stderr}`); }
}
// 2. Manifest is valid JSON
try { JSON.parse(readFileSync(join(SRC, 'manifest.webmanifest'), 'utf8')); } catch (e) { problems.push('manifest.webmanifest is not valid JSON'); }

// 3. Everything the service worker pre-caches exists in the build
if (!existsSync(DIST)) problems.push('dist/ is missing: run "npm run build" first');
else {
  const sw = readFileSync(join(DIST, 'sw.js'), 'utf8');
  if (sw.includes('__BUILD_ID__')) problems.push('dist/sw.js still has the __BUILD_ID__ placeholder');
  for (const f of (sw.match(/"([^"]+)"/g) || []).map(x => x.slice(1, -1)).filter(x => /\.(html|js|css|png|jpg|woff2|webmanifest)$/.test(x)))
    if (!existsSync(join(DIST, f))) problems.push(`sw.js caches "${f}" but it is not in dist/`);
  if (existsSync(join(DIST, '.env'))) problems.push('.env must never be copied into dist/');
}

// 4. No requests to other servers (the site must work on an isolated intranet)
const ALLOWED = [/^http:\/\/www\.w3\.org\//, /^http:\/\/schemas\.openxmlformats\.org\//];
for (const f of walk(SRC).filter(f => ['.html', '.js', '.css', '.webmanifest'].includes(extname(f)))) {
  for (const u of readFileSync(f, 'utf8').match(/https?:\/\/[a-zA-Z0-9.-]+[^\s"'`)<]*/g) || [])
    if (!ALLOWED.some(r => r.test(u))) problems.push(`external URL in ${relative(ROOT, f)}: ${u}`);
}

// 5. Secrets and personal settings must come from the environment, not the code
const SECRET = [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /glpat-[0-9A-Za-z_-]{20}/, /AKIA[0-9A-Z]{16}/, /\b[0-9a-f]{64}\b/];
const tracked = walk(ROOT).filter(f => !/(^|\/)(node_modules|dist|dist-single|\.git|test-results)(\/|$)/.test(relative(ROOT, f)) && !/\.(png|jpg|woff2|zip)$/.test(f) && !/(^|\/)(\.env|package-lock\.json)$/.test(f));
for (const f of tracked) {
  const t = readFileSync(f, 'utf8');
  for (const r of SECRET) if (r.test(t)) problems.push(`possible secret (${r.source.slice(0, 24)}…) in ${relative(ROOT, f)}`);
}

if (problems.length) { console.error('Checks failed:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log('All static checks passed.');
