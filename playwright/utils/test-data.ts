/**
 * Gedeelde statische test data & constants.
 */

/** Formward submit URL (gebruikt voor mocking). */
export const FORMWARD_URL =
  "https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7";

/** Bedankt-pagina pad. */
export const THANK_YOU_PAGE = "bedankt.html";

/** E-mail adres (gebruikt in contact tests / footer checks). */
export const EMAIL = "Maarten.kamps.bee@outlook.com";

/** Externe links. */
export const GITHUB_URL = "https://github.com/MaartenKa/Portfolio";
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/maarten-kamps-a6909527/";

/** Pagina's voor de smoke lightweight check. */
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
