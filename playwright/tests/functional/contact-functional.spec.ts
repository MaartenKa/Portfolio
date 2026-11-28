import { test } from "../../fixtures/test-fixtures";
import {
  AT_LIMIT_CONTACT,
  BOUNDARY_CONTACT,
  EXCESS_CHAR,
  FORM_POST_FIELDS,
  HONEYPOT_FILLED,
  INVALID_EMAIL_CONTACT,
  MESSAGE_MAX_LENGTH,
  NAME_MAX_LENGTH,
  OPTIONAL_SUBJECT_CONTACT,
  SUBJECT_MAX_LENGTH,
  SPECIAL_CHARS_CONTACT,
  THANK_YOU_PAGE,
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

    test("F5: honeypot-waarde zit in de submit-payload", async ({
      contactPage,
      formwardMock,
    }) => {
      // De mock redirectt altijd, dus de spam-verwijdering zelf is Formward-upstream
      // (TESTPLAN.md §3.2). Het lokale contract is de POST: de honeypot-waarde en
      // de redirect-target gaan mee in de payload.
      await contactPage.fillForm(VALID_CONTACT);
      await contactPage.fillHoneypot(HONEYPOT_FILLED);
      await contactPage.submitForm();

      await formwardMock.expectRequestCount(1);
      await formwardMock.expectRequestMethod("POST");
      await formwardMock.expectPostedFieldNames(FORM_POST_FIELDS);
      await formwardMock.expectPostedValue("_gotcha", HONEYPOT_FILLED);
      await formwardMock.expectPostedValue("_redirect", THANK_YOU_PAGE);
    });

    test("F5: tabvolgorde laat het honeypot-veld overslaan", async ({
      contactPage,
    }) => {
      await contactPage.expectTabOrderSkipsHoneypot();
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

  test.describe("Formulier-limieten en submit-guard (F8, TESTPLAN §7)", () => {
    test("F8c: de maxlength-limieten staan in het formulier", async ({
      contactPage,
    }) => {
      // De limieten in de markup zijn de specificatiegrens waar F6 en F8 op
      // bounderen (TESTPLAN §5.5); zonder attribute is er geen bovengrens om te testen.
      await contactPage.expectMaxLengthContract();
    });

    test("F8d: de limietwaarden vullen het formulier volledig", async ({
      contactPage,
      formwardMock,
    }) => {
      // BVA op de échte bovengrens: elk gelimiteerd veld tot op de limiet, en de
      // POST-payload die Formward ontvangt met die lengtes.
      await contactPage.fillForm(AT_LIMIT_CONTACT);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await formwardMock.expectRequestCount(1);
      await formwardMock.expectPostedLength("name", NAME_MAX_LENGTH);
      await formwardMock.expectPostedLength("subject", SUBJECT_MAX_LENGTH);
      await formwardMock.expectPostedLength("message", MESSAGE_MAX_LENGTH);
    });

    test("F8e: bericht boven de limiet wordt afgekapte tot de limiet", async ({
      contactPage,
      formwardMock,
    }) => {
      // Eén teken boven de limiet: `fill()` omzeilt de maxlength, dus de afkapping
      // is meetbaar door te typen. De POST draagt het afgekapte bericht.
      await contactPage.fillForm(AT_LIMIT_CONTACT);
      await contactPage.typeMessage(EXCESS_CHAR);
      await contactPage.expectMessageLength(MESSAGE_MAX_LENGTH);
      await contactPage.submitForm();
      await contactPage.expectRedirectToThankYouPage();
      await formwardMock.expectRequestCount(1);
      await formwardMock.expectPostedLength("message", MESSAGE_MAX_LENGTH);
    });

    test("F8a: de submit-guard staat niet op bij een ongeldige submit", async ({
      contactPage,
      formwardMock,
    }) => {
      // Native validatie blokkeert de submit (F2). De guard mag het formulier niet
      // markeren, zodat de gebruiker na het verbeteren wél kan versturen.
      await contactPage.submitForm();
      await contactPage.expectNotRedirected();
      await contactPage.expectFormInvalid();
      await contactPage.expectSubmitGuardIdle();
      await formwardMock.expectRequestCount(0);
    });

    test("F8b: de dubbele submit-actie levert maximaal één POST op", async ({
      contactPage,
      formwardMock,
    }) => {
      // Het F8-contract (TESTPLAN §7 en §7.1 regel R8): bij snel dubbel klikken
      // mag er maximaal één POST naar Formward gaan. De guard markeert het
      // formulier bij de eerste submit, deaktiveert de knop en blokkeert de
      // tweede submit; de mock registreert daarom één POST en de redirect blijft
      // idempotent.
      await contactPage.fillForm(VALID_CONTACT);
      await contactPage.expectDoubleSubmitBlocked();
      await formwardMock.expectRequestCount(1);
      await contactPage.expectRedirectToThankYouPage();
    });
  });
});
