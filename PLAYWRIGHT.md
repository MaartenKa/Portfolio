# Project Overview — QA & Test Automation Portfolio

> **Doel van dit bestand:** dit is een compact overzicht van het project.
> Lees dit bestand bij het begin van elke nieuwe chat, zodat het project
> Houd dit bestand up-to-to-date bij structurele wijzigingen.

## 1. Wat is dit project?

Persoonlijk portfolio van **Maarten Kamps** (QA Engineer / Software Tester),
opgebouwd als een **statische website** gecombineerd met een **Playwright
testautomation-suit** die als portfolio-demo dient. De tests demonstreren
professionele QA-praktijk (Page Object Model, smoke + functional tests,
network mocking, CI-ready configuratie).

- **Taal website:** Nederlands
- **Type applicatie:** static site (geen backend/framework), getest met Playwright
- **Repo:** https://github.com/MaartenKa/Portfolio

## 2. Tech stack

| Onderdeel      | Technologie                                  |
|----------------|----------------------------------------------|
| Testframework  | Playwright (`@playwright/test` v1.62.x)      |
| Taal (tests + site-JS) | TypeScript (strict mode)            |
| Website        | Statisch HTML/CSS + klein TS-module          |
| Testserver     | `http-server` (lokaal op poort 3000)         |
| Reporter       | Playwright HTML reporter                      |
| Browser        | Chromium (Desktop Chrome)                     |

## 3. Projectstructuur

```
.
├── package.json              # scripts + devDependencies
├── tsconfig.json             # TypeScript-config (strict, ES2020, outDir ./dist)
├── playwright.config.ts      # Playwright configuratie
├── public/                   # STATISCHE WEBSITE (root van de site)
│   ├── index.html            # Home pagina
│   ├── curriculum.html
│   ├── testing.html
│   ├── automation.html
│   ├── projects.html
│   ├── personal.html
│   ├── contact.html          # Contactformulier (Formward)
│   ├── bedankt.html          # Thank-you / redirect pagina
│   ├── privacy.html
│   ├── 404.html
│   ├── robots.txt
│   ├── css/style.css
│   ├── images/
│   ├── js/ts/main.ts         # bron: mobiel menu-toggle
│   ├── js/ts/main.js         # gebouwd bestand (wordt geladen door de site)
│   └── old/                  # oude/verouderde kopieën van de site (legacy)
├── src/
│   └── ts/main.ts            # bron voor site-JS (menu-toggle), zie hieronder
├── playwright/               # TESTAUTOMATISERING
│   ├── pages/                # Page Object Model (huidige versie)
│   │   ├── base.page.ts      # BasePage: goto + console/page-error catch
│   │   ├── home.page.ts      # HomePage
│   │   ├── contact.page.ts   # ContactPage (incl. Formward-mock)
│   │   └── old/              # oude page objects (legacy)
│   ├── fixtures/
│   │   └── test-fixtures.ts  # (placeholder, leeg)
│   ├── utils/
│   │   └── test-data.ts      # (placeholder, leeg)
│   └── tests/
│       ├── smoke/smoke.spec.ts          # smoke tests (huidig)
│       ├── functional/homepage-functional.spec.ts
│       ├── functional/contact-functional.spec.ts
│       └── old/                        # oude specs (legacy, NIET actueel)
└── playwright-report/        # HTML rapport (ge-genereerd, in .gitignore)
```

## 4. Website (`public/`)

Statische site. Elke `.html` is een zelfstandige pagina. Belangrijkste punten:

- **Navigatie (navbar):** Home, Curriculum Vitae, Software Testen,
  Automatisering, Projecten, Persoonlijke Projecten, Contact.
- **Testable elementen** gebruiken `data-testid` attributen, o.a.:
  `nav-home`, `nav-curriculum`, `nav-testing`, `nav-automation`,
  `nav-projects`, `nav-personal`, `nav-contact`,
  `cta-projects`, `cta-curriculum`, `cta-projects-bottom`,
  `card-link-testing`, `card-link-automation`, `card-link-projects`,
  `footer-contact`, `footer-github`, `footer-linkedin`, `footer-privacy`,
  `menu-toggle`.
- **Contactformulier** (`contact.html`) post naar **Formward**:
  `https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7`.
  Heeft een verborgen **honeypot**-veld (`data-testid="field-honeypot"`,
  `style="display:none"`) als spamfilter.
- **Site-JS** (`src/ts/main.ts` → gebouwd naar `public/js/ts/main.js`):
  togt de mobiele navigatie (`#menu-toggle` ↔ `#nav-links` classe `open`,
  beheert `aria-expanded`).
- **Links (extern):** GitHub `MaartenKa/Portfolio`,
  LinkedIn `maarten-kamps-a6909527`, e-mail `Maarten.kamps.bee@outlook.com`.

> Let op: `public/old/`, `playwright/pages/old/` en `playwright/tests/old/`
> bevatten verouderde/legacy kopieën. Werk hier niet aan, behoudens expliciet.

## 5. Testautomatisering (`playwright/`)

### Architectuur
- **Page Object Model** in `playwright/pages/`:
  - `BasePage` — abstracte basis: `goto(path)` (wacht op `networkidle`,
    vangt console errors + page errors op), `expectNoConsoleErrors()`.
  - `HomePage extends BasePage` — `navigate()`, `expectStructureVisible()`
    (`.navbar` / `.hero` / `.footer`) + functionele navigatie-mappen
    (`clickProjectsCta`, `clickCurriculumCta`, `clickContactNavLink`,
    `clickProjectsNavLink`, `clickTestingCardLink`).
  - `ContactPage extends BasePage` — `navigate()`, `fillForm()`, `submitForm()`,
    `mockFormSubmit()` / `clearFormMock()` (route-mock op Formward),
    assertions op velden, honeypot, en externe links.

### Test-categorieën (huidig)
1. **Smoke** — `tests/smoke/smoke.spec.ts`
   - Deep check op `index.html`: structuur + geen console errors.
   - Lightweight check op overige pagina's (curriculum, testing, automation,
     projects, personal, contact, privacy, bedankt): HTTP 200 + geen
     console errors. Gebruikt bewust géén page object (netwerk/infra-laag).
2. **Functioneel** — `tests/functional/`
   - `homepage-functional.spec.ts`: CTA's + nav-links openen de juiste pagina's.
   - `contact-functional.spec.ts`: pagina-structuur + formulier-inzending
     (mockt Formward; valide submit → redirect naar `bedankt.html`;
     ongeldige/lege submit → géén redirect dankzij native validatie).

### Config (playwright.config.ts)
- `testDir`: `./playwright/tests`
- `baseURL`: `http://127.0.0.1:3000`
- `webServer`: `npx http-server public -p 3000` (auto-start, `reuseExistingServer`)
- Reporter: HTML → `./playwright/playwright-report`
- Op failure: screenshot; op retry: trace; op failure: video (retained)
- `fullyParallel: true`; CI: 2 retries + 1 worker + `forbidOnly`
- Eén project: **chromium** (Desktop Chrome)

## 6. npm scripts

| Script                  | Doel                                        |
|-------------------------|---------------------------------------------|
| `npm run build`         | `tsc` → TypeScript compileren naar `./dist` |
| `npm test`              | `playwright test` (alle tests)              |
| `npm run test:ui`       | Playwright UI mode                          |
| `npm run test:headed`   | Headed browser                              |
| `npm run testChromium`  | Alleen chromium project                     |
| `npm run test_homepage` | `homepage.spec.ts`                          |
| `npm run test_smoke`    | `smoke.spec.ts`                             |
| `npm run test_debug`    | Debug mode                                  |
| `npm run test_list_tests` | `--list` (tests opsommen)               |
| `npm run test_codegen`  | `playwright codegen`                        |

## 7. Hoe starten & testen

```bash
npm install                 # dependencies
npm test                    # draait http-server (poort 3000) + alle Playwright tests
npm run test:headed         # met zichtbare browser
npm run test:ui             # interactieve UI
npm run build               # TS compileren (naar ./dist)
```

## 8. Belangrijke conventies & aandachtspunten

- **Gebruik Page Objects** (`playwright/pages/`) voor UI-interactie; roep ze
  niet direct op via `page` in tests (uitzondering: lightweight smoke op de
  netwerklaag, expliciet gemotiveerd).
- **Locator-strategie:** preferentie voor `getByTestId(...)`, `getByLabel(...)`,
  `getByRole(...)` — robuuster dan CSS-selectors.
- **Determinisme:** externe netwerkaanroepen (Formward) worden gemockt via
  `page.route(...)` zodat tests offline en betrouwbaar draaien.
- **Console/page errors** worden centraal gevangen in `BasePage` en geassert.
- **TypeScript strict mode**; `noEmitOnError: true`.
- **Legacy/old-mappen** (`public/old`, `pages/old`, `tests/old`) zijn
  verouderd — niet wijzigen tenzij expliciet gevraagd.
- **`fixtures/test-fixtures.ts`** en **`utils/test-data.ts`** zijn momenteel
  placeholders (leeg) — nog in te vullen indien nodig.
- De website is **Nederlands**; test-namen en UI-teksten zijn dus in het
  Nederlands.

## 9. Snelreferentie

- Home title regex: `/Maarten Kamps/`
- Contact title regex: `/Contact/`
- Thank-you tekst: `"Bedankt uw bericht is ontvangen"`
- Formward URL: `https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7`
- Bedankt-pagina: `/bedankt.html`
- Privacy-link: `privacy.html`
- E-mail: `mailto:Maarten.kamps.bee@outlook.com`
- GitHub: `https://github.com/MaartenKa/Portfolio`
- LinkedIn: `https://www.linkedin.com/in/maarten-kamps-a6909527/`
