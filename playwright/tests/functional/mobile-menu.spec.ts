import { test, expect } from "@playwright/test";

// Viewporten conform TESTSTRATEGY.md §5.1
const DESKTOP_VIEWPORT = { width: 1280, height: 800 }; // >850px → nav inline
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // ≤850px → menu-toggle zichtbaar

// Verwachte menu-items (data-testid) in #nav-links
const NAV_ITEM_TEST_IDS = [
  "nav-home",
  "nav-curriculum",
  "nav-testing",
  "nav-automation",
  "nav-projects",
  "nav-personal",
  "nav-contact",
];

// Controleer of alle menu-items in het openstaande menu zichtbaar zijn
async function expectAllNavItemsVisible(page: import("@playwright/test").Page) {
  for (const testId of NAV_ITEM_TEST_IDS) {
    await expect(
      page.getByTestId(testId),
      `Menu-item "${testId}" is niet zichtbaar`,
    ).toBeVisible();
  }
}


test.describe("Mobiele menu-toggle", () => {
  test.describe("Desktop (>850px)", () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test("menu-toggle is niet zichtbaar en nav-links staan inline", async ({
      page,
    }) => {
      await page.goto("");

      // Toggle button bestaat in DOM maar is via CSS verborgen (display: none)
      const toggle = page.getByTestId("menu-toggle");
      await expect(toggle).toBeHidden();

      // Navigatie-lijst is inline zichtbaar (flex, geen .open nodig)
      const navLinks = page.locator("#nav-links");
      await expect(navLinks).toBeVisible();
      await expect(navLinks).not.toHaveClass(/open/);
    });
  });

  test.describe("Mobiel (≤850px)", () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test.beforeEach(async ({ page }) => {
      await page.goto("");
    });

    test("toggle is zichtbaar en menu is initieel gesloten", async ({ page }) => {
      const toggle = page.getByTestId("menu-toggle");
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");

      // #nav-links heeft geen .open klasse en is niet zichtbaar (display: none)
      const navLinks = page.locator("#nav-links");
      await expect(navLinks).not.toHaveClass(/open/);
      await expect(navLinks).toBeHidden();
    });

  test("klik op toggle opent het menu", async ({ page }) => {
      const toggle = page.getByTestId("menu-toggle");
      await toggle.click();

      // #nav-links krijgt class="open" en wordt zichtbaar
      const navLinks = page.locator("#nav-links");
      await expect(navLinks).toHaveClass(/open/);
      await expect(navLinks).toBeVisible();

      // aria-expanded is nu "true"
      await expect(toggle).toHaveAttribute("aria-expanded", "true");

      // Alle menu-items zijn zichtbaar in het openstaande menu
      await expectAllNavItemsVisible(page);
    });

    test("klik op toggle sluit het menu weer", async ({ page }) => {
      const toggle = page.getByTestId("menu-toggle");

      // Open eerst
      await toggle.click();
      await expect(page.locator("#nav-links")).toHaveClass(/open/);

      // Klik opnieuw → gesloten
      await toggle.click();

      const navLinks = page.locator("#nav-links");
      await expect(navLinks).not.toHaveClass(/open/);
      await expect(navLinks).toBeHidden();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
    });

    test("klik op nav-link in open menu sluit het menu en navigeert", async ({
      page,
    }) => {
      const toggle = page.getByTestId("menu-toggle");

      // Open het menu
      await toggle.click();
      await expect(page.locator("#nav-links")).toHaveClass(/open/);

      // Klik op een nav-link (Contact)
      await page.getByTestId("nav-contact").click();

      // Navigatie naar de juiste pagina
      await expect(page).toHaveURL(/contact\.html/);

      // Op de nieuwe pagina is het menu gesloten
      const newToggle = page.getByTestId("menu-toggle");
      await expect(newToggle).toHaveAttribute("aria-expanded", "false");
      const navLinks = page.locator("#nav-links");
      await expect(navLinks).not.toHaveClass(/open/);
    });
  });
});
