# Plan — testarchitectuur verbeteren

> **Status:** uitgevoerd — november 2026.
> **Doel:** de bestaande suite professioneler maken zonder het aantal tests of de
> gebruikersflows te veranderen.
> **Baseline:** 41 tests in 5 spec-bestanden; `npm run test:local` is groen;
> `npm run check` is groen.

## 1. Scope

De wijzigingen richten zich op:

- fixtures expliciet maken;
- de Formward-mock encapsuleren;
- implementation-detail-asserts verminderen;
- de formulier-locator expliciet maken;
- CIH-03 sterker maken;
- kleine consistentiepunten opruimen.

Niet in scope: nieuwe coverage (SM-03, MENU-07…10, NAV-04/05, F4–F8/F10) en
non-functionele suites.

## 2. Voorgenomen wijzigingen

### P1 — Fixtures scheiden van navigatie en mocks

- `homePage`, `contactPage`, `navPage`, `ciHistoryPage` en `basePage` leveren
  alleen de Page Object.
- Navigatie gebeurt expliciet in de test of in een `beforeEach`.
- `ciHistoryPage` blijft zonder navigatie, omdat de test eerst de history mockt.

### P2 — Formward-mock encapsuleren

- Nieuwe `FormwardMock`-klasse met:
  - `install()`;
  - `expectRequestCount(count)`.
- `ContactPage` bevat geen mock- of requeststate meer.
- De fixture `formwardMock` installleert de route vóór de test.
- F1 assert 1 request; F2/F3 asserten 0 requests.

### P3 — Implementation-detail-asserts verminderen

- `.open`-class-asserts worden vervangen door:
  - `toBeVisible()` / `toBeHidden()`;
  - `aria-expanded`;
  - focus en zichtbaarheid van nav-items.
- `.open` blijft alleen als bewust CSS-contract gedocumenteerd, niet als primaire
  assert.

### P4 — Formulier-testid

- Voeg `data-testid="contact-form"` toe aan `docs/contact.html`.
- `ContactPage.expectFormInvalid()` gebruikt `getByTestId("contact-form")`.
- De raw-locator-uitzondering en `eslint-disable` verdwijnen.

### P5 — CIH-03 sterker

- Assert per rij:
  - Run;
  - Datum (datumpatroon, tijdzoneonafhankelijk);
  - Status;
  - Tests;
  - Geslaagd;
  - Flaky.
- Gebruik de bestaande `threeRuns`-fixture.

### P6 — Kleine consistentiepunten

- Hernoem `expectNoConsoleErrors()` naar `expectNoRuntimeErrors()`.
- Escape de input in `expectTitleContains()`.
- Breid `HistoryRunFixture` uit met optionele schema-velden en
  `runNumber: number | null`.
- Werk de actieve documentatie bij.

## 3. Validatie

Na de wijzigingen:

- `npm run test:local` moet **41/41** groen blijven;
- `npm run check` moet groen blijven;
- `npx playwright test --list` moet **41 tests in 5 files** blijven;
- `git diff --check` moet schoon zijn.

## 4. Acceptatiecriteria

- Specs gebruiken de fixtures, maar navigatie en mock zijn expliciet.
- `ContactPage` heeft geen mock-/requeststate meer.
- F2/F3 bewijzen dat een ongeldige submit **geen** Formward-request veroorzaakt.
- De menu-tests asserten gebruikerszichtbaarheid en ARIA, niet alleen `.open`.
- CIH-03 assert celwaarden, niet alleen rijcount en één link.
- De docs beschrijven de nieuwe fixture- en mockstructuur.

## 5. Risico's

- Een formulier-testid toevoegen raakt de site-markup; dit is een bewuste
  testcontractwijziging en moet met `html-validate` en de suite worden
  gevalideerd.
- Datumasserts moeten tijdzoneonafhankelijk zijn; gebruik een patroon, geen
  vaste lokale tijd.
- De fixtures blijven per test geïsoleerd; geen gedeelde `let`-state.
## 6. Status na uitvoering

**Doorgevoerd:**

- Fixtures leveren alleen Page Objects; navigatie gebeurt expliciet in de test
  of `beforeEach`.
- `FormwardMock` is een aparte fixture met `install()` en
  `expectRequestCount()`.
- `ContactPage` heeft geen mock- of requeststate meer.
- F1 assert 1 Formward-request; F2/F3 asserten 0 requests.
- De menu-tests asserten zichtbaarheid en ARIA; de primaire `.open`-assert is
  verwijderd.
- Het contactformulier heeft `data-testid="contact-form"`;
  `expectFormInvalid()` gebruikt die testid.
- CIH-03 assert de celwaarden van alle drie rijen.
- `expectNoConsoleErrors()` is hernoemd naar `expectNoRuntimeErrors()`.
- `expectTitleContains()` escapet de input.
- `HistoryRunFixture` heeft optionele schema-velden en
  `runNumber: number | null`.
- README, PLAYWRIGHT.md, CI-OVERVIEW.md, TESTPLAN.md en BESTPRACTICES.md zijn
  bijgewerkt.

**Nog open (buiten deze plan-scope):**

- SM-03 (404-fallback).
- MENU-07…10 (Escape, klik-buiten, focus).
- NAV-04/05 (footer-links).
- F4–F8 en F10.
- RESP/A11Y/SEO/LINK/IMG/VIS/PERF-suites.
- CIH-06/07/08.

Binnen de bestaande suite zijn geen open reviewpunten meer. De validatie is:
`npm run test:local` → **41/41 groen**, `npm run check` → groen en
`npx playwright test --list` → **41 tests in 5 bestanden**.

