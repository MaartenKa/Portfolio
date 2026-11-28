// Portfolio — playwright/pages/contact.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import {
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  SUBJECT_MAX_LENGTH,
} from "../utils/test-data";

/** Invoer voor het contactformulier; elk veld is optioneel. */
export interface ContactFormData {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/** Honeypot-veld uit het `data-testid`-contract van `contact.html`. */
const HONEYPOT_TEST_ID = "field-honeypot";

/**
 * F5: de tab-volgorde door het formulier, volgens de markup-volgorde van
 * `contact.html`. Het honeypot-veld staat tussen Bericht en de submit-knop en
 * heeft `tabindex="-1"`, dus de tabbar springt over het veld.
 */
export const FORM_TAB_TRAIL = [
  "field-name",
  "field-email",
  "field-subject",
  "field-message",
  "form-submit",
] as const;

/**
 * F8c: de `maxlength`-limieten van de drie gelimiteerde velden, uit het
 * `data-testid`-contract van `contact.html`. Het e-mailveld heeft geen
 * lengte-limiet; de validatie van het e-mailtype is daar de grens.
 */
export const MAX_LENGTH_FIELDS = [
  { testId: "field-name", maxLength: NAME_MAX_LENGTH },
  { testId: "field-subject", maxLength: SUBJECT_MAX_LENGTH },
  { testId: "field-message", maxLength: MESSAGE_MAX_LENGTH },
] as const;

/** Page object voor de contactpagina en het Formward-formulier. */
export class ContactPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<ContactPage> {
    const response = await super.goto("contact.html");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(this.page).toHaveTitle(/Contact/);
    return this;
  }

  async expectFormInvalid(): Promise<void> {
    const form = this.page.getByTestId("contact-form");
    const isValid = await form.evaluate((element) =>
      (element as HTMLFormElement).checkValidity(),
    );

    expect(isValid, "Formulier is onverwacht geldig").toBe(false);
  }

  async expectFieldInvalid(label: string): Promise<void> {
    const field = this.page.getByLabel(label);
    const isValid = await field.evaluate((element) =>
      (element as HTMLInputElement | HTMLTextAreaElement).checkValidity(),
    );

    expect(isValid, `Veld "${label}" is onverwacht geldig`).toBe(false);
  }

  async expectTitleContains(title: string): Promise<void> {
    // Escape regex-metatekens, zodat de titel als letterlijke tekst wordt gezocht.
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await expect(this.page).toHaveTitle(new RegExp(escapedTitle));
  }

  async fillForm(data: ContactFormData): Promise<void> {
    if (data.name !== undefined) {
      await this.page.getByLabel("Naam").fill(data.name);
    }
    if (data.email !== undefined) {
      await this.page.getByLabel("E-mailadres").fill(data.email);
    }
    if (data.subject !== undefined) {
      await this.page.getByLabel("Onderwerp").fill(data.subject);
    }
    if (data.message !== undefined) {
      await this.page.getByLabel("Bericht").fill(data.message);
    }
  }

  /**
   * Vulde de honeypot: de bot-simulatie voor testcase F5.
   *
   * Het honeypot-veld staat `display:none`, dus Playwright's actionability-check
   * voor `fill()` slaagt daar niet. De waarde wordt direct op het element gezet,
   * omdat F5 het payload-contract test en niet de interactie van een mens.
   *
   * @param value - De bot-waarde die in de submit mee moet gaan.
   */
  async fillHoneypot(value: string): Promise<void> {
    await this.page.getByTestId(HONEYPOT_TEST_ID).evaluate((element, text) => {
      (element as HTMLInputElement).value = text;
    }, value);
  }

  async submitForm(): Promise<void> {
    await this.page.getByRole("button", { name: "Verstuur bericht" }).click();
  }

  async expectRedirectToThankYouPage(): Promise<void> {
    await expect(this.page).toHaveURL(/bedankt\.html/);
    await expect(
      this.page.getByText("Bedankt, uw bericht is ontvangen"),
    ).toBeVisible();
  }

  async expectNotRedirected(): Promise<void> {
    await expect(this.page).toHaveURL(/contact\.html/);
  }

  async expectFieldVisible(label: string): Promise<void> {
    await expect(this.page.getByLabel(label)).toBeVisible();
  }

  async expectHoneypotHidden(): Promise<void> {
    const honeypot = this.page.getByTestId(HONEYPOT_TEST_ID);
    await expect(honeypot).toBeHidden();
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("autocomplete", "off");
  }

  /**
   * F5: de tabbar laat het honeypot-veld overslaan.
   *
   * Start op het eerste veld en loopt de tabvolgorde door de vier formuliervelden
   * en de submit-knop. De trail is de `data-testid`-volgorde uit de markup, dus
   * een `tabindex="-1"`-verandering in de honeypot faalt hier. Het actieve
   * element wordt via de DOM gelezen, omdat de Playwright-testtypes geen
   * focused-element-helper op `Page` hebben.
   */
  async expectTabOrderSkipsHoneypot(): Promise<void> {
    const trail: string[] = [];

    await this.page.getByLabel("Naam").focus();
    trail.push("field-name");

    for (let step = 1; step <= FORM_TAB_TRAIL.length - 1; step += 1) {
      await this.page.keyboard.press("Tab");
      trail.push(
        await this.page.evaluate(() => {
          const active = document.activeElement as HTMLElement | null;
          return active?.getAttribute("data-testid") ?? "";
        }),
      );
    }

    expect(
      trail,
      "De tabvolgorde van het formulier wijkt af van het testcontract",
    ).toEqual([...FORM_TAB_TRAIL]);
    expect(
      trail,
      "Het honeypot-veld mag niet focusbaar zijn via het toetsenbord",
    ).not.toContain(HONEYPOT_TEST_ID);
  }

  async expectPrivacyLink(): Promise<void> {
    const link = this.page.getByRole("link", { name: "privacyverklaring" });
    await expect(link).toBeVisible();
    // Relatief pad (conventie PLAYWRIGHT.md §8): een absoluut "/privacy.html"
    // levert een 404 op de GitHub Pages-subpath /Portfolio/.
    await expect(link).toHaveAttribute("href", /^privacy\.html$/);
  }

  async expectEmailLink(): Promise<void> {
    const link = this.page.getByRole("link", { name: "E-mailen" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", `mailto:${EMAIL}`);
  }

  async expectGitHubLink(): Promise<void> {
    const link = this.page.getByTestId("footer-github");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", GITHUB_URL);
  }

  async expectLinkedInLink(): Promise<void> {
    const link = this.page.getByTestId("footer-linkedin");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", LINKEDIN_URL);
  }

  /**
   * F8c: elk gelimiteerd veld draagt de `maxlength` uit de markup — de
   * specificatiegrens waar F6 en F8 op bounderen (TESTPLAN §5.5).
   */
  async expectMaxLengthContract(): Promise<void> {
    for (const field of MAX_LENGTH_FIELDS) {
      await expect(
        this.page.getByTestId(field.testId),
        `Veld "${field.testId}" heeft de maxlength niet in de markup`,
      ).toHaveAttribute("maxlength", String(field.maxLength));
    }
  }

  /**
   * F8e: typen in het bericht. `fill()` zet de `value` direct en omzeilt de
   * `maxlength`; typen respekteert de limiet, dus de afkapping is daar meetbaar.
   */
  async typeMessage(text: string): Promise<void> {
    await this.page.getByTestId("field-message").click();
    await this.page.keyboard.insertText(text);
  }

  /** F8e: de lengte van het bericht in het veld, na de afkapping. */
  async expectMessageLength(length: number): Promise<void> {
    const valueLength = await this.page
      .getByTestId("field-message")
      .evaluate((element) => (element as HTMLTextAreaElement).value.length);

    expect(valueLength, `Verwacht ${length} tekens in het bericht`).toBe(length);
  }

  /**
   * F8a: bij een ongeldige submit is de submit-guard rustend. Native validatie
   * voert het submit-event niet uit, dus het formulier is niet gemarkeerd en de
   * knop blijft actief (TESTPLAN §7 F2/F3 en F8).
   */
  async expectSubmitGuardIdle(): Promise<void> {
    const submitted = await this.page
      .getByTestId("contact-form")
      .evaluate((element) => (element as HTMLFormElement).dataset.submitted);

    expect(submitted, "De submit-guard is onverwacht actief").toBeUndefined();
    await expect(this.page.getByTestId("form-submit")).toBeEnabled();
  }

  /**
   * F8b: de dubbele submit-actie, in één synchronisch page-script.
   *
   * Playwright's `click()` wacht de navigatie van de submit af, dus na de eerste
   * submit is de knop al weggevoerd en is de guard-state op de pagina niet meer
   * waarneembaar. De twee submits en de observatie van de guard gebeuren daarom
   * in één page-script: de eerste submit markeert het formulier en deaktiveert
   * de knop, de tweede submit wordt door de guard geblokkeerd. De request-count
   * in de Formward-mock bevestigt daarna dat er maximaal één POST is gegaan.
   */
  async expectDoubleSubmitBlocked(): Promise<void> {
    const guard = await this.page.evaluate(() => {
      const form = document.querySelector("#contact-form") as HTMLFormElement;
      const button = form.querySelector(
        'button[type="submit"]',
      ) as HTMLButtonElement;

      form.requestSubmit();

      const marked = form.dataset.submitted;
      const disabled = button.disabled;

      form.requestSubmit();

      return { marked, disabled };
    });

    expect(
      guard.marked,
      "De submit-guard heeft het formulier niet gemarkeerd",
    ).toBe("true");
    expect(
      guard.disabled,
      "De submitknop is na de eerste submit niet gedeactiveerd",
    ).toBe(true);
  }
}
