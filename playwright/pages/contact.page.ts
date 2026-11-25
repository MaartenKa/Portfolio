// Portfolio — playwright/pages/contact.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "../utils/test-data";

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
}
