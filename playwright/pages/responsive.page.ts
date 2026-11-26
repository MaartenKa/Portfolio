// Portfolio — playwright/pages/responsive.page.ts

import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { COMPACT_BREAKPOINT, NAV_BREAKPOINT, NAV_LINK_TEST_IDS } from "../utils/test-data";

/** Een viewport zoals RESP-01 die in `test-data.ts` definieert. */
export interface Viewport {
  readonly width: number;
  readonly height: number;
}

/**
 * Page object voor de responsive-suite (RESP-01).
 *
 * De checks zijn meetbaar: horizontale overflow wordt getoetst op de breedte van
 * de document-root, de nav-stijl op de zichtbaarheid van de toggle en de
 * nav-links (het `data-testid`-contract van PLAYWRIGHT §4), en de compacte
 * layout op de berekenede buttonbreedte. De hero-tilt is een computed style —
 * die heeft geen testid en wordt dus via `page.evaluate` gelezen.
 */
export class ResponsivePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Navigeert naar een pagina en controleert de HTTP-status. */
  async navigateTo(path: string): Promise<void> {
    const response = await super.goto(path);
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  }

  /** Zet de viewport vóór de navigatie, zodat de media queries op die breedte
   *  worden toegepast bij de eerste render. */
  async setViewport(viewport: Viewport): Promise<void> {
    await this.page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
  }

  /** RESP-01: de pagina loopt niet horizontaal in deze viewport. */
  async expectNoHorizontalScroll(): Promise<void> {
    const metrics = await this.page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    expect(
      metrics.scrollWidth,
      `Horizontale scroll: ${metrics.scrollWidth}px content in ${metrics.innerWidth}px viewport`,
    ).toBeLessThanOrEqual(metrics.innerWidth);
  }

  /** RESP-01: op de breakpoint en eronder is de toggle zichtbaar en de nav ingeklapt. */
  async expectCollapsedMenu(): Promise<void> {
    const width = this.page.viewportSize()!.width;
    expect(
      width,
      `De viewport (${width}px) staat niet onder de nav-breakpoint (${NAV_BREAKPOINT}px)`,
    ).toBeLessThanOrEqual(NAV_BREAKPOINT);

    await expect(this.page.getByTestId("menu-toggle")).toBeVisible();
    await expect(this.page.getByTestId("nav-links")).toBeHidden();

    for (const testId of NAV_LINK_TEST_IDS) {
      await expect(this.page.getByTestId(testId)).toBeHidden();
    }
  }

  /** RESP-01: boven de breakpoint is de toggle verborgen en de nav inline. */
  async expectInlineNav(): Promise<void> {
    const width = this.page.viewportSize()!.width;
    expect(
      width,
      `De viewport (${width}px) staat niet boven de nav-breakpoint (${NAV_BREAKPOINT}px)`,
    ).toBeGreaterThan(NAV_BREAKPOINT);

    await expect(this.page.getByTestId("menu-toggle")).toBeHidden();

    for (const testId of NAV_LINK_TEST_IDS) {
      await expect(this.page.getByTestId(testId)).toBeVisible();
    }
  }

  /**
   * RESP-01: het volledige viewport-contract — geen horizontale scroll, de nav
   * in de juiste stijl voor deze breedte, en de compacte layout op de
   * compacte breakpoint. De vertakking staat in het page object, omdat de
   * Playwright-preset voorwaardes in een test-lichaam verbiedt
   * (`playwright/no-conditional-in-test`).
   */
  async expectViewportContract(viewport: Viewport): Promise<void> {
    await this.expectNoHorizontalScroll();

    if (viewport.width <= NAV_BREAKPOINT) {
      await this.expectCollapsedMenu();
    } else {
      await this.expectInlineNav();
    }

    if (viewport.width <= COMPACT_BREAKPOINT) {
      await this.expectCompactLayout();
    }
  }

  /**
   * RESP-01: op de compacte breakpoint zijn de knoppen full-width en staan de
   * hero-knoppen gestapeld. De buttonbreedte wordt afgezet tegen de contentbreedte
   * van de parent (ouders hebben eigen padding, dus de border-box is niet de maat).
   *
   * Agenda's, projectkaarten, de privacyverklaring en de CV-pagina hebben geen
   * `.button`-elementen; daar is dit contract leeg en dus een lege lijst. De
   * assert op `buttons.length` zou die pagina's onterecht laten falen.
   */
  async expectCompactLayout(): Promise<void> {
    const buttons = await this.page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".button")].map((el) => {
        const parent = el.parentElement;
        const style = parent ? getComputedStyle(parent) : null;
        const contentWidth =
          parent && style
            ? parent.clientWidth -
              parseFloat(style.paddingLeft) -
              parseFloat(style.paddingRight)
            : 0;

        return {
          label: el.textContent?.trim() ?? "?",
          width: Math.round(el.getBoundingClientRect().width),
          contentWidth: Math.round(contentWidth),
        };
      }),
    );

    const notFullWidth = buttons
      .filter((button) => Math.abs(button.width - button.contentWidth) > 2)
      .map((button) => `${button.label}: ${button.width}px in ${button.contentWidth}px`);

    expect(
      notFullWidth,
      `Knoppen zijn niet full-width in de compacte layout: ${notFullWidth.join(", ")}`,
    ).toEqual([]);

    const direction = await this.page.evaluate(() => {
      const heroButtons = document.querySelector(".hero-buttons");
      return heroButtons ? getComputedStyle(heroButtons).flexDirection : null;
    });

    if (direction !== null) {
      expect(
        direction,
        "De hero-knoppen staan niet gestapeld in de compacte layout",
      ).toBe("column");
    }
  }

  /**
   * RESP-01: de hero-tilt. De tilt is aan boven de compacte breakpoint en
   * uitgezet eronder (PLAN-HERO-SOFT-3D §3: op mobiel geen tilt).
   */
  async expectHeroTilt(tilted: boolean): Promise<void> {
    const transform = await this.page.evaluate(() => {
      const card = document.querySelector(".hero-card");
      return card ? getComputedStyle(card).transform : null;
    });

    expect(transform, "De pagina heeft geen hero-card met een transform").not.toBeNull();

    if (tilted) {
      expect(transform, "De hero-card heeft geen tilt op desktop").not.toBe("none");
    } else {
      expect(transform, "De hero-card-tilt blijft staan op de compacte breakpoint").toBe("none");
    }
  }
}