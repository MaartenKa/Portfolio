import { test, expect, type Request } from "@playwright/test";
import { ContactPage } from "../../pages/contact.page";

// Mockt Formward zodat tests:
// onafhankelijk zijn van internet
// het redirect-gedrag deterministisch nabootsen
// de POST-payload kunnen inspecteren

async function mockFormward(page: import("@playwright/test").Page) {
  const capturedRequests: Request[] = [];

  await page.route("**formward**", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    capturedRequests.push(route.request());

    const gotcha =
      new URLSearchParams(route.request().postData() ?? "").get("_gotcha") ??
      "";

    if (gotcha) {
      // Formward negeert de submit stil (geen redirect)
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body>ok</body></html>",
      });
    } else {
      // Formward redirect naar _redirect URL
      // route.fulfill met 302 volgt de browser niet bij navigation requests,
      // dus we gebruiken een JS redirect in plaats daarvan.
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<html><body><script>window.location.replace('/bedankt.html')</script></body></html>`,
      });
    }
  });

  return { capturedRequests };
}

test.describe("Contactformulier", () => {
  let contactPage: ContactPage;
  let capturedRequests: Request[] = [];

  test.beforeEach(async ({ page }) => {
    contactPage = new ContactPage(page);
    capturedRequests = (await mockFormward(page)).capturedRequests;
    await contactPage.goto("/contact.html");
  });

  // ──────────────────────────────────────────────
  test.describe("Versturen", () => {
    test("geldig formulier redirect naar bedanktpagina", async () => {
      await contactPage.fillForm(
        "Maarten Kamps",
        "maarten.kamps.bee@outlook.com",
        "Test Onderwerp",
        "Dit is een test bericht.",
      );
      await contactPage.submit();
      await contactPage.expectFormSubmitted();
      await contactPage.expectNoConsoleErrors();
    });

    test("POST bevat correcte veldwaarden", async () => {
      await contactPage.fillForm(
        "Jan Jansen",
        "jan@test.nl",
        "Vraag",
        "Beste, ik wil meer weten.",
      );
      await contactPage.submit();
      await contactPage.expectFormSubmitted();

      // Verifieer dat er precies één POST is verzonden
      expect(capturedRequests).toHaveLength(1);

      const postData = new URLSearchParams(capturedRequests[0].postData()!);
      expect(postData.get("name")).toBe("Jan Jansen");
      expect(postData.get("email")).toBe("jan@test.nl");
      expect(postData.get("subject")).toBe("Vraag");
      expect(postData.get("message")).toBe("Beste, ik wil meer weten.");
    });
  });

  // ──────────────────────────────────────────────
  test.describe("Validatie", () => {
    test("leeg formulier toont native validatiefouten", async () => {
      await contactPage.submit();
      await contactPage.expectStillOnContactPage();
      await contactPage.expectRequiredFieldsInvalid();
    });
  });

  // ──────────────────────────────────────────────
  test.describe("Bot-bescherming", () => {
    test("gevulde honeypot voorkomt redirect", async () => {
      await contactPage.fillForm(
        "Bot",
        "bot@example.com",
        "Spam",
        "Ik ben een bot!",
        "ik_ben_geen_mens",
      );
      await contactPage.submit();
      // Geen redirect naar bedankt.html – pagina toont "ok" op formward URL
      await expect(contactPage.page).not.toHaveURL(/bedankt\.html/);
    });
  });
});
