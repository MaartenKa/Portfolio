// Portfolio / playwright / pages / base.page.ts;
import { Page, expect } from "@playwright/test";

export class BasePage {
  protected consoleErrors: string[] = [];

  protected constructor(protected readonly page: Page) {}

  async goto(path: string) {
    this.consoleErrors = [];
    this.page.on("console", (msg) => {
      if (msg.type() === "error") this.consoleErrors.push(msg.text());
    });
    this.page.on("pageerror", (err) => this.consoleErrors.push(err.message));

    const response = await this.page.goto(path);
    await this.page.waitForLoadState("networkidle");
    return response;
  }

  async expectNoConsoleErrors() {
    expect(this.consoleErrors).toEqual([]);
  }
}
