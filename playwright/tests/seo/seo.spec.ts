// Portfolio — playwright/tests/seo/seo.spec.ts

import { test } from "../../fixtures/test-fixtures";
import {
  ALL_PAGES,
  NON_SITEMAP_PAGES,
  SITEMAP_PAGES,
} from "../../utils/test-data";

// SEO is een markup-contract: titel, description, structuur, canonical en de
// social card. De suite test niet of een crawler de site indexeert — de site is
// bewust niet indexeerbaar (noindex, nofollow en `Disallow: /` in robots.txt).
// De sitemap met 8 content-pagina's is daarmee een contract dat de site zelf
// publiceert; de spanning met de verborgen site is een documentvinding, geen
// assert (TESTPLAN §8.4, §10.2 en TEST-SUITE-STATUS §4.2).
test.describe("SEO – Titel en description (SEO-01)", () => {
  for (const page of ALL_PAGES) {
    test(`SEO-01: ${page} heeft een eigen, Nederlandse titel en description`, async ({
      seoPage,
    }) => {
      await seoPage.navigateTo(page);
      await seoPage.expectTitleAndDescription();
    });
  }

  test("SEO-01: titels en descriptions zijn site-wide uniek", async ({ seoPage }) => {
    await seoPage.expectUniqueTitlesAndDescriptions(ALL_PAGES);
  });
});

test.describe("SEO – Structuur en indexatie (SEO-02)", () => {
  for (const page of ALL_PAGES) {
    test(`SEO-02: ${page} heeft één h1, unieke id's en indexatie uit`, async ({
      seoPage,
    }) => {
      await seoPage.navigateTo(page);
      await seoPage.expectHeadingAndIndexation();
    });
  }
});

test.describe("SEO – Canonical en social card (SEO-03)", () => {
  for (const page of ALL_PAGES) {
    test(`SEO-03: ${page} heeft canonical, Open Graph en Twitter card`, async ({
      seoPage,
    }) => {
      await seoPage.navigateTo(page);
      await seoPage.expectCanonicalAndSocialCard(page);
    });
  }
});

test.describe("SEO – Sitemap en robots (SEO-04)", () => {
  test("SEO-04: sitemap.xml dekt de 8 content-pagina's en robots.txt sluit indexering uit", async ({
    seoPage,
  }) => {
    await seoPage.expectSitemapAndRobots(SITEMAP_PAGES, NON_SITEMAP_PAGES);
  });
});