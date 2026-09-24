import { test, expect } from "@playwright/test";

test.describe("Smoke test – index pagina", () => {
  test("index pagina laadt zonder fouten", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Foutmeldingen naar console pushen
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      consoleErrors.push(err.message);
    });

    // Start test
    const response = await page.goto("/");
    // Basis controlleren
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page).toHaveTitle(/Maarten Kamps/);

    // Structuur van de index pagina is aanwezig
    await expect(page.locator(".navbar")).toBeVisible();
    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator(".footer")).toBeVisible();
    await page.waitForLoadState("networkidle");
    // Geen console fouten
    expect(consoleErrors).toEqual([]);
  });
});
