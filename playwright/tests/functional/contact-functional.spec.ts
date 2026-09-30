import { test } from "@playwright/test";
import { ContactPage } from "../../pages/contact.page";

test.describe("Contactpagina - functionele tests", () => {
  let contact: ContactPage;

  test.beforeEach(async ({ page }) => {
    contact = new ContactPage(page);
    // Installeer de Formward-mock VÓÓR het navigeren, zodat elke request naar
    // Formward (incl. een eventuele submit) al geïntercepteerd wordt en er nooit
    // een echt POST/mailtje weggaat. Tests die native validatie willen testen,
    // roepen zelf clearFormMock() aan.
    await contact.mockFormSubmit();
    await contact.navigate();
  });

  test.describe("Pagina-structuur", () => {
    test("titel bevat 'Contact'", async () => {
      await contact.expectTitleContains("Contact");
    });

    test("alle formulievelden zijn zichtbaar", async () => {
      await contact.expectFieldVisible("Naam");
      await contact.expectFieldVisible("E-mailadres");
      await contact.expectFieldVisible("Onderwerp");
      await contact.expectFieldVisible("Bericht");
    });

    test("honeypot-veld is verborgen", async () => {
      await contact.expectHoneypotHidden();
    });

    test("privacyverklaring-link verwijst naar privacy-pagina", async () => {
      await contact.expectPrivacyLink();
    });

    test("e-mail-link heeft correct mailto-adres", async () => {
      await contact.expectEmailLink();
    });

    test("GitHub-link heeft correcte URL", async () => {
      await contact.expectGitHubLink();
    });

    test("LinkedIn-link heeft correcte URL", async () => {
      await contact.expectLinkedInLink();
    });
  });

  test.describe("Formulier-inzending", () => {
    // De Formward-mock staat al in de bovenliggende beforeEach.
    test("geldig formulier redirect naar bedanktpagina", async () => {
      await contact.fillForm({
        name: "Test Gebruiker",
        email: "test@example.com",
        subject: "Test onderwerp",
        message: "Dit is een testbericht.",
      });
      await contact.submitForm();
      await contact.expectRedirectToThankYouPage();
    });

    test("formulier zonder verplichte velden redirect niet", async () => {
      await contact.clearFormMock();
      await contact.submitForm();
      await contact.expectNotRedirected();
    });

    test("formulier met ongeldige e-mail redirect niet", async () => {
      await contact.clearFormMock();
      await contact.fillForm({
        name: "Test Gebruiker",
        email: "ongeldig-email",
        message: "Dit is een testbericht.",
      });
      await contact.submitForm();
      await contact.expectNotRedirected();
    });
  });
});

