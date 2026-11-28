// Portfolio — playwright/tests/accessibility/accessibility.spec.ts

import { test } from "../../fixtures/test-fixtures";
import type { HistoryRunFixture } from "../../pages/ci-history.page";
import {
  ALL_PAGES,
  CI_CARD_LABELS,
  CI_SECTION_LABEL,
  CI_STATUS_BADGE_ALT,
  CI_STATUS_BADGE_LABEL,
  CI_TABLE_CAPTION,
  CI_TABLE_COLUMNS,
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

// CIH-08: de CI-sectie van automation.html is de meest dynamische plek van de
// site en dus de meest a11y-gevoelige (PLAN-CI-HISTORY-TESTS.md §7 fase D). De
// history-endpoint wordt gemockt, zodat de rijen, de runnamen en dus de
// tabvolgorde vaststaan en niet afhangen van wat er in de CI draaide
// (TESTPLAN §6.2, BESTPRACTICES §10).
const CI_SECTION_RUNS: HistoryRunFixture[] = [
  {
    runId: 46093057449,
    runNumber: 74,
    createdAt: "2026-11-28T18:18:00.000Z",
    conclusion: "success",
    total: 145,
    passed: 145,
    failed: 0,
    flaky: 0,
    passRate: 100,
    runUrl: "https://github.com/MaartenKa/Portfolio/actions/runs/46093057449",
    suiteTests: 145,
  },
  {
    runId: 45973424264,
    runNumber: 73,
    createdAt: "2026-11-27T18:18:00.000Z",
    conclusion: "success",
    total: 139,
    passed: 139,
    failed: 0,
    flaky: 0,
    passRate: 100,
    runUrl: "https://github.com/MaartenKa/Portfolio/actions/runs/45973424264",
    suiteTests: 139,
  },
  {
    runId: 45911057514,
    runNumber: 72,
    createdAt: "2026-11-26T18:18:00.000Z",
    conclusion: "failure",
    total: 139,
    passed: 135,
    failed: 4,
    flaky: 0,
    passRate: 97.1,
    runUrl: "https://github.com/MaartenKa/Portfolio/actions/runs/45911057514",
    suiteTests: 139,
  },
];

const CI_SECTION_RUN_NAMES = CI_SECTION_RUNS.map(
  (entry) => `Run ${entry.runNumber}`,
);

test.describe("Accessibility test – CI-sectie van automation.html (CIH-08)", () => {
  test("CIH-08a: de geschiedenis-tabel heeft een Nederlandse caption en zes gekopde kolommen", async ({
    a11yPage,
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory(CI_SECTION_RUNS);
    await a11yPage.navigateTo("automation.html");

    await a11yPage.expectTableCaption(CI_TABLE_CAPTION);
    await a11yPage.expectTableHeader(CI_TABLE_COLUMNS);
  });

  test("CIH-08b: élke geschiedenisrij vult de zes kolommen en de run-link is veilig en leesbaar", async ({
    a11yPage,
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory(CI_SECTION_RUNS);
    await a11yPage.navigateTo("automation.html");

    await a11yPage.expectRowShape(
      CI_SECTION_RUNS.length,
      CI_TABLE_COLUMNS.length,
    );
    await a11yPage.expectRunLink(
      CI_SECTION_RUN_NAMES[0],
      CI_SECTION_RUNS[0].runUrl,
    );
  });

  test("CIH-08c: de lege geschiedenis houdt de caption en de zes-kolomsstructuur intact", async ({
    a11yPage,
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory([]);
    await a11yPage.navigateTo("automation.html");

    await a11yPage.expectTableCaption(CI_TABLE_CAPTION);
    await a11yPage.expectRowShape(1, CI_TABLE_COLUMNS.length);
  });

  test("CIH-08d: de CI-kaarten blijven leesbaar en de run-links zijn toetsenbordbereikbaar in rijvolgorde", async ({
    a11yPage,
    ciHistoryPage,
  }) => {
    await ciHistoryPage.mockHistory(CI_SECTION_RUNS);
    await a11yPage.navigateTo("automation.html");

    await a11yPage.expectCardsReadable(CI_CARD_LABELS, CI_SECTION_LABEL);
    await a11yPage.expectStatusBadgeAccessible(
      CI_STATUS_BADGE_LABEL,
      CI_STATUS_BADGE_ALT,
    );
    await a11yPage.expectRunLinksInTabOrder(
      CI_STATUS_BADGE_LABEL,
      CI_SECTION_RUN_NAMES,
    );
  });
});
