import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<HomePage> {
    const response = await super.goto("/");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(this.page).toHaveTitle(/Maarten Kamps/);
    return this;
  }

  async expectStructureVisible() {
    await expect(this.page.locator(".navbar")).toBeVisible();
    await expect(this.page.locator(".hero")).toBeVisible();
    await expect(this.page.locator(".footer")).toBeVisible();
  }

  // Functionele navigatie (gebruikersgedrag)

  async clickProjectsCta() {
    await this.page
      .getByRole("link", { name: "Bekijk mijn projecten", exact: true })
      .click();
    await expect(this.page).toHaveURL(/projects\.html/);
  }

  async clickCurriculumCta() {
    await this.page
      .getByRole("link", { name: "Bekijk mijn Curriculum vitae", exact: true })
      .click();
    await expect(this.page).toHaveURL(/curriculum\.html/);
  }

  async clickContactNavLink() {
    await this.page
      .getByRole("navigation")
      .getByRole("link", { name: "Contact", exact: true })
      .click();
    await expect(this.page).toHaveURL(/contact\.html/);
  }

  async clickProjectsNavLink() {
    await this.page
      .getByRole("navigation")
      .getByRole("link", { name: "Projecten", exact: true })
      .click();
    await expect(this.page).toHaveURL(/projects\.html/);
  }

  async clickTestingCardLink() {
    await this.page.getByRole("link", { name: /Meer over testing/ }).click();
    await expect(this.page).toHaveURL(/testing\.html/);
  }
}
