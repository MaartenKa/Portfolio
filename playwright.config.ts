// Portfolio — playwright.config.ts
// Standaardconfig: de suite draait tegen de live GitHub Pages-site.

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/tests",

  outputDir: "./playwright/test-results",

  // In CI stopt Playwright de run zelf, in plaats van de runner. Daardoor wordt
  // het HTML-rapport ook gegenereerd als de suite vastloopt.
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

  // Lokaal werk gebruikt playwright.local.config.ts; dit uitgeschakelde
  // webServer-voorbeeld is alleen ter illustratie.
  // webServer: {
  //   command: "npx http-server docs -p 8080 -s",
  //   url: "http://127.0.0.1:8080",
  //   reuseExistingServer: !process.env.CI,
  // },
})