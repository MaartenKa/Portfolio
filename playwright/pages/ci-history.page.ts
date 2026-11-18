// Portfolio — playwright/pages/ci-history.page.ts
import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page object voor de CI-history op automation.html.
 *
 * De CI-kaarten worden client-side gevuld uit data/playwright-history.json.
 * Tests mocken die endpoint, zodat de verwachte cijfers vaststaan en niet
 * afhangen van wat er toevallig in de CI is gedraaid.
 */
/** Fixturevorm van één CI-history-run. */
export type HistoryRunFixture = {
  runId: number;
  runNumber: number | null;
  createdAt: string;
  conclusion: string;
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  passRate: number;
  runUrl: string;
  branch?: string;
  commit?: string;
  event?: string;
  skipped?: number;
  durationMs?: number;
};

const CI_HISTORY_ROUTE = "**/data/playwright-history.json";

export class CiHistoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Mockt de history-endpoint vóór het navigeren.
   *
   * @param runs - Fixture-runs die de endpoint moet teruggeven.
   * @returns Dit page object, zodat de mock en navigate() samenwerken.
   */
  async mockHistory(runs: HistoryRunFixture[]): Promise<CiHistoryPage> {
    const payload = {
      schemaVersion: 1,
      workflow: "playwright.yml",
      updated: runs.length > 0 ? runs[0].createdAt : null,
      runs,
    };

    await this.page.route(CI_HISTORY_ROUTE, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      }),
    );

    return this;
  }

  async navigate(): Promise<CiHistoryPage> {
    const response = await super.goto("automation.html");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(this.page).toHaveTitle(/Test Automatisering/);

    // De body wordt altijd gerenderd: met rijen of met de placeholdertekst.
    await expect(this.page.getByTestId("ci-history-body")).not.toBeEmpty();

    return this;
  }

  /** Wrapper rond getByTestId voor de CI-kaarten en de CI-tabel. */
  value(testId: string) {
    return this.page.getByTestId(testId);
  }

  /** Rijen in de CI-history-tabel. */
  historyRows() {
    return this.page.getByTestId("ci-history-body").getByRole("row");
  }
}
