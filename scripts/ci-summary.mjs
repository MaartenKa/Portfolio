// Portfolio — scripts/ci-summary.mjs
//
// Leest het Playwright JSON-report, normaliseert de cijfers en schrijft de
// nieuwste CI-run naar docs/data/playwright-history.json.

import fs from "node:fs";
import path from "node:path";

const DEFAULT_REPORT_PATH = "playwright/test-results/report.json";
const DEFAULT_HISTORY_PATH = "docs/data/playwright-history.json";
const DEFAULT_MAX_RUNS = 30;
const DEFAULT_WORKFLOW_URL =
  "https://github.com/MaartenKa/Portfolio/actions/workflows/playwright.yml";

/**
 * Leest een CLI-argument in de vorm `--naam=waarde`.
 *
 * @param {string} name - Argumentnaam zonder `--`.
 * @param {string} fallback - Waarde als het argument ontbreekt.
 * @returns {string} De gedecodeerde argumentwaarde of de fallback.
 */
function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((entry) => entry.startsWith(prefix));

  if (!arg) return fallback;

  return decodeURIComponent(arg.slice(prefix.length));
}

/**
 * Leest en parseert een JSON-bestand; geeft de fallback terug als lezen of
 * parsen mislukt.
 *
 * @param {string} filePath - Pad van het JSON-bestand.
 * @param {unknown} fallback - Waarde bij een ontbrekend of ongeldig bestand.
 * @returns {unknown} Het geparseerde JSON-object of de fallback.
 */
function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

/**
 * Schrijft data als geformatteerde JSON en maakt de doelmap zo nodig aan.
 *
 * @param {string} filePath - Pad van het JSON-bestand.
 * @param {unknown} data - Te schrijven data.
 * @returns {void}
 */
function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/**
 * Normaliseert een waarde naar een niet-negatief geheel getal.
 *
 * @param {unknown} value - Invoerwaarde.
 * @returns {number} Het genormaliseerde getal, of 0 bij ongeldige invoer.
 */
function normalizeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? Math.trunc(number) : 0;
}

/**
 * Normaliseert een pass-rate naar één decimaal binnen 0–100.
 *
 * @param {unknown} value - Invoerwaarde.
 * @returns {number} De genormaliseerde pass-rate, of 0 bij ongeldige invoer.
 */
function normalizePassRate(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.round(Math.min(100, Math.max(0, number)) * 10) / 10;
}

/**
 * Beperkt de conclusion tot de waarden die de site kent.
 *
 * @param {unknown} value - Conclusion uit het rapport of uit CI.
 * @returns {string} Een toegestane conclusion, anders "unknown".
 */
function normalizeConclusion(value) {
  const allowed = new Set([
    "success",
    "failure",
    "cancelled",
    "no-report",
    "unknown",
  ]);

  return allowed.has(value) ? value : "unknown";
}

/**
 * Beperkt het CI-event tot de waarden die de site kent.
 *
 * @param {unknown} value - Eventnaam uit de CI-omgeving.
 * @returns {string} Een toegestaan event, anders "unknown".
 */
function normalizeEvent(value) {
  const allowed = new Set([
    "schedule",
    "workflow_dispatch",
    "push",
    "pull_request",
    "repository_dispatch",
    "no-report",
    "unknown",
  ]);

  return allowed.has(value) ? value : "unknown";
}

/**
 * Bouwt de URL van de huidige CI-run; valt terug op de workflowpagina als de
 * GitHub-omgevingsvariabelen ontbreken.
 *
 * @returns {string} De run-URL of de workflow-URL.
 */
function buildRunUrl() {
  const server = process.env.GITHUB_SERVER_URL;
  const repository = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;

  if (!server || !repository || !runId) {
    return DEFAULT_WORKFLOW_URL;
  }

  return `${server.replace(/\/$/, "")}/${repository}/actions/runs/${runId}`;
}

/**
 * Bouwt één history-entry uit het Playwright-report en de CI-omgeving.
 *
 * @param {unknown} report - Geparseerd Playwright JSON-report.
 * @returns {object} De genormaliseerde history-entry.
 */
function buildEntry(report) {
  const stats = report?.stats ?? {};
  const expected = normalizeNumber(stats.expected);
  const flaky = normalizeNumber(stats.flaky);
  const failed = normalizeNumber(stats.unexpected);
  const skipped = normalizeNumber(stats.skipped);
  const total = expected + flaky + failed;
  const passed = expected + flaky;
  const passRate = total > 0 ? normalizePassRate((passed / total) * 100) : 0;
  // Een ontbrekend rapport telt als "no-report", niet als een geslaagde run.
  const hasReport = Boolean(report?.stats);

  return {
    runId: normalizeNumber(process.env.GITHUB_RUN_ID) || null,
    runNumber: normalizeNumber(process.env.GITHUB_RUN_NUMBER) || null,
    createdAt: new Date().toISOString(),
    event: normalizeEvent(process.env.GITHUB_EVENT_NAME),
    branch: process.env.GITHUB_REF_NAME || "main",
    commit: (process.env.GITHUB_SHA || "").slice(0, 7),
    conclusion: normalizeConclusion(
      process.env.CI_SUMMARY_STATUS || (hasReport ? "unknown" : "no-report"),
    ),
    total,
    passed,
    failed,
    flaky,
    skipped,
    passRate,
    durationMs: normalizeNumber(stats.duration),
    runUrl: buildRunUrl(),
  };
}

/**
 * Voegt een entry toe aan de historie en houdt alleen de nieuwste runs.
 *
 * @param {unknown} history - Bestaande historie.
 * @param {object} entry - Nieuwe history-entry.
 * @param {number} maxRuns - Maximale aantal runs in de historie.
 * @returns {object} De bijgewerkte historie.
 */
function mergeHistory(history, entry, maxRuns) {
  const runs = Array.isArray(history?.runs) ? history.runs : [];
  // Dezelfde runId wordt vervangen, zodat een rerun niet dubbel in de historie staat.
  const deduped = runs.filter((run) => run?.runId !== entry.runId);

  return {
    schemaVersion: 1,
    workflow: "playwright.yml",
    updated: entry.createdAt,
    runs: [entry, ...deduped].slice(0, maxRuns),
  };
}

// CLI-opties: --report, --history en --max; de defaults houden de
// standaard-CI-flow bruikbaar zonder extra parameters.
const reportPath = readArg("report", DEFAULT_REPORT_PATH);
const historyPath = readArg("history", DEFAULT_HISTORY_PATH);
const maxRuns = normalizeNumber(readArg("max", DEFAULT_MAX_RUNS)) || DEFAULT_MAX_RUNS;
const report = readJson(reportPath, null);
const history = readJson(historyPath, {
  schemaVersion: 1,
  workflow: "playwright.yml",
  updated: null,
  runs: [],
});
const entry = buildEntry(report);

writeJson(historyPath, mergeHistory(history, entry, maxRuns));