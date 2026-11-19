// Portfolio — playwright/pages/base.page.ts
import { Page, expect } from "@playwright/test";

/**
 * Basispagina voor alle page objects.
 *
 * Registreert console-errors en page-errors één keer per page en reset de
 * verzameling bij elke navigatie.
 */
export class BasePage {
  protected consoleErrors: string[] = [];

  public constructor(protected readonly page: Page) {
    // De listeners worden één keer in de constructor geregistreerd, niet per
    // goto()-aanroep: goto() kan meerdere keren per pagina worden aangeroepen.
    this.page.on("console", (msg) => {
      if (msg.type() === "error") this.consoleErrors.push(msg.text());
    });
    this.page.on("pageerror", (err) => this.consoleErrors.push(err.message));
  }

  /**
   * Navigeert naar een pad binnen de site en reset de verzamelde runtime-errors.
   *
   * @param path - Relatief pad binnen de site.
   * @returns De HTTP-response van de navigatie.
   */
  async goto(path: string) {
    this.consoleErrors = [];
    const response = await this.page.goto(path, { waitUntil: "load" });
    return response;
  }

  /**
   * Navigeert naar een pad en retryt op 5xx- of netwerkfouten.
   *
   * De live-site-preflight (`npm run check:site`) is de primaire gate; deze
   * helper voorkomt dat een tijdelijke host-503 als testflake wordt geteld.
   *
   * @param path - Relatief pad binnen de site.
   * @param attempts - Maximaal aantal navigatiepogingen.
   * @returns De laatste HTTP-response, of null bij een blijvende netwerkfout.
   */
  async gotoWithRetry(path: string, attempts = 3) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const response = await this.goto(path);

      if (response && response.status() < 500) return response;
      if (attempt === attempts) return response;

      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }

    return null;
  }

  /**
   * Controleert dat de pagina geen console-errors of page-errors heeft
   * opgeleverd.
   */
  async expectNoRuntimeErrors() {
    expect(this.consoleErrors, "Runtime errors gevonden op de pagina").toEqual([]);
  }
}
