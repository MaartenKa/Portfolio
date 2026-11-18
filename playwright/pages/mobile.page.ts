// Portfolio — playwright/pages/mobile.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

// data-testid's van de nav-links in de lijst met data-testid="nav-links"
// (dezelfde lijst staat op elke pagina).
export const NAV_ITEM_TEST_IDS = [
  "nav-home",
  "nav-curriculum",
  "nav-testing",
  "nav-automation",
  "nav-projects",
  "nav-personal",
  "nav-contact",
] as const;

/** Mapping van nav-link-testid naar de verwachte URL-regex. */
export const NAV_ITEM_URLS: Record<string, RegExp> = {
  "nav-home": /index\.html$/,
  "nav-curriculum": /curriculum\.html/,
  "nav-testing": /testing\.html/,
  "nav-automation": /automation\.html/,
  "nav-projects": /projects\.html/,
  "nav-personal": /personal\.html/,
  "nav-contact": /contact\.html/,
};

/**
 * NavigationPage hergebruikt de globale navigatiebalk (header) die op elk
 * onderdeel van de site dezelfde DOM en selectors heeft: de testids
 * `menu-toggle` en `nav-links`. Het page object is dus niet pagina-specifiek,
 * maar vertegenwoordigt een gedeelde component.
 */

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators (centraal in dit page object).
  get menuToggle() {
    return this.page.getByTestId("menu-toggle");
  }

  get navLinks() {
    // De <ul> heeft geen accessible name en role "list" is niet uniek op de
    // pagina; de class-toggle-assertie (.open) vereist daarom een eigen testid
    // in de markup volgens het testid-contract (PLAYWRIGHT.md §8):
    // data-testid="nav-links".
    return this.page.getByTestId("nav-links");
  }

  get navItems() {
    return this.navLinks.getByRole("link");
  }

  get firstNavLink() {
    return this.navItems.first();
  }

  /** Klik op een element buiten het menu om de click-outside-handler te testen. */
  async clickOutsideMenu() {
    await this.page.getByRole("contentinfo").click({ position: { x: 5, y: 5 } });
  }

  /** Klik op de mobiele menu-toggle. */
  async toggleMenu() {
    await this.menuToggle.click();
  }

  /** Controleer dat het menu geopend en zichtbaar is voor de gebruiker. */
  async expectMenuOpen() {
    await expect(this.navLinks).toBeVisible();
    for (const id of NAV_ITEM_TEST_IDS) {
      await expect(
        this.page.getByTestId(id),
        `Menu-item "${id}" is niet zichtbaar`,
      ).toBeVisible();
    }
  }

  /** Controleer dat het menu op mobiel gesloten en verborgen is. */
  async expectMenuClosedOnMobile() {
    await expect(this.navLinks).toBeHidden();
    await expect(this.menuToggle).toHaveAttribute("aria-expanded", "false");
  }

  /** Controleer dat de navigatie op desktop inline zichtbaar is. */
  async expectMenuInlineOnDesktop() {
    await expect(this.navLinks).toBeVisible();
    await expect(this.menuToggle).toBeHidden();
  }

  /** Controleer de aria-expanded-toestand van de toggle. */
  async expectToggleAriaExpanded(expanded: boolean) {
    await expect(this.menuToggle).toHaveAttribute(
      "aria-expanded",
      expanded ? "true" : "false",
    );
  }

  /**
   * Navigeer via een nav-link naar de verwachte URL.
   *
   * @param testId - data-testid van de nav-link.
   * @param expectedUrl - Regex waarmee de target-URL moet matchen.
   */
  async clickNavLink(testId: string, expectedUrl: RegExp) {
    await this.page.getByTestId(testId).click();
    await expect(this.page).toHaveURL(expectedUrl);
  }
}
