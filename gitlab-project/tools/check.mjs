// Static checks run in CI (npm run check, after the type checks): no secrets or personal settings committed,
// no requests to other servers from the web app, migrations named in order, application code parses.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SKIP = /(^|\/)(node_modules|dist|dist-test|server-dist|test-output|\.git)(\/|$)/;
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f), r = relative(ROOT, p); if (SKIP.test(r)) return []; return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(ROOT).filter(f => !/\.(png|jpg|woff2|zip|mp4)$/.test(f) && !/(^|\/)(\.env|package-lock\.json)$/.test(f));
const problems = [];

// 1. secrets
const SECRET = [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, /glpat-[0-9A-Za-z_-]{20}/, /AKIA[0-9A-Z]{16}/, /\bsha256~[A-Za-z0-9_-]{20,}/, /\b[0-9a-f]{64}\b/, /xox[baprs]-[0-9A-Za-z-]{10,}/];
for (const f of files) {
  const t = readFileSync(f, 'utf8');
  for (const r of SECRET) if (r.test(t)) problems.push(`possible secret (${r.source.slice(0, 22)}…) in ${relative(ROOT, f)}`);
}

// 2. the web app must not call other servers (it runs on an intranet; CSP would block it anyway)
const ALLOWED = [/^http:\/\/www\.w3\.org\//, /^http:\/\/schemas\.openxmlformats\.org\//];
for (const f of files.filter(f => /^(public|src)\//.test(relative(ROOT, f)) && ['.html', '.js', '.ts', '.css', '.webmanifest'].includes(extname(f)))) {
  for (const u of readFileSync(f, 'utf8').match(/https?:\/\/[a-zA-Z0-9.-]+[^\s"'`)<]*/g) || [])
    if (!ALLOWED.some(r => r.test(u))) problems.push(`external URL in ${relative(ROOT, f)}: ${u}`);
}

// 3. migrations: NNN_name.sql, numbered without gaps
const mig = readdirSync(join(ROOT, 'server', 'migrations')).filter(f => f.endsWith('.sql')).sort();
mig.forEach((f, i) => { if (!f.startsWith(String(i + 1).padStart(3, '0') + '_')) problems.push(`migration ${f} is out of sequence (expected ${String(i + 1).padStart(3, '0')}_…)`); });

// 4. application code parses
for (const f of ['public/assets/app.js', 'public/assets/boot.js', 'public/sw.js']) {
  try { execFileSync(process.execPath, ['--check', join(ROOT, f)], { stdio: 'pipe' }); } catch (e) { problems.push(`syntax error in ${f}: ${e.stderr}`); }
}

// 5. sample data is fictional: no real-looking personal email domains
const sample = readFileSync(join(ROOT, 'tools', 'sample-data.json'), 'utf8');
for (const m of sample.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []) if (!/@(example\.(com|org)|review\.local)$/.test(m)) problems.push(`sample data contains a non-example email: ${m}`);

if (problems.length) { console.error('Checks failed:\n - ' + problems.join('\n - ')); process.exit(1); }
console.log(`All static checks passed (${files.length} files).`);
