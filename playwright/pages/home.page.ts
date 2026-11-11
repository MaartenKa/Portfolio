import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

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
    // Semantische locators op basis van de bestaande accessible namen:
    // <nav class="navbar" aria-label="Hoofdnavigatie">,
    // <section class="hero" aria-label="Intro"> (section met naam => role region)
    // en <footer class="footer"> (landmark contentinfo).
    await expect(this.page.getByRole("navigation", { name: "Hoofdnavigatie" })).toBeVisible();
    await expect(this.page.getByRole("region", { name: "Intro" })).toBeVisible();
    await expect(this.page.getByRole("contentinfo")).toBeVisible();
  }

  // Functionele navigatie (gebruikersgedrag)

  async clickProjectsCta() {
    await this.page.getByTestId("cta-projects").click();
    await expect(this.page).toHaveURL(/projects\.html/);
  }

  async clickCurriculumCta() {
    await this.page.getByTestId("cta-curriculum").click();
    await expect(this.page).toHaveURL(/curriculum\.html/);
  }

  async clickContactNavLink() {
    await this.page.getByTestId("nav-contact").click();
    await expect(this.page).toHaveURL(/contact\.html/);
  }

  async clickProjectsNavLink() {
    await this.page.getByTestId("nav-projects").click();
    await expect(this.page).toHaveURL(/projects\.html/);
  }

  async clickTestingCardLink() {
    await this.page.getByTestId("card-link-testing").click();
    await expect(this.page).toHaveURL(/testing\.html/);
  }
}
