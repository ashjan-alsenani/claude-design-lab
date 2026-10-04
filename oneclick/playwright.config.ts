import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

// Uses the preinstalled Chromium when present (cloud dev containers), otherwise Playwright's own.
const localChromium = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const launchOptions = fs.existsSync(localChromium) ? { executablePath: localChromium } : {};
const PORT = Number(process.env.E2E_PORT || 3100);

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 45_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, launchOptions, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: true,
    timeout: 120_000,
    // Fake Google credentials: the button shows and the hand-off can be checked; no real Google call is made.
    env: { ONECLICK_DEMO_MODE: "true", GOOGLE_CLIENT_ID: "e2e-client.apps.googleusercontent.com", GOOGLE_CLIENT_SECRET: "e2e-secret" },
  },
});
