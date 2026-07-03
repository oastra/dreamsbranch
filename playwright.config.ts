import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright end-to-end test config.
 *
 * `npm run test:e2e`     — run all tests headless (CI-style)
 * `npm run test:e2e:ui`  — open the interactive UI to watch/step through tests
 *
 * Tests live in `e2e/`. They drive a real browser against the dev server,
 * which Playwright starts for us automatically (see `webServer` below).
 */
export default defineConfig({
  testDir: "./e2e",

  // Fail the build if you accidentally leave `test.only` in a file.
  forbidOnly: !!process.env.CI,
  // Retry once on CI to smooth over rare flakiness; never locally.
  retries: process.env.CI ? 1 : 0,
  // A readable console report, plus an HTML report you can open after a run.
  reporter: process.env.CI ? "line" : [["list"], ["html", { open: "never" }]],

  use: {
    // Every `page.goto("/en/shop")` is resolved against this base URL.
    baseURL: "http://localhost:3000",
    // Keep a trace (DOM snapshots + network) for the first retry, so a
    // failure is debuggable with `npx playwright show-trace`.
    trace: "on-first-retry",
  },

  // One browser to start. Add firefox/webkit projects later if you want.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  // Playwright boots the app before tests and tears it down after.
  // `reuseExistingServer` means: if you already have `npm run dev` running,
  // it reuses that instead of starting a second one.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
