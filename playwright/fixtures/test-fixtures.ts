// Portfolio — playwright/fixtures/test-fixtures.ts
import { test as base } from "@playwright/test";
import { BasePage } from "../pages/base.page";
import { FooterPage } from "../pages/footer.page";
import { AccessibilityPage } from "../pages/a11y.page";
import { ContentIntegrityPage } from "../pages/content.page";
import { FormwardMock } from "./formward.mock";
import { CiHistoryPage } from "../pages/ci-history.page";
import { ContactPage } from "../pages/contact.page";
import { HomePage } from "../pages/home.page";
import { NavigationPage } from "../pages/mobile.page";
import { ResponsivePage } from "../pages/responsive.page";
import { SeoPage } from "../pages/seo.page";

/**
 * Getypeerde Playwright-fixtures voor de portfolio-suite.
 *
 * Fixtures leveren runtime-voorzieningen (page objects, mocks, setup) en zorgen
 * voor een verse instantie per test. Testwaarden blijven in
 * `playwright/utils/test-data.ts`.
 */
type Fixtures = {
  homePage: HomePage;
  contactPage: ContactPage;
  navPage: NavigationPage;
  ciHistoryPage: CiHistoryPage;
  basePage: BasePage;
  footerPage: FooterPage;
  a11yPage: AccessibilityPage;
  contentPage: ContentIntegrityPage;
  seoPage: SeoPage;
  responsivePage: ResponsivePage;
  formwardMock: FormwardMock;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },

  navPage: async ({ page }, use) => {
    await use(new NavigationPage(page));
  },

  formwardMock: async ({ page }, use) => {
    const mock = new FormwardMock(page);
    await mock.install();
    await use(mock);
  },

  ciHistoryPage: async ({ page }, use) => {
    // Bewust geen navigate(): de test mockt eerst de history-endpoint en
    // navigeert daarna zelf.
    await use(new CiHistoryPage(page));
  },

  footerPage: async ({ page }, use) => {
    await use(new FooterPage(page));
  },

  a11yPage: async ({ page }, use) => {
    // De accessibility-suite navigeert zelf per pagina; de fixture levert alleen
    // het page object met de a11y-asserts.
    await use(new AccessibilityPage(page));
  },

  basePage: async ({ page }, use) => {
    // Voor de lichte smoke-checks op pagina's zonder eigen page object.
    await use(new BasePage(page));
  },

  contentPage: async ({ page }, use) => {
    // De content-integrity-suite navigeert zelf per pagina.
    await use(new ContentIntegrityPage(page));
  },

  seoPage: async ({ page, request }, use) => {
    // De suite leest de DOM van de pagina's en de sitemap/robots via de
    // request-fixture, zonder browserrendering voor die twee bestanden.
    await use(new SeoPage(page, request));
  },

  responsivePage: async ({ page }, use) => {
    // De viewport wordt per test gezet; de fixture levert het page object.
    await use(new ResponsivePage(page));
  },
});

export const expect = base.expect;
