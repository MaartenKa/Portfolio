// Portfolio — scripts/view-tests.mjs
//
// Start de lokale suite in de kijkmodus: de browser draait zichtbaar en élke run
// (geslaagd of niet) houdt video, trace en screenshot achter, zodat de test na te
// kijken is. De kijkmodus zelf staat in playwright.local.config.ts en wordt
// aangezet door de env-vlag PW_VIEW. Dit script zet die vlag platformonafhankelijk
// en roept Playwright direct op node aan (geen shell-laag), zodat de webServer van
// de config zijn eigen stdio behoudt en de run niet blokkeert. Extra argumenten
// gaan door naar Playwright: npm run test:localVideo -- homepage-functional.

import { spawnSync } from "node:child_process";

const LOCAL_CONFIG = "playwright.local.config.ts";
const PLAYWRIGHT_CLI = "node_modules/playwright/cli.js";

const extraArgs = process.argv.slice(2);

const result = spawnSync(
  process.execPath,
  [PLAYWRIGHT_CLI, "test", "-c", LOCAL_CONFIG, ...extraArgs],
  {
    stdio: "inherit",
    env: { ...process.env, PW_VIEW: "1" },
  }
);

if (result.error) {
  console.error(`Playwright niet gestart: ${result.error.message}`);
}

process.exit(result.status ?? 1);
