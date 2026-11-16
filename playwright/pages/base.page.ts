// Portfolio / playwright / pages / base.page.ts;
import { Page, expect } from "@playwright/test";

export class BasePage {
  protected consoleErrors: string[] = [];

  public constructor(protected readonly page: Page) {
    // Luisterers hier registration, niet per goto() call: goto() kan
    // multiple times per page worden roepen.
    this.page.on("console", (msg) => {
      if (msg.type() === "error") this.consoleErrors.push(msg.text());
    });
    this.page.on("pageerror", (err) => this.consoleErrors.push(err.message));
  }

  async goto(path: string) {
    this.consoleErrors = [];
    const response = await this.page.goto(path, { waitUntil: "load" });
    return response;
  }

  async expectNoConsoleErrors() {
    expect(this.consoleErrors, "Runtime errors gevonden op de pagina").toEqual([]);
  }
}
