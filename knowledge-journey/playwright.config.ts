import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// Use the pre-installed Chromium when present (cloud dev env); otherwise Playwright's own.
const local = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const launchOptions = existsSync(local) ? { executablePath: local } : {};

export default defineConfig({
  testDir: './e2e',
  timeout: 240_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173', launchOptions, actionTimeout: 15_000, trace: 'retain-on-failure' },
  webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 860 }, launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions } },
  ],
});
