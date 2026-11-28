// Portfolio — playwright/pages/a11y.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { compositeChain, contrastRatio, parseCssColor } from "../utils/contrast";
import { MIN_CONTRAST_AA, PLACEHOLDER_COLOR } from "../utils/test-data";

/** Skip-link-tekst, -href en het focusbare target, op alle 10 pagina's gelijk. */
const SKIP_LINK_NAME = "Ga naar hoofdinhoud";
const SKIP_LINK_HREF = "#hoofdinhoud";
const MAIN_TARGET_ID = "hoofdinhoud";

/** Landmark-namen en het testid-contract dat op elke pagina hetzelfde is. */
const NAV_LANDMARK_NAME = "Hoofdnavigatie";
const FOOTER_LANDMARK_NAME = "Footernavigatie";
const MENU_TOGGLE_TEST_ID = "menu-toggle";

/** De focus-indicator zoals het design-systeem voorschrijft (`:focus-visible`). */
const FOCUS_OUTLINE = {
  width: "2px",
  style: "solid",
  color: "rgb(224, 214, 255)",
  offset: "3px",
};

/** Markers voor focusbare elementen zonder `data-testid` (skip-link, logo, notice, button). */
const TRAIL_MARKERS = ["skip-link", "logo", "notice", "button"] as const;

/** De velden van het contactformulier en hun `data-testid`-contract. */
const FORM_LABEL_TEST_IDS: Record<string, string> = {
  Naam: "field-name",
  "E-mailadres": "field-email",
  Onderwerp: "field-subject",
  Bericht: "field-message",
};

/**
 * Page object voor de accessibility-suite (A11Y-01…A11Y-04, CIH-08).
 *
 * De asserts staan hier, in lijn met PLAYWRIGHT.md §8; de specs roepen alleen
 * methods aan. De suite bewijst DOM-/interactiegedrag: taal, landmarks, labels,
 * `alt`-teksten, focus, tabvolgorde en berekende kleuren. Screenreader-gedrag en
 * high-contrast-rendering blijven aanvullend en handmatig (BESTPRACTICES §22).
 */
export class AccessibilityPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get skipLink() {
    return this.page.getByRole("link", { name: SKIP_LINK_NAME });
  }

  /**
   * Navigeert naar een pagina en controleert de HTTP-status.
   *
   * @param path - Relatief pad binnen de site.
   */
  async navigateTo(path: string): Promise<void> {
    const response = await super.goto(path);
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  }

  /** A11Y-02: de pagina is als Nederlands gemarkeerd. */
  async expectLangDutch(): Promise<void> {
    const lang = await this.page.evaluate(() => document.documentElement.lang);
    expect(
      lang,
      `De pagina is niet als Nederlands gemarkeerd (${lang})`,
    ).toBe("nl");
  }

  /** A11Y-02: de landmarks bestaan en zijn benoemd. */
  async expectLandmarksNamed(): Promise<void> {
    await expect(
      this.page.getByRole("navigation", { name: NAV_LANDMARK_NAME }),
    ).toBeVisible();
    await expect(
      this.page.getByRole("navigation", { name: FOOTER_LANDMARK_NAME }),
    ).toBeVisible();
    await expect(this.page.getByRole("main")).toBeVisible();
    await expect(this.page.getByRole("contentinfo")).toBeVisible();
  }

  /** A11Y-02: de menu-toggle is gesloten en heeft de Nederlandse label. */
  async expectMenuToggleCollapsed(): Promise<void> {
    const toggle = this.page.getByTestId(MENU_TOGGLE_TEST_ID);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAttribute("aria-label", "Open navigatie");
  }

  /** A11Y-02: elke afbeelding heeft een niet-lege `alt`. */
  async expectImagesHaveAlt(): Promise<void> {
    const missing = await this.page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => img.alt.trim() === "")
        .map((img) => img.getAttribute("src") ?? "?"),
    );

    expect(
      missing,
      `Afbeeldingen zonder alt-tekst: ${missing.join(", ")}`,
    ).toEqual([]);
  }

  /**
   * A11Y-03: de skip-link, zijn href en het focusbare target in de hoofdinhoud.
   *
   * De skip-link staat `position: absolute` en verschijnt pas bij focus; het
   * bounding box bestaat dus al vóór de Tab-toets.
   */
  async expectSkipLinkContract(): Promise<void> {
    await expect(this.skipLink).toBeVisible();
    await expect(this.skipLink).toHaveAttribute("href", SKIP_LINK_HREF);

    const targetId = await this.page.evaluate(
      (target) => document.getElementById(target)?.id ?? "",
      MAIN_TARGET_ID,
    );
    expect(
      targetId,
      "De skip-link heeft geen focusbaar target in de hoofdinhoud",
    ).toBe(MAIN_TARGET_ID);
  }

  /** A11Y-03: Tab op de skip-link en Enter brengt de focus naar de hoofdinhoud. */
  async expectSkipLinkMovesFocusToMain(): Promise<void> {
    const link = this.skipLink;
    await expect(link).toBeVisible();

    await link.focus();
    await this.page.keyboard.press("Enter");

    await expect(this.page).toHaveURL(/#hoofdinhoud$/);

    const focusedId = await this.page.evaluate(
      () => (document.activeElement as HTMLElement).id,
    );
    expect(focusedId, "De skip-link krijgt de focus niet op de hoofdinhoud").toBe(
      MAIN_TARGET_ID,
    );
  }

  /**
   * A11Y-03: de benoemde sections in het Nederlands, in markup-volgorde.
   *
   * @param expected - De contractlijst uit `test-data.ts` voor deze pagina.
   */
  async expectSectionLabels(expected: readonly string[]): Promise<void> {
    const labels = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll("section[aria-label]")).map(
        (section) => section.getAttribute("aria-label") ?? "",
      ),
    );

    expect(labels, "De section-labels wijken af van de contractlijst").toEqual([
      ...expected,
    ]);
  }

  /** A11Y-03: `aria-hidden` staat alleen op decoratieve iconen, en op al die iconen. */
  async expectDecorativeIconsHidden(): Promise<void> {
    const result = await this.page.evaluate(() => {
      const hidden = Array.from(
        document.querySelectorAll('[aria-hidden="true"]'),
      );
      const cardIcons = Array.from(document.querySelectorAll(".card-icon"));

      // Decoratieve content bevat geen leesbare letters: emoji, pijlen en svg.
      // aria-hidden op echte tekst zou content voor screenreaders verbergen.
      return {
        hiddenWithText: hidden
          .filter((element) => /[a-z]/i.test(element.textContent ?? ""))
          .map(
            (element) =>
              `${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim()}"`,
          ),
        cardIconsOpen: cardIcons
          .filter((element) => element.getAttribute("aria-hidden") !== "true")
          .map((element) => element.textContent ?? ""),
      };
    });

    expect(
      result.hiddenWithText,
      "aria-hidden staat op elementen met leesbare tekst",
    ).toEqual([]);
    expect(
      result.cardIconsOpen,
      "Decoratieve iconen moeten aria-hidden hebben",
    ).toEqual([]);
  }

  /** A11Y-02: elk veld van het formulier heeft een eigen label met de juiste testid. */
  async expectFormLabelsMatchFields(): Promise<void> {
    for (const [label, testId] of Object.entries(FORM_LABEL_TEST_IDS)) {
      const field = this.page.getByLabel(label);
      await expect(field).toBeVisible();
      await expect(field).toHaveAttribute("data-testid", testId);
    }
  }

  /** A11Y-01: het aantal focusbare elementen in de huidige weergave. */
  async countFocusables(): Promise<number> {
    return this.page.evaluate(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          'a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

      // Een `display:none`-toggle heeft geen offsetParent en is dus niet focusbaar.
      return nodes.filter((element) => element.offsetParent !== null).length;
    });
  }

  /**
   * A11Y-01: de tabvolgorde als lijst markers.
   *
   * @param steps - Aantal Tab-toetsen.
   */
  async readTabTrail(steps: number): Promise<string[]> {
    const trail: string[] = [];

    for (let step = 0; step < steps; step += 1) {
      await this.page.keyboard.press("Tab");
      trail.push(
        await this.page.evaluate(() => {
          const active = document.activeElement as HTMLElement | null;
          if (!active || active === document.body) return "";

          const testId = active.getAttribute("data-testid");
          if (testId) return testId;

          if (active.classList.contains("skip-link")) return "skip-link";
          if (active.classList.contains("logo")) return "logo";
          if (active.classList.contains("notice")) return "notice";
          if (active.classList.contains("button")) return "button";

          return active.tagName.toLowerCase();
        }),
      );
    }

    return trail;
  }

  /**
   * A11Y-01: de tabvolgorde is de contractvolgorde, beginnend bij de skip-link.
   *
   * De `unexpected`-assert vangt een focusval of een onverwacht focusbaar
   * element; de `ids`-assert vergelijkt de testid-reeks met het contract.
   *
   * @param expected - De verwachte testid-reeks uit `test-data.ts`.
   */
  async expectKeyboardTrail(expected: readonly string[]): Promise<void> {
    const steps = Math.min((await this.countFocusables()) + 2, 40);
    const trail = await this.readTabTrail(steps);

    expect(trail[0], "De tabvolgorde begint niet bij de skip-link").toBe(
      "skip-link",
    );
    expect(trail[1], "De tabvolgorde gaat niet door de logo-link").toBe("logo");

    const known = new Set<string>([...TRAIL_MARKERS, ...expected]);
    const unexpected = trail.filter(
      (marker) => marker !== "" && !known.has(marker),
    );
    expect(
      unexpected,
      `Onverwacht focusbaar element in de tabvolgorde: ${unexpected.join(", ")}`,
    ).toEqual([]);

    const ids = trail.filter((marker) => expected.includes(marker));
    expect(
      ids,
      "De tabvolgorde van de testids wijkt af van het testcontract",
    ).toEqual([...expected]);
    expect(
      ids,
      "Het honeypot-veld mag niet focusbaar zijn via het toetsenbord",
    ).not.toContain("field-honeypot");
  }

  /** A11Y-01: de focus-indicator op het element dat met het toetsenbord is bereikt. */
  async expectVisibleFocusIndicator(): Promise<void> {
    await this.page.keyboard.press("Tab");

    const outline = await this.page.evaluate(() => {
      const active = document.activeElement as HTMLElement;
      const style = getComputedStyle(active);

      return {
        width: style.outlineWidth,
        style: style.outlineStyle,
        color: style.outlineColor,
        offset: style.outlineOffset,
      };
    });

    expect(
      outline.style,
      "Er is geen focus-outline op het actieve element (WCAG 2.4.7)",
    ).not.toBe("none");
    expect(
      outline.width,
      `De focus-outline is dunner dan het design-token (${outline.width})`,
    ).toBe(FOCUS_OUTLINE.width);
    expect(
      outline.color,
      `De focus-outline heeft de tokenkleur niet (${outline.color})`,
    ).toBe(FOCUS_OUTLINE.color);
    expect(
      outline.offset,
      `De focus-outline heeft geen offset (${outline.offset})`,
    ).toBe(FOCUS_OUTLINE.offset);
  }

  /**
   * A11Y-04: de gemeten placeholder-contrast tegen de samengestelde achtergrond.
   *
   * De invoerachtergrond is semi-transparant, dus de keten van
   * `background-color`-waarden van het veld tot de eerste dekkende ancestor wordt
   * hier samengesteld. Gradients in `background-image` blijven buiten de
   * berekening: een gradient is geen egale `background-color`.
   */
  async expectPlaceholderContrast(): Promise<void> {
    const measured = await this.page
      .getByLabel("E-mailadres")
      .evaluate((element) => {
        const placeholder = getComputedStyle(element, "::placeholder").color;
        const chain: string[] = [];
        let node: HTMLElement | null = element as HTMLElement;

        while (node) {
          const background = getComputedStyle(node).backgroundColor;
          if (background !== "rgba(0, 0, 0, 0)" && background !== "transparent") {
            chain.push(background);
          }
          if (node === document.body) break;
          node = node.parentElement;
        }

        return { placeholder, chain };
      });

    expect(measured.placeholder, "De placeholderkleur is niet het design-token").toBe(
      PLACEHOLDER_COLOR,
    );

    const background = compositeChain(measured.chain.map(parseCssColor));
    const ratio = contrastRatio(parseCssColor(measured.placeholder), background);

    expect(
      ratio,
      `Placeholder-contrast ${ratio.toFixed(2)}:1 is onder de AA-drempel van ${MIN_CONTRAST_AA}:1 (WCAG 1.4.3)`,
    ).toBeGreaterThanOrEqual(MIN_CONTRAST_AA);
  }

  /** A11Y-04: de gradient-tekst in de hero blijft leesbaar in forced-colors-modus. */
  async expectForcedColorsHeroReadable(): Promise<void> {
    await this.page.emulateMedia({ forcedColors: "active" });

    const hero = await this.page
      .getByRole("heading", { level: 1 })
      .evaluate((element) => {
        const span = element.querySelector("span");
        const style = getComputedStyle(span ?? element);

        return {
          color: style.color,
          backgroundClip:
            style.getPropertyValue("background-clip") ||
            style.getPropertyValue("-webkit-background-clip"),
          backgroundImage: style.backgroundImage,
        };
      });

    expect(
      hero.color,
      "De hero-tekst valt weg in forced-colors-modus (WCAG 1.4.3)",
    ).not.toBe("rgba(0, 0, 0, 0)");
    expect(
      hero.backgroundClip,
      "De gradient-clip blijft staan in forced-colors-modus",
    ).not.toBe("text");
    expect(hero.backgroundImage, "De gradient blijft staan in forced-colors-modus").toBe(
      "none",
    );
  }

  /**
   * CIH-08: de geschiedenis-tabel heeft een Nederlandse caption als accessible
   * name. De caption staat als `.sr-only` in de markup: visueel één pixel, maar
   * niet `display: none` en niet `visibility: hidden` — anders leest een
   * screenreader de tabel zonder naam.
   *
   * @param caption - De verwachte captietekst uit `test-data.ts`.
   */
  async expectTableCaption(caption: string): Promise<void> {
    const table = this.page.getByTestId("ci-history-table");
    await expect(table).toBeVisible();

    const read = await table.evaluate(
      (element, expected: string) => {
        const node = element.querySelector("caption");
        const style = node ? getComputedStyle(node) : null;

        return {
          text: node?.textContent?.trim() ?? "",
          srOnly: node?.classList.contains("sr-only") ?? false,
          display: style?.display ?? "",
          visibility: style?.visibility ?? "",
          expected,
        };
      },
      caption,
    );

    expect(
      read.text,
      `De tabel heeft geen accessible name uit de caption (${read.text})`,
    ).toBe(read.expected);
    expect(read.srOnly, "De caption is niet als sr-only gemarkeerd").toBe(true);
    expect(
      read.display,
      "De caption is display:none en dus niet leesbaar voor de screenreader",
    ).not.toBe("none");
    expect(
      read.visibility,
      "De caption is visibility:hidden en dus niet leesbaar voor de screenreader",
    ).not.toBe("hidden");
  }

  /**
   * CIH-08: de kolomkoppen zijn als kolom gemarkeerd (`scope="col"`) in de
   * contractvolgorde. Zonder scope leest een screenreader cel en kop niet als
   * samenhangend paar.
   *
   * @param columns - De kolomnamen in de volgorde van de markup.
   */
  async expectTableHeader(columns: readonly string[]): Promise<void> {
    const headers = await this.page
      .getByTestId("ci-history-table")
      .evaluate((element) =>
        Array.from(element.querySelectorAll("thead th")).map((th) => ({
          text: th.textContent?.trim() ?? "",
          scope: th.getAttribute("scope") ?? "",
        })),
      );

    const names = headers.map((th) => th.text);
    expect(names, "De kolomkoppen wijken af van de contractlijst").toEqual([
      ...columns,
    ]);

    const unscoped = headers
      .filter((th) => th.scope !== "col")
      .map((th) => th.text);
    expect(
      unscoped,
      `Koppen zonder scope="col": ${unscoped.join(", ")}`,
    ).toEqual([]);
  }

  /**
   * CIH-08: élke rij van de geschiedenis vult de zes kolommen, zodat elke cel
   * op de juiste kolomkop aansluit. De `colspan` van de placeholder-rij telt
   * mee: de zes-kolomsstructuur is ook in de lege toestand het contract.
   *
   * @param expectedRows - Het aantal rijen dat de mock oplevert.
   * @param columns - Het aantal kolommen van de tabel.
   */
  async expectRowShape(expectedRows: number, columns: number): Promise<void> {
    const shape = await this.page
      .getByTestId("ci-history-body")
      .evaluate((body) =>
        Array.from(body.querySelectorAll("tr")).map(
          (row) =>
            Array.from(row.querySelectorAll("td")).reduce(
              (cells, td) => cells + (td.colSpan || 1),
              0,
            ),
        ),
      );

    expect(
      shape,
      `Het aantal rijen is niet ${expectedRows} (het is ${shape.length})`,
    ).toHaveLength(expectedRows);
    expect(
      shape,
      `Rijen vullen de ${columns} kolommen niet: ${shape.join(", ")}`,
    ).toEqual(new Array(expectedRows).fill(columns));
  }

  /**
   * CIH-08: de run-link heeft de runnaam als leesbare tekst en is als externe
   * link gemarkeerd — dezelfde ingang voor toetsenbord, screenreader en ziende
   * gebruiker.
   *
   * @param name - De verwachte linktekst, bijvoorbeeld `Run 74`.
   * @param href - De GitHub Actions-URL van die run.
   */
  async expectRunLink(name: string, href: string): Promise<void> {
    const link = this.page
      .getByTestId("ci-history-body")
      .getByRole("link", { name });

    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }

  /**
   * CIH-08: de kaarten van de CI-sectie blijven leesbaar: élke kaart heeft een
   * contractlabel en een waarde die niet verborgen is. De site-wide assert op
   * decoratieve `aria-hidden`-iconen staat al in A11Y-02; hier staat de
   * kaartset van de dynamische sectie zelf.
   *
   * @param labels - De kaartlabels in de volgorde van de markup.
   * @param section - De `aria-label` van de CI-sectie.
   */
  async expectCardsReadable(
    labels: readonly string[],
    section: string,
  ): Promise<void> {
    const cards = await this.page.evaluate((label: string) => {
        const scope = document.querySelector(`section[aria-label="${label}"]`);
        const nodes = Array.from(scope?.querySelectorAll("article.card") ?? []);

        return {
          labels: nodes.map(
            (card) => card.querySelector("p")?.textContent?.trim() ?? "",
          ),
          unreadable: nodes
            .filter((card) => {
              const value = card.querySelector("h3");
              return (
                !value ||
                value.getAttribute("aria-hidden") === "true" ||
                value.textContent.trim() === ""
              );
            })
            .map((card) => card.querySelector("p")?.textContent?.trim() ?? "?"),
        };
    }, section);

    expect(
      cards.labels,
      "De kaartlabels van de CI-sectie wijken af van de contractlijst",
    ).toEqual([...labels]);
    expect(
      cards.unreadable,
      `Kaarten zonder leesbare waarde: ${cards.unreadable.join(", ")}`,
    ).toEqual([]);
  }

  /**
   * CIH-08: de statusbadge heeft een eigen accessible name en de badge-afbeelding
   * een Nederlandse alt-tekst, zodat de link niet als kaal shield-icoon leest.
   *
   * @param label - De `aria-label` van de badge-link.
   * @param alt - De `alt`-tekst van de badge-afbeelding.
   */
  async expectStatusBadgeAccessible(label: string, alt: string): Promise<void> {
    const badge = this.page.getByRole("link", { name: label });
    await expect(badge).toBeVisible();
    await expect(badge.getByRole("img")).toHaveAccessibleName(alt);
  }

  /**
   * CIH-08: de run-links in de geschiedenis zijn toetsenbordbereikbaar in de
   * volgorde van de rijen. De tab start op de statusbadge-link; de volgende
   * focusbare elementen in de sectie zijn de run-links, rij voor rij.
   *
   * @param badgeLabel - De accessible name van de statusbadge-link.
   * @param names - De runnamen in rijvolgorde, bijvoorbeeld `Run 74`.
   */
  async expectRunLinksInTabOrder(
    badgeLabel: string,
    names: readonly string[],
  ): Promise<void> {
    await this.page.getByRole("link", { name: badgeLabel }).focus();

    const trail: string[] = [];

    for (let step = 0; step < names.length; step += 1) {
      await this.page.keyboard.press("Tab");
      trail.push(
        await this.page.evaluate(
          () =>
            (document.activeElement as HTMLElement | null)?.textContent?.trim() ??
            "",
        ),
      );
    }

    expect(
      trail,
      `De toetsenbordvolgorde langs de run-links is ${trail.join(", ")}`,
    ).toEqual([...names]);
  }
}