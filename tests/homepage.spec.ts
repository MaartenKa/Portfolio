import { test, expect } from "@playwright/test";

test("homepage heeft de juiste titel", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Maarten Kamps | QA & Test Automation");
});

test("homepage toont mijn belangrijkste onderdelen", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /Ik test software/i,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", {
      name: "Bekijk mijn projecten",
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("link", {
      name: "Bekijk mijn CV",
    }),
  ).toBeVisible();
});

test("CV-link werkt", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("link", {
      name: "Bekijk mijn CV",
    })
    .click();

  await expect(page).toHaveURL(/cv\.html/);
});
