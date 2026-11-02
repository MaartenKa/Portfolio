import fs from "node:fs";
import path from "node:path";

const DEFAULT_REPORT_PATH = "playwright/test-results/report.json";
const DEFAULT_HISTORY_PATH = "docs/data/playwright-history.json";
const DEFAULT_MAX_RUNS = 30;
const DEFAULT_WORKFLOW_URL =
  "https://github.com/MaartenKa/Portfolio/actions/workflows/playwright.yml";

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((entry) => entry.startsWith(prefix));

  if (!arg) return fallback;

  return decodeURIComponent(arg.slice(prefix.length));
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) && number >= 0 ? Math.trunc(number) : 0;
}

function normalizePassRate(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.round(Math.min(100, Math.max(0, number)) * 10) / 10;
}

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

function buildRunUrl() {
  const server = process.env.GITHUB_SERVER_URL;
  const repository = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;

  if (!server || !repository || !runId) {
    return DEFAULT_WORKFLOW_URL;
  }

  return `${server.replace(/\/$/, "")}/${repository}/actions/runs/${runId}`;
}

function buildEntry(report) {
  const stats = report?.stats ?? {};
  const expected = normalizeNumber(stats.expected);
  const flaky = normalizeNumber(stats.flaky);
  const failed = normalizeNumber(stats.unexpected);
  const skipped = normalizeNumber(stats.skipped);
  const total = expected + flaky + failed;
  const passed = expected + flaky;
  const passRate = total > 0 ? normalizePassRate((passed / total) * 100) : 0;
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

function mergeHistory(history, entry, maxRuns) {
  const runs = Array.isArray(history?.runs) ? history.runs : [];
  const deduped = runs.filter((run) => run?.runId !== entry.runId);

  return {
    schemaVersion: 1,
    workflow: "playwright.yml",
    updated: entry.createdAt,
    runs: [entry, ...deduped].slice(0, maxRuns),
  };
}

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