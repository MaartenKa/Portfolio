import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/tests",

  outputDir: "./playwright/test-results",

  // In CI: Playwright stopt de run zelf, in plaats van dat de runner de run afbreekt.
  // Daardoor wordt het HTML-rapport wél gegenereerd als de suite hangt.
  globalTimeout: 10 * 60 * 1000,

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["html", { outputFolder: "./playwright/playwright-report", open: "never" }],
    ["json", { outputFile: "./playwright/test-results/report.json" }],
  ],

  use: {
    // baseURL: "http://127.0.0.1:3000",
    baseURL: "https://maartenka.github.io/Portfolio/",

    trace: "on-first-retry",

    screenshot: "only-on-failure",

    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ]

  // webServer: {
  //   command: "npx http-server docs -p 3000",

  //   url: "http://127.0.0.1:3000",

  //   reuseExistingServer: !process.env.CI,
  // }
})