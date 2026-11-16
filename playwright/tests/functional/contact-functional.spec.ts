import { test } from "../../fixtures/test-fixtures";
import {
  INVALID_EMAIL_CONTACT,
  VALID_CONTACT,
} from "../../utils/test-data";

test.describe("Contactpagina - functionele tests", () => {
  test.describe("Pagina-structuur", () => {
    test("titel bevat 'Contact'", async ({ contactPage }) => {
      await contactPage.expectTitleContains("Contact");
    });

    test("alle formuliervelden zijn zichtbaar", async ({ contactPage }) => {
      await contactPage.expectFieldVisible("Naam");
      await contactPage.expectFieldVisible("E-mailadres");
      await contactPage.expectFieldVisible("Onderwerp");
      await contactPage.expectFieldVisible("Bericht");
    });

    test("honeypot-veld is verborgen", async ({ contactPage }) => {
      await contactPage.expectHoneypotHidden();
    });

    test("privacyverklaring-link verwijst naar privacy-pagina", async ({
      contactPage,
    }) => {
      await contactPage.expectPrivacyLink();
    });

    test("e-mail-link heeft correct mailto-adres", async ({ contactPage }) => {
      await contactPage.expectEmailLink();
    });

    test("GitHub-link heeft correcte URL", async ({ contactPage }) => {
      await contactPage.expectGitHubLink();
    });

    test("LinkedIn-link heeft correcte URL", async ({ contactPage }) => {
      await contactPage.expectLinkedInLink();
    });
  });

  test.describe("Formulier-inzending", () => {
    test("geldig formulier redirect naar bedanktpagina", async ({
      contactPage,
    }) => {
      await contactPage.fillForm(VALID_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await contactPage.expectFormwardRequestCount(1);
    });

    test("formulier zonder verplichte velden redirect niet", async ({
      contactPage,
    }) => {
      await contactPage.submitForm();
      await contactPage.expectNotRedirected();
      await contactPage.expectFormInvalid();
      await contactPage.expectFieldInvalid("Naam");
      await contactPage.expectFieldInvalid("E-mailadres");
      await contactPage.expectFieldInvalid("Bericht");
      await contactPage.expectFormwardRequestCount(0);
    });

    test("formulier met ongeldige e-mail redirect niet", async ({
      contactPage,
    }) => {
      await contactPage.fillForm(INVALID_EMAIL_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectNotRedirected();
      await contactPage.expectFormInvalid();
      await contactPage.expectFieldInvalid("E-mailadres");
      await contactPage.expectFormwardRequestCount(0);
    });
  });
});
