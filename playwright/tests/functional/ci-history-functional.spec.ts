import { expect, test } from "../../fixtures/test-fixtures";
import type { HistoryRunFixture } from "../../pages/ci-history.page";

const RUN_URL =
  "https://github.com/MaartenKa/Portfolio/actions/runs/41424673096";

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
  suiteTests: 40,
  ...overrides,
});

// De nieuwste run staat vooraan; ci-summary.mjs voegt nieuwe entries vooraan toe.
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
  test("laatste-run kaarten tonen de nieuwste CI-run", async ({
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory(threeRuns);
    await ciHistoryPage.navigate();

    await expect(ciHistoryPage.value("ci-suite-size")).toHaveText("40 tests");
    await expect(ciHistoryPage.value("ci-runs")).toHaveText("3");
    await expect(ciHistoryPage.value("ci-total-tests")).toHaveText("40");
    await expect(ciHistoryPage.value("ci-pass-rate")).toHaveText("100%");
    await expect(ciHistoryPage.value("ci-status")).toHaveText("Geslaagd");
  });

  test("aggregate kaarten poolen alle runs en de ratio is Σ passed / Σ total", async ({
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory(threeRuns);
    await ciHistoryPage.navigate();

    // 40 + 40 + 40 uitgevoerde tests, 40 + 38 + 30 geslaagde tests.
    await expect(ciHistoryPage.value("ci-total-executed")).toHaveText("120");
    await expect(ciHistoryPage.value("ci-total-passed")).toHaveText(
      "108 van 120",
    );
    await expect(ciHistoryPage.value("ci-pass-ratio")).toHaveText("90%");
    await expect(ciHistoryPage.value("ci-streak")).toHaveText("1");
    await expect(ciHistoryPage.value("ci-flaky-runs")).toHaveText("1");
    await expect(ciHistoryPage.value("ci-failed-runs")).toHaveText("2");

    await expect(ciHistoryPage.value("ci-metrics-note")).toContainText(
      "Over 3 CI-runs",
    );
    await expect(ciHistoryPage.value("ci-metrics-note")).toContainText(
      "108 van 120 tests geslaagd.",
    );
  });

  test("geschiedenis toont een rij per run met een werkende run-link", async ({
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory(threeRuns);
    await ciHistoryPage.navigate();

    const rows = ciHistoryPage.historyRows();
    await expect(rows).toHaveCount(3);

    const expectedRows = [
      { run: "Run 42", status: "Geslaagd", total: "40", pass: "100%", flaky: "0" },
      { run: "Run 41", status: "Gefaald", total: "40", pass: "95%", flaky: "1" },
      { run: "Run 40", status: "Gefaald", total: "40", pass: "75%", flaky: "0" },
    ];

    for (let index = 0; index < expectedRows.length; index += 1) {
      const cells = rows.nth(index).getByRole("cell");
      const expected = expectedRows[index];

      await expect(cells.nth(0)).toContainText(expected.run);
      await expect(cells.nth(1)).toHaveText(/\d{1,2} [a-z]+ 2026, \d{2}:\d{2}/);
      await expect(cells.nth(2)).toHaveText(expected.status);
      await expect(cells.nth(3)).toHaveText(expected.total);
      await expect(cells.nth(4)).toHaveText(expected.pass);
      await expect(cells.nth(5)).toHaveText(expected.flaky);
    }

    await expect(
      ciHistoryPage
        .value("ci-history-body")
        .getByRole("link", { name: "Run 42" }),
    ).toHaveAttribute("href", RUN_URL);
  });

  test("runs zonder noemer worden uitgesloten van de totalen", async ({
    ciHistoryPage,
  }) => {
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

    await ciHistoryPage.mockHistory(withCancelled);
    await ciHistoryPage.navigate();

    // Alleen de twee runs met `total > 0` tellen mee: 72 van 80 = 90%.
    await expect(ciHistoryPage.value("ci-total-executed")).toHaveText("80");
    await expect(ciHistoryPage.value("ci-total-passed")).toHaveText(
      "72 van 80",
    );
    await expect(ciHistoryPage.value("ci-pass-ratio")).toHaveText("90%");
    await expect(ciHistoryPage.value("ci-streak")).toHaveText("0");
    await expect(ciHistoryPage.value("ci-status")).toHaveText("Geannuleerd");

    await expect(ciHistoryPage.value("ci-metrics-note")).toContainText(
      "2 van 3 CI-runs geteld",
    );
  });

  test("lege geschiedenis toont placeholders en de placeholder-rij", async ({
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory([]);
    await ciHistoryPage.navigate();

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
      await expect(ciHistoryPage.value(testId)).toHaveText("—");
    }

    await expect(ciHistoryPage.value("ci-history-body")).toContainText(
      "Geen CI-historie beschikbaar.",
    );
    await expect(ciHistoryPage.value("ci-metrics-note")).toContainText(
      "Σ geslaagde tests",
    );
  });

  test("CIH-07a: suiteTests vult de suite-omvang", async ({ ciHistoryPage }) => {
    const suiteRuns: HistoryRunFixture[] = [
      run({
        runId: 6,
        runNumber: 74,
        createdAt: "2026-11-28T18:18:00.000Z",
        total: 145,
        passed: 145,
        failed: 0,
        flaky: 0,
        passRate: 100,
        suiteTests: 145,
      }),
      run({
        runId: 5,
        runNumber: 73,
        createdAt: "2026-11-27T18:18:00.000Z",
        total: 139,
        passed: 139,
        failed: 0,
        flaky: 0,
        passRate: 100,
        suiteTests: 139,
      }),
    ];

    await ciHistoryPage.mockHistory(suiteRuns);
    await ciHistoryPage.navigate();

    // De kaart toont de suite-omvang uit de nieuwste entry, niet de grootste total
    // uit het hele venster. De aggregate-kaarten blijven wel de gepoolde totalen.
    await expect(ciHistoryPage.value("ci-suite-size")).toHaveText("145 tests");
    await expect(ciHistoryPage.value("ci-runs")).toHaveText("2");
    await expect(ciHistoryPage.value("ci-total-tests")).toHaveText("145");
    await expect(ciHistoryPage.value("ci-total-executed")).toHaveText("284");
    await expect(ciHistoryPage.value("ci-total-passed")).toHaveText(
      "284 van 284",
    );
    await expect(ciHistoryPage.value("ci-pass-ratio")).toHaveText("100%");
    await expect(ciHistoryPage.value("ci-streak")).toHaveText("2");
  });

  test("CIH-07b: entries zonder suiteTests vallen terug op max(total)", async ({
    ciHistoryPage,
  }) => {
    const legacyRuns: HistoryRunFixture[] = [
      run({
        runId: 7,
        runNumber: 73,
        createdAt: "2026-11-27T18:18:00.000Z",
        total: 139,
        passed: 139,
        failed: 0,
        flaky: 0,
        passRate: 100,
        suiteTests: undefined,
      }),
      run({
        runId: 6,
        runNumber: 72,
        createdAt: "2026-11-26T18:18:00.000Z",
        total: 145,
        passed: 145,
        failed: 0,
        flaky: 0,
        passRate: 100,
        suiteTests: undefined,
      }),
    ];

    await ciHistoryPage.mockHistory(legacyRuns);
    await ciHistoryPage.navigate();

    // Schema v1-entries hebben geen suiteTests. De UI blijft dan werken op de
    // proxy max(total), zodat oude geschiedenissen niet leeg of placeholders tonen.
    await expect(ciHistoryPage.value("ci-suite-size")).toHaveText("145 tests");
    await expect(ciHistoryPage.value("ci-runs")).toHaveText("2");
    await expect(ciHistoryPage.value("ci-total-tests")).toHaveText("139");
    await expect(ciHistoryPage.value("ci-total-executed")).toHaveText("284");
  });
});
