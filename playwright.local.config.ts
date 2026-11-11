import { defineConfig, devices } from "@playwright/test";

/**
 * Hulpm-config voor lokaal werk aan `docs/` (vaste configuratie in de repo).
 *
 * De standaard-suite (`playwright.config.ts`) draait tegen de live GitHub
 * Pages-site. Nieuwe of aangepaste site-markup staat daar nog niet, dus die
 * tests slagen pas ná deploy plus de Pages-cacheperiode. Met deze config draait
 * dezelfde suite tegen de lokale `docs/`-map.
 *
 * Gebruik:
 *   npm run build
 *   npm run test:local
 *
 * Deze config verandert niets aan de standaard-suite of aan de CI.
 */
export default defineConfig({
  testDir: "./playwright/tests",

  outputDir: "./playwright/test-results",

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  // Lokaal: één worker en geen retries, zodat een lokale bevinding een echte
  // bevinding blijft en niet weggemaskerd wordt door een herhaalde poging.
  retries: 0,

  workers: 1,

  reporter: [
    [
      "html",
      { outputFolder: "./playwright/playwright-report", open: "never" },
    ],
    // Zelfde JSON-report als de standaardconfig, zodat de lokaal gedocumenteerde
    // ci-summary-flow (CI-PLAYWRIGHT-HISTORY.md §11.3) met deze config werkt.
    ["json", { outputFile: "./playwright/test-results/report.json" }],
    ["list"],
  ],

  use: {
    // De "/" op het einde is verplicht: relatieve pads lossen dan op in deze
    // map, niet in de domein-root (conventie PLAYWRIGHT.md §8).
    baseURL: "http://127.0.0.1:8080/",

    trace: "retain-on-failure",

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
  ],

  webServer: {
    command: "npx http-server docs -p 8080 -s",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});