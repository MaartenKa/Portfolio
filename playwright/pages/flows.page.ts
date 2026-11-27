// Portfolio — playwright/pages/flows.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { CARD_LINK_URLS } from "./home.page";
import { NAV_ITEM_URLS } from "./mobile.page";
import { GITHUB_URL, LINKEDIN_URL } from "../utils/test-data";

/**
 * Eén landingspagina in een gebruikersflow: de URL waar de gebruiker komt en de
 * h1 die de pagina daar toont. De h1 is het zichtbare bewijs van de landing —
 * een URL-check alleen bewijst niet dat de gebruiker de juiste pagina ziet.
 */
export interface FlowLanding {
  readonly url: RegExp;
  readonly heading: string;
}

/** Eén stap van een flow: de link die de gebruiker klikt en waar hij landt. */
export interface FlowStep {
  readonly testId: string;
  readonly landing: FlowLanding;
}

/**
 * Landing van de homepage. De site-root (`/`) en `index.html` zijn dezelfde
 * pagina: de root is het startpunt van de standaardsuite, `index.html` is de
 * landing na een klik op `nav-home`.
 */
export const HOME_LANDING: FlowLanding = {
  url: /(index\.html$|\/$)/,
  heading: "Breaking software",
};

/**
 * E2E-01 (S1): de volledige navigatietour, in de volgorde van de
 * navigatielijst (`NAV_LINK_TEST_IDS`) — dezelfde zeven nav-links op elke
 * pagina. Elke stap landt op de eigen pagina met de eigen h1 uit de markup.
 */
export const NAV_JOURNEY_STEPS: readonly FlowStep[] = [
  {
    testId: "nav-curriculum",
    landing: { url: /curriculum\.html/, heading: "Curriculum Vitae" },
  },
  {
    testId: "nav-testing",
    landing: { url: /testing\.html/, heading: "Software Testen" },
  },
  {
    testId: "nav-automation",
    landing: { url: /automation\.html/, heading: "Automatiseren" },
  },
  {
    testId: "nav-projects",
    landing: { url: /projects\.html/, heading: "Projecten" },
  },
  {
    testId: "nav-personal",
    landing: { url: /personal\.html/, heading: "Persoonlijke Projecten" },
  },
  {
    testId: "nav-contact",
    landing: { url: /contact\.html/, heading: "Laten we kennismaken" },
  },
  { testId: "nav-home", landing: HOME_LANDING },
];

/**
 * E2E-05 (S5): de footerreis. Alleen de twee interne footerlinks zijn klikbaar
 * in de flow; de externe links (GitHub, LinkedIn) openen een nieuwe tab en
 * worden op hun attributen geassert, niet op hun navigatie (TESTPLAN §6.2).
 * `activeId` is de footer-link die op de landingspagina actief moet zijn, of
 * `null` op de homepage — daar is geen enkele footer-link actief (NAV-05).
 */
export interface FooterJourneyStep extends FlowStep {
  readonly activeId: string | null;
}

export const FOOTER_JOURNEY_STEPS: readonly FooterJourneyStep[] = [
  {
    testId: "footer-contact",
    landing: { url: /contact\.html/, heading: "Laten we kennismaken" },
    activeId: "footer-contact",
  },
  {
    testId: "footer-privacy",
    landing: { url: /privacy\.html/, heading: "Privacyverklaring" },
    activeId: "footer-privacy",
  },
  { testId: "nav-home", landing: HOME_LANDING, activeId: null },
];

/** E2E-05: het link-contract van de footer — href en extern/intern. */
export const FOOTER_LINK_CONTRACT = [
  { testId: "footer-contact", href: "contact.html", external: false },
  { testId: "footer-privacy", href: "privacy.html", external: false },
  { testId: "footer-github", href: GITHUB_URL, external: true },
  { testId: "footer-linkedin", href: LINKEDIN_URL, external: true },
] as const;

/**
 * Page object voor de E2E-gebruikersflows (E2E-01…E2E-06, TESTPLAN §7 S1–S6).
 *
 * Dit page object is niet pagina-specifiek: het bewijst de **journey-continuity**
 * — de gebruiker landt op elke stap op de verwachte pagina met de verwachte h1.
 * De detail-asserts (attributes, focus, payload, kaarten) staan in de bestaande
 * page objects van de functionele suites; de flows hergebruiken die en dupliceren
 * ze niet (BESTPRACTICES §25: één testcase, één gedrag). De URL-contracten zijn
 * de bestaande mappen `NAV_ITEM_URLS` en `CARD_LINK_URLS`, niet een eigen lijst.
 */
export class FlowPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Navigeert naar het startpunt van de flow en controleert de HTTP-status. */
  async navigateTo(path: string): Promise<void> {
    const response = await super.goto(path);
    expect(response).not.toBeNull();
    expect(response!.status(), `Startpunt "${path}" gaf geen 200`).toBe(200);
  }

  /** Flow-contract: de gebruiker landt op de verwachte pagina met de verwachte h1. */
  async expectLandedOn(landing: FlowLanding): Promise<void> {
    await expect(
      this.page,
      `Flow landt niet op de pagina "${landing.heading}"`,
    ).toHaveURL(landing.url);

    const heading = this.page.getByRole("heading", { level: 1 });
    await expect(
      heading,
      `De h1 van "${landing.heading}" is niet zichtbaar`,
    ).toBeVisible();
    await expect(
      heading,
      `De h1 van "${landing.heading}" wijkt af`,
    ).toContainText(landing.heading);
  }

  /**
   * Klik een nav-link en land op de bijbehorende pagina. De bestemming komt uit
   * het bestaande `NAV_ITEM_URLS`-contract, zodat de flow geen URL-lijst dupliceert.
   *
   * @param testId - `data-testid` van de nav-link.
   */
  async followNavLink(testId: string): Promise<void> {
    const expectedUrl = NAV_ITEM_URLS[testId];
    await this.page.getByTestId(testId).click();
    await expect(
      this.page,
      `Nav-link "${testId}" landt niet op de verwachte pagina`,
    ).toHaveURL(expectedUrl);
  }

  /**
   * Klik een card-link op de homepage en land op de bijbehorende pagina.
   *
   * @param testId - `data-testid` van de card-link.
   */
  async followCardLink(testId: string): Promise<void> {
    const expectedUrl = CARD_LINK_URLS[testId];
    await this.page.getByTestId(testId).click();
    await expect(
      this.page,
      `Card-link "${testId}" landt niet op de verwachte pagina`,
    ).toHaveURL(expectedUrl);
  }

  /**
   * Klik een interne footer-link en land op de bijbehorende pagina.
   *
   * @param testId - `data-testid` van de footer-link.
   * @param expectedUrl - Regex op de URL na de klik.
   */
  async followFooterLink(testId: string, expectedUrl: RegExp): Promise<void> {
    await this.page.getByTestId(testId).click();
    await expect(
      this.page,
      `Footer-link "${testId}" landt niet op de verwachte pagina`,
    ).toHaveURL(expectedUrl);
  }

  /**
   * E2E-05 (S5): de actieve footer-link op de landingspagina, met de inactieve
   * tegenhanger — de actieve state per pagina (NAV-05).
   *
   * @param activeId - `data-testid` van de link die actief moet zijn.
   * @param inactiveId - `data-testid` van de tegenhanger die niet actief mag zijn.
   */
  async expectFooterActive(
    activeId: string,
    inactiveId: string,
  ): Promise<void> {
    const active = this.page.getByTestId(activeId);
    await expect(
      active,
      `Footer-link "${activeId}" is niet actief op deze pagina`,
    ).toHaveClass(/active/);
    await expect(
      active,
      `De actieve footer-link "${activeId}" heeft de actieve kleur niet`,
    ).toHaveCSS("color", "rgb(134, 239, 172)");
    await expect(
      this.page.getByTestId(inactiveId),
      `Footer-link "${inactiveId}" is onverwacht actief op deze pagina`,
    ).not.toHaveClass(/active/);
  }

  /** E2E-05 (S5): op de homepage is geen enkele footer-link actief. */
  async expectNoActiveFooterLink(): Promise<void> {
    for (const link of FOOTER_LINK_CONTRACT) {
      await expect(
        this.page.getByTestId(link.testId),
        `Footer-link "${link.testId}" is onverwacht actief op de homepage`,
      ).not.toHaveClass(/active/);
    }
  }

  /**
   * E2E-05 (S5): de volledige footerreis. De vertakking tussen "actieve link op
   * de bestemmingspagina" en "geen actieve link op de homepage" staat in dit
   * page object, niet in het test-lichaam (`no-conditional-in-test`).
   */
  async expectFooterJourney(): Promise<void> {
    for (const step of FOOTER_JOURNEY_STEPS) {
      await this.followFooterLink(step.testId, step.landing.url);
      await this.expectLandedOn(step.landing);

      if (step.activeId === null) {
        await this.expectNoActiveFooterLink();
        continue;
      }

      const counterpart =
        step.activeId === "footer-contact" ? "footer-privacy" : "footer-contact";
      await this.expectFooterActive(step.activeId, counterpart);
    }
  }

  /**
   * E2E-01 (S1): de volledige tour — elke stap landt op de eigen pagina met de
   * eigen h1. De assert staat per stap, zodat een afwijking de positie in de
   * journey noemt en niet alleen het eindpunt.
   */
  async expectJourneyPath(steps: readonly FlowStep[]): Promise<void> {
    for (const step of steps) {
      await this.followNavLink(step.testId);
      await this.expectLandedOn(step.landing);
    }
  }

  /**
   * E2E-04 (S4): het contract van de run-link in de eerste rij van de
   * geschiedenis-tabel. De link wijst naar de GitHub-Actions-run van die run en
   * opent veilig in een nieuwe tab; de flow zelf klikt de externe link niet,
   * omdat de suite niet aan externe hosts hangt (TESTPLAN §6.2).
   */
  async expectRunLinkContract(runUrl: string): Promise<void> {
    const runLink = this.page
      .getByTestId("ci-history-body")
      .getByRole("row")
      .first()
      .getByRole("link");

    await expect(
      runLink,
      "De run-link in de eerste rij heeft niet de Run-notatie",
    ).toHaveText(/^Run \d+$/);
    await expect(
      runLink,
      "De run-link wijst niet naar de eigen GitHub-Actions-run",
    ).toHaveAttribute("href", runUrl);
    await expect(runLink, "De run-link opent niet in een nieuwe tab").toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(
      runLink,
      "De run-link heeft niet het veilige rel-contract",
    ).toHaveAttribute("rel", "noopener noreferrer");
  }

  /**
   * E2E-06 (S6): de hersteljourney. Een onbekend pad eindigt als 404, de
   * fallbackpagina van de site is bereikbaar, en de navigatie brengt de
   * gebruiker terug naar de homepage zonder runtime-errors.
   *
   * De Pages-fallback op een willekeurig pad is een live-check (SM-03); deze
   * journey is op beide omgevingen deterministisch: het onbekende pad geeft de
   * 404-status en `404.html` is de fallbackpagina van de repo.
   */
  async expectNotFoundRecovery(unknownPath: string): Promise<void> {
    const missing = await super.goto(unknownPath);
    expect(missing, `Onbekend pad "${unknownPath}" gaf geen response`).not.toBeNull();
    expect(
      missing!.status(),
      `Een onbekend pad "${unknownPath}" moet als 404 eindigen`,
    ).toBe(404);

    const fallback = await super.goto("404.html");
    expect(fallback, "De 404-fallback van de site gaf geen response").not.toBeNull();
    expect(
      fallback!.status(),
      "De 404-fallbackpagina van de site is niet bereikbaar",
    ).toBe(200);

    await expect(
      this.page.getByRole("heading", { level: 1, name: "Pagina niet gevonden" }),
      "De 404-fallback toont de fallback-content niet",
    ).toBeVisible();

    await this.followNavLink("nav-home");
    await this.expectLandedOn(HOME_LANDING);
    await this.expectNoRuntimeErrors();
  }
}

