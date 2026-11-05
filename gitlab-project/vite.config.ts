import { defineConfig, loadEnv, type Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * npm run build       → dist/       shared version (needs the server)
 * npm run build:test  → dist-test/  standalone version (no server; fictional data in the browser)
 */
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const standalone = mode === 'standalone';
  const outDir = standalone ? 'dist-test' : 'dist';
  let buildId = env.CI_COMMIT_SHORT_SHA || env.BUILD_ID || '';
  if (!buildId) try { buildId = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch {}
  if (!buildId) buildId = Date.now().toString(36);

  // The standalone build has its own built-in owner account (from OWNER_* settings); the shared build never does.
  const list = (v?: string) => String(v || '').split(',').map(x => x.trim()).filter(Boolean);
  const standaloneConfig = standalone ? {
    ownerUsername: env.OWNER_USERNAME || '', ownerAliases: list(env.OWNER_LOGIN_ALIASES), ownerDisplayName: env.OWNER_DISPLAY_NAME || '',
    ownerPasswordSha256: (env.OWNER_PASSWORD_SHA256 || '').toLowerCase(), creditName: env.CREDIT_NAME || '', creditTeam: env.CREDIT_TEAM || '',
  } : null;

  const stampServiceWorker: Plugin = {
    name: 'stamp-service-worker',
    apply: 'build',
    closeBundle() {
      const f = join(outDir, 'sw.js');
      if (existsSync(f)) writeFileSync(f, readFileSync(f, 'utf8').replace('__BUILD_ID__', buildId));
    },
  };

  return {
    base: './', // relative links: works under any sub-path (BASE_PATH) without rebuilding
    define: { __STANDALONE__: JSON.stringify(standalone), __STANDALONE_CONFIG__: JSON.stringify(standaloneConfig) },
    build: { outDir, emptyOutDir: true, assetsDir: 'app', sourcemap: false, target: 'es2020' },
    server: {
      port: 5173,
      // npm run dev: the API and sign-in are served by the local server (npm run dev:server) on port 8080.
      proxy: { '/employee-directory/api': 'http://127.0.0.1:8080', '/employee-directory/auth': 'http://127.0.0.1:8080' },
    },
    plugins: [stampServiceWorker],
  };
});
