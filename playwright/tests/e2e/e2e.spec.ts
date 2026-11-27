// Portfolio — playwright/tests/e2e/e2e.spec.ts

import { expect, test } from "../../fixtures/test-fixtures";
import type { HistoryRunFixture } from "../../pages/ci-history.page";
import {
  FOOTER_LINK_CONTRACT,
  HOME_LANDING,
  NAV_JOURNEY_STEPS,
} from "../../pages/flows.page";
import {
  FORM_POST_FIELDS,
  MOBILE_VIEWPORT,
  THANK_YOU_PAGE,
  VALID_CONTACT,
} from "../../utils/test-data";

// E2E-06: een pad dat er op de site niet is. Op beide omgevingen eindigt dit als
// 404; `404.html` is de fallbackpagina van de repo (SM-03, TESTPLAN §8.1).
const UNKNOWN_PATH = "deze-pagina-bestaat-niet.html";

// De drie gemockte CI-runs voor de dashboard-journey. De cijfers staan vast, zodat
// de verwachting niet afhangt van wat er die nacht in de CI draaide (TESTPLAN §6.2,
// PLAN-CI-HISTORY-TESTS §3: mock boven live data in de UI-tests). De nieuwste run
// staat vooraan, zoals ci-summary.mjs entries vooraan toevoegt.
const run = (overrides: Partial<HistoryRunFixture>): HistoryRunFixture => ({
  runId: 1,
  runNumber: null,
  createdAt: "2026-11-28T18:17:00.000Z",
  conclusion: "success",
  total: 145,
  passed: 145,
  failed: 0,
  flaky: 0,
  passRate: 100,
  runUrl: "https://github.com/MaartenKa/Portfolio/actions/runs/45999999001",
  ...overrides,
});

const dashboardRuns: HistoryRunFixture[] = [
  run({
    runId: 3,
    runNumber: 74,
    createdAt: "2026-11-28T18:17:00.000Z",
    runUrl: "https://github.com/MaartenKa/Portfolio/actions/runs/45999999001",
  }),
  run({
    runId: 2,
    runNumber: 73,
    createdAt: "2026-11-27T18:17:00.000Z",
    conclusion: "failure",
    passed: 141,
    failed: 4,
    flaky: 1,
    passRate: 97.2,
    runUrl: "https://github.com/MaartenKa/Portfolio/actions/runs/45999999002",
  }),
  run({
    runId: 1,
    runNumber: 72,
    createdAt: "2026-11-26T18:17:00.000Z",
    runUrl: "https://github.com/MaartenKa/Portfolio/actions/runs/45999999003",
  }),
];

// De gepoolde verwachting bij deze drie runs: Σ 145 + 145 + 145 = 435 uitgevoerd,
// Σ 145 + 141 + 145 = 431 geslaagd → ratio 99,1%. Alle runs hebben een noemer,
// dus de notering noemt drie runs. De laatste run is de groene run 74.
const POOLED_TOTAL = "435";
const POOLED_PASSED = "431 van 435";
const POOLED_RATIO = "99,1%";
const LATEST_RUN_URL =
  "https://github.com/MaartenKa/Portfolio/actions/runs/45999999001";

/**
 * De E2E-laag (TESTPLAN §4: de kern van de pyramide, §7 scenarios S1–S6).
 *
 * Deze flows bewijzen **journey-continuity**: de gebruiker landt op elke stap op
 * de verwachte pagina. De detail-asserts — attributes, focus, payload, kaarten —
 * staan in de gefocuste suites (NAV, F, MENU, CIH, SEO, A11Y); de flows
 * dupliceren die niet (BESTPRACTICES §25, TESTPLAN §8). Doel G14, IDs E2E-01…06
 * en de traceability staan in `TESTPLAN.md` §2, §8.6 en §15.
 */
test.describe("E2E – Gebruikersflows (E2E-01…E2E-06, TESTPLAN §7 S1–S6)", () => {
  test.describe("S1 – volledige navigatietour", () => {
    test("E2E-01 (S1): elke nav-link van de navigatielijst landt op de eigen pagina", async ({
      flowPage,
    }) => {
      await flowPage.navigateTo("");
      await flowPage.expectLandedOn(HOME_LANDING);

      await flowPage.expectJourneyPath(NAV_JOURNEY_STEPS);
      await flowPage.expectNoRuntimeErrors();
    });
  });

  test.describe("S2 – contactjourney", () => {
    test("E2E-02 (S2): van de homepage via het formulier naar de bedanktpagina en terug", async ({
      flowPage,
      contactPage,
      formwardMock,
      page,
    }) => {
      await flowPage.navigateTo("");
      await flowPage.followNavLink("nav-contact");

      // Partitie "lege verplichte velden" vóór de submit: het formulier is nog
      // ongeldig, dus er is niets getypt en er is geen request (F2, TESTPLAN §7).
      await contactPage.expectFormInvalid();

      await contactPage.fillForm(VALID_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();

      // Journey-continuity: terug naar het formulier zonder nieuwe submit (F10).
      await page.goBack();
      await contactPage.expectNotRedirected();

      // Exact één POST met de Formward-velden en de redirect-target.
      await formwardMock.expectRequestCount(1);
      await formwardMock.expectRequestMethod("POST");
      await formwardMock.expectPostedFieldNames(FORM_POST_FIELDS);
      await formwardMock.expectPostedValue("_redirect", THANK_YOU_PAGE);
    });
  });

  test.describe("S3 – mobiel menu-journey", () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test("E2E-03 (S3): open het menu, navigeer, en het menu is gesloten op de nieuwe pagina", async ({
      flowPage,
      navPage,
    }) => {
      await flowPage.navigateTo("");
      await navPage.expectMenuClosedOnMobile();

      await navPage.toggleMenu();
      await navPage.expectMenuOpen();

      // Focusbeheer bij openen: de focus gaat naar de eerste nav-link (MENU-05).
      await expect(navPage.firstNavLink).toBeFocused();

      await navPage.clickNavLink("nav-automation", /automation\.html/);

      // Journey-continuity op de landingspagina: menu gesloten, aria en h1 correct.
      await navPage.expectMenuClosedOnMobile();
      await navPage.expectToggleAriaExpanded(false);
      await flowPage.expectLandedOn({
        url: /automation\.html/,
        heading: "Automatiseren",
      });
    });
  });

  test.describe("S4 – CI-dashboard-journey", () => {
    test("E2E-04 (S4): van de homepage naar het dashboard, met de kaarten, de rijen en de run-link", async ({
      flowPage,
      ciHistoryPage,
    }) => {
      // De mock staat vóór de navigatie: de kaarten en de tabel rendert de site
      // client-side uit deze fixture-cijfers (CIH-01…CIH-03, TESTPLAN §8.5).
      await ciHistoryPage.mockHistory(dashboardRuns);
      await ciHistoryPage.navigate();

      // Laatste-run kaarten: de nieuwste run (run 74, groen, 145 tests).
      await expect(ciHistoryPage.value("ci-suite-size")).toHaveText("145 tests");
      await expect(ciHistoryPage.value("ci-runs")).toHaveText("3");
      await expect(ciHistoryPage.value("ci-total-tests")).toHaveText("145");
      await expect(ciHistoryPage.value("ci-pass-rate")).toHaveText("100%");
      await expect(ciHistoryPage.value("ci-status")).toHaveText("Geslaagd");

      // Aggregate kaarten: de gepoolde ratio is Σ passed / Σ total.
      await expect(ciHistoryPage.value("ci-total-executed")).toHaveText(POOLED_TOTAL);
      await expect(ciHistoryPage.value("ci-total-passed")).toHaveText(POOLED_PASSED);
      await expect(ciHistoryPage.value("ci-pass-ratio")).toHaveText(POOLED_RATIO);
      await expect(ciHistoryPage.value("ci-streak")).toHaveText("1");
      await expect(ciHistoryPage.value("ci-flaky-runs")).toHaveText("1");
      await expect(ciHistoryPage.value("ci-failed-runs")).toHaveText("1");

      // Journey-continuity: één rij per run, met de veilige run-link, en de
      // navigatie brengt de gebruiker terug naar de homepage.
      await expect(ciHistoryPage.historyRows()).toHaveCount(3);
      await flowPage.expectRunLinkContract(LATEST_RUN_URL);

      await flowPage.followNavLink("nav-home");
      await flowPage.expectLandedOn(HOME_LANDING);
    });
  });

  test.describe("S5 – footer-journey", () => {
    test("E2E-05 (S5): footer-contract, actieve footer-link en terugkeer naar de homepage", async ({
      flowPage,
      footerPage,
    }) => {
      await flowPage.navigateTo("");

      // Het link-contract van de footer op de homepage: href en de veilige
      // externe attributen (NAV-04).
      for (const link of FOOTER_LINK_CONTRACT) {
        await footerPage.expectLink(link.testId, link.href, link.external);
      }

      // De reis via de twee interne footerlinks, met de actieve state per pagina
      // (NAV-05) en de terugkeer naar de homepage via de navigatie. De vertakking
      // staat in het page object, niet in het test-lichaam (`no-conditional-in-test`).
      await flowPage.expectFooterJourney();
    });
  });

  test.describe("S6 – hersteljourney vanaf de 404-fallback", () => {
    test("E2E-06 (S6): een onbekend pad eindigt als 404 en de navigatie herstelt naar de homepage", async ({
      flowPage,
    }) => {
      await flowPage.expectNotFoundRecovery(UNKNOWN_PATH);
    });
  });
});

