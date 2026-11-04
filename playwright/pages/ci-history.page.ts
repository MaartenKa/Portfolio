import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Playwright CI-history page (automation.html).
 *
 * De CI-kaarten worden client-side gevuld uit data/playwright-history.json.
 * Tests mocken die endpoint, zodat de verwachte cijfers vaststaan en niet
 * afhangen van wat er toevallig in de CI is gedraaid.
 */
export type HistoryRunFixture = {
  runId: number;
  runNumber: number;
  createdAt: string;
  conclusion: string;
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  passRate: number;
  runUrl: string;
};

const CI_HISTORY_ROUTE = "**/data/playwright-history.json";

export class CiHistoryPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Mockt de history-endpoint vóór het navigeren.
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

    // De body wordt altijd gerenderd: rijen of de placeholder-tekst.
    await expect(this.page.getByTestId("ci-history-body")).not.toBeEmpty();

    return this;
  }

  value(testId: string) {
    return this.page.getByTestId(testId);
  }

  historyRows() {
    return this.page.getByTestId("ci-history-body").locator("tr");
  }
}
