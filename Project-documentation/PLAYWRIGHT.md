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

| Onderdeel              | Technologie                                           |
| ---------------------- | ----------------------------------------------------- |
| Testframework          | Playwright (`@playwright/test` v1.62.x)               |
| Taal (tests + site-JS) | TypeScript (strict mode)                              |
| Website                | Statisch HTML/CSS + klein TS-module                   |
| Testomgeving           | Live GitHub Pages (`https://maartenka.github.io/Portfolio/`) |
| Reporter               | Playwright HTML reporter                              |
| Browser                | Chromium (Desktop Chrome)                             |
| Statusbadge (site)     | shields.io — GitHub Actions workflow-status           |

## 3. Projectstructuur

```
.
├── package.json              # scripts + devDependencies
├── tsconfig.json             # TypeScript-config (strict, ES2020, noEmit → type-check only)
├── tsconfig.site.json        # extends tsconfig.json; site-JS → docs/js/ts (noEmit: false)
├── playwright.config.ts      # Playwright configuratie
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
│   ├── images/
│   └── js/ts/main.js         # gebouwd bestand (output van tsconfig.site.json, geladen door site)
├── src/
│   └── ts/main.ts            # bron voor site-JS (menu-toggle), zie hieronder
├── playwright/               # TESTAUTOMATISERING
│   ├── pages/                # Page Object Model (huidige versie)
│   │   ├── base.page.ts      # BasePage: goto + console/page-error catch
│   │   ├── home.page.ts      # HomePage
│   │   ├── contact.page.ts   # ContactPage (incl. Formward-mock)
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
│       └── functional/mobile-menu-functional.spec.ts
│└── playwright-report/        # HTML rapport (ge-genereerd, in .gitignore)
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
  `menu-toggle`.
- **Contactformulier** (`contact.html`) post naar **Formward**:
  `https://forms.formward.eu/f/269c7657-9b51-4404-b3c8-0f3acd13c0d7`.
  Heeft een verborgen **honeypot**-veld (`data-testid="field-honeypot"`,
  `style="display:none"`) als spamfilter.
- **Site-JS** (`src/ts/main.ts` → gebouwd naar `docs/js/ts/main.js` via
   `tsconfig.site.json`):
   togt de mobiele navigatie (`#menu-toggle` ↔ `#nav-links` classe `open`,
   beheert `aria-expanded`).
- **Statusbadge (`automation.html`):** toont de status van de laatste
  Playwright CI-run (workflow `playwright.yml`, draait op schedule) via een
  shields.io badge, gelinkt naar de GitHub Actions runs. De badge is in
  site-stijl geïntegreerd: `for-the-badge` met `labelColor=111827`
  (aansluitend bij `--card`) binnen een omlijst kaart-element
  (`.automation-status-badge`) met `CI STATUS`-eyebrow, lazy-loaded. De badge
  geeft uitsluitend de run-status (passing/failing), geen testcijfers. De
  placeholder-kaarten (`[Aantal]`, `[Percentage]`, `[Status]`) staan in een
  HTML-comment met TODO (geplande uitbouw: cijfers via JSON-reporter +
  CI-commit); ze tonen dus géén lege kaarten bij bezoekers. De
  `[IN PROGRESS]`-toelichting en de badge blijven wél zichtbaar.
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

### Config (playwright.config.ts)

- `testDir`: `./playwright/tests`
  `baseURL`: `https://maartenka.github.io/Portfolio/` (standaard)
  of lokaal: `http://127.0.0.1:3000` (handmatig omzetten in config)
- `webServer`: `npx http-server docs -p 3000` — alleen actief wanneer
  de config op localhost staat (auto-start, `reuseExistingServer`)
- Reporter: HTML → `./playwright/playwright-report`
- Op failure: screenshot; op retry: trace; op failure: video (retained)
- `fullyParallel: true`; CI: 2 retries + 1 worker + `forbidOnly`
- Eén project: **chromium** (Desktop Chrome)

## 6. npm scripts

| Script                    | Doel                                        |
| ------------------------- | ------------------------------------------- |
| `npm run build`           | site-TS → `docs/js/ts` **&&** type-check alle TS (noEmit) |
| `npm test`                | `playwright test` (alle tests)              |
| `npm run test:ui`         | Playwright UI mode                          |
| `npm run test:headed`     | Headed browser                              |
| `npm run testChromium`    | Alleen chromium project                     |
| `npm run test_homepage`   | `homepage.spec.ts`                          |
| `npm run test_smoke`      | `smoke.spec.ts`                             |
| `npm run test_debug`      | Debug mode                                  |
| `npm run test_list_tests` | `--list` (tests opsommen)                   |
| `npm run test_codegen`    | `playwright codegen`                        |

## 7. Hoe starten & testen

```bash
npm install                 # dependencies
npm test                    # draait alle Playwright tests (en of start lokaal de webserver wanneer dit gedefinieerd is in de playwright config)
npm run test:headed         # met zichtbare browser
npm run test:ui             # interactieve UI
npm run build               # TS: site-JS → docs/js/ts, al het rest type-checken (noEmit)
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
  `npx html-validate "docs/*.html"` (config `.htmlvalidate.json` op repo-root,
  wordt automatisch opgepakt). Actief als defectregel: `no-implicit-close`
  (expliciet sluiten van `<p>`/`<li>`/…), `close-order` (geneste tags in de
  juiste volgorde sluiten), `element-case` (tags in kleine letters),
  `no-raw-characters` (`&` → `&amp;`) en `no-utf8-bom` (bestanden BOM-vrij
  saves; een BOM vóór `<!DOCTYPE>` kan de quirks-mode triggeren). Bewust
  **uit** gezet in de config (stijl van deze site, geen defects):
  `doctype-style`, `void-style` (`<br/>`-self-closing) en
  `no-implicit-button-type`. Stand van zaken: **0 errors** over alle 10
  pagina's.

- **Indexatie-besluit (open):** `noindex, nofollow` + `docs/robots.txt`
  (`Disallow: /`) staan bewust; op GitHub Pages wordt `robots.txt` op
  domein-root gepubliceerd (`https://maartenka.github.io/robots.txt`), niet
  onder `/Portfolio/`. Bij later indexeren: robots-meta per pagina opzetten en
  `robots.txt` op domein-root richting `/Portfolio/` laten wijzen.

- **`tsconfig.json` include:** dekt `src/`, `playwright/tests/`,
  `playwright/pages/`, `playwright/utils/`, `playwright/fixtures/` en
  `playwright.config.ts` af voor IDE type-checking. `tsconfig.site.json`
  `extends` dit config en **only** dekt `src/ts/` (emit naar `docs/js/ts`).

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
- HTML-validering: `npx html-validate "docs/*.html"`
- Indexatie: `noindex, nofollow` (alle pagina's) + `docs/robots.txt`
