import { test } from "../../fixtures/test-fixtures";
import {
  BOUNDARY_CONTACT,
  INVALID_EMAIL_CONTACT,
  OPTIONAL_SUBJECT_CONTACT,
  SPECIAL_CHARS_CONTACT,
  VALID_CONTACT,
} from "../../utils/test-data";

test.describe("Contactpagina - functionele tests", () => {
  test.beforeEach(async ({ contactPage, formwardMock: _formwardMock }) => {
    // De mock wordt via de fixture geïnstalleerd; navigeer daarom pas daarna.
    await contactPage.navigate();
  });

  test.describe("Pagina-structuur", () => {
    test("titel bevat Contact", async ({ contactPage }) => {
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
      formwardMock,
    }) => {
      await contactPage.fillForm(VALID_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await formwardMock.expectRequestCount(1);
    });

    test("formulier zonder verplichte velden redirect niet", async ({
      contactPage,
      formwardMock,
    }) => {
      await contactPage.submitForm();
      await contactPage.expectNotRedirected();
      await contactPage.expectFormInvalid();
      await contactPage.expectFieldInvalid("Naam");
      await contactPage.expectFieldInvalid("E-mailadres");
      await contactPage.expectFieldInvalid("Bericht");
      await formwardMock.expectRequestCount(0);
    });

    test("formulier met ongeldige e-mail redirect niet", async ({
      contactPage,
      formwardMock,
    }) => {
      await contactPage.fillForm(INVALID_EMAIL_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectNotRedirected();
      await contactPage.expectFormInvalid();
      await contactPage.expectFieldInvalid("E-mailadres");
      await formwardMock.expectRequestCount(0);
    });

    test("F4: geldige submit zonder optioneel subject", async ({
      contactPage,
      formwardMock,
    }) => {
      await contactPage.fillForm(OPTIONAL_SUBJECT_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await formwardMock.expectRequestCount(1);
    });

    test("F6: boundary-waarden worden geaccepteerd", async ({
      contactPage,
      formwardMock,
    }) => {
      await contactPage.fillForm(BOUNDARY_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await formwardMock.expectRequestCount(1);
    });

    test("F7: speciale tekens worden geaccepteerd", async ({
      contactPage,
      formwardMock,
    }) => {
      await contactPage.fillForm(SPECIAL_CHARS_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await formwardMock.expectRequestCount(1);
    });

    test("F10: browser back na redirect werkt", async ({
      contactPage,
      formwardMock,
      page,
    }) => {
      await contactPage.fillForm(VALID_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await page.goBack();
      await contactPage.expectNotRedirected();
      await formwardMock.expectRequestCount(1);
    });
  });
});
