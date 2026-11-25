# Test suite status — portfolio

> **Status:** actueel status- en backlogdocument, november 2026.
> Dit is de canonieke bron voor wat gedaan is en wat nog moet gebeuren.
> Historische reviews en afgeronde plannen staan in `Project-documentation/Obselete/`.

## 1. Baseline

- **63 tests in 6 spec-bestanden.**
- Smoke: 10, homepage: 12, contact: 16, mobiel menu: 17, CI-history: 5, footer: 3.
- `npm run check` → groen.
- `npm run test:local` → **63/63 tests geslaagd**.
- `npx playwright test --list` → 63 tests in 6 files.

## 2. Wat is gedaan

| Onderdeel | Resultaat |
| --- | --- |
| **Typed fixtures** | `homePage`, `contactPage`, `navPage`, `ciHistoryPage`, `basePage`, `footerPage` en `formwardMock`; specs importeren `test`/`expect` uit de fixtures. |
| **Formward-mock** | `FormwardMock` registreert requests; F1 assert 1 request, F2/F3 asserten 0 requests. |
| **Native validatie** | F2/F3 asserten `checkValidity()` en ongeldige velden. |
| **Menu** | `.open`-asserts vervangen door zichtbaarheid en ARIA; MENU-07…10 toegevoegd. |
| **Navigatie** | NAV-01 dekt alle 7 nav-links op desktop; NAV-03 dekt alle drie card-links op de homepage. |
| **Menu-state** | MENU-04 assert een herhaalde open-sluit-cyclus en verborgen menu-items bij sluiten. |
| **Footer** | `FooterPage` + `footer-functional.spec.ts`; NAV-04/05 gedekt. |
| **Contact** | F4, F6, F7 en F10 toegevoegd; nieuwe datasets in `test-data.ts`. |
| **Honeypot (F5)** | `FormwardMock` registreert de urlencoded POST-payload; F5 assert de `_gotcha`-waarde plus de zes Formward-veldnamen in de submit, en de tabvolgorde die het honeypot-veld overslaat. |
| **Smoke** | SM-03 toegevoegd voor `404.html`; `BasePage` vangt ook `pageerror`. |
| **Live-site-preflight** | `scripts/site-check.mjs` + `npm run check:site`: alle live pagina's HTTP 200 met retries; `BasePage.gotoWithRetry()` voor smoke en smoke heeft `retries: 0`. Een host-5xx is infrastructuur, geen testflake (run #64: `testing.html` 503). |
| **CI-history** | CIH-03 assert celwaarden per rij. |
| **Kleine fixes** | `networkidle` verwijderd; runtime-error-helper hernoemd; titel-regex escapet input; honeypot-assert gebruikersgericht. |

## 3. Wat nog open is

| # | Open punt | Bewijs / locatie | Actie |
| --- | --- | --- | --- |
| 1 | **F8** | Dubbel submit / maximaal één POST is niet geautomatiseerd. | Productbesluit: submit-guard toevoegen, F8 meten met `dblclick` en een `≤ 1`-request-assert, of F8 als niet-lokaal-automatiseerbaar documenteren. |
| 2 | **SM-03 live fallback** | Lokaal is `404.html` direct getest; unknown-path-fallback is een live/GitHub-Pages-check. | Live fallback handmatig of via live-only test afdekken. |
| 3 | **Non-functioneel** | RESP-01, A11Y-01…04, SEO-01…04, LINK-01/02, IMG-01, VIS-01 en PERF-01 ontbreken. | Non-functionele suites bouwen. |
| 4 | **CI-history data/keten** | CIH-06 (ci-summary), CIH-07 (schema v2), CIH-08 (a11y CI-sectie) ontbreken. | Volgens `PLAN-CI-HISTORY-TESTS.md` bouwen. |

## 4. Wat niet meer op de backlog staat

- F5 honeypot-payload en tabvolgorde.
- CIH-03 celwaarden.
- `.open`-class-asserts.
- `HistoryRunFixture`-subset.
- `expectTitleContains`-regex.
- `expectNoConsoleErrors`-naam.
- Footer-links en actieve footer-link.
- Contact F4/F6/F7/F10.
- SM-03 lokale `404.html`-test.
- MENU-04 herhaalde state-transition.
- NAV-01 desktopdekking van alle 7 nav-links.
- NAV-03 alle drie card-links.
- Live-host-503 als testflake (run #64; nu preflight + host-retry).

## 5. Voorgestelde volgorde

1. F8 afronden (met expliciet besluit over de submit-guard; F5 is af).
2. Non-functionele suites (RESP/A11Y/SEO/LINK/IMG/VIS/PERF).
3. CIH-06/07/08.

## 6. Documentatie

Actief:

- `README.md`
- `TEST-SUITE-STATUS.md`
- `TESTPLAN.md`
- `PLAYWRIGHT.md`
- `CI-OVERVIEW.md`
- `CI-PLAYWRIGHT-HISTORY.md`
- `BESTPRACTICES.md`
- `PLAN-CI-HISTORY-TESTS.md`
- `PLAN-DEPENDENCY-UPGRADES.md`
- `PLAN-HERO-SOFT-3D.md`

Historisch/obsolete:

- `Obselete/REVIEW-EXISTING-TESTS.md`
- `Obselete/REVIEW-TESTPLAN.md`
- `Obselete/PLAN-TEST-IMPROVEMENTS.md`
- `Obselete/PLAN-FUNCTIONAL-COVERAGE.md`
