import { test, expect } from "@playwright/test";

test.describe("Homepage - functionele navigatie", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test('CTA-knop "Bekijk mijn projecten" opent de projectenpagina', async ({
    page,
  }) => {
    await page
      .getByRole("link", { name: "Bekijk mijn projecten", exact: true })
      .click();

    await expect(page).toHaveURL(/projects\.html/);
  });

  test('CTA-knop "Bekijk mijn Curriculum vitae" opent de curriculumpagina', async ({
    page,
  }) => {
    await page
      .getByRole("link", { name: "Bekijk mijn Curriculum vitae", exact: true })
      .click();

    await expect(page).toHaveURL(/curriculum\.html/);
  });

  test('navigatielink "Contact" opent de contactpagina', async ({ page }) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Contact", exact: true })
      .click();

    await expect(page).toHaveURL(/contact\.html/);
  });

  test('navigatielink "Projecten" opent de projectenpagina', async ({
    page,
  }) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Projecten", exact: true })
      .click();

    await expect(page).toHaveURL(/projects\.html/);
  });

  test('card-link "Meer over testing" opent de testpagina', async ({
    page,
  }) => {
    await page.getByRole("link", { name: /Meer over testing/ }).click();

    await expect(page).toHaveURL(/testing\.html/);
  });
});
