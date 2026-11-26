// Portfolio — playwright/tests/responsive/responsive.spec.ts

import { test } from "../../fixtures/test-fixtures";
import {
  ALL_PAGES,
  COMPACT_BREAKPOINT,
  RESPONSIVE_VIEWPORTS,
} from "../../utils/test-data";

// RESP-01 test de layout op de viewports uit TESTPLAN §6.3, inclusief de
// CSS-grenzen zelf en de grens eronder: 850/849 en 500/499 (boundary value
// analysis op de media queries van `style.css`). Elke test loopt alle 10
// pagina's op één viewport, zodat de suite lineair meegroeit met het aantal
// pagina's en niet met het aantal viewporten. De checks zijn meetbaar:
// documentbreedte, zichtbaarheid van het nav-contract en berekenede knopbreedte.
test.describe("Responsive – Layout per viewport (RESP-01)", () => {
  for (const viewport of RESPONSIVE_VIEWPORTS) {
    test(`RESP-01: ${viewport.width}×${viewport.height} heeft de juiste nav-stijl en geen horizontale scroll`, async ({
      responsivePage,
    }) => {
      await responsivePage.setViewport(viewport);

      for (const page of ALL_PAGES) {
        await responsivePage.navigateTo(page);
        await responsivePage.expectViewportContract(viewport);
      }
    });
  }

  test("RESP-01: de hero-tilt is aan op desktop en uitgezet op de compacte grens", async ({
    responsivePage,
  }) => {
    await responsivePage.setViewport({ width: 1280, height: 800 });
    await responsivePage.navigateTo("index.html");
    await responsivePage.expectHeroTilt(true);

    await responsivePage.setViewport({ width: COMPACT_BREAKPOINT, height: 640 });
    await responsivePage.expectHeroTilt(false);

    await responsivePage.setViewport({ width: COMPACT_BREAKPOINT - 1, height: 640 });
    await responsivePage.expectHeroTilt(false);
  });
});