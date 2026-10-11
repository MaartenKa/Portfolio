import { test, expect } from "@playwright/test";
import { NavigationPage } from "../../pages/mobile.page";

// Viewporten conform TESTSTRATEGY.md §5.1
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 }; // >850px breedte → nav inline
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // ≤850px breedte → menu-toggle zichtbaar

test.describe("Mobiele menu-toggle", () => {
  test.describe("Desktop (>850px)", () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test("menu-toggle is niet zichtbaar en nav-links staan inline", async ({
      page,
    }) => {
      const nav = new NavigationPage(page);
      await nav.goto("");

      // Toggle button bestaat in DOM maar is via CSS verborgen (display: none)
      await expect(nav.menuToggle).toBeHidden();

      // Navigatie-lijst is inline zichtbaar, zonder .open klasse
      await nav.expectMenuState(false);
    });
  });

  test.describe("Mobiel (≤850px)", () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    let nav: NavigationPage;

    test.beforeEach(async ({ page }) => {
      nav = new NavigationPage(page);
      await nav.goto("");
    });

    test("toggle is zichtbaar en menu is initieel gesloten", async () => {
      // Toggle is zichtbaar en aangegeven als "niet geëxpanded"
      await expect(nav.menuToggle).toBeVisible();
      await nav.expectToggleAriaExpanded(false);

      // Menu is gesloten (géén .open klasse) en op mobiel niet zichtbaar
      await nav.expectMenuState(false);
      await expect(nav.navLinks).toBeHidden();
    });

    test("klik op toggle opent het menu", async () => {
      await nav.toggleMenu();

      // Menu open: .open + zichtbaar + alle items zichtbaar + aria-expanded=true
      await nav.expectMenuState(true);
      await nav.expectToggleAriaExpanded(true);
    });

    test("klik op toggle sluit het menu weer", async () => {
      // Open eerst
      await nav.toggleMenu();
      // Klik opnieuw → gesloten
      await nav.toggleMenu();

      await nav.expectMenuState(false);
      await expect(nav.navLinks).toBeHidden();
      await nav.expectToggleAriaExpanded(false);
    });

    test("klik op nav-link in open menu sluit het menu en navigeert", async () => {
      // Open het menu
      await nav.toggleMenu();
      await nav.expectMenuState(true);

      // Klik op een nav-link (Contact) → navigatie + menu gesloten op nieuwe pagina
      await nav.clickNavLink("nav-contact", /contact\.html/);
      await expect(nav.navLinks).not.toHaveClass(/open/);
      await expect(nav.menuToggle).toHaveAttribute("aria-expanded", "false");
    });
  });
});
