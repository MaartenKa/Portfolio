// Portfolio — scripts/site-check.mjs
//
// Preflight voor de live site: controleert alle pagina's uit docs/ voordat de
// Playwright-suite start. Een 5xx of timeout is een omgevingsfout, geen
// testflake; de suite zelf blijft tegen de live GitHub Pages-site draaien.

import fs from "node:fs";

const DEFAULT_BASE_URL = "https://maartenka.github.io/Portfolio/";
const DOCS_DIR = "docs";
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 15_000;

const configuredBaseUrl = process.env.SITE_BASE_URL || DEFAULT_BASE_URL;
const baseUrl = configuredBaseUrl.endsWith("/")
  ? configuredBaseUrl
  : `${configuredBaseUrl}/`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let pages = [];
try {
  pages = fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".html"))
    .sort();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Kan ${DOCS_DIR} niet lezen: ${message}`);
}

/**
 * Controleert één pagina met maximaal drie pogingen.
 *
 * @param {string} page - HTML-bestandsnaam uit docs/.
 * @returns {Promise<boolean>} true bij HTTP 200, anders false.
 */
async function checkPage(page) {
  const url = new URL(page, baseUrl).toString();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (response.status === 200) {
        console.log(`OK   ${response.status} ${url}`);
        return true;
      }

      if (response.status >= 500 && attempt < MAX_ATTEMPTS) {
        console.warn(
          `WARN ${response.status} ${url} (poging ${attempt}/${MAX_ATTEMPTS})`,
        );
        await sleep(attempt * 1000);
        continue;
      }

      console.error(`FAIL ${response.status} ${url}`);
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (attempt < MAX_ATTEMPTS) {
        console.warn(
          `WARN ${message} ${url} (poging ${attempt}/${MAX_ATTEMPTS})`,
        );
        await sleep(attempt * 1000);
        continue;
      }

      console.error(`FAIL ${message} ${url}`);
      return false;
    }
  }

  return false;
}

let hasFailure = false;

if (pages.length === 0) {
  console.error(`Geen HTML-pagina's gevonden in ${DOCS_DIR}.`);
  process.exitCode = 1;
} else {
  for (const page of pages) {
    if (!(await checkPage(page))) hasFailure = true;
  }

  if (hasFailure) {
    console.error(
      "Live site is niet gezond; de Playwright-suite wordt niet gestart.",
    );
    process.exitCode = 1;
  } else {
    console.log(`Live site gezond: ${pages.length} pagina's met HTTP 200.`);
  }
}
