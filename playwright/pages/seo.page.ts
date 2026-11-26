// Portfolio — playwright/pages/seo.page.ts

import { APIRequestContext, Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MIN_TITLE_LENGTH,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  OG_LOCALE,
  OG_SITE_NAME,
  OG_TYPE,
  ROBOTS_CONTENT,
  SITE_BASE_URL,
  TITLE_PREFIX,
  TWITTER_CARD,
} from "../utils/test-data";

/** Meta- en OG-keys die de suite op elke pagina leest. */
const META_KEYS = [
  "description",
  "robots",
  "og:title",
  "og:description",
  "og:type",
  "og:locale",
  "og:site_name",
  "og:url",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:image:alt",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:image",
] as const;

/** De SEO-waarden van één pagina, uit de DOM. */
interface SeoProbe {
  title: string;
  canonical: string;
  metas: Record<string, string>;
  h1Count: number;
  duplicateIds: string[];
}

/**
 * Page object voor de SEO-suite (SEO-01…SEO-04).
 *
 * De waarden worden uit de DOM gelezen: de site-opmaak zet meta-attributes op
 * aparte regels, dus een regex op de bron is niet betrouwbaar. Dezelfde
 * redenering als in `a11y.page.ts`: geen raw locators in page objects
 * (`playwright/no-raw-locators` op error), dus `page.evaluate`.
 *
 * De suite test de markup-contracten, niet de indexering zelf: de site is bewust
 * niet indexeerbaar (`noindex, nofollow`, `Disallow: /`). De spanning tussen een
 * sitemap met 8 content-pagina's en een verborgen site is een documentvinding,
 * geen test-assert (zie TESTPLAN §8.4 en §10.2).
 */
export class SeoPage extends BasePage {
  public constructor(
    page: Page,
    private readonly request: APIRequestContext,
  ) {
    super(page);
  }

  /** Navigeert naar een pagina en controleert de HTTP-status. */
  async navigateTo(path: string): Promise<void> {
    const response = await super.goto(path);
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  }

  /** Leest titel, canonical, alle metas, de h1-aantelling en de id-duplicaten. */
  private async probe(): Promise<SeoProbe> {
    return this.page.evaluate(
      (keys: string[]) => {
        const meta = (key: string) =>
          (
            document.querySelector(`meta[name="${key}"]`) ??
            document.querySelector(`meta[property="${key}"]`)
          )?.getAttribute("content") ?? "";

        const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);

        return {
          title: document.title.trim(),
          canonical: (
            document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? ""
          ).trim(),
          metas: Object.fromEntries(
            keys.map((key) => [key, meta(key).trim()]),
          ) as Record<string, string>,
          h1Count: document.querySelectorAll("h1").length,
          duplicateIds: [
            ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
          ],
        };
      },
      [...META_KEYS],
    );
  }

  /** SEO-01: de eigen titel en meta description van de pagina. */
  async expectTitleAndDescription(): Promise<void> {
    const probe = await this.probe();
    const description = probe.metas["description"];

    expect(probe.title, "De pagina heeft geen titel").not.toBe("");
    expect(
      probe.title.startsWith(TITLE_PREFIX),
      `De titel begint niet met "${TITLE_PREFIX}": ${probe.title}`,
    ).toBe(true);
    expect(
      probe.title.length,
      `De titel is te kort (${probe.title.length} tekens)`,
    ).toBeGreaterThanOrEqual(MIN_TITLE_LENGTH);
    expect(
      probe.title.length,
      `De titel is te lang (${probe.title.length} tekens)`,
    ).toBeLessThanOrEqual(MAX_TITLE_LENGTH);

    expect(description, "De meta description ontbreekt").not.toBe("");
    expect(
      description.length,
      `De description is te kort (${description.length} tekens)`,
    ).toBeGreaterThanOrEqual(MIN_DESCRIPTION_LENGTH);
    expect(
      description.length,
      `De description is te lang (${description.length} tekens)`,
    ).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  }

  /** SEO-01: titels en descriptions zijn site-wide uniek (geen duplicaten). */
  async expectUniqueTitlesAndDescriptions(pages: readonly string[]): Promise<void> {
    const titles: string[] = [];
    const descriptions: string[] = [];

    for (const path of pages) {
      await this.navigateTo(path);
      const probe = await this.probe();
      titles.push(probe.title);
      descriptions.push(probe.metas["description"]);
    }

    expect(
      new Set(titles).size,
      `Titels komen vaker voor dan het aantal pagina's (${pages.length})`,
    ).toBe(pages.length);
    expect(
      new Set(descriptions).size,
      `Descriptions komen vaker voor dan het aantal pagina's (${pages.length})`,
    ).toBe(pages.length);
  }

  /** SEO-02: één `<h1>`, unieke id's en de indexatie staat uit. */
  async expectHeadingAndIndexation(): Promise<void> {
    const probe = await this.probe();

    expect(probe.h1Count, `Er is niet precies één h1 (${probe.h1Count})`).toBe(1);
    expect(
      probe.duplicateIds,
      `Duplicaten in id-attributen: ${probe.duplicateIds.join(", ")}`,
    ).toEqual([]);
    expect(
      probe.metas["robots"],
      `Indexatie staat niet uit (robots: "${probe.metas["robots"]}"), verwacht "${ROBOTS_CONTENT}"`,
    ).toBe(ROBOTS_CONTENT);
  }

  /** SEO-03: canonical, Open Graph en Twitter card, consistent per pagina. */
  async expectCanonicalAndSocialCard(expectedFile: string): Promise<void> {
    const probe = await this.probe();
    const canonical = `${SITE_BASE_URL}${expectedFile}`;
    const metas = probe.metas;

    expect(probe.canonical, `De canonical is niet ${canonical}`).toBe(canonical);
    expect(metas["og:url"], `og:url wijkt af van de canonical`).toBe(canonical);
    expect(metas["og:title"], "og:title ontbreekt").not.toBe("");
    expect(metas["og:description"], "og:description ontbreekt").not.toBe("");
    expect(metas["og:type"], `og:type is niet "${OG_TYPE}"`).toBe(OG_TYPE);
    expect(metas["og:locale"], `og:locale is niet "${OG_LOCALE}"`).toBe(OG_LOCALE);
    expect(metas["og:site_name"], `og:site_name is niet "${OG_SITE_NAME}"`).toBe(OG_SITE_NAME);
    expect(metas["og:image"], `og:image is niet de site-asset`).toBe(OG_IMAGE_URL);
    expect(metas["og:image:width"], `og:image:width is niet ${OG_IMAGE_WIDTH}`).toBe(OG_IMAGE_WIDTH);
    expect(metas["og:image:height"], `og:image:height is niet ${OG_IMAGE_HEIGHT}`).toBe(OG_IMAGE_HEIGHT);
    expect(metas["og:image:alt"], "og:image:alt ontbreekt").not.toBe("");
    expect(metas["twitter:card"], `twitter:card is niet "${TWITTER_CARD}"`).toBe(TWITTER_CARD);
    expect(metas["twitter:title"], "twitter:title ontbreekt").not.toBe("");
    expect(metas["twitter:description"], "twitter:description ontbreekt").not.toBe("");
    expect(metas["twitter:image"], `twitter:image is niet de site-asset`).toBe(OG_IMAGE_URL);
  }

  /**
   * SEO-04: `sitemap.xml` dekt exact de content-pagina's, utility-pagina's
   * staan er niet in, en `robots.txt` sluit indexering uit.
   */
  async expectSitemapAndRobots(
    expectedPages: readonly string[],
    excludedPages: readonly string[],
  ): Promise<void> {
    const sitemap = await this.request.get("sitemap.xml");
    expect(sitemap.status(), `sitemap.xml gaf status ${sitemap.status()}`).toBe(200);

    const body = await sitemap.text();
    const locs = [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
      match[1].trim(),
    );
    const expected = expectedPages.map((page) => `${SITE_BASE_URL}${page}`);

    expect(
      [...new Set(locs)].sort(),
      `De sitemap dekt niet de content-pagina's (${locs.join(", ")})`,
    ).toEqual([...expected].sort());

    for (const page of excludedPages) {
      expect(locs, `Utility-pagina ${page} staat wél in de sitemap`).not.toContain(
        `${SITE_BASE_URL}${page}`,
      );
    }

    const robots = await this.request.get("robots.txt");
    expect(robots.status(), `robots.txt gaf status ${robots.status()}`).toBe(200);

    const robotsBody = await robots.text();
    expect(robotsBody, "robots.txt heeft geen User-agent-regel").toContain(
      "User-agent: *",
    );
    expect(robotsBody, "robots.txt sluit indexering niet uit").toContain(
      "Disallow: /",
    );
  }
}