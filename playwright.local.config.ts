// Portfolio — playwright.local.config.ts

import { defineConfig, devices } from "@playwright/test";

/**
 * Hulpconfig voor lokaal werk aan `docs/` (vaste configuratie in de repo).
 *
 * De standaard-suite (`playwright.config.ts`) draait tegen de live GitHub
 * Pages-site. Nieuwe of aangepaste site-markup staat daar nog niet, dus die
 * tests slagen pas na deploy en de Pages-cacheperiode. Met deze config draait
 * dezelfde suite tegen de lokale `docs/`-map.
 *
 * Gebruik:
 *   npm run build
 *   npm run test:local        # lichte standaardrun: artefacten alleen bij failure
 *   npm run test:localVideo   # kijkmodus: video, trace en screenshot van élke run
 *
 * Deze config verandert niets aan de standaard-suite of aan de CI.
 */

// De kijkmodus (npm run test:localVideo, of PW_VIEW=1 bij een eigen commando) laat
// élke run een video, trace en screenshot achter, zodat ook een geslaagde test na te
// kijken is. Zonder die vlag blijven de artefacten beperkt tot mislukkingen — dezelfde
// lichte standaardrun als in de CI. De standaardconfig en de workflow blijven onverandert.
const viewMode = !!process.env.PW_VIEW;

export default defineConfig({
  testDir: "./playwright/tests",

  outputDir: "./playwright/test-results",

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  // Lokaal: één worker en geen retries, zodat een lokale bevinding een echte
  // bevinding blijft en niet door een herhaalde poging wordt gemaskeerd.
  retries: 0,

  workers: 1,

  reporter: [
    [
      "html",
      {
        outputFolder: "./playwright/playwright-report",
        // In de kijkmodus gaat het rapport open na de run, zodat video's en traces
        // bij de tests staan. Standaard blijft `never`: de suite is dan de stille
        // kwaliteitspoort. Het rapport open je later met `npm run show:report`.
        open: viewMode ? "always" : "never",
      },
    ],
    // Hetzelfde JSON-report als de standaardconfig, zodat de lokaal gedocumenteerde
    // ci-summary-flow (CI-PLAYWRIGHT-HISTORY.md §11.3) met deze config werkt.
    ["json", { outputFile: "./playwright/test-results/report.json" }],
    ["list"],
  ],

  use: {
    // De afsluitende "/" is verplicht: relatieve paden lossen dan op binnen deze
    // map, niet vanuit de domein-root (conventie PLAYWRIGHT.md §8).
    baseURL: "http://127.0.0.1:8080/",

    // Kijkmodus: `on` geeft een volledige trace per run; de trace-viewer speelt die
    // run als screencast, actie voor actie (npx playwright show-trace). Standaard:
    // alleen bij een mislukking, als in de CI.
    trace: viewMode ? "on" : "retain-on-failure",

    screenshot: viewMode ? "on" : "only-on-failure",

    // `retain-on-failure` neemt élke run op, maar verwijdert de video van de
    // geslaagde runs — er is dus niets te kijken als alles groen is. `mode: "on"`
    // behoudt de video van élke run: `video.webm` in de artifactmap
    // `playwright/test-results/<test>/` en als bijlage in het HTML-rapport.
    // `size` is het videoformaat (default: de viewport geschaald naar max. 800x800);
    // `show` tekent acties en de testnaam in de video, wat het kijken vergemakkelijkt.
    video: viewMode
      ? {
          mode: "on",
          size: { width: 800, height: 450 },
          show: { actions: { duration: 400 }, test: { level: "step" } },
        }
      : "retain-on-failure",

    // In de kijkmodus draait de browser zichtbaar, zodat de run live meeloopt.
    headless: !viewMode,
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