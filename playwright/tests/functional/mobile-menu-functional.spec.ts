import { expect, test } from "../../fixtures/test-fixtures";
import {
  NAV_ITEM_TEST_IDS,
  NAV_ITEM_URLS,
} from "../../pages/mobile.page";
import {
  DESKTOP_VIEWPORT,
  MOBILE_VIEWPORT,
} from "../../utils/test-data";

test.describe("Mobiele menu-toggle", () => {
  test.beforeEach(async ({ navPage }) => {
    await navPage.goto("");
  });

  test.describe("Desktop (>850px)", () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test("menu-toggle is niet zichtbaar en nav-links staan inline", async ({
      navPage,
    }) => {
      await navPage.expectMenuInlineOnDesktop();
    });
  });

  test.describe("Mobiel (≤850px)", () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test("toggle is zichtbaar en menu is initieel gesloten", async ({
      navPage,
    }) => {
      // De toggle is zichtbaar en heeft aria-expanded="false".
      await expect(navPage.menuToggle).toBeVisible();
      await navPage.expectToggleAriaExpanded(false);

      // Het menu is op mobiel gesloten en verborgen.
      await navPage.expectMenuClosedOnMobile();
    });

    test("klik op toggle opent het menu", async ({ navPage }) => {
      await navPage.toggleMenu();

      // Het menu is geopend: alle items zijn zichtbaar en aria-expanded="true".
      await navPage.expectMenuOpen();
      await navPage.expectToggleAriaExpanded(true);
    });

    test("klik op toggle sluit het menu weer", async ({ navPage }) => {
      await navPage.toggleMenu();
      await navPage.toggleMenu();

      await navPage.expectMenuClosedOnMobile();
    });

    test("MENU-04: herhaalde open-sluit-cyclus houdt de state correct", async ({
      navPage,
    }) => {
      // Twee volledige cyclussen plus een laatste open/sluit-paar: hiermee
      // wordt een stale toestand of een vastgelopen toggle zichtbaar.
      for (let cycle = 0; cycle < 2; cycle++) {
        await navPage.toggleMenu();
        await navPage.expectMenuOpen();
        await navPage.expectToggleAriaExpanded(true);

        await navPage.toggleMenu();
        await navPage.expectMenuClosedOnMobile();
        await navPage.expectToggleAriaExpanded(false);
      }

      await navPage.toggleMenu();
      await navPage.expectMenuOpen();
      await navPage.expectToggleAriaExpanded(true);

      await navPage.toggleMenu();
      await navPage.expectMenuClosedOnMobile();
      await navPage.expectToggleAriaExpanded(false);
    });

    test("klik op nav-link in open menu sluit het menu en navigeert", async ({
      navPage,
    }) => {
      await navPage.toggleMenu();
      await navPage.expectMenuOpen();

      // Na navigatie moet het menu op de nieuwe pagina gesloten zijn.
      await navPage.clickNavLink("nav-contact", /contact\.html/);
      await navPage.expectMenuClosedOnMobile();
    });

    test("Escape sluit het menu en geeft focus terug", async ({ navPage, page }) => {
      await navPage.toggleMenu();
      await navPage.expectMenuOpen();
      await page.keyboard.press("Escape");
      await navPage.expectMenuClosedOnMobile();
      await expect(navPage.menuToggle).toBeFocused();
    });

    test("klik buiten het menu sluit het menu en geeft focus terug", async ({ navPage }) => {
      await navPage.toggleMenu();
      await navPage.expectMenuOpen();
      await navPage.clickOutsideMenu();
      await navPage.expectMenuClosedOnMobile();
      await expect(navPage.menuToggle).toBeFocused();
    });

    test("focus na openen gaat naar de eerste nav-link", async ({ navPage }) => {
      await navPage.toggleMenu();
      await expect(navPage.firstNavLink).toBeFocused();
    });

    test("Escape op gesloten menu verandert de focus niet", async ({ navPage, page }) => {
      await navPage.menuToggle.focus();
      await page.keyboard.press("Escape");
      await expect(navPage.menuToggle).toBeFocused();
      await navPage.expectMenuClosedOnMobile();
    });

    test.describe("Alle nav-links navigeren naar de juiste pagina", () => {
      for (const testId of NAV_ITEM_TEST_IDS) {
        test(`nav-link "${testId}" navigeert naar ${NAV_ITEM_URLS[testId]}`, async ({
          navPage,
        }) => {
          await navPage.toggleMenu();
          await navPage.expectMenuOpen();

          await navPage.clickNavLink(testId, NAV_ITEM_URLS[testId]);

          // Het menu moet na de navigatie gesloten zijn.
          await navPage.expectMenuClosedOnMobile();
        });
      }
    });
  });
});
