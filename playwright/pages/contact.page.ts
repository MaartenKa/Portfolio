import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

const FORMWARD_URL =
  "https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7";

export interface ContactFormData {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export class ContactPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<ContactPage> {
    const response = await super.goto("/contact.html");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(this.page).toHaveTitle(/Contact/);
    return this;
  }

  /** Mock de Formward POST zodat tests deterministisch zijn en geen internet nodig hebben. */
  async mockFormSubmit(): Promise<void> {
    await this.page.route(FORMWARD_URL, async (route) => {
      // Het formulier doet een top-level document-navigatie (POST).
      // Een `Location`-header heeft alleen effect op een redirect-status (3xx);
      // met status 200 zou de browser hem negeren. Retourneer daarom een echte
      // 302-redirect zodat de browser naar /bedankt.html navigeert, zonder dat
      // het request het lokale domein verlaat (geen echt Formward-mailtje).
      await route.fulfill({
        status: 302,
        headers: { Location: "/bedankt.html" },
      });
    });
  }

  /** Verwijder de Formward-mock zodat native validatie de submit kan blokkeren. */
  async clearFormMock(): Promise<void> {
    await this.page.unroute(FORMWARD_URL);
  }

  async expectTitleContains(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(title));
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

  async submitForm(): Promise<void> {
    await this.page.getByRole("button", { name: "Verstuur bericht" }).click();
  }

  async expectRedirectToThankYouPage(): Promise<void> {
    await expect(this.page).toHaveURL(/bedankt\.html/);
    await expect(
      this.page.getByText("Bedankt uw bericht is ontvangen"),
    ).toBeVisible();
  }

  async expectNotRedirected(): Promise<void> {
    await expect(this.page).toHaveURL(/contact\.html/);
  }

  async expectFieldVisible(label: string): Promise<void> {
    await expect(this.page.getByLabel(label)).toBeVisible();
  }

  async expectHoneypotHidden(): Promise<void> {
    const honeypot = this.page.getByTestId("field-honeypot");
    await expect(honeypot).toHaveAttribute("style", /display:\s*none/);
  }

  async expectPrivacyLink(): Promise<void> {
    const link = this.page.getByRole("link", { name: "privacyverklaring" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", /privacy\.html/);
  }

  async expectEmailLink(): Promise<void> {
    const link = this.page.getByRole("link", { name: "E-mailen" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "mailto:Maarten.kamps.bee@outlook.com",
    );
  }

  async expectGitHubLink(): Promise<void> {
    const link = this.page.getByTestId("footer-github");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/MaartenKa/Portfolio",
    );
  }

  async expectLinkedInLink(): Promise<void> {
    const link = this.page.getByTestId("footer-linkedin");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/maarten-kamps-a6909527/",
    );
  }
}
