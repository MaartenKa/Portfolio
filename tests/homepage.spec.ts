  //   de homepage opent zonder foutmelding;
  //   de belangrijkste heading zichtbaar is;
  //   de navigatie zichtbaar is;
  //   de belangrijkste CTA aanwezig is;
  //   de pagina een correcte titel heeft.

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

// Contact requirement fields
test('contact form validates email', async ({ page }) => {
  await page.goto('/contact');

  await page.getByLabel('Name').fill('John Doe');
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Message').fill('Hello');

  await page.getByRole('button', { name: /send/i }).click();

  await expect(page.getByText(/valid email/i)).toBeVisible();
});

// external links
test('GitHub link points to correct destination', async ({ page }) => {
  await page.goto('/');

  const github = page.getByRole('link', { name: /github/i });

  await expect(github).toHaveAttribute('href', /github\.com/);
});

// accesibillity 

test('main navigation is accessible', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('navigation')
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: /home/i })
  ).toBeVisible();
});