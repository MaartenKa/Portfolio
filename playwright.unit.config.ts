// Portfolio — playwright.unit.config.ts
//
// Hulpconfig voor de browserloze datasuite (CIH-06) op scripts/ci-summary.mjs.
// Deze suite is de kwaliteitspoort op de producer van de CI-history en draait in
// de CI vóór de browserinstallatie: er is geen browser, geen webServer en geen
// baseURL, want de tests zijn Node-computatie op de rekenregels van de script.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright/tests/unit",

  // Aparte artifactmap: het HTML- en JSON-rapport van de browser-suite blijven
  // onaangeraakt, zodat ci-summary.mjs na de suite élét rapport leest — het
  // rapport van de suite, niet dat van de gate.
  outputDir: "./playwright/test-results-unit",

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  // Deterministisch: een rekenfout mag niet door een retry worden gemaskeerd
  // (TESTPLAN.md §11).
  retries: 0,

  workers: 1,

  // Bewust alleen `list`: de gate is de lichtste poort van de keten en laat
  // geen HTML- en JSON-rapport in de CI-artifactmappen achter.
  reporter: [["list"]],

  projects: [
    // Geen `use` met devices: dit project heeft geen browser nodig en start dus
    // geen browser op. De tests gebruiken de `page`-fixture niet.
    { name: "unit" },
  ],
});
