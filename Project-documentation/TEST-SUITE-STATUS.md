# Test suite status — portfolio

> **Status:** actueel status- en backlogdocument, november 2026.
> Dit is het canonieke overzicht van wat in de bestaande suite is gedaan en
> wat nog open is. `REVIEW-EXISTING-TESTS.md` is de historische review en kan
> na dit document worden verwijderd.

## 1. Baseline

- **41 tests in 5 spec-bestanden.**
- `npm run check` → groen: typecheck, ESLint en html-validate.
- `npm run test:local` → **41/41 tests geslaagd**.
- `npx playwright test --list` → 41 tests in 5 files.
- De standaard live-suite is in deze stap niet opnieuw gedraaid; de lokale
  configuratie is gebruikt om de suite te valideren.

## 2. Wat is gedaan

| Onderdeel | Resultaat |
| --- | --- |
| **Typed fixtures** | `playwright/fixtures/test-fixtures.ts` levert `homePage`, `contactPage`, `navPage`, `ciHistoryPage` en `basePage`. |
| **Specs gebruiken fixtures** | Alle specs importeren `test`/`expect` uit de fixtures; geen handmatige `new PageObject(...)` meer. |
| **Geen gedeelde `let`-state** | De `let home`/`let nav`/`let contact`/`let ci`-patronen en overbodige `beforeEach`-blocks zijn verwijderd. |
| **Formward-mock veilig** | De mock blijft actief en registreert requests. F1 assert 1 request; F2/F3 asserten 0 requests. |
| **Native validatie** | F2/F3 asserten `checkValidity() === false` en de ongeldige velden. |
| **Smoke pageerror** | De lightweight smoke-checks gebruiken `BasePage`, zodat ook `pageerror` wordt gevangen. |
| **Geen `networkidle`** | `BasePage.goto()` wacht niet meer op `networkidle`; het wacht op `load`. |
| **Honeypot** | `expectHoneypotHidden()` gebruikt `toBeHidden()`, `tabindex="-1"` en `autocomplete="off"`. |
| **Desktop-menu** | De desktop-test assert nu ook dat de inline nav zichtbaar is. |
| **Redirect** | De Formward-mock gebruikt een relatieve `Location`, resolved tegen de huidige pagina-URL; lokaal wordt `docs/bedankt.html` gebruikt. |
| **Testdata** | `VALID_CONTACT` en `INVALID_EMAIL_CONTACT` staan in `playwright/utils/test-data.ts`. |
| **Documentatie** | `TESTPLAN.md` vermeldt de fixtures en de bestaande formulierdatasets. |

## 3. Wat nog open is binnen de bestaande suite

| # | Open punt | Bewijs / locatie | Actie |
| --- | --- | --- | --- |
| 1 | **CIH-03 assert geen celwaarden** | Alleen rijcount en één run-link worden geassert. | Datum, Status, Tests, Geslaagd en Flaky per rij asserten. |
| 2 | **`.open`-class-asserts** | `NavigationPage.expectMenuState()` en de mobile-tests asserten nog `toHaveClass(/open/)`. | Als projectcontract documenteren of vervangen door `toBeVisible()`/`toBeHidden()` + `aria-expanded`. |
| 3 | **`HistoryRunFixture` is een subset** | Type mist `skipped`, `durationMs`, `branch`, `commit`; `runNumber` kan in het echte schema `null` zijn. | Type uitbreiden of expliciet als test-subset documenteren. |
| 4 | **`expectTitleContains` regex** | `new RegExp(title)` escapet de input niet. | Literal regex gebruiken of de input escapen. |
| 5 | **Kleine naam-/commentaar-punten** | `expectNoConsoleErrors()` heet “console” maar vangt ook `pageerror`; enkele commentaren kunnen strakker. | Hernoemen naar `expectNoRuntimeErrors()` of de naam documenteren; commentaren opschonen. |

## 4. Wat nog open is in het testplan (coverage)

Deze punten zijn geen reviewbevindingen, maar de geplande coverage uit
`TESTPLAN.md`:

- **SM-03** — 404-fallback.
- **MENU-07…10** — Escape, klik-buiten, focus na openen, Escape op gesloten menu.
- **NAV-04/05** — footer-links en actieve footer-link.
- **F4–F8 en F10** — optioneel veld, honeypot ingevuld, boundary, speciale tekens, dubbel submit, terugnavigatie.
- **RESP-01, A11Y-01…04, SEO-01…04, LINK-01/02, IMG-01, VIS-01, PERF-01** — non-functionele suites.
- **CIH-06/07/08** — data-laag, schema v2 en a11y van de CI-sectie.

## 5. Voorgestelde volgorde

1. CIH-03 celwaarden toevoegen.
2. `.open`-asserts en `expectTitleContains` opruimen.
3. `HistoryRunFixture` uitbreiden.
4. Daarna de geplande coverage uit §4 uitbreiden.

## 6. Relatie tot de review

`REVIEW-EXISTING-TESTS.md` bevat de historische onderbouwing en de
bevindingen. Dit statusdocument is bedoeld als de actuele, beknopte bron.
Na verwijdering van de review blijft de statusinformatie dus behouden.
