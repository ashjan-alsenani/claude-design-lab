// Minimal static server for local use and CI tests. Serves dist/ under BASE_PATH (default /employee-directory/)
// so the subfolder setup used in production is exercised. Sends the same security headers as deploy/nginx.conf.
// Usage: node scripts/serve.mjs   (PORT=8080 BASE_PATH=/employee-directory/ HOST=127.0.0.1)
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {join, normalize, extname} from 'node:path';
import {ROOT, loadEnv} from './env.mjs';

const env = loadEnv();
const PORT = Number(env.PORT || 8080);
const HOST = env.HOST || '127.0.0.1';
let BASE = env.BASE_PATH || '/employee-directory/';
if (!BASE.startsWith('/')) BASE = '/' + BASE;
if (!BASE.endsWith('/')) BASE += '/';
const DIR = join(ROOT, env.SERVE_DIR || 'dist');
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'};
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; frame-src 'self' blob: data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === BASE.slice(0, -1)) { res.writeHead(301, {Location: BASE}); return res.end(); }
  if (!url.pathname.startsWith(BASE)) { res.writeHead(404, {'Content-Type': 'text/plain'}); return res.end('Not found'); }
  let rel = decodeURIComponent(url.pathname.slice(BASE.length)) || 'index.html';
  const file = normalize(join(DIR, rel));
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end(); }
  try {
    const s = await stat(file);
    const target = s.isDirectory() ? join(file, 'index.html') : file;
    const body = await readFile(target);
    const ext = extname(target);
    const noCache = ['.html', '.js', '.css', '.webmanifest'].includes(ext);
    res.writeHead(200, {'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': noCache ? 'no-cache' : 'public, max-age=3600', ...SECURITY_HEADERS});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, {'Content-Type': 'text/plain'}); res.end('Not found');
  }
}).listen(PORT, HOST, () => console.log(`Serving ${DIR} at http://${HOST}:${PORT}${BASE}`));
