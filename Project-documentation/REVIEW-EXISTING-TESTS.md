# Review — bestaande Playwright-suite

> **Status:** reviewdocument, november 2026.
> **Doel:** vastleggen wat de bestaande 41 tests goed doen, waar ze logisch of
> volgens Playwright-best-practices tekortschieten, en welke wijzigingen nodig
> zijn vóór de suite wordt uitgebreid.
> **Scope:** `playwright/tests/`, `playwright/pages/`, `playwright/fixtures/`,
> `playwright/utils/test-data.ts`, `playwright.config.ts` en
> `playwright.local.config.ts`.

## 1. Methode en bewijs

- `npm run check` → groen: typecheck, ESLint en html-validate.
- `npx playwright test --list` → **41 tests in 5 spec-bestanden**.
- De volledige suite is in deze review niet opnieuw uitgevoerd om bestaande
  artifacts niet te overschrijven. De review is statisch, op basis van de
  spec-bestanden, Page Objects, fixtures en configuratie.

## 2. Inventaris

| Spec-bestand | Tests | Rol |
| --- | ---: | --- |
| `smoke/smoke.spec.ts` | 9 | Index deep check + 8 lightweight pagina-checks |
| `functional/homepage-functional.spec.ts` | 5 | CTA-, nav- en card-navigatie |
| `functional/mobile-menu-functional.spec.ts` | 12 | Desktop/mobiel menu, toggle en 7 nav-links |
| `functional/contact-functional.spec.ts` | 10 | Structuur, links en formulier-submit |
| `functional/ci-history-functional.spec.ts` | 5 | CI-kaarten, aggregatie, tabel en lege state |

## 3. Wat goed is

- **Page Objects** centraliseren selectors en gebruikersacties.
- **Formward wordt gemockt**; de normale suite doet geen echte POST.
- **CI-history gebruikt vaste fixtures** en een gemockte JSON-endpoint, dus
  deterministisch.
- **Web-first assertions** en geen `waitForTimeout`.
- **Duidelijke Nederlandse testnamen**.
- **`data-testid` als expliciet contract** waar semantische locators niet
  volstaan.
- **ContactFormData** is typed en `fillForm` is herbruikbaar.
- **Geen gedeelde browserstate tussen tests**; elke test krijgt een verse
  `page`/context.

## 4. Bevindingen

| # | Bevinding | Bewijs | Ernst | Actie |
| --- | --- | --- | --- | --- |
| 1 | **`clearFormMock()` is riskant** | F2/F3 verwijderen de Formward-route vóór submit. Als native validatie faalt, kan een echte POST naar Formward gaan. | **Hoog** | Mock actief houden en requests registreren; assert dat invalid submits **0 requests** veroorzaken. |
| 2 | **F2/F3 bewijzen alleen “geen redirect”** | `expectNotRedirected()` checkt alleen de URL; geen assert op `:invalid`, `checkValidity()` of focus. | Middel | Assert minimaal `:invalid`-count en `checkValidity() === false`. |
| 3 | **Smoke lightweight mist `pageerror`** | `smoke.spec.ts` luistert alleen naar `console`-errors; `BasePage` luistert ook naar `pageerror`. | Middel | `BasePage`/fixture gebruiken of ook `pageerror` opnemen. |
| 4 | **`BasePage.goto()` wacht op `networkidle`** | Dit is fragiel bij externe assets zoals de shields.io-badge. | Middel | `networkidle` verwijderen of expliciet als uitzondering documenteren; synchroniseer op zichtbare elementen/URL. |
| 5 | **`test-fixtures.ts` is dead code** | Geen spec importeert uit `playwright/fixtures/test-fixtures.ts`. | Middel | Typed fixtures implementeren en in de specs gebruiken. |
| 6 | **Gedeelde `let`-state in describe-scope** | `homepage` en `mobile-menu` gebruiken `let home`/`let nav` en zetten die in `beforeEach`. | Laag | Fixtures of lokale variables per test gebruiken. |
| 7 | **Desktop-menuassert is incompleet** | `expectMenuState(false)` assert alleen “geen `.open`”; de inline nav op desktop wordt niet op zichtbaarheid geassert. | Laag | Op desktop `navLinks` **zichtbaar** asserten; op mobiel gesloten `navLinks` **hidden**. |
| 8 | **`.open`-class asserts zijn implementation details** | Meerdere tests asserten `toHaveClass(/open/)`. | Laag-Middel | Primair `toBeVisible()`/`toBeHidden()` + `aria-expanded`; `.open` alleen als bewust CSS-contract. |
| 9 | **Honeypot-test is brittle** | `expectHoneypotHidden()` assert de inline `style="display:none"`. | Laag | `toBeHidden()`, `tabindex="-1"` en `autocomplete="off"` asserten. |
| 10 | **CIH-03 is te zwak** | Alleen rijcount en één run-link worden geassert; celwaarden niet. | Laag-Middel | Ook Datum, Status, Tests, Geslaagd en Flaky per rij asserten. |
| 11 | **Mock-redirect is absoluut** | `mockFormSubmit()` redirect naar de live GitHub Pages-URL; lokaal test de suite daardoor niet de lokale `bedankt.html`. | Middel | Relatieve `Location` gebruiken, resolved tegen de huidige pagina-URL. |
| 12 | **`THANK_YOU_PAGE` is ongebruikt** | Alleen gedefinieerd in `test-data.ts`. | Laag | In de mock/redirect-assert gebruiken of verwijderen. |
| 13 | **Formulierdata staat inline** | F1/F3 gebruiken inline waarden; `test-data.ts` heeft geen formulierdatasets. | Middel | Datasets centraliseren voor F1–F10. |
| 14 | **`HistoryRunFixture` is een subset** | Type bevat geen `skipped`, `durationMs`, `branch`, `commit`; `runNumber` kan in het echte schema `null` zijn. | Laag | Type uitbreiden of expliciet als test-subset documenteren. |
| 15 | **Kleine inconsistenties** | Typo’s als “controlleert”, “volledage”, “formulievelden”; `new RegExp(title)` zonder escaping. | Laag | Opruimen; literal regex of escaping gebruiken. |


## 5. Fixtures versus testdata

**Fixtures** zijn runtime-resources:

- Page Objects;
- gemockte Formward-route;
- setup/teardown;
- eventueel auth/state.

**Testdata** zijn waarden:

- geldige/invalid formulierdatasets;
- boundary values;
- URL-constanten;
- pagina-lijsten.

Voor deze suite is de gewenste scheiding:

```ts
type Fixtures = {
  homePage: HomePage;
  contactPage: ContactPage;
  navPage: NavigationPage;
  ciHistoryPage: CiHistoryPage;
  basePage: BasePage;
};
```

De fixtures zorgen ervoor dat elke test een verse Page Object krijgt en dat
`beforeEach`-repetitie verdwijnt. `test-data.ts` blijft de bron voor waarden.

## 6. Uitvoeringsplan

1. **Fixtures implementeren** in `playwright/fixtures/test-fixtures.ts`:
   - `homePage`: navigeert naar de homepage;
   - `contactPage`: installeert de Formward-mock en navigeert;
   - `navPage`: navigeert naar de homepage met de globale navigatie;
   - `ciHistoryPage`: constructie zonder navigatie, omdat de test eerst mockt;
   - `basePage`: voor de lightweight smoke-checks.
2. **Specs laten importeren uit de fixtures** in plaats van `@playwright/test`.
3. **Formward-mock veilig maken**:
   - route blijft actief;
   - requests worden geregistreerd;
   - F1 assert één request; F2/F3 asserten nul requests.
4. **Validatie sterker asserten** met `:invalid` en `checkValidity()`.
5. **Honeypot-assert gebruikersgericht maken** met `toBeHidden()` en
   `tabindex`/`autocomplete`.
6. **Desktop-menuassert compleet maken** met zichtbaarheid van de inline nav.
7. **Testdata centraliseren** voor de geplande F4–F10-cases.
8. **Daarna** de suite uitbreiden met SM-03, MENU-07…10, NAV-04/05 en de
   non-functionele suites.

## 7. Acceptatiecriteria

De fixture- en testwijziging is klaar wanneer:

- alle specs `test`/`expect` uit `playwright/fixtures/test-fixtures.ts` gebruiken;
- er geen ongebruikte fixture-placeholder meer is;
- de Formward-mock bij F2/F3 **niet** wordt verwijderd en er **0 requests**
  worden geregistreerd;
- de suite lokaal groen is met `npm run test:local`;
- `npm run check` groen blijft;
- `npx playwright test --list` nog steeds 41 tests telt;
- de testdata voor F1/F3 uit `test-data.ts` komt.

## 8. Status van deze stap

Dit document legt de review vast. De fixture-implementatie en de belangrijkste
testaanpassingen zijn in dezelfde stap doorgevoerd.

### Doorgevoerd

- Typed fixtures in `playwright/fixtures/test-fixtures.ts`:
  `homePage`, `contactPage`, `navPage`, `ciHistoryPage` en `basePage`.
- Alle specs importeren `test`/`expect` uit de fixtures; geen handmatige
  `new PageObject(...)` of gedeelde `let`-state meer.
- De Formward-mock blijft actief; F2/F3 verwijderen de mock niet meer en
  asserten **0 requests**.
- F2/F3 asserten `checkValidity() === false` en de betrokken ongeldige velden.
- De lightweight smoke-checks gebruiken `BasePage`, zodat ook `pageerror`
  wordt gevangen.
- `BasePage.goto()` wacht niet meer op `networkidle`.
- De honeypot-assert gebruikt `toBeHidden()`, `tabindex="-1"` en
  `autocomplete="off"`.
- De desktop-menuassert controleert nu ook dat de inline nav zichtbaar is.
- De Formward-redirect gebruikt een relatieve `Location`, resolved tegen de
  huidige pagina-URL; lokaal wordt dus `bedankt.html` in `docs/` gebruikt.
- `VALID_CONTACT` en `INVALID_EMAIL_CONTACT` staan in `test-data.ts`.

### Nog open

- CIH-03 assert nog geen celwaarden (Datum, Status, Tests, Geslaagd, Flaky).
- `.open`-class-asserts zijn nog aanwezig als projectspecifiek contract.
- `HistoryRunFixture` is nog een subset van het echte schema.
- Kleine punten: `expectTitleContains` gebruikt een niet-geescapete regex;
  enkele commentaren kunnen nog worden opgeruimd.

De suite is lokaal gevalideerd met `npm run test:local`: **41/41 groen**.
`npm run check` blijft groen en `npx playwright test --list` telt nog steeds
41 tests in 5 spec-bestanden.


