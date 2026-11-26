// Portfolio — playwright/tests/unit/ci-summary.spec.ts
//
// CIH-06 — datasuite op de producer van de CI-history (TESTPLAN.md §8.5,
// PLAN-CI-HISTORY-TESTS.md §7 fase B, PLAYWRIGHT.md §5 categorie 6). De suite is
// browserloos: geen `page`-fixture, geen browserlaunch, geen baseURL. Elke test
// bouwt een eigen map in de temp-dir, zodat de echte
// `docs/data/playwright-history.json` nooit wordt aangeraakt. De cases komen uit
// de formatieve lijst van PLAN-CI-HISTORY-TESTS.md §7: formules, rounding,
// `total = 0`, ontbrekend rapport, `CI_SUMMARY_STATUS`-normalisatie, dedup op
// `runId`, `--max` en de decoding van de CLI-argumenten.
//
// De tests zijn deterministisch: vaste CI-omgevingsvariabelen per run, vaste
// statistieken per rapport, en geen netwerk.

import { spawnSync } from "node:child_process";
import type { SpawnSyncReturns } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";

/** De map van de repo: de producer werkt met relatieve paden vanuit de root.
 * De spec ligt in `playwright/tests/unit`, dus drie niveau's omhoog. */
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

/** De valback van de producer als de CI-omgevingsvariabelen ontbreken. */
const WORKFLOW_URL =
  "https://github.com/MaartenKa/Portfolio/actions/workflows/playwright.yml";

/** Eén history-entry, zoals de producer die in de historie schrijft. */
type HistoryEntry = {
  runId: number | null;
  runNumber: number | null;
  createdAt: string;
  event: string;
  branch: string;
  commit: string;
  conclusion: string;
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  passRate: number;
  durationMs: number;
  runUrl: string;
};

/** Het historiebestand dat de producer schrijft en de site leest. */
type HistoryFile = {
  schemaVersion: number;
  workflow: string;
  updated: string | null;
  runs: HistoryEntry[];
};

/** De statistiek van één run, zoals het Playwright JSON-rapport die bevat. De
 * waarden kunnen als tekst in het rapport staan: de producer normaliseert ze. */
type ReportStats = {
  expected?: number | string;
  flaky?: number | string;
  unexpected?: number | string;
  skipped?: number | string;
  duration?: number | string;
};

/**
 * Maakt een vaste entry voor de voorgelezen historie van een test.
 *
 * @param runId - runId van de entry; ook de run van die oude CI-run.
 * @param overrides - de cijfers en de status van die oude run.
 * @returns Een complete history-entry.
 */
const oldRun = (
  runId: number,
  overrides: Partial<HistoryEntry> = {},
): HistoryEntry => ({
  runId,
  runNumber: runId,
  createdAt: "2026-11-20T10:00:00.000Z",
  event: "push",
  branch: "main",
  commit: "abc1234",
  conclusion: "success",
  total: 10,
  passed: 10,
  failed: 0,
  flaky: 0,
  skipped: 0,
  passRate: 100,
  durationMs: 1000,
  runUrl: `https://github.com/MaartenKa/Portfolio/actions/runs/${runId}`,
  ...overrides,
});

/**
 * De vaste CI-omgeving van één run, zodat de entry niet van de machine afhangt.
 *
 * @param runId - de runId die de producer als dedup-sleutel gebruikt.
 * @param extra - omgevingsvariabelen bovenop de vaste set, zoals de status.
 * @returns De omgeving voor de kinderprocess.
 */
const ciEnv = (
  runId: string,
  extra: Record<string, string> = {},
): Record<string, string> => ({
  GITHUB_SERVER_URL: "https://github.com",
  GITHUB_REPOSITORY: "MaartenKa/Portfolio",
  GITHUB_RUN_ID: runId,
  GITHUB_RUN_NUMBER: "42",
  GITHUB_EVENT_NAME: "workflow_dispatch",
  GITHUB_REF_NAME: "main",
  GITHUB_SHA: "0123456789abcdef",
  ...extra,
});

/**
 * Een verse map in de temp-dir: de tests delen niets met elkaar en schrijven
 * nooit in de repo.
 *
 * @returns Het pad van de nieuwe temp-map.
 */
const makeTempDir = (): string =>
  fs.mkdtempSync(path.join(os.tmpdir(), "cih06-"));

/**
 * Ruimt de temp-map van de test op, zodat de suite geen vuil achterlaat.
 *
 * @param dir - de temp-map van de test.
 */
const cleanup = (dir: string): void =>
  fs.rmSync(dir, { recursive: true, force: true });

/**
 * Schrijft een Playwright-achtig JSON-rapport met de statistiek van één run.
 *
 * @param file - pad van het rapport in de temp-map.
 * @param stats - de statistiek van de run.
 */
const writeReport = (file: string, stats: ReportStats): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ stats }), "utf8");
};

/**
 * Schrijft de bestaande historie: de state vóór de run van de producer, voor de
 * dedup- en `--max`-cases.
 *
 * @param file - pad van de historie in de temp-map.
 * @param runs - de runs die er al staan, nieuwste vooraan.
 */
const writeHistory = (file: string, runs: HistoryEntry[]): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        schemaVersion: 1,
        workflow: "playwright.yml",
        updated: "2026-11-20T10:00:00.000Z",
        runs,
      },
      null,
      2,
    ),
    "utf8",
  );
};

/**
 * Leest de geschreven historie als getypeerd bestand.
 *
 * @param file - pad van de historie in de temp-map.
 * @returns De historie met de entries in de volgorde van het bestand.
 */
const readHistory = (file: string): HistoryFile =>
  JSON.parse(fs.readFileSync(file, "utf8")) as HistoryFile;

/**
 * Draait de producer met een vaste CI-omgeving. De paden gaan URI-gecodeerd
 * mee, zoals in de CI-workflow, zodat de decoding van de CLI-argumenten
 * telkens wordt geoefend.
 *
 * @param options - report- en history-pad (temp-map), optioneel `--max`, en de
 * omgeving van de run.
 * @returns Het resultaat van de kinderprocess.
 */
const runSummary = (options: {
  report?: string;
  history: string;
  max?: string;
  env?: Record<string, string>;
}): SpawnSyncReturns<Buffer> => {
  const args = ["scripts/ci-summary.mjs"];

  if (options.report !== undefined) {
    args.push(`--report=${encodeURIComponent(options.report)}`);
  }

  args.push(`--history=${encodeURIComponent(options.history)}`);

  if (options.max !== undefined) {
    args.push(`--max=${options.max}`);
  }

  return spawnSync(process.execPath, args, {
    cwd: REPO_ROOT,
    env: options.env,
  });
};


test.describe("CIH-06 — de producer van de CI-history", () => {
  test("CIH-06a buildEntry-berekeningen uit het Playwright-rapport", () => {
    const dir = makeTempDir();
    const report = path.join(dir, "report.json");
    const history = path.join(dir, "nested", "playwright-history.json");

    writeReport(report, {
      expected: 36,
      flaky: 2,
      unexpected: 3,
      skipped: 1,
      duration: 34903,
    });

    const result = runSummary({ report, history, env: ciEnv("1234567890") });
    expect(result.status).toBe(0);

    const file = readHistory(history);
    const latest = file.runs[0];

    // 36 expected + 2 flaky = 41 tests die meetellen in de noemer, en 3 die
    // faalden. De skipped-test telt niet mee: 38 van 41 is 92.7%.
    expect(file.schemaVersion).toBe(1);
    expect(file.workflow).toBe("playwright.yml");
    expect(file.updated).toBe(latest.createdAt);
    expect(latest.total).toBe(41);
    expect(latest.passed).toBe(38);
    expect(latest.failed).toBe(3);
    expect(latest.flaky).toBe(2);
    expect(latest.skipped).toBe(1);
    expect(latest.passRate).toBe(92.7);
    expect(latest.durationMs).toBe(34903);
    expect(latest.runId).toBe(1234567890);
    expect(latest.runNumber).toBe(42);
    expect(latest.event).toBe("workflow_dispatch");
    expect(latest.branch).toBe("main");
    expect(latest.commit).toBe("0123456");
    // Zonder CI_SUMMARY_STATUS kent de producer de uitslag van de run niet: een
    // rapport is geen geslaagde run, dus `unknown` en niet `success`.
    expect(latest.conclusion).toBe("unknown");
    expect(latest.runUrl).toBe(
      "https://github.com/MaartenKa/Portfolio/actions/runs/1234567890",
    );

    cleanup(dir);
  });

  test("CIH-06b passRate rondt op één decimaal en blijft binnen 0 tot 100", () => {
    const dir = makeTempDir();
    const report = path.join(dir, "report.json");
    const history = path.join(dir, "playwright-history.json");

    // 2 van 3 geslaagd: 66.666…% wordt 66.7 — één decimaal, geen 66.66.
    writeReport(report, { expected: 2, flaky: 0, unexpected: 1 });
    expect(runSummary({ report, history, env: ciEnv("1001") }).status).toBe(0);

    // Een schone run: de pass-rate raakt 100 en komt er niet boven.
    writeReport(report, { expected: 1, flaky: 0, unexpected: 0 });
    expect(runSummary({ report, history, env: ciEnv("1002") }).status).toBe(0);

    const file = readHistory(history);
    expect(file.runs).toHaveLength(2);
    expect(file.runs[0].passRate).toBe(100);
    expect(file.runs[1].passRate).toBe(66.7);

    cleanup(dir);
  });

  test("CIH-06c total van nul en ongeldige getallen worden genormaliseerd", () => {
    const dir = makeTempDir();
    const report = path.join(dir, "report.json");
    const history = path.join(dir, "playwright-history.json");

    // De status komt uit CI_SUMMARY_STATUS, niet uit het rapport zelf.
    writeReport(report, {
      expected: 0,
      flaky: 0,
      unexpected: 0,
      skipped: 0,
      duration: 0,
    });
    const zero = runSummary({
      report,
      history,
      env: ciEnv("2001", { CI_SUMMARY_STATUS: "success" }),
    });
    expect(zero.status).toBe(0);

    // Negatief, niet-getal en kommagetal: afgekapt, niet-negatief, geen NaN.
    writeReport(report, {
      expected: -5,
      flaky: "abc",
      unexpected: 2.9,
      skipped: 0,
      duration: 1000,
    });
    expect(
      runSummary({
        report,
        history,
        env: ciEnv("2002", { CI_SUMMARY_STATUS: "failure" }),
      }).status,
    ).toBe(0);

    const file = readHistory(history);
    const zeroRun = file.runs[1];
    const normalized = file.runs[0];

    expect(zeroRun.total).toBe(0);
    expect(zeroRun.passRate).toBe(0);
    expect(zeroRun.conclusion).toBe("success");

    // expected -5 wordt 0, flaky "abc" wordt 0, unexpected 2.9 wordt 2: dus 2
    // tests in de noemer, 0 geslaagd, dus 0%.
    expect(normalized.total).toBe(2);
    expect(normalized.passed).toBe(0);
    expect(normalized.failed).toBe(2);
    expect(normalized.passRate).toBe(0);
    expect(normalized.conclusion).toBe("failure");

    cleanup(dir);
  });

  test("CIH-06d ontbrekend rapport geeft no-report en niet success", () => {
    const dir = makeTempDir();
    // Een rapport dat er niet is: de producer moet dat als defect herkennen,
    // anders krijgt de site een lege run die als geslaagd lijkt. Het pad staat
    // in de temp-map, dus de echte suite-rapporten in de repo doen er niet toe.
    const report = path.join(dir, "report.json");
    const history = path.join(dir, "playwright-history.json");

    const result = runSummary({ report, history, env: ciEnv("3001") });
    expect(result.status).toBe(0);

    const latest = readHistory(history).runs[0];
    expect(latest.conclusion).toBe("no-report");
    expect(latest.total).toBe(0);
    expect(latest.passed).toBe(0);
    expect(latest.passRate).toBe(0);

    cleanup(dir);
  });


  test("CIH-06e CI_SUMMARY_STATUS wordt genormaliseerd naar de site-waarden", () => {
    const dir = makeTempDir();
    const report = path.join(dir, "report.json");
    const history = path.join(dir, "playwright-history.json");

    writeReport(report, { expected: 5, flaky: 0, unexpected: 0 });

    // Een echte CI-status, dan een waarde die de site niet kent: die mag niet
    // als status op de kaarten verschijnen.
    expect(
      runSummary({
        report,
        history,
        env: ciEnv("4001", { CI_SUMMARY_STATUS: "cancelled" }),
      }).status,
    ).toBe(0);
    expect(
      runSummary({
        report,
        history,
        env: ciEnv("4002", { CI_SUMMARY_STATUS: "succes" }),
      }).status,
    ).toBe(0);

    const file = readHistory(history);
    expect(file.runs[0].conclusion).toBe("unknown");
    expect(file.runs[1].conclusion).toBe("cancelled");
    expect(file.runs[0].total).toBe(5);
    expect(file.runs[0].runNumber).toBe(42);
    expect(file.runs[0].event).toBe("workflow_dispatch");

    cleanup(dir);
  });

  test("CIH-06f dedup op runId vervangt de bestaande entry", () => {
    const dir = makeTempDir();
    const report = path.join(dir, "report.json");
    const history = path.join(dir, "playwright-history.json");

    // Run 12 staat al in de historie: een rerun van diezelfde run mag niet
    // dubbel in de geschiedenis komen.
    writeHistory(history, [
      oldRun(13, { total: 130, passed: 128, failed: 2, passRate: 98.5 }),
      oldRun(12, { total: 131, passed: 131, failed: 0, passRate: 100 }),
      oldRun(11, { total: 120, passed: 110, failed: 10, passRate: 91.7 }),
    ]);

    writeReport(report, { expected: 139, flaky: 0, unexpected: 0 });

    const result = runSummary({ report, history, env: ciEnv("12") });
    expect(result.status).toBe(0);

    const file = readHistory(history);

    // De nieuwe entry staat vooraan, de oude copy van run 12 is vervangen, en
    // de andere runs blijven staan.
    expect(file.runs).toHaveLength(3);
    expect(file.runs.map((run) => run.runId)).toEqual([12, 13, 11]);
    expect(file.runs[0].total).toBe(139);
    expect(file.updated).toBe(file.runs[0].createdAt);

    cleanup(dir);
  });

  test("CIH-06g --max kapt de historie bij op de nieuwe entry plus het maximum", () => {
    const dir = makeTempDir();
    const report = path.join(dir, "report.json");
    const history = path.join(dir, "playwright-history.json");

    // De bestaande historie, nieuwste vooraan: `--max=2` houdt de nieuwe entry
    // plus de oudste uit het begin van de lijst — in de geschiedenis-conventie
    // de tweede nieuwste — en kapt de rest af.
    writeHistory(history, [25, 24, 23, 22, 21].map((runId) => oldRun(runId)));

    writeReport(report, { expected: 139, flaky: 0, unexpected: 0 });

    const result = runSummary({
      report,
      history,
      max: "2",
      env: ciEnv("26"),
    });
    expect(result.status).toBe(0);

    const file = readHistory(history);

    // De nieuwe entry plus de nieuwste oude run; de rest druipt af. De
    // schema- en workflowvelden blijven intact, en `updated` volgt de nieuwe
    // entry.
    expect(file.runs).toHaveLength(2);
    expect(file.runs.map((run) => run.runId)).toEqual([26, 25]);
    expect(file.schemaVersion).toBe(1);
    expect(file.workflow).toBe("playwright.yml");
    expect(file.updated).toBe(file.runs[0].createdAt);

    cleanup(dir);
  });

  test("CIH-06h CLI-argumenten decoderen en de run-URL bouwen uit de CI-omgeving", () => {
    const dir = makeTempDir();
    // Een rapportnaam met een spatie en een history in een geneste map: de
    // decodering van de argumenten moet beide paden intact houden.
    const report = path.join(dir, "rapport rapport.json");
    const history = path.join(dir, "nested", "playwright-history.json");

    writeReport(report, { expected: 5, flaky: 0, unexpected: 0 });

    expect(
      runSummary({ report, history, env: ciEnv("88") }).status,
    ).toBe(0);

    // Een server-URL met afsluitende slash mag geen dubbele slash in de run-URL
    // opleveren.
    expect(
      runSummary({
        report,
        history,
        env: ciEnv("89", { GITHUB_SERVER_URL: "https://github.com/" }),
      }).status,
    ).toBe(0);

    // Zonder CI-omgevingsvariabelen: de producer valt terug op de workflowpagina
    // en op de eigen defaults, zonder te crashen.
    expect(runSummary({ report, history, env: {} }).status).toBe(0);

    expect(fs.existsSync(history)).toBe(true);

    const file = readHistory(history);
    const fallbackRun = file.runs[0];

    expect(fallbackRun.runUrl).toBe(WORKFLOW_URL);
    expect(fallbackRun.runId).toBeNull();
    expect(fallbackRun.runNumber).toBeNull();
    expect(fallbackRun.branch).toBe("main");
    expect(fallbackRun.commit).toBe("");
    expect(fallbackRun.event).toBe("unknown");
    expect(fallbackRun.conclusion).toBe("unknown");

    expect(file.runs[1].runUrl).toBe(
      "https://github.com/MaartenKa/Portfolio/actions/runs/89",
    );
    expect(file.runs[2].runUrl).toBe(
      "https://github.com/MaartenKa/Portfolio/actions/runs/88",
    );

    cleanup(dir);
  });
});

