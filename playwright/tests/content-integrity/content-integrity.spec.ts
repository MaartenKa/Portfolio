// Portfolio — playwright/tests/content-integrity/content-integrity.spec.ts

import { test } from "../../fixtures/test-fixtures";
import {
  ALL_PAGES,
  LOCAL_IMAGE_SOURCES,
  SITE_ASSETS,
} from "../../utils/test-data";

// Content-integrity is een structurele check op de markup. Interne links en
// afbeeldingen worden getoetst tegen de set van bekende site-bestanden, niet
// tegen HTTP-bereikbaarheid: de suite hangt dan niet van de live-host, van de
// Pages-cache of van externe hosts (TESTPLAN §6.2). Er wordt niets gemockt.
test.describe("Content-integrity – Interne links en afbeeldingen (LINK-01, LINK-02, IMG-01)", () => {
  for (const page of ALL_PAGES) {
    test(`LINK-01, LINK-02 en IMG-01: ${page} heeft valide links en afbeeldingen`, async ({
      contentPage,
    }) => {
      await contentPage.navigateTo(page);
      await contentPage.expectInternalLinks(ALL_PAGES);
      await contentPage.expectAnchorTargetsExist();
      await contentPage.expectExternalLinkContract();
      await contentPage.expectImages(LOCAL_IMAGE_SOURCES);
    });
  }

  test("IMG-01: elke asset-referentie op de site verwijst naar een bekend site-bestand", async ({
    contentPage,
  }) => {
    for (const page of ALL_PAGES) {
      await contentPage.navigateTo(page);
      await contentPage.expectAssetReferences(SITE_ASSETS);
    }
  });
});