import { expect, test } from "../../fixtures/test-fixtures";
import { OTHER_PAGES_TO_TEST } from "../../utils/test-data";

test.describe("Smoke test – Index pagina (Deep Check)", () => {
  test("index pagina laadt zonder fouten en structuur is correct", async ({
    homePage,
  }) => {
    await homePage.navigate();
    await homePage.expectStructureVisible();
    await homePage.expectNoRuntimeErrors();
  });
});

test.describe("Smoke test – Overige pagina's (Lightweight Check)", () => {
  for (const url of OTHER_PAGES_TO_TEST) {
    test(`${url} laadt zonder kritieke fouten`, async ({ basePage }) => {
      const response = await basePage.goto(url);

      expect(
        response,
        `Pagina ${url} kon niet worden geladen (geen response).`,
      ).not.toBeNull();

      expect(
        response?.status(),
        `Pagina ${url} gaf een foutieve status: ${response?.status()}`,
      ).toBe(200);

      // Captures zowel console-errors als pageerror.
      await basePage.expectNoRuntimeErrors();
    });
  }
});

test.describe("Smoke test – 404-fallback", () => {
  test("404.html laadt met de fallback-content", async ({ page }) => {
    const response = await page.goto("404.html");

    expect(
      response,
      "404.html kon niet worden geladen (geen response).",
    ).not.toBeNull();
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Pagina niet gevonden/);
    await expect(
      page.getByRole("heading", { name: "Pagina niet gevonden" }),
    ).toBeVisible();
  });
});
