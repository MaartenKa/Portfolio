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
}
