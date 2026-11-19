// Portfolio — playwright/pages/home.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/** Testids van de card-links op de homepage (NAV-03). */
export const CARD_LINK_TEST_IDS = [
  "card-link-testing",
  "card-link-automation",
  "card-link-projects",
] as const;

/** Mapping van card-link-testid naar de verwachte URL. */
export const CARD_LINK_URLS: Record<string, RegExp> = {
  "card-link-testing": /testing\.html/,
  "card-link-automation": /automation\.html/,
  "card-link-projects": /projects\.html/,
};

/** Page object voor de homepage en de belangrijkste navigatie-CTA's. */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<HomePage> {
    const response = await super.goto("");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(this.page).toHaveTitle(/Maarten Kamps/);
    return this;
  }

  async expectStructureVisible() {
    // Semantische locators op basis van de bestaande toegankelijke namen:
    // - <nav class="navbar" aria-label="Hoofdnavigatie">
    // - <section class="hero" aria-label="Intro">: een benoemde section heeft
    //   role "region"
    // - <footer class="footer">: landmark role "contentinfo"
    await expect(this.page.getByRole("navigation", { name: "Hoofdnavigatie" })).toBeVisible();
    await expect(this.page.getByRole("region", { name: "Intro" })).toBeVisible();
    await expect(this.page.getByRole("contentinfo")).toBeVisible();
  }

  // Functionele navigatie: gebruikersgedrag.

  async clickProjectsCta() {
    await this.page.getByTestId("cta-projects").click();
    await expect(this.page).toHaveURL(/projects\.html/);
  }

  async clickCurriculumCta() {
    await this.page.getByTestId("cta-curriculum").click();
    await expect(this.page).toHaveURL(/curriculum\.html/);
  }

  /**
   * Klik op een card-link en controleer de bestemming.
   *
   * @param testId - data-testid van de card-link.
   * @param expectedUrl - Regex waarmee de target-URL moet matchen.
   */
  async clickCardLink(testId: string, expectedUrl: RegExp) {
    await this.page.getByTestId(testId).click();
    await expect(this.page).toHaveURL(expectedUrl);
  }
}
