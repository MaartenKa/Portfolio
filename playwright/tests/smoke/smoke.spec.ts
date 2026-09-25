import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/home.page";

// De overige pagina's die we willen controleren op basis van je routes
const otherPagesToTest = [
  "/curriculum.html",
  "/testing.html",
  "/automation.html",
  "/projects.html",
  "/personal.html",
  "/contact.html",
  "/privacy.html",
  "/bedankt.html",
];

test.describe("Smoke test – Index pagina (Deep Check)", () => {
  test("index pagina laadt zonder fouten en structuur is correct", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.navigate();
    // De Page Object controlleert op de volledage integriteit van de homepage
    await home.expectStructureVisible();
    await home.expectNoConsoleErrors();
  });
});

// Test of de overige pagina's laden, bewust geen page object gebruikt omdat deze controlleert op de  netwerk- en infrastructuurlaag
// en page objecten zijn voornamelijk bedoeld om gebruikersinteractie en UI-elementen te abstraheren.
test.describe("Smoke test – Overige pagina's (Lightweight Check)", () => {
  for (const url of otherPagesToTest) {
    test(`${url} laadt zonder kritieke fouten`, async ({ page }) => {
      const consoleErrors: string[] = [];

      // Luister naar console errors
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto(url);

      // Controlleren of de pagina bestaat
      expect(
        response,
        `Pagina ${url} kon niet worden geladen (geen response).`,
      ).not.toBeNull();

      // Check status code 200
      expect(
        response?.status(),
        `Pagina ${url} gaf een foutieve status: ${response?.status()}`,
      ).toBe(200);

      // Wachten op netwerk idle
      await page.waitForLoadState("networkidle");

      // Controle of er console javascript fouten zijn opgetreden
      expect(
        consoleErrors,
        `Console errors gevonden op ${url}: ${consoleErrors.join(", ")}`,
      ).toHaveLength(0);
    });
  }
});
