// Portfolio — playwright/pages/content.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

/** Beeld van één afbeelding: bron, alt-tekst, internaliteit en load-state. */
interface ImageProbe {
  src: string;
  alt: string;
  internal: boolean;
  known: boolean;
  loaded: boolean;
}

/**
 * Page object voor de content-integrity-suite (LINK-01, LINK-02, IMG-01).
 *
 * De asserts staan in de methods, in lijn met PLAYWRIGHT.md §8. De checks zijn
 * structureel: interne links en afbeeldingen worden getoetst tegen de set van
 * bekende site-bestanden, niet tegen HTTP-bereikbaarheid (TESTPLAN.md §6.2),
 * omdat de suite dan niet van de live-host of van externe hosts afhangt. De DOM
 * wordt met `page.evaluate` gelezen: markup-checks hebben geen `data-testid` en
 * `playwright/no-raw-locators` staat in page objects op error (BESTPRACTICES §2
 * en §16).
 */
export class ContentIntegrityPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Navigeert naar een pagina en controleert de HTTP-status. */
  async navigateTo(path: string): Promise<void> {
    const response = await super.goto(path);
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  }

  /**
   * LINK-01: elke interne link op de pagina targett een bekend site-bestand.
   *
   * `mailto:`-links en in-page anchors (`#…`) zijn geen bestandsreferenties en
   * worden hier overgeslagen; daar staat een eigen assert op.
   *
   * @param knownTargets - De relatieve paden die de site kent (`ALL_PAGES`).
   */
  async expectInternalLinks(knownTargets: readonly string[]): Promise<void> {
    const offenders = await this.page.evaluate(
      (known: string[]) =>
        [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
          .map((a) => a.getAttribute("href") ?? "")
          .filter((href) => !href.startsWith("#") && !href.startsWith("mailto:"))
          .filter((href) => !/^https?:\/\//.test(href))
          .map((href) => href.replace(/^\.\/+/, "").split("#")[0].split("?")[0])
          .filter((target) => target !== "" && !new Set(known).has(target)),
      [...knownTargets],
    );

    expect(
      offenders,
      `Interne links naar onbekende targets: ${offenders.join(", ")}`,
    ).toEqual([]);
  }

  /** LINK-01: elk in-page anchor (`#…`) heeft een element met die id. */
  async expectAnchorTargetsExist(): Promise<void> {
    const missing = await this.page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("a[href^='#']")]
        .map((a) => (a.getAttribute("href") ?? "").slice(1))
        .filter((id) => id !== "" && document.getElementById(id) === null),
    );

    expect(
      missing,
      `In-page anchors zonder target: ${missing.join(", ")}`,
    ).toEqual([]);
  }

  /** LINK-02: elke externe link heeft `target="_blank"` + `rel="noopener noreferrer"`. */
  async expectExternalLinkContract(): Promise<void> {
    const violations = await this.page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("a[href^='http']")]
        .filter((a) => {
          const rel = (a.getAttribute("rel") ?? "").toLowerCase();
          return (
            a.getAttribute("target") !== "_blank" ||
            !rel.includes("noopener") ||
            !rel.includes("noreferrer")
          );
        })
        .map((a) => a.getAttribute("href") ?? "?"),
    );

    expect(
      violations,
      `Externe links zonder target="_blank" + rel="noopener noreferrer": ${violations.join(", ")}`,
    ).toEqual([]);
  }

  /**
   * IMG-01: elke afbeelding heeft een niet-lege `alt`, een bron uit de bekende
   * asset-set en is geladen. Externe afbeeldingen (shields.io-badge) worden op
   * hun load-state niet getoetst, omdat hun bereikbaarheid niet bij deze suite
   * hoort (TESTPLAN §6.2).
   */
  async expectImages(knownAssets: readonly string[]): Promise<void> {
    const probes: ImageProbe[] = await this.page.evaluate(
      (known: string[]) =>
        [...document.images].map((img) => {
          const src = img.getAttribute("src") ?? "";
          const internal = !/^https?:\/\//.test(src);
          return {
            src,
            alt: img.alt.trim(),
            internal,
            known: !internal || new Set(known).has(src),
            loaded: img.complete && img.naturalWidth > 0,
          };
        }),
      [...knownAssets],
    );

    expect(probes.length, "De pagina bevat geen afbeeldingen").toBeGreaterThan(0);

    const noAlt = probes.filter((p) => p.alt === "").map((p) => p.src);
    expect(noAlt, `Afbeeldingen zonder alt-tekst: ${noAlt.join(", ")}`).toEqual([]);

    const unknown = probes.filter((p) => p.internal && !p.known).map((p) => p.src);
    expect(unknown, `Afbeeldingen met een onbekende bron: ${unknown.join(", ")}`).toEqual([]);

    const unloaded = probes
      .filter((p) => p.internal && !p.loaded)
      .map((p) => p.src);
    expect(unloaded, `Afbeeldingen die niet geladen zijn: ${unloaded.join(", ")}`).toEqual([]);
  }

  /**
   * IMG-01: elke interne referentie in de markup (`img[src]`, `link[href]`,
   * `script[src]`) is een bekend site-bestand. De lege favicon-data-URI
   * (`href="data:,"`) is een bewuste placeholder en dus toegestaan.
   */
  async expectAssetReferences(knownAssets: readonly string[]): Promise<void> {
    const offenders = await this.page.evaluate(
      (known: string[]) => {
        const allowed = new Set([...known, "data:,"]);
        return [...document.querySelectorAll("img[src], link[href], script[src]")]
          .map((el) => el.getAttribute("src") ?? el.getAttribute("href") ?? "")
          .filter((ref) => ref !== "" && !ref.startsWith("#"))
          .filter((ref) => !/^https?:\/\//.test(ref))
          .filter((ref) => !allowed.has(ref.replace(/^\.\/+/, "")));
      },
      [...knownAssets],
    );

    expect(offenders, `Onbekende asset-referenties: ${offenders.join(", ")}`).toEqual([]);
  }
}