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

| Onderdeel              | Technologie                                                  |
| ---------------------- | ------------------------------------------------------------ |
| Testframework          | Playwright (`@playwright/test` v1.65.x)                      |
| Taal (tests + site-JS) | TypeScript (strict mode)                                     |
| Website                | Statisch HTML/CSS + klein TS-module                          |
| Testomgeving           | Live GitHub Pages (`https://maartenka.github.io/Portfolio/`) |
| Reporter               | Playwright HTML + JSON reporters                             |
| Browser                | Chromium (Desktop Chrome)                                    |
| Statusbadge (site)     | shields.io — GitHub Actions workflow-status                  |

## 3. Projectstructuur

```
.
├── package.json              # scripts + devDependencies
├── tsconfig.json             # TypeScript-config (strict, ES2020, noEmit → type-check only)
├── tsconfig.site.json        # extends tsconfig.json; site-JS → docs/js/ts (noEmit: false)
├── playwright.config.ts      # Playwright configuratie
├── playwright.local.config.ts  # lokale override: baseURL http://127.0.0.1:8080 (docs/)
├── .htmlvalidate.json        # HTML-validation config voor de site-pagina's
├── scripts/
│   └── ci-summary.mjs        # Playwright JSON-report → CI-history JSON
├── docs/                   # STATISCHE WEBSITE (root van de site)
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
│   ├── data/playwright-history.json # CI-history data voor automation.html
│   ├── images/
│   └── js/ts/main.js         # gebouwd bestand (output van tsconfig.site.json, geladen door site)
├── src/
│   └── ts/main.ts            # bron voor site-JS (menu-toggle + CI-history), zie hieronder
├── playwright/               # TESTAUTOMATISERING
│   ├── pages/                # Page Object Model (huidige versie)
│   │   ├── base.page.ts      # BasePage: goto + console/page-error catch
│   │   ├── home.page.ts      # HomePage
│   │   ├── contact.page.ts   # ContactPage (incl. Formward-mock)
│   │   ├── ci-history.page.ts # CiHistoryPage: mock + kaarten/tabel van automation.html
│   │   ├── mobile.page.ts    # NavigationPage (mobiele menu-toggle)
│   │
│   ├── fixtures/
│   │   └── test-fixtures.ts  # Custom Playwright fixtures (test.extend)
│   ├── utils/
│   │   └── test-data.ts      # Gedeelde statische data & constants
│   └── tests/
│       ├── smoke/smoke.spec.ts          # smoke tests (huidig)
│       ├── functional/homepage-functional.spec.ts
│       ├── functional/contact-functional.spec.ts
│       ├── functional/mobile-menu-functional.spec.ts
│       ├── functional/ci-history-functional.spec.ts
│       ├── accessibility/     # leeg — TESTPLAN fase 4 (A11Y-01…04)
│       ├── compatibility/     # leeg — TESTPLAN fase 7 (Firefox/WebKit)
│       ├── e2e/               # leeg — gebruikersflows
│       └── regression/        # leeg — LINK/IMG/HTML-integriteit
│   └── playwright-report/    # HTML rapport (ge-genereerd, in .gitignore)
│   └── test-results/         # screenshots/traces/video's + JSON report (in .gitignore)
```

## 4. Website (`docs/`)

Statische site. Elke `.html` is een zelfstandige pagina. Belangrijkste punten:

- **Navigatie (navbar):** Home, Curriculum Vitae, Software Testen,
  Automatisering, Projecten, Persoonlijke Projecten, Contact.
- **Testable elementen** gebruiken `data-testid` attributen, o.a.:
  `nav-home`, `nav-curriculum`, `nav-testing`, `nav-automation`,
  `nav-projects`, `nav-personal`, `nav-contact`,
  `cta-projects`, `cta-curriculum`, `cta-projects-bottom`,
  `cta-automation-bottom`, `cta-github-bottom`, `cta-contact-bottom`,
  `cta-github-social`, `cta-linkedin-social`,
  `card-link-testing`, `card-link-automation`, `card-link-projects`,
  `card-link-scrum`,
  `footer-contact`, `footer-github`, `footer-linkedin`, `footer-privacy`,
  `menu-toggle`, `ci-suite-size`, `ci-runs`, `ci-total-tests`, `ci-pass-rate`,
  `ci-status`, `ci-total-executed`, `ci-total-passed`, `ci-pass-ratio`,
  `ci-streak`, `ci-flaky-runs`, `ci-failed-runs`, `ci-metrics-note`,
  `ci-history-table`, `ci-history-body`, `nav-links` (de lijst zelf; het
  bijbehorende `id="nav-links"` blijft nodig voor de site-JS in `src/ts/main.ts`).
- **Actieve navigatie-link:** de nav-link van de huidige pagina in de header
  draagt `class="active"` (stijl `.nav-links a.active`: kleur
  `--primary-active`, accent-background en underline-balk). In de footer draagt
  de link naar de pagina zelf `class="active"`: `footer-contact` op
  `contact.html` en `footer-privacy` op `privacy.html`; op de overige pagina's
  heeft de footer géén actieve link (Contact/Privacy zijn daar niet de huidige
  pagina). Footer-stijl: `.footer-links a.active` (kleur `--primary-active` =
  `#86efac`).
- **Contactformulier** (`contact.html`) post naar **Formward**:
  `https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7`.
  Heeft een verborgen **honeypot**-veld (`data-testid="field-honeypot"`,
  `style="display:none"`) als spamfilter.
- **Site-JS** (`src/ts/main.ts` → gebouwd naar `docs/js/ts/main.js` via
  `tsconfig.site.json`):
  beheert de mobiele navigatie en de CI-history UI. De toggle zet `#nav-links`
  classe `open`, `aria-expanded` (`true` / `false`) en `aria-label`
  (`Open navigatie` / `Sluit navigatie`). Bij openen gaat focus naar de eerste
  nav-link; bij sluiten via de toggle, `Escape`, klik buiten het menu of een
  nav-link-klik sluit het menu. Bij `Escape` en klik buiten het menu gaat focus
  terug naar `#menu-toggle`; bij een nav-link-klik navigeert de browser naar de
  link. De CI-history code fetcht alleen op pagina's met
  `data-testid="ci-history-body"`.
- **CI-resultaten (`automation.html`):** de pagina toont een shields.io
  statusbadge plus kaarten en een history-tabel voor de laatste Playwright
  CI-run, QA-aggregaatcijfers en de laatste 10 CI-runs. De badge toont alleen
  de workflow-status; de kaarten en tabel worden gevuld uit
  `docs/data/playwright-history.json`, gegenereerd door de Playwright
  JSON-reporter en `scripts/ci-summary.mjs`. Exacte werking staat in
  `Project-documentation/CI-PLAYWRIGHT-HISTORY.md`.
- **Links (extern):** GitHub `MaartenKa/Portfolio`,
  LinkedIn `maarten-kamps-a6909527`, e-mail `Maarten.kamps.bee@outlook.com`.
- **Meta & SEO (per pagina, in `<head>` vóór `<title>`):**
  - `meta[name="description"]` en `link[rel="canonical"]` (absolute URL,
    `https://maartenka.github.io/Portfolio/<pagina>.html`).
  - Open Graph: `og:title`, `og:description`, `og:type=website`,
    `og:locale=nl_NL`, `og:site_name`, `og:url`, `og:image` (+ `width` 400,
    `height` 326, `alt`), Twitter: `twitter:card=summary`, `twitter:title`,
    `twitter:description`, `twitter:image`.
  - `og:image`/`twitter:image` wijzen op `images/logoipsum-407.png` —
    placeholder-logo (bewust, zie §8).
  - `meta[name="robots"]` = `noindex, nofollow` op álle pagina's: de site is
    nog indexatie-afgeschermd. OG/Twitter cards werken wél (social sharing),
    canonical/sitemap zijn nu effectloos maar onschadelijk (zie §8).
  - `docs/sitemap.xml`: 8 content-pagina's (`index`, `curriculum`, `testing`,
    `automation`, `projects`, `personal`, `contact`, `privacy`); `404.html` en
    `bedankt.html` bewust uitgesloten. Gepubliceerd op
    `https://maartenka.github.io/Portfolio/sitemap.xml`.
- **Favicon:** `link[rel="icon"] href="data:,"` — lege data-URI, bewust als
  placeholder (voorkomt impliciete `/favicon.ico`-request).
- **Logo:** `<img src="images/logoipsum-407.png">` is een placeholder-bestand;
  de `alt` is overal identiek: `Logo van Maarten Kamps (terug naar homepage)`.
- **Toegankelijkheid (P2-fixes):** alle 10 pagina's hebben een skip-link
  `<a href="#hoofdinhoud" class="skip-link">Ga naar hoofdinhoud</a>` vóór de
  header, met `main id="hoofdinhoud"` als doel. De 44 decoratieve
  `.card-icon`-emoji’s en decoratieve pijl-`span`-elementen zijn
  `aria-hidden="true"`. Section-`aria-label`s zijn ver-Nederlands (o.a.
  `Intro`, `Meer weten`, `Naar GitHub`, `Naar projecten`, `Contact`,
  `Volgende stap`, `Vaardigheden`; `Testresultaten` blijft zoals het is).
  Placeholder-tekst in het contactformulier heeft contrastkleur `#94a3b8`, en
  `.hero h1 span` heeft een `forced-colors` fallback met `CanvasText` zodat
  high-contrastmodus de gradient-tekst niet verliest.

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
  - `NavigationPage extends BasePage` (in `mobile.page.ts`) — mobiele
    menu-toggle interactie: `toggleMenu()`, `expectMenuState()`,
    `expectToggleAriaExpanded()`, `clickNavLink()`. Exporteert ook
    `NAV_ITEM_TEST_IDS` en `NAV_ITEM_URLS` als page-specifieke constants.

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
   - `mobile-menu-functional.spec.ts`: mobiele menu-toggle opent/sluit het
     menu, assert `aria-expanded`, navigeert via nav-links en checkt desktop
     (toggle verborgen, nav inline).
   - `ci-history-functional.spec.ts`: de CI-resultatensectie op
     `automation.html`. Mockt `data/playwright-history.json` via `page.route()`,
     zodat de verwachte kaarncijfers vaststaan en niet afhangen van wat er in de
     CI draaide: suite-omvang, testruns, laatste-run kaarten, Σ totalen, pooled
     ratio, streak, flaky/failed, run-link in de tabel, runs zonder noemer en de
     lege state. Page object: `pages/ci-history.page.ts`.

### Config (playwright.config.ts)

- `testDir`: `./playwright/tests`
  `baseURL`: `https://maartenka.github.io/Portfolio/` (standaard, live)
- Lokaal werken aan `docs/`: **niet** de standaardconfig omzetten, maar
  `playwright.local.config.ts` gebruiken (`npm run test:local`, `baseURL
  http://127.0.0.1:8080/` + eigen `webServer`). De vaste help-config staat in
  de repo; de standaardconfig blijft op live staan.
- `webServer` (alleen in `playwright.local.config.ts`): `npx http-server docs
  -p 8080 -s`, auto-start, `reuseExistingServer: !CI`
- Reporter: HTML → `./playwright/playwright-report`; JSON →
  `./playwright/test-results/report.json`
- Op failure: screenshot; op retry: trace; op failure: video (retained)
- `fullyParallel: true`; CI: 2 retries + 1 worker + `forbidOnly`
- Eén project: **chromium** (Desktop Chrome)

## 6. npm scripts

| Script                    | Doel                                                      |
| ------------------------- | --------------------------------------------------------- |
| `npm run build`           | site-TS → `docs/js/ts` **&&** type-check alle TS (noEmit) |
| `npm run typecheck`       | `tsc --noEmit` — type-check zonder output                 |
| `npm run lint`            | ESLint 10 (`eslint.config.mjs`), incl. playwright-plugin  |
| `npm run lint:fix`        | ESLint met automatische fixes                             |
| `npm run validate:html`   | `html-validate "docs/*.html"` (testcase HTML-01)          |
| `npm run check`           | typecheck + lint + html-validate, in één keer             |
| `npm test`                | `playwright test` (alle tests, live site)                 |
| `npm run test:local`      | zelfde suite tegen `docs/` via `playwright.local.config.ts` |
| `npm run test:ui`         | Playwright UI mode                                        |
| `npm run test:headed`     | Headed browser                                            |
| `npm run testChromium`    | Alleen chromium project                                   |
| `npm run test_homepage`   | `homepage-functional.spec.ts`                             |
| `npm run test_smoke`      | `smoke.spec.ts`                                           |
| `npm run test_debug`      | Debug mode                                                |
| `npm run test_list_tests` | `--list` (tests opsommen)                                 |
| `npm run test_codegen`    | `playwright codegen`                                      |

## 7. Hoe starten & testen

```bash
npm install                 # dependencies
npm test                    # draait alle Playwright tests (en of start lokaal de webserver wanneer dit gedefinieerd is in de playwright config)
npm run test:headed         # met zichtbare browser
npm run test:ui             # interactieve UI
npm run build               # TS: site-JS → docs/js/ts, al het rest type-checken (noEmit)
```

> **Standaard-Playwright-run:** `npm test` gebruikt `baseURL`
> `https://maartenka.github.io/Portfolio/` en dus de live GitHub Pages-site.
> Voor verifiëring van lokale `docs/`-wijzigingen staat er een vaste hulpm-config
> in de repo: `playwright.local.config.ts`. Dat is een eigen `defineConfig` die de
> standaardconfig **overneemt** (geen `extends`) en `baseURL` verwerkt naar
> `http://127.0.0.1:8080/`, plus eigen `webServer`, 1 worker en 0 retries. Gebruik:
>
> ```bash
> npm run build                          # site-JS bouwen
> npm run test:local                     # suite + auto-start van de webserver (8080)
> ```
>
> `webServer` start de server zelf (`reuseExistingServer: !CI`); een handmatige
> `npx http-server docs -p 8080 -s` is dus alleen nodig als je de server wil
> hergebruiken tussen runs door. De config schrijft dezelfde reports als de
> standaardconfig: HTML (`playwright/playwright-report/`) én JSON
> (`playwright/test-results/report.json`), beide `gitignore`-gebied.
>
> Dit is de enige manier om nieuwe kaarten/markup lokaal te testen vóór deploy:
> de standaard-suite draait tegen de live site, die de wijziging nog niet heeft.
> De hulpm-config verandert niets aan de standaard-suite, die blijft op de live
> GitHub Pages-site draaien.

## 8. Belangrijke conventies & aandachtspunten

- **Gebruik Page Objects** (`playwright/pages/`) voor UI-interactie; roep ze
  niet direct op via `page` in tests (uitzondering: lightweight smoke op de
  netwerklaag, expliciet gemotiveerd).
- **Locator-strategie:** preferentie voor `getByTestId(...)`, `getByLabel(...)`,
  `getByRole(...)` — robuuster dan CSS-selectors.
- **Determinisme:** externe netwerkaanroepen (Formward) worden gemockt via
  `page.route(...)` zodat tests offline en betrouwbaar draaien.
- **Console/page errors** worden centraal gevangen in `BasePage` en geassert.
- **CI-history UI:** `automation.html` fetcht alleen
  `data/playwright-history.json`; die file moet in de repo bestaan om 404
  console errors te voorkomen. De UI mag geen console errors loggen bij een
  ontbrekende, ongeldige of lege history-response.
- **TypeScript strict mode**; `noEmitOnError: true`; `noEmit: true` in
  `tsconfig.json` → de gezende `tsc`-run **type-checkt alleen** (no `dist/`
  output). `tsconfig.site.json` overrules met `noEmit: false` voor de site-JS.
- **`fixtures/test-fixtures.ts`** — custom Playwright fixtures (`test.extend`).
  Nog leeg (geen fixtures gedefinieerd), klaar voor uitbreiding.
- **`utils/test-data.ts`** — gedeelde statische constants (`FORMWARD_URL`,
  `OTHER_PAGES_TO_TEST`, externe links, e-mail). Geïmporteerd door page
  objects en specs waar nodig.
- De website is **Nederlands**; test-namen en UI-teksten zijn dus in het
  Nederlands.

- **Pad-conventie voor `page.goto(...)`:** gebruik **relatieve paden**
  (zonder leading `/`) zodat Playwright ze oplost ten opzichte van `baseURL`.
  - ✅ `page.goto("")` → home pagina
  - ✅ `page.goto("curriculum.html")`
  - ❌ `page.goto("/")` → lost op als root van de domain, NIET ten opzichte van baseURL
  - ❌ `page.goto("/curriculum.html")`
    Dit is cruciaal wanneer `baseURL` een subpath bevat, bijv.
    `https://maartenka.github.io/Portfolio/`. Een leading `/` zou dan naar
    `https://maartenka.github.io/curriculum.html` navigeren (404).

- **`_redirect` in het Formward-formulier is bewust relatief:**
  `<input type="hidden" name="_redirect" value="bedankt.html" />`
  (`contact.html`). Formward resolve de redirect ten opzichte van de
  verzendende URL, dus een relatieve waarde is subpath-safe
  (`/Portfolio/bedankt.html`); een absolute `https://.../Portfolio/bedankt.html`
  kan de subpath verliezen. Let op: de Playwright-mock
  (`ContactPage.mockFormSubmit`) simuleert de redirect zélf met een absolute
  `Location`-header en asserts die mock-waarde — de echte Formward-redirect is
  dus via de suite níét gedekt (alleen handmatig/live verifiëren).

- **Externe links:** elke link naar een andere domein heeft
  `target="_blank" rel="noopener noreferrer"` (footers, socials-knoppen op
  `contact.html`, project-cardlinks op `projects.html`). Conventie:
  `rel` steeds in diezelfde volgorde; interne pagina-links blijven zonder
  `target`.

- **Logo-`alt`:** op alle 10 pagina's exact dezelfde tekst
  `Logo van Maarten Kamps (terug naar homepage)` — beschrijvend én
  functie-beschrijvend (de logo-link gaat naar `index.html`).

- **HTML-validiteit:** structuur van de site-pagina's valideren met
  `npm run validate:html` (`html-validate "docs/*.html"`; config
  `.htmlvalidate.json` op repo-root, wordt automatisch opgepakt). Actief als
  defectregel: `no-implicit-close`
  (expliciet sluiten van `<p>`/`<li>`/…), `close-order` (geneste tags in de
  juiste volgorde sluiten), `element-case` (tags in kleine letters),
  `no-raw-characters` (`&` → `&amp;`) en `no-utf8-bom` (bestanden BOM-vrij
  saves; een BOM vóór `<!DOCTYPE>` kan de quirks-mode triggeren). Bewust
  aangepast in de config (stijl van deze site, geen defects):
  `doctype-style` op `lowercase`, `void-style` op `selfclosing`
  (`<br/>`-self-closing) en `no-implicit-button-type` op `off`.

  Stand van zaken: **alle 10 pagina's slagen** (`exit 0`). De raw `&` in
  `docs/curriculum.html` (testcase HTML-01) is opgeruimd naar `&amp;`, en de
  validering draait als poort vóór de tests in `playwright.yml`.

- **Lint:** `npm run lint` (ESLint 10, flat config `eslint.config.mjs`). De
  extensie `.mjs` is bewust: `package.json` heeft geen `"type": "module"`, dus
  een `eslint.config.js` wordt door ESLint als CommonJS gelezen en de
  `import`-regel dus een syntaxfout wordt. De config dekt
  `src/`, `playwright/` en `scripts/`; `docs/**` blijft buiten de lint want
  `docs/js/ts/main.js` is gebouwd resultaat. De Playwright-preset draait
  volledig op `playwright/tests/**`; op page objects/fixtures/configs staan de
  test-specifieke regels uit (asserts leven daar bewust, PLAYWRIGHT.md §4 en
  §8). `no-raw-locators` staat op `error` voor page objects/fixtures/configs: de
  eerdere raw locators zijn opgelost. `home.page.ts` asserts semantisch
  (`getByRole` op `Hoofdnavigatie`, `Intro` en `contentinfo`) en `mobile.page.ts`
  gebruikt `getByTestId("nav-links")`, ondersteund door `data-testid="nav-links"`
  in de navigatielijst van alle 10 pagina's. `npm run lint` draait met
  `--max-warnings=0`: de poort faalt op errors én op elke warning.

- **Indexatie-besluit (open):** `noindex, nofollow` + `docs/robots.txt`
  (`Disallow: /`) staan bewust; op GitHub Pages wordt `robots.txt` op
  domein-root gepubliceerd (`https://maartenka.github.io/robots.txt`), niet
  onder `/Portfolio/`. Bij later indexeren: robots-meta per pagina opzetten en
  `robots.txt` op domein-root richting `/Portfolio/` laten wijzen.

- **`tsconfig.json` include:** dekt `src/`, `playwright/tests/`,
  `playwright/pages/`, `playwright/utils/`, `playwright/fixtures/`,
  `playwright.config.ts` en `playwright.local.config.ts` af voor IDE
  type-checking. `tsconfig.site.json`
  `extends` dit config en **only** dekt `src/ts/` (emit naar `docs/js/ts`).

- **Toegankelijkheidsconventies:** de skip-link staat als eerste focusbaar
  element in `<body>` en verwijst naar `#hoofdinhoud`; decoratieve emoji’s en
  pijlen krijgen `aria-hidden="true"`; bruikbare section-`aria-label`s blijven
  in het Nederlands; `#menu-toggle` houdt `aria-expanded` en `aria-label`
  synchroon met de menu-status; focusbeheer in `src/ts/main.ts` houdt de
  toetsenbordfocus bij openen/sluiten van het mobiele menu voorspelbaar.
- **Externe badge (shields.io):** `automation.html` laadt een externe
  badge-afbeelding van `img.shields.io` (status van workflow `playwright.yml`).
  Het endpoint gebruikt de **bestandsnaam** (`playwright.yml`), niet de
  workflow-naam. Scheduled runs (cron) worden meegeteld; publieke repo → geen
  token nodig. Shields.io is niet-tracking (bewaart geen logs), maar de badge
  doet wel een externe request per pageview — verwerkt in de privacyverklaring
  (`privacy.html`, sectie 9). De afbeelding staat op `loading="lazy"` en staat
  onder de fold, zodat de request buiten de `networkidle`-wachttijd van
  `BasePage.goto()` valt.

## 9. Snelreferentie

- Home title regex: `/Maarten Kamps/`
- Contact title regex: `/Contact/`
- Thank-you tekst: `"Bedankt, uw bericht is ontvangen"`
- Formward URL: `https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7`
- Bedankt-pagina: `bedankt.html`
- Privacy-link: `privacy.html`
- E-mail: `mailto:Maarten.kamps.bee@outlook.com`
- GitHub: `https://github.com/MaartenKa/Portfolio`
- LinkedIn: `https://www.linkedin.com/in/maarten-kamps-a6909527/`
- Sitemap: `https://maartenka.github.io/Portfolio/sitemap.xml` (8 pagina's)
- OG/Twitter image: `https://maartenka.github.io/Portfolio/images/logoipsum-407.png`
- Logo-`alt`: `Logo van Maarten Kamps (terug naar homepage)`
- Skip-link: `Ga naar hoofdinhoud` → `#hoofdinhoud` (10 pagina's)
- Decoratieve icons: `aria-hidden="true"` (44 `.card-icon`-emoji’s + pijlen)
- HTML-validering: `npx html-validate "docs/*.html"`
- CI-history documentatie: `Project-documentation/CI-PLAYWRIGHT-HISTORY.md`
- CI-history data: `docs/data/playwright-history.json`
- Indexatie: `noindex, nofollow` (alle pagina's) + `docs/robots.txt`

## 10. README onderhouden

De `README.md` op de repo-root is een showcase, geen bron van waarheid. Elke
cijfer of versie die erin staat, staat ook in de code. Werk de README bij **in
dezelfde wijziging** als de oorzaak, niet later.

| README-claim | Bron van waarheid | Bijwerken wanneer |
| --- | --- | --- |
| Aantal tests per suite + totaal (41) | `npx playwright test --list` | test toegevoegd/verwijderd/hernoemd |
| Playwright-versie (1.65) | `package.json` → `devDependencies` | versie-upgrade |
| ESLint-versie (10) | `package.json` → `devDependencies.eslint` | versie-upgrade |
| Node-grens (`>=24.8 <25`) | `package.json` → `engines.node` | Node-upgrade |
| Cron-tijd (18:17 UTC) | `.github/workflows/playwright.yml` → `on.schedule` | wijziging van de cron |
| Laatste CI-run en pass-rate | `docs/data/playwright-history.json` | **niet met de hand** — dit schrijft de CI zelf |
| Aantal pagina's (10) | `docs/*.html` | nieuwe of verwijderde pagina |
| Screenshot `assets/readme-automation.png` | `automation.html` | UI-wijziging van het dashboard |
| Lijst met documenten | `Project-documentation/*` | nieuw of verplaatst document |

De screenshot vernieuw je met een element-screenshot van
`section[aria-label="Testresultaten"]` op `http://127.0.0.1:8080/automation.html`
(2× resolutie), met `npx http-server docs -p 8080 -s` als lokale server. Laat de
vaste site-header weg: die overlapt de kaarten in een element-screenshot.
