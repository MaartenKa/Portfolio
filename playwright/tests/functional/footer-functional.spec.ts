import { test } from "../../fixtures/test-fixtures";

const FOOTER_LINKS = [
  { testId: "footer-contact", href: "contact.html", external: false },
  { testId: "footer-privacy", href: "privacy.html", external: false },
  {
    testId: "footer-github",
    href: "https://github.com/MaartenKa/Portfolio",
    external: true,
  },
  {
    testId: "footer-linkedin",
    href: "https://www.linkedin.com/in/maarten-kamps-a6909527/",
    external: true,
  },
] as const;

test.describe("Footer - globale navigatie", () => {
  test("footer-links hebben de juiste bestemming en veilige externe attributen", async ({
    footerPage,
  }) => {
    await footerPage.goto("");

    for (const link of FOOTER_LINKS) {
      await footerPage.expectLink(link.testId, link.href, link.external);
    }
  });

  test("actieve footer-link op contact", async ({ footerPage }) => {
    await footerPage.goto("contact.html");
    await footerPage.expectActive("footer-contact");
    await footerPage.expectInactive("footer-privacy");
  });

  test("actieve footer-link op privacy", async ({ footerPage }) => {
    await footerPage.goto("privacy.html");
    await footerPage.expectActive("footer-privacy");
    await footerPage.expectInactive("footer-contact");
  });
});
