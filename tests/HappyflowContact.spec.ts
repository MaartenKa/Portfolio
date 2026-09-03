import { test, expect } from "@playwright/test";

test('user can submit contact form', async ({ page }) => {
  await page.goto('/contact');

  await page.getByLabel('Name').fill('John Doe');
  await page.getByLabel('Email').fill('john@example.com');
  await page.getByLabel('Message').fill('Hello! I would like to get in touch.');

  await page.getByRole('button', { name: /send/i }).click();

  await expect(
    page.getByText(/message sent|thank you/i)
  ).toBeVisible();
});