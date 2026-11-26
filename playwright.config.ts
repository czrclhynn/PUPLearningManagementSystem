import { defineConfig, devices } from "@playwright/test";

const live = process.env.LMS_LIVE_DEMO === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  expect: { timeout: live ? 15000 : 5000 },
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: live ? "http://127.0.0.1:8443" : "http://127.0.0.1:4173",
    channel: "chromium",
    actionTimeout: live ? 15000 : 0,
    trace: live ? "off" : "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: live
    ? undefined
    : {
        command: "node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
