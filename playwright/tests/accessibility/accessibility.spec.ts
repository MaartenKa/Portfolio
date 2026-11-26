// Portfolio — playwright/tests/accessibility/accessibility.spec.ts

import { test } from "../../fixtures/test-fixtures";
import {
  ALL_PAGES,
  CONTACT_TAB_TRAIL,
  HOME_TAB_TRAIL,
  PAGE_SECTION_LABELS,
} from "../../utils/test-data";

// De suite bewijst structurele toegankelijkheid op de lokale markup: taal,
// landmarks, labels, alt-teksten, toetsenbordbediening en berekende kleuren.
// Er wordt niets gemockt: de pages zijn statisch en de checks zijn deterministisch.
test.describe("Accessibility test – Structuur per pagina (A11Y-02, A11Y-03)", () => {
  for (const page of ALL_PAGES) {
    test(`A11Y-02 en A11Y-03: ${page} heeft taal, landmarks, alt-teksten, Nederlandse labels en een skip-link`, async ({
      a11yPage,
    }) => {
      await a11yPage.navigateTo(page);
      await a11yPage.expectLangDutch();
      await a11yPage.expectLandmarksNamed();
      await a11yPage.expectMenuToggleCollapsed();
      await a11yPage.expectImagesHaveAlt();
      await a11yPage.expectSectionLabels(PAGE_SECTION_LABELS[page]);
      await a11yPage.expectDecorativeIconsHidden();
      await a11yPage.expectSkipLinkContract();
    });
  }
});

test.describe("Accessibility test – Toetsenbordnavigatie (A11Y-01)", () => {
  test("A11Y-01: het toetsenbord loopt de contractvolgorde over de homepage", async ({
    a11yPage,
  }) => {
    await a11yPage.navigateTo("index.html");
    await a11yPage.expectKeyboardTrail(HOME_TAB_TRAIL);
  });

  test("A11Y-01: het toetsenbord laat het honeypot-veld in het contactformulier overslaan", async ({
    a11yPage,
  }) => {
    await a11yPage.navigateTo("contact.html");
    await a11yPage.expectKeyboardTrail(CONTACT_TAB_TRAIL);
  });

  test("A11Y-01: de focus-indicator is zichtbaar bij toetsenbordnavigatie", async ({
    a11yPage,
  }) => {
    await a11yPage.navigateTo("index.html");
    await a11yPage.expectVisibleFocusIndicator();
  });
});

test.describe("Accessibility test – Skip-link (A11Y-03)", () => {
  test("A11Y-03: de skip-link brengt de focus naar de hoofdinhoud", async ({
    a11yPage,
  }) => {
    await a11yPage.navigateTo("index.html");
    await a11yPage.expectSkipLinkMovesFocusToMain();
  });
});

test.describe("Accessibility test – Contactformulier (A11Y-02)", () => {
  test("A11Y-02: elk veld van het contactformulier heeft een eigen label", async ({
    a11yPage,
  }) => {
    await a11yPage.navigateTo("contact.html");
    await a11yPage.expectFormLabelsMatchFields();
  });
});

test.describe("Accessibility test – Contrast en high contrast (A11Y-04)", () => {
  test("A11Y-04: de placeholder heeft voldoende contrast tegen de invoerachtergrond", async ({
    a11yPage,
  }) => {
    await a11yPage.navigateTo("contact.html");
    await a11yPage.expectPlaceholderContrast();
  });

  test("A11Y-04: de hero-tekst blijft leesbaar in forced-colors-modus", async ({
    a11yPage,
  }) => {
    await a11yPage.navigateTo("index.html");
    await a11yPage.expectForcedColorsHeroReadable();
  });
});
