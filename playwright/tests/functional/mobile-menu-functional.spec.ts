import { expect, test } from "../../fixtures/test-fixtures";
import {
  NAV_ITEM_TEST_IDS,
  NAV_ITEM_URLS,
} from "../../pages/mobile.page";

const DESKTOP_VIEWPORT = { width: 1920, height: 1080 }; // >850px breedte → nav inline
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // ≤850px breedte → menu-toggle zichtbaar

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
      // Toggle is zichtbaar en aangegeven als "niet geëxpanded"
      await expect(navPage.menuToggle).toBeVisible();
      await navPage.expectToggleAriaExpanded(false);

      // Menu is gesloten en op mobiel niet zichtbaar
      await navPage.expectMenuClosedOnMobile();
    });

    test("klik op toggle opent het menu", async ({ navPage }) => {
      await navPage.toggleMenu();

      // Menu open: zichtbaar + alle items zichtbaar + aria-expanded=true
      await navPage.expectMenuOpen();
      await navPage.expectToggleAriaExpanded(true);
    });

    test("klik op toggle sluit het menu weer", async ({ navPage }) => {
      // Open eerst
      await navPage.toggleMenu();
      // Klik opnieuw → gesloten
      await navPage.toggleMenu();

      await navPage.expectMenuClosedOnMobile();
    });

    test("klik op nav-link in open menu sluit het menu en navigeert", async ({
      navPage,
    }) => {
      // Open het menu
      await navPage.toggleMenu();
      await navPage.expectMenuOpen();

      // Klik op een nav-link (Contact) → navigatie + menu gesloten op nieuwe pagina
      await navPage.clickNavLink("nav-contact", /contact\.html/);
      await navPage.expectMenuClosedOnMobile();
    });

    test.describe("Alle nav-links navigeren naar de juiste pagina", () => {
      for (const testId of NAV_ITEM_TEST_IDS) {
        test(`nav-link "${testId}" navigeert naar ${NAV_ITEM_URLS[testId]}`, async ({
          navPage,
        }) => {
          // Open het menu
          await navPage.toggleMenu();
          await navPage.expectMenuOpen();

          // Klik op de nav-link en verifieer de URL
          await navPage.clickNavLink(testId, NAV_ITEM_URLS[testId]);

          // Menu is gesloten na navigatie
          await navPage.expectMenuClosedOnMobile();
        });
      }
    });
  });
});
