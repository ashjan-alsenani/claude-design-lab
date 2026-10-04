import { defineConfig } from "@playwright/test";
import fs from "node:fs";

const localChromium = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
export default defineConfig({
  testDir: ".",
  timeout: 90_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3600", launchOptions: fs.existsSync(localChromium) ? { executablePath: localChromium } : {} },
});
