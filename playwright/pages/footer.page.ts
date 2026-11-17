import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class FooterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  link(testId: string) {
    return this.page.getByTestId(testId);
  }

  async expectLink(
    testId: string,
    href: string,
    external = false,
  ): Promise<void> {
    const link = this.link(testId);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);

    if (external) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  }

  async expectActive(testId: string): Promise<void> {
    const link = this.link(testId);
    await expect(link).toHaveClass("active");
    await expect(link).toHaveCSS("color", "rgb(134, 239, 172)");
  }

  async expectInactive(testId: string): Promise<void> {
    await expect(this.link(testId)).not.toHaveClass(/active/);
  }
}
