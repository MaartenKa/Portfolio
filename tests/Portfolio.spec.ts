import { test, expect } from "@playwright/test";


// Load correctly
test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Portfolio/i);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation')).toBeVisible();
});

// Navigation
test('user can navigate to projects', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /projects/i }).click();

  await expect(page).toHaveURL(/projects/);
  await expect(
    page.getByRole('heading', { name: /projects/i })
  ).toBeVisible();
});

// Projects

test('projects are displayed', async ({ page }) => {
  await page.goto('/projects');

  const projects = page.getByRole('article');

  await expect(projects).toHaveCount(3);
  await expect(projects.first()).toBeVisible();
});