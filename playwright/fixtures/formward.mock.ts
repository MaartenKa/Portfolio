// Portfolio — playwright/fixtures/formward.mock.ts

import { Page, expect } from "@playwright/test";
import { FORMWARD_URL, THANK_YOU_PAGE } from "../utils/test-data";

/**
 * Geïsoleerde Formward-mock met registratie van requests.
 *
 * De route blijft actief zolang de test duurt. Een ongeldige submit mag geen
 * request veroorzaken; tests kunnen dat expliciet asserten.
 */
export class FormwardMock {
  private readonly requests: string[] = [];

  constructor(private readonly page: Page) {}

  async install(): Promise<void> {
    await this.page.route(FORMWARD_URL, async (route) => {
      this.requests.push(route.request().url());

      const redirectUrl = new URL(THANK_YOU_PAGE, this.page.url()).toString();

      await route.fulfill({
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    });
  }

  async expectRequestCount(count: number): Promise<void> {
    expect(
      this.requests,
      `Verwacht ${count} Formward-request(s), ontvangen ${this.requests.length}`,
    ).toHaveLength(count);
  }
}
