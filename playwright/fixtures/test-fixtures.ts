// Portfolio / playwright / fixtures / test-fixtures.ts
import { test as base } from "@playwright/test";
import { BasePage } from "../pages/base.page";
import { CiHistoryPage } from "../pages/ci-history.page";
import { ContactPage } from "../pages/contact.page";
import { HomePage } from "../pages/home.page";
import { NavigationPage } from "../pages/mobile.page";

/**
 * Typed Playwright fixtures voor de portfolio-suite.
 *
 * Fixtures leveren runtime-resources (Page Objects, mocks, setup) en zorgen
 * voor een verse instantie per test. Testwaarden blijven in
 * `playwright/utils/test-data.ts`.
 */
type Fixtures = {
  homePage: HomePage;
  contactPage: ContactPage;
  navPage: NavigationPage;
  ciHistoryPage: CiHistoryPage;
  basePage: BasePage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await use(homePage);
  },

  contactPage: async ({ page }, use) => {
    const contactPage = new ContactPage(page);
    await contactPage.mockFormSubmit();
    await contactPage.navigate();
    await use(contactPage);
  },

  navPage: async ({ page }, use) => {
    const navPage = new NavigationPage(page);
    await navPage.goto("");
    await use(navPage);
  },

  ciHistoryPage: async ({ page }, use) => {
    // Bewust geen navigate(): de test mockt eerst de history-endpoint.
    await use(new CiHistoryPage(page));
  },

  basePage: async ({ page }, use) => {
    // Voor de lightweight smoke-checks op pagina's zonder eigen Page Object.
    await use(new BasePage(page));
  },
});

export const expect = base.expect;
