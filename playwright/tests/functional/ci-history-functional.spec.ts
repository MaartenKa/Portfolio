import { test, expect } from "@playwright/test";
import {
  CiHistoryPage,
  HistoryRunFixture,
} from "../../pages/ci-history.page";

const RUN_URL = "https://github.com/MaartenKa/Portfolio/actions/runs/41424673096";

const run = (overrides: Partial<HistoryRunFixture>): HistoryRunFixture => ({
  runId: 41424673096,
  runNumber: 42,
  createdAt: "2026-11-02T18:18:00.000Z",
  conclusion: "success",
  total: 40,
  passed: 40,
  failed: 0,
  flaky: 0,
  passRate: 100,
  runUrl: RUN_URL,
  ...overrides,
});

// Nieuwste run eerst: ci-summary.mjs zet de nieuwe entry vooraan.
const threeRuns: HistoryRunFixture[] = [
  run({
    runId: 3,
    runNumber: 42,
    createdAt: "2026-11-02T18:18:00.000Z",
    conclusion: "success",
    total: 40,
    passed: 40,
    failed: 0,
    flaky: 0,
    passRate: 100,
  }),
  run({
    runId: 2,
    runNumber: 41,
    createdAt: "2026-11-01T18:18:00.000Z",
    conclusion: "failure",
    total: 40,
    passed: 38,
    failed: 2,
    flaky: 1,
    passRate: 95,
  }),
  run({
    runId: 1,
    runNumber: 40,
    createdAt: "2026-10-31T18:18:00.000Z",
    conclusion: "failure",
    total: 40,
    passed: 30,
    failed: 10,
    flaky: 0,
    passRate: 75,
  }),
];

test.describe("CI-resultaten - kaarten en geschiedenis", () => {
  let ci: CiHistoryPage;

  test.beforeEach(async ({ page }) => {
    ci = new CiHistoryPage(page);
  });

  test("laatste-run kaarten tonen de nieuwste CI-run", async () => {
    await ci.mockHistory(threeRuns);
    await ci.navigate();

    await expect(ci.value("ci-suite-size")).toHaveText("40 tests");
    await expect(ci.value("ci-runs")).toHaveText("3");
    await expect(ci.value("ci-total-tests")).toHaveText("40");
    await expect(ci.value("ci-pass-rate")).toHaveText("100%");
    await expect(ci.value("ci-status")).toHaveText("Geslaagd");
  });

  test("aggregate kaarten poolen alle runs en de ratio is Σ passed / Σ total", async () => {
    await ci.mockHistory(threeRuns);
    await ci.navigate();

    // 40 + 40 + 40 uitgevoerde tests, 40 + 38 + 30 geslaagde tests.
    await expect(ci.value("ci-total-executed")).toHaveText("120");
    await expect(ci.value("ci-total-passed")).toHaveText("108 van 120");
    await expect(ci.value("ci-pass-ratio")).toHaveText("90%");
    await expect(ci.value("ci-streak")).toHaveText("1");
    await expect(ci.value("ci-flaky-runs")).toHaveText("1");
    await expect(ci.value("ci-failed-runs")).toHaveText("2");

    await expect(ci.value("ci-metrics-note")).toContainText("Over 3 CI-runs");
    await expect(ci.value("ci-metrics-note")).toContainText(
      "108 van 120 tests geslaagd.",
    );
  });

  test("geschiedenis toont een rij per run met een werkende run-link", async () => {
    await ci.mockHistory(threeRuns);
    await ci.navigate();

    await expect(ci.historyRows()).toHaveCount(3);
    await expect(
      ci.value("ci-history-body").getByRole("link", { name: "Run 42" }),
    ).toHaveAttribute("href", RUN_URL);
  });

  test("runs zonder noemer worden uitgesloten van de totalen", async () => {
    const withCancelled: HistoryRunFixture[] = [
      run({
        runId: 4,
        runNumber: 43,
        createdAt: "2026-11-03T18:18:00.000Z",
        conclusion: "cancelled",
        total: 0,
        passed: 0,
        failed: 0,
        flaky: 0,
        passRate: 0,
      }),
      run({
        runId: 2,
        runNumber: 41,
        createdAt: "2026-11-01T18:18:00.000Z",
        conclusion: "success",
        total: 40,
        passed: 38,
        failed: 0,
        flaky: 0,
        passRate: 95,
      }),
      run({
        runId: 1,
        runNumber: 40,
        createdAt: "2026-10-31T18:18:00.000Z",
        conclusion: "success",
        total: 40,
        passed: 34,
        failed: 0,
        flaky: 0,
        passRate: 85,
      }),
    ];

    await ci.mockHistory(withCancelled);
    await ci.navigate();

    // Alleen de twee runs met total > 0 tellen mee: 72 van 80 = 90%.
    await expect(ci.value("ci-total-executed")).toHaveText("80");
    await expect(ci.value("ci-total-passed")).toHaveText("72 van 80");
    await expect(ci.value("ci-pass-ratio")).toHaveText("90%");
    await expect(ci.value("ci-streak")).toHaveText("0");
    await expect(ci.value("ci-status")).toHaveText("Geannuleerd");

    await expect(ci.value("ci-metrics-note")).toContainText(
      "2 van 3 CI-runs geteld",
    );
  });

  test("lege geschiedenis toont placeholders en de placeholder-rij", async () => {
    await ci.mockHistory([]);
    await ci.navigate();

    for (const testId of [
      "ci-suite-size",
      "ci-runs",
      "ci-total-tests",
      "ci-pass-rate",
      "ci-status",
      "ci-total-executed",
      "ci-total-passed",
      "ci-pass-ratio",
      "ci-streak",
      "ci-flaky-runs",
      "ci-failed-runs",
    ]) {
      await expect(ci.value(testId)).toHaveText("—");
    }

    await expect(ci.value("ci-history-body")).toContainText(
      "Geen CI-historie beschikbaar.",
    );
    await expect(ci.value("ci-metrics-note")).toContainText(
      "Σ geslaagde tests",
    );
  });
});
