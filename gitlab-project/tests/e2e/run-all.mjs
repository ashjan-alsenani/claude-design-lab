// Browser tests of the standalone build (dist-test/: all data in the browser, fictional sample data).
// Serves dist-test/ itself (with the same security headers as the real server), then runs each check.
//   npm run build:test && npm run test:e2e
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, '..', '..', 'dist-test');
if (!existsSync(join(DIR, 'index.html'))) { console.error('dist-test/ is missing: run "npm run build:test" first'); process.exit(1); }
const PORT = Number(process.env.E2E_STATIC_PORT || 8098), BASE = '/employee-directory/';
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; frame-src 'self' blob: data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (!u.pathname.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  const f = normalize(join(DIR, decodeURIComponent(u.pathname.slice(BASE.length)) || 'index.html'));
  if (!f.startsWith(DIR)) { res.writeHead(403); return res.end(); }
  try { const s = await stat(f); const t = s.isDirectory() ? join(f, 'index.html') : f; const body = await readFile(t);
    res.writeHead(200, { 'Content-Type': TYPES[extname(t)] || 'application/octet-stream', 'Content-Security-Policy': CSP, 'Cache-Control': 'no-cache' }); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(PORT, '127.0.0.1');

mkdirSync(join(HERE, '..', '..', 'test-output'), { recursive: true });
const failed = [];
for (const f of readdirSync(HERE).filter(f => f.endsWith('.mjs') && f !== 'run-all.mjs').sort()) {
  // spawn (not spawnSync): the static server above must keep answering while a check runs
  const r = await new Promise(done => {
    const ch = spawn(process.execPath, [join(HERE, f)], { cwd: join(HERE, '..', '..', 'test-output'), env: { ...process.env, BASE_URL: `http://127.0.0.1:${PORT}${BASE}` } });
    let out = ''; ch.stdout.on('data', d => out += d); ch.stderr.on('data', d => out += d);
    ch.on('close', status => done({ status, out }));
  });
  const out = r.out;
  const pass = (out.match(/^PASS/gm) || []).length, bad = out.split('\n').filter(l => /^FAIL|Error/.test(l));
  console.log(`${bad.length || r.status ? 'FAIL' : 'ok  '} ${f}: ${pass} checks passed${bad.length ? '\n   ' + bad.slice(0, 5).join('\n   ') : ''}`);
  if (bad.length || r.status) failed.push(f);
}
server.close();
console.log(failed.length ? `\nFAILED: ${failed.join(', ')}` : '\nALL FILES PASSED');
process.exit(failed.length ? 1 : 0);
