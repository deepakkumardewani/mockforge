import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    /** Dedicated port so E2E does not collide with a developer Next server on 3000 */
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: [
    {
      command: "bun run dev -- --port 3010",
      cwd: "./apps/web",
      url: "http://localhost:3010",
      env: {
        /** Browser-side playground requests target the API instance below */
        NEXT_PUBLIC_API_URL: "http://localhost:4000",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "bun run dev",
      cwd: "./apps/api",
      url: "http://localhost:4000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
