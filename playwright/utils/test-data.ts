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

/** Testcase F6: minimale naam en lange berichttekst. */
export const BOUNDARY_CONTACT = {
  name: "A",
  email: "test@example.com",
  subject: "Boundary",
  message: "x".repeat(500),
};

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
