import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

// Testable data-testid's van de nav-links in #nav-links (op elke pagina)
export const NAV_ITEM_TEST_IDS = [
  "nav-home",
  "nav-curriculum",
  "nav-testing",
  "nav-automation",
  "nav-projects",
  "nav-personal",
  "nav-contact",
] as const;

/**
 * NavigationPage abstrahiert de globale navigatiebalk (header) die op elk
 * onderdeel van de site dezelfde DOM/selectors draagt: #menu-toggle en
 * #nav-links. Het is dus niet pagina-specifiek, maar een gedeelde component.
 */

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // export class NavigationPage extends BasePage {
  // Locators (centraal in deze page object)
  get menuToggle() {
    return this.page.getByTestId("menu-toggle");
  }

  get navLinks() {
    return this.page.locator("#nav-links");
  }

  /** Klik op de mobiele menu-toggle. */
  async toggleMenu() {
    await this.menuToggle.click();
  }

  /**
   * Assert de toestand van het navigatiemenu.
   * open=true  → #nav-links heeft .open, is zichtbaar én alle items zijn zichtbaar.
   * open=false → #nav-links heeft géén .open (op mobiel hidden, op desktop inline visible).
   */
  async expectMenuState(open: boolean) {
    if (open) {
      await expect(this.navLinks).toHaveClass(/open/);
      await expect(this.navLinks).toBeVisible();
      for (const id of NAV_ITEM_TEST_IDS) {
        await expect(
          this.page.getByTestId(id),
          `Menu-item "${id}" is niet zichtbaar`,
        ).toBeVisible();
      }
    } else {
      await expect(this.navLinks).not.toHaveClass(/open/);
    }
  }

  /** Assert de aria-expanded toestand van de toggle. */
  async expectToggleAriaExpanded(expanded: boolean) {
    await expect(this.menuToggle).toHaveAttribute(
      "aria-expanded",
      expanded ? "true" : "false",
    );
  }

  /** Navigeer via een nav-link (data-testid) naar de verwachte URL. */
  async clickNavLink(testId: string, expectedUrl: RegExp) {
    await this.page.getByTestId(testId).click();
    await expect(this.page).toHaveURL(expectedUrl);
  }
}
