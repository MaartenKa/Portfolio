import { test } from "../../fixtures/test-fixtures";
import {
  CARD_LINK_TEST_IDS,
  CARD_LINK_URLS,
} from "../../pages/home.page";
import { NAV_ITEM_TEST_IDS, NAV_ITEM_URLS } from "../../pages/mobile.page";
import { DESKTOP_VIEWPORT } from "../../utils/test-data";

const NAV_ITEM_PAGE_NAMES: Record<(typeof NAV_ITEM_TEST_IDS)[number], string> = {
  "nav-home": "homepagina",
  "nav-curriculum": "curriculumpagina",
  "nav-testing": "testing-pagina",
  "nav-automation": "automatiseringspagina",
  "nav-projects": "projectenpagina",
  "nav-personal": "persoonlijke-projectenpagina",
  "nav-contact": "contactpagina",
};

const CARD_LINK_PAGE_NAMES: Record<(typeof CARD_LINK_TEST_IDS)[number], string> = {
  "card-link-testing": "testing-pagina",
  "card-link-automation": "automatiseringspagina",
  "card-link-projects": "projectenpagina",
};

test.describe("Homepage - functionele navigatie", () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigate();
  });

  test('CTA-knop "Bekijk mijn projecten" opent de projectenpagina', async ({
    homePage,
  }) => {
    await homePage.clickProjectsCta();
  });

  test('CTA-knop "Bekijk mijn Curriculum vitae" opent de curriculumpagina', async ({
    homePage,
  }) => {
    await homePage.clickCurriculumCta();
  });

  test.describe("Desktopnavigatie (>850px)", () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    // NAV-01: alle nav-links expliciet op desktop, niet alleen via het mobiele menu.
    for (const testId of NAV_ITEM_TEST_IDS) {
      test(
        `NAV-01: nav-link "${testId}" opent de ${NAV_ITEM_PAGE_NAMES[testId]}`,
        async ({ navPage }) => {
          await navPage.clickNavLink(testId, NAV_ITEM_URLS[testId]);
        },
      );
    }
  });

  test.describe("Card-links", () => {
    // NAV-03: alle drie de card-links op de homepage.
    for (const testId of CARD_LINK_TEST_IDS) {
      test(
        `NAV-03: card-link "${testId}" opent de ${CARD_LINK_PAGE_NAMES[testId]}`,
        async ({ homePage }) => {
          await homePage.clickCardLink(testId, CARD_LINK_URLS[testId]);
        },
      );
    }
  });
});
