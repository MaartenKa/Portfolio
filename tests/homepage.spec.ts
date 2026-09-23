import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('pagina laadt succesvol', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page).toHaveTitle(/Maarten Kamps/);
  });

  test('belangrijkste heading en introductie zijn zichtbaar', async ({ page }) => {
    await page.goto('/');

    const heroHeading = page.getByRole('heading', { level: 1, name: /Breaking software/i });
    await expect(heroHeading).toBeVisible();

    const intro = page.locator('.hero-description');
    await expect(intro).toBeVisible();
    await expect(intro).toContainText(/software testing/i);
  });

  test('belangrijkste navigatie-elementen zijn aanwezig', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.logo')).toBeVisible();

    const expectedLinks = [
      'Home',
      'Curriculum Vitae',
      'Software Testen',
      'Automatisering',
      'Projecten',
      'Contact',
    ];

    for (const label of expectedLinks) {
      await expect(
        page.getByRole('navigation').getByRole('link', { name: label, exact: true }),
      ).toBeVisible();
    }
  });

  test('er zijn geen evidente console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toEqual([]);
  });
});
