// Portfolio — playwright/utils/test-data.ts

/**
 * Gedeelde statische testdata en constanten.
 */

/** Formward-submit-URL, gebruikt voor mocking. */
export const FORMWARD_URL =
  "https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7";

/** Pad naar de bedanktpagina. */
export const THANK_YOU_PAGE = "bedankt.html";

/** E-mailadres, gebruikt in contacttests en footerchecks. */
export const EMAIL = "Maarten.kamps.bee@outlook.com";

/** Externe links naar GitHub en LinkedIn. */
export const GITHUB_URL = "https://github.com/MaartenKa/Portfolio";
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/maarten-kamps-a6909527/";

/** Testcase F1/F9: geldige formulierdataset. */
export const VALID_CONTACT = {
  name: "Test Gebruiker",
  email: "test@example.com",
  subject: "Test onderwerp",
  message: "Dit is een testbericht.",
};

/** Testcase F3: ongeldige e-maildataset. */
export const INVALID_EMAIL_CONTACT = {
  name: "Test Gebruiker",
  email: "ongeldig-email",
  message: "Dit is een testbericht.",
};

/** Vaste viewports voor de menu- en responsive-tests (TESTPLAN §6.3). */
export const DESKTOP_VIEWPORT = { width: 1920, height: 1080 } as const;
export const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;

/** Pagina's voor de lichte smoke-check. */
export const OTHER_PAGES_TO_TEST = [
  "curriculum.html",
  "testing.html",
  "automation.html",
  "projects.html",
  "personal.html",
  "contact.html",
  "privacy.html",
  "bedankt.html",
] as const;

/** Testcase F4: geldige submit zonder optioneel subject. */
export const OPTIONAL_SUBJECT_CONTACT = {
  name: "Test Gebruiker",
  email: "test@example.com",
  message: "Dit is een testbericht.",
};

/**
 * F8 (stap A): de `maxlength`-limieten van het contactformulier, zoals ze in
 * `docs/contact.html` staan. De limiet is de specificatiegrens voor de BVA van
 * F6 en F8 (TESTPLAN.md §5.5 en §7).
 */

export const NAME_MAX_LENGTH = 60;
export const SUBJECT_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 500;

/** Testcase F6: minimale naam en lange berichttekst. */
export const BOUNDARY_CONTACT = {
  name: "A",
  email: "test@example.com",
  subject: "Boundary",
  message: "x".repeat(MESSAGE_MAX_LENGTH),
};

/** Testcase F8d: elk gelimiteerd veld exact op de limiet van de HTML. */

export const AT_LIMIT_CONTACT = {
  name: "a".repeat(NAME_MAX_LENGTH),
  email: "test@example.com",
  subject: "s".repeat(SUBJECT_MAX_LENGTH),
  message: "x".repeat(MESSAGE_MAX_LENGTH),
};

/** Testcase F8e: één teken boven de berichtlimiet, getypt na de limiet. */

export const EXCESS_CHAR = "x";

/** Testcase F7: unicode, emoji en speciale tekens. */
export const SPECIAL_CHARS_CONTACT = {
  name: "Test 🚀",
  email: "test@example.com",
  subject: "Speciale tekens 🚀",
  message: "emoji 🚀 en <tag> tekst",
};

/** Testcase F5: honeypot-waarde (een bot-waarde, niet door een mens getypt). */
export const HONEYPOT_FILLED = "http://spam.example — bulkbericht";

/** Testcase F5: de Formward-velden die in een volledige submit horen. */
export const FORM_POST_FIELDS = [
  "name",
  "email",
  "subject",
  "message",
  "_gotcha",
  "_redirect",
] as const;

/** Alle HTML-pagina's van de site (10 bestanden), voor site-wide checks. */
export const ALL_PAGES = [
  "index.html",
  "curriculum.html",
  "testing.html",
  "automation.html",
  "projects.html",
  "personal.html",
  "contact.html",
  "privacy.html",
  "bedankt.html",
  "404.html",
] as const;

/**
 * A11Y-03: de `aria-label` van elke benoemde `<section>` per pagina, in de
 * volgorde van de markup. Een `<section>` zonder accessible name is geen
 * landmark en staat hier dus niet.
 */
export const PAGE_SECTION_LABELS: Record<string, readonly string[]> = {
  "index.html": ["Intro", "Expertise", "Over mij", "Meer weten"],
  "curriculum.html": [
    "Curriculum",
    "Profiel",
    "Werkervaring",
    "Opleiding",
    "Vaardigheden",
    "Meer weten",
  ],
  "testing.html": [

    "Software Testen",
    "Mijn aanpak",
    "Testmethoden",
    "Mijn toolkit",
    "Volgende stap",
  ],
  "automation.html": [
    "Test Automatisering",
    "Automatisering",
    "Mijn automation stack",
    "Wat ik automatiseer",
    "Testresultaten",
    "Naar projecten",

  ],
  "projects.html": ["Intro", "Projecten", "Toekomstige projecten", "Naar GitHub"],
  "personal.html": [
    "Persoonlijke Projecten",
    "Interesses",
    "Persoonlijke ontwikkeling",
    "Contact",
  ],
  "contact.html": ["Contact", "Vind mij online"],
  "privacy.html": ["Privacyverklaring"],
  "bedankt.html": ["Bedankt"],
  "404.html": ["Pagina niet gevonden"],
};

/**
 * A11Y-01: de tabvolgorde van de `data-testid`-elementen op de homepage, in
 * desktopviewport. De skip-link en de logo-link hebben geen testid, dus de
 * page object leest die als `skip-link` en `logo`.
 */
export const HOME_TAB_TRAIL = [
  "nav-home",
  "nav-curriculum",
  "nav-testing",
  "nav-automation",
  "nav-projects",
  "nav-personal",
  "nav-contact",
  "cta-projects",
  "cta-curriculum",
  "card-link-testing",
  "card-link-automation",
  "card-link-projects",
  "card-link-scrum",
  "cta-projects-bottom",
  "footer-contact",
  "footer-github",
  "footer-linkedin",
  "footer-privacy",
] as const;

/**
 * A11Y-01: de tabvolgorde op de contactpagina. Het honeypot-veld heeft
 * `tabindex="-1"` en `display:none`, dus de tabbar laat het veld overslaan;
 * dat is hier expliciet als contract opgenomen.
 */
export const CONTACT_TAB_TRAIL = [
  "nav-home",
  "nav-curriculum",
  "nav-testing",
  "nav-automation",
  "nav-projects",
  "nav-personal",
  "nav-contact",
  "field-name",
  "field-email",
  "field-subject",
  "field-message",
  "form-submit",
  "cta-github-social",
  "cta-linkedin-social",
  "footer-contact",
  "footer-github",
  "footer-linkedin",
  "footer-privacy",
] as const;

/** A11Y-04: de placeholderkleur uit het design-systeem. */
export const PLACEHOLDER_COLOR = "rgb(148, 163, 184)";

/** A11Y-04: WCAG 2.1 drempel voor normale tekst (niveau AA). */
export const MIN_CONTRAST_AA = 4.5;

/** Basis-URL van de site, voor canonical en social-card asserts (SEO-03). */
export const SITE_BASE_URL = "https://maartenka.github.io/Portfolio/";

/** Delingsafbeelding van de site, in OG en Twitter op elke pagina identiek. */
export const OG_IMAGE_URL = `${SITE_BASE_URL}images/logoipsum-407.png`;

/** Titelvoorvoetsel dat op elke pagina in de `<title>` staat (SEO-01). */
export const TITLE_PREFIX = "Maarten Kamps";

/** SEO-01: lengtegrenzen voor `<title>` (gemeten 18–40 tekens op de 10 pagina's). */
export const MIN_TITLE_LENGTH = 10;
export const MAX_TITLE_LENGTH = 60;

/** SEO-01: lengtegrenzen voor de meta description (gemeten 18–86 tekens). */
export const MIN_DESCRIPTION_LENGTH = 15;
export const MAX_DESCRIPTION_LENGTH = 160;

/** SEO-02: de indexatie-keus van de site — elke pagina staat uit (PLAYWRIGHT §4). */
export const ROBOTS_CONTENT = "noindex, nofollow";

/** SEO-03: de social-card-waarden die op elke pagina identiek zijn. */
export const OG_TYPE = "website";
export const OG_LOCALE = "nl_NL";
export const OG_SITE_NAME = "Maarten Kamps";
export const OG_IMAGE_WIDTH = "400";
export const OG_IMAGE_HEIGHT = "326";
export const TWITTER_CARD = "summary";

/** SEO-04: de pagina's die in de sitemap horen (8 content-pagina's). */
export const SITEMAP_PAGES = [
  "index.html",
  "curriculum.html",
  "testing.html",
  "automation.html",
  "projects.html",
  "personal.html",
  "contact.html",
  "privacy.html",
] as const;

/** SEO-04: utility-pagina's die expliciet buiten de sitemap blijven. */
export const NON_SITEMAP_PAGES = ["404.html", "bedankt.html"] as const;

/** LINK-01 en IMG-01: site-bestanden die de markup mag refereren. */
export const SITE_ASSETS = [
  "css/style.css",
  "js/ts/main.js",
  "images/logoipsum-407.png",
  "data/playwright-history.json",
  "robots.txt",
  "sitemap.xml",
] as const;

/** IMG-01: de lokale afbeelding-bron van de site (placeholder-asset). */
export const LOCAL_IMAGE_SOURCES = ["images/logoipsum-407.png"] as const;

/**
 * RESP-01: de viewports van de responsive-suite, inclusief de CSS-grenzen
 * (TESTPLAN §6.3; `style.css` gebruikt `max-width: 850px` en `max-width: 500px`).
 * De grenzen zelf en de grens eronder zijn opgenomen, zodat de overschrijving
 * van de media query getest wordt — boundary value analysis op de breakpoint.
 */
export const RESPONSIVE_VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 850, height: 1024 },
  { width: 849, height: 1024 },
  { width: 500, height: 640 },
  { width: 499, height: 640 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
] as const;

/** RESP-01: de nav-breakpoint van `style.css` (`max-width: 850px`). */
export const NAV_BREAKPOINT = 850;

/** RESP-01: de compacte breakpoint van `style.css` (`max-width: 500px`). */
export const COMPACT_BREAKPOINT = 500;

/** RESP-01: de `data-testid`-contracten van de zeven nav-links. */
export const NAV_LINK_TEST_IDS = [
  "nav-home",
  "nav-curriculum",
  "nav-testing",
  "nav-automation",
  "nav-projects",
  "nav-personal",
  "nav-contact",
] as const;


/**
 * CIH-08: de Nederlandse caption van de geschiedenis-tabel op automation.html.
 * De caption is de accessible name van de tabel en staat als `.sr-only` in de
 * markup — visueel ingekrompen tot één pixel, maar wél leesbaar voor de
 * screenreader.
 */
export const CI_TABLE_CAPTION =
  "Geschiedenis van de laatste Playwright CI-runs";

/**
 * CIH-08: de zes kolomkoppen van de geschiedenis-tabel, in de volgorde van de
 * markup. De rijen die `src/ts/main.ts` bouwt, sluiten op deze zes kolommen aan.
 */
export const CI_TABLE_COLUMNS = [
  "Run",
  "Datum",
  "Status",
  "Tests",
  "Geslaagd",
  "Flaky",
] as const;

/** CIH-08: de `aria-label` van de CI-sectie op automation.html. */
export const CI_SECTION_LABEL = "Testresultaten";

/** CIH-08: de accessible name van de statusbadge-link boven de CI-kaarten. */
export const CI_STATUS_BADGE_LABEL =
  "Bekijk Playwright-testruns op GitHub Actions";

/** CIH-08: de alt-tekst van de shields.io-badge in die statusbadge-link. */
export const CI_STATUS_BADGE_ALT =
  "Playwright tests: status van laatste CI-run";

/**
 * CIH-08: de kaartlabels van de CI-sectie, in de volgorde van de markup —
 * eerst de vijf kaarten van de laatste run, dan de zes aggregate kaarten.
 */
export const CI_CARD_LABELS = [
  "Suite omvang",
  "Testruns",
  "Tests uitgevoerd (laatste run)",
  "Tests geslaagd (laatste run)",
  "Laatste test run",
  "Totaal uitgevoerde tests",
  "Totaal geslaagd",
  "Geslaagde ratio",
  "Groene runs op rij",
  "Flaky runs",
  "Gefaalde runs",
] as const;
