import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class ContactPage extends BasePage {
  private readonly nameField = this.page.getByTestId("field-name");
  private readonly emailField = this.page.getByTestId("field-email");
  private readonly subjectField = this.page.getByTestId("field-subject");
  private readonly messageField = this.page.getByTestId("field-message");
  private readonly honeypotField = this.page.getByTestId("field-honeypot");
  private readonly submitButton = this.page.getByTestId("form-submit");

  constructor(page: Page) {
    super(page);
  }

  // --- Acties ---

  async fillForm(
    name: string,
    email: string,
    subject: string,
    message: string,
    honeypot?: string,
  ) {
    await this.nameField.fill(name);
    await this.emailField.fill(email);
    if (subject) await this.subjectField.fill(subject);
    await this.messageField.fill(message);
    if (honeypot !== undefined) {
      // Honeypot is per definitie verborgen; fill() vereist zichtbaarheid,
      // dus we zetten de waarde direct in de DOM.
      await this.honeypotField.evaluate((el, value) => {
        (el as HTMLInputElement).value = value;
      }, honeypot);
    }
    return this;
  }

  async submit() {
    await this.submitButton.click();
    return this;
  }

  // --- Asserties ---

  async expectFormSubmitted() {
    await expect(this.page).toHaveURL(/bedankt\.html/);
    return this;
  }

  async expectStillOnContactPage() {
    await expect(this.page).toHaveURL(/contact\.html/);
    return this;
  }

  async expectRequiredFieldsInvalid() {
    await expect(this.nameField).toHaveJSProperty("validity.valid", false);
    await expect(this.emailField).toHaveJSProperty("validity.valid", false);
    await expect(this.messageField).toHaveJSProperty("validity.valid", false);
    return this;
  }

  async expectNoConsoleErrors() {
    return super.expectNoConsoleErrors();
  }

  // --- Helpers voor tests die netwerk willen inspecteren ---

  getFormActionUrl(): string {
    return "https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7";
  }
}
