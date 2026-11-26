# Testplan & Teststrategie — Portfolio Website

| Veld           | Waarde                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------- |
| **Versie**     | 1.4 — november 2026                                                                         |
| **Status**     | Actueel testplan; status per testcase staat in de matrixen (§7, §8); suite-testnamen in §15.1 |
| **Eigenaar**   | QA Engineer (zie §13)                                                                       |
| **Testobject** | Statische portfolio-site in `docs/` (10 HTML-bestanden) + Playwright-suite in `playwright/` |
| **Testbasis**  | §3.3                                                                                        |
| **Bewijs**     | `npm run check` groen; `npx playwright test --list` = 131 tests in 10 spec-bestanden         |

**Scope:** de statische portfolio-website in `docs/` — 9 contentpagina's plus de
`404.html`-fallback (10 HTML-bestanden), het CSS-design-systeem, één klein
JS-module voor de mobiele menu-toggle en het contactformulier via Formward — en
de bijbehorende Playwright-testsuite in `playwright/`.

**Taal:** Nederlands (website en test-namen).

**Doel:** een professioneel, reproduceerbaar en CI-ready kwaliteitsniveau voor
een static site — met een heldere testpiramide, een uitvoerbare testmatrix,
testtechnieken, risico-analyse en duidelijke entry-/exit-criteria.

---

## 1. Samenvatting (executive summary)

De website is **statisch** (geen backend/framework). De belangrijkste
kwaliteitsrisico's liggen daarom op vier vlakken:

1. **Inhoud & navigatie** — pagina's laden, links kloppen, structuur is compleet.
2. **Contactformulier** — validatie, spamfilter (honeypot), submit + redirect (de
   enige echte "data-flow" van de site; loopt via externe dienst Formward).
3. **Client-side gedrag** — de mobiele menu-toggle (de enige echte site-JS).
4. **Non-functioneel** — responsive, accessibility, SEO, performance, cross-browser.

De huidige suite dekt (1) **grotendeels** (10 HTML-bestanden, inclusief de
`404.html`-pagina; de unknown-path-fallback blijft een live-check), (2)
**grotendeels** en (3) **volledig** — de mobiele menu-toggle is geautomatiseerd
in `mobile-menu-functional.spec.ts` (incl. ARIA, state-transitions, focus,
`Escape` en klik-buiten). Het formulier is gedekt voor F1–F7, F9 en F10 (F5 op
payload- en tabvolgorde-contract); F8 is gepland (§7). De P2-accessibility fixes
op de site (skip-link, decoratieve `aria-hidden`-iconen, Nederlandse
section-labels, placeholder-contrast en `forced-colors` fallback) zijn sinds
november 2026 gedekt door de accessibility-suite: 17 tests in
`accessibility.spec.ts` (A11Y-01…A11Y-04). De resterende gaten liggen op vlak
**(4)**: responsive, SEO, content-integriteit (LINK/IMG), visual-regression en
performance ontbreken nog als geautomatiseerde tests.

Een CI-keten bestaat wél: `.github/workflows/playwright.yml` draait nightly
en via `workflow_dispatch`, met kwaliteitspoorten vóór de suite en een
geautomatiseerde CI-history. Een **pre-deploy gate** (push/PR-trigger) is nog
niet geconfigureerd; dat is een open beslispunt (zie §10 en §11), geen
ontbrekende pipeline.

Deze strategie sluit die gaten op met een gestructureerde, gefaseerde aanpak
(zie §10 Roadmap) zodat het portfolio een professioneel, compleet testprofiel
toont. De ISTQB-indeling (testniveaus / testtypes / testtechnieken) wordt als
kader gebruikt om de scope te bepalen en prioriteiten te onderbouwen.

---

## 2. Testdoelstellingen

| #   | Doelstelling                                                                                                                             | Type                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| G1  | Alle pagina's laden zonder kritieke fouten (HTTP 200, geen JS/console errors)                                                            | Functioneel / Smoke                 |
| G2  | Navigatie (navbar, footer, CTA's, cards) leidt naar de juiste pagina                                                                     | Functioneel                         |
| G3  | Contactformulier valideert correct en stuurt alleen geldige berichten                                                                    | Functioneel                         |
| G4  | Mobiele menu-toggle opent/sluit de navigatie, zet `aria-expanded`/`aria-label` correct en beheert focus/Escape/klik-buiten               | Functioneel                         |
| G5  | Website is responsive op desktop, tablet en mobiel                                                                                       | Non-functieel (responsive)          |
| G6  | Website is toegankelijk (WCAG 2.1 AA, keyboard-navigatie, ARIA)                                                                          | Non-functieel (a11y)                |
| G7  | SEO-basis is correct (titel, meta, lang, robots, unieke headings)                                                                        | Non-functieel (SEO)                 |
| G8  | Geen gebroken links of afbeeldingen (intern + extern)                                                                                    | Non-functieel (content-integriteit) |
| G9  | Visueel stabiel (geen onbedoelde design-regressies)                                                                                      | Non-functieel (visual)              |
| G10 | Prestaties blijven binnen acceptabele marges (static site)                                                                               | Non-functieel (performance)         |
| G11 | Tests draaien deterministisch en reproduceerbaar in CI (parallel-draaibaar ontwerp; CI zelf draait met 1 worker)                         | Proces                              |
| G12 | Kwaliteitspoorten (typecheck, lint, html-validate) en de suite draaien geautomatiseerd in CI; een pre-deploy gate is **open beslispunt** | Proces (CI/CD)                      |
| G13 | De CI-history-sectie op `automation.html` toont de nieuwste run en gepoolde cijfers correct uit de history-JSON                          | Functioneel (dashboard)             |

---

## 3. Test scope

### 3.1 In scope

- Alle 9 contentpagina's, plus de `404.html`-fallback:
  `index.html`, `curriculum.html`, `testing.html`, `automation.html`,
  `projects.html`, `personal.html`, `contact.html`, `privacy.html`,
  `bedankt.html`.
- Navigatie-elementen met `data-testid` (`nav-*`, `cta-*`, `card-link-*`, `footer-*`,
  `menu-toggle`).
- Contactformulier (`contact.html`) incl. honeypot, native validatie, Formward-submit.
- Client-side JS: `main.js` (menu-toggle, focusbeheer, `Escape`-sluiten en
  klik-buiten-het-menu).
- Externe links (GitHub, LinkedIn, e-mail/`mailto`, Formforward-referenties in privacy).
- Responsive gedrag (viewport media-queries: ≥850px, ≤850px, ≤500px).
- Accessibility (focus, keyboard, skip-link, `aria-*`, Nederlandse
  section-labels, contrast, semantiek, img `alt`, `forced-colors`).
- SEO-basis en content-integriteit (links/afbeeldingen).
- SEO-meta per pagina: unieke `<title>`, meta description, canonical,
  Open Graph/Twitter cards; `docs/sitemap.xml` (8 content-pagina's).
- Visual regression en performance (als kwaliteitseisen, zie §10 Roadmap).
- De CI-history-sectie op `automation.html` (kaarten + Geschiedenis-tabel):
  testcases CIH-01…CIH-05, zie §8.5.

### 3.2 Uit scope (bewust)

- **`public/old/`, `playwright/pages/old/`, `playwright/tests/old/`** — legacy/verouderde
  kopieën; niet testen of wijzigen (tenzij expliciet gevraagd).
- De echte backend/verwerking van Formward (die ligt buiten onze infra; wordt
  gemockt — zie §6).
- Server-side / hosting-specifiek gedrag van de live-deploy (wel de `404`-fallback
  lokaal simuleren).
- i18n/vertaling (website is monolingual Nederlands).
- Security-penetratie (static site, geen auth/backend; wél basis: HTTPS + honeypot-check).
- Het indexatie-besluit zelf: `noindex, nofollow` en `docs/robots.txt`
  (`Disallow: /`) staan bewust en blijven zo; canonical/sitemap zijn daardoor
  nu effectloos (worden wél getest op aanwezigheid/consistentie, niet op
  indexatie-effect).
- Invullen van placeholders: logo-bestand (`images/logoipsum-407.png`) en lege
  favicon (`href="data:,"`) — content-work, geen testcases. De
  CI-statistiekkaarten en history-tabel op `automation.html` zijn niet langer
  placeholders; ze worden gevuld uit `docs/data/playwright-history.json` en
  gedocumenteerd in `CI-PLAYWRIGHT-HISTORY.md`.

### 3.3 Testbasis, aannames en referenties

**Testbasis (waar de tests uit zijn afgeleid):**

| Bron                                                                                              | Wat het levert                                                               |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `docs/*.html` + `docs/css/style.css`                                                              | feitelijk gedrag, `data-testid`-contract, breakpoints, formulierattributen   |
| `docs/sitemap.xml`, `docs/robots.txt`                                                             | indexeerbare pagina's en het bewuste `noindex`-besluit                       |
| `contact.html` (formulierattributen) + Formward-config                                            | veldtypen, `required`, `maxlength`, honeypot, `_redirect`                    |
| `src/ts/main.ts` + `docs/data/playwright-history.json`                                            | CI-history-schema (`schemaVersion`, `runs[]`, `passRate`) en de rendering    |
| `.github/workflows/playwright.yml`, `scripts/ci-summary.mjs`                                      | de werkelijke CI-keten, kwaliteitspoorten en history-productie               |
| `Project-documentation/PLAYWRIGHT.md`, `CI-PLAYWRIGHT-HISTORY.md`, `PLAN-CI-HISTORY-TESTS.md`     | projectconventies, CI-spec en CI-history-testplan                            |
| WCAG 2.1 AA, ISTQB CTFL-syllabus, ISO/IEC/IEEE 29119-3, Playwright Best Practices / Locator-guide | externe normen voor a11y, testniveaus, testdocumentatie en locator-strategie |

**Aannames:**

- De live GitHub Pages-site is tijdens een suite-run bereikbaar; lokaal werk
  gebeurt via `playwright.local.config.ts` tegen `docs/`.
- Formward is een externe, niet-testbare dienst. De suite mockt het endpoint en
  bewijst daarmee de **afhandeling** van submit/redirect, niet de echte
  Formward-verwerking, e-mailontvangst of spamfiltergedrag.
- Alleen Chromium is een ondersteunde CI-browser; Firefox/WebKit zijn fase 7.
- Er is geen backend, auth of database; security- en performance-eisen blijven
  daarom beperkt tot statische site-eigenschappen.
- De site is Nederlandstalig; i18n valt buiten scope.
- "Release" betekent in dit portfolio: een merge naar `main` plus de Pages-deploy;
  er is géén aparte productrelease met goedkeuringsprocedure.

**Acceptatiecriteria:** een release is acceptabel wanneer de in §11 genoemde
release-target-criteria én de Definition of Done per test (§14) gelden. De
statuslegenda in §5 maakt zichtbaar welke criteria nu al door de suite worden
gedekt en welke pas na fase 1–7.

---

## 4. Testniveaus (test pyramide)

Omdat er geen backend of unit-testbare module-logic is (de enige JS is een
kleine DOM-toggle), ligt de focus op **E2E/acceptance** en **non-functionele
checks**. De "unit-laag" wordt gedeeltelijk vervangen door directe DOM/ARIA-asserts.

```
            ┌─────────────────────────────┐
            │   E2E / Acceptance (Playwright)│  ← core: navigatie, formulier, toggle
            ├─────────────────────────────┤
            │  Non-functional (viewport,     │  ← a11y, SEO, links, visual, perf
            │  a11y, SEO, links, visual, perf)│
            ├─────────────────────────────┤
            │  Component / DOM-checks        │  ← ARIA-staat, structuur, honeypot
            ├┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┤
            │  Node-laag (CIH-06, gepland)   │  ← scripts/ci-summary.mjs, zonder browser
            └─────────────────────────────┘
```

- **Component/DOM-laag:** snelle, gerichte asserts op `aria-expanded`, menu-visibility
  (geen class-assert), honeypot-zichtbaarheid en `aria-hidden` op decoratieve iconen —
  via Page Objects.
- **Non-functional:** viewport/a11y/SEO/links/visual/perf — eigen spec-bestanden.
- **E2E/acceptance:** volledige gebruikersflows (navigatie, formulier-gebruik, menu).
- **Node-laag (gepland, CIH-06):** de producerende kant van de CI-history
  (`scripts/ci-summary.mjs`) zonder browser, als `npm run test:ci-summary`-poort vóór
  de browserinstall. Nu nog leeg: alle 131 tests zijn browser-cases
  (`PLAN-CI-HISTORY-TESTS.md` §7 fase B).

> **Conventie:** gebruik Page Objects voor UI-interactie; alleen de lightweight
> smoke-laag mag rechtstreeks `page` gebruiken (netwerk/infrastructuurcheck).
> Page Objects en de Formward-mock worden via typed fixtures in
> `playwright/fixtures/test-fixtures.ts` geleverd; de specs importeren
> `test`/`expect` daaruit.

### 4.1 Verhouding tot ISTQB-testniveaus

ISTQB onderscheidt component, integration, system en acceptance testing. Voor deze
statische site zijn er geen unit-testbare componenten; de enige integratie is de
formulier-submit naar de externe dienst Formward. De toewijzing is daarom:

| ISTQB-niveau     | Toepassing in dit project                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Component / unit | (bijna) niet van toepassing — de enige module-logic (`main.ts`) wordt via DOM/ARIA-asserts gedekt; de Node-script-logica (`scripts/ci-summary.mjs`) krijgt de geplande CIH-06-test (PLAN-CI-HISTORY-TESTS §7) |
| Integration      | interactie formulier ↔ Formward (**system integration** met een gemockte externe interface); geen component-integratie in de klassieke zin |
| System           | de volledige site als geheel (Playwright E2E)                                                                                              |
| Acceptance       | systeemtest tegen de acceptatiecriteria van §3.3/§11 — géén formele UAT met eindgebruikers                                                 |

De nadruk ligt dus bewust op **system** en **acceptance testing**; dat past bij het
risico-profiel van een statische portfolio-site. Waar het plan "acceptance" zegt,
bedoelt het systeemtest met acceptance criteria, niet een door de opdrachtgever
uitgevoerde UAT.

---

## 5. Testtypes (met concrete toepassing)

**Statuslegenda (geldt voor §5 en §7–§8):**

| Status          | Betekenis                                                                                |
| --------------- | ---------------------------------------------------------------------------------------- |
| **Bestaand**    | Geautomatiseerd in de huidige suite (`playwright/tests/`), als test in een spec-bestand. |
| **Deels**       | Een subset van het beschreven gedrag is geautomatiseerd; de rest ontbreekt.              |
| **Gepland**     | Nog niet geautomatiseerd; opgenomen in de roadmap (§10).                                 |
| **Niet gedekt** | Bewust buiten de huidige suite; alleen handmatig of door een andere keten bewezen.       |

### 5.1 Functioneel

- **Smoke / sanity:** elke pagina laadt (HTTP 200), geen console/page errors. _(bestaand; 10 tests)_
- **Navigatie:** elke `nav-*`-link, CTA en card-link opent de juiste URL. _(bestaand: NAV-01…NAV-05)_
- **Formulier:** zie §7 (validatie, honeypot, submit, redirect). F1–F7, F9 en F10
  zijn gedekt; F8 is gepland. De suite telt 16 contact-tests.
- **CI-history dashboard:** kaarten en Geschiedenis-tabel op `automation.html` — zie §8.5 _(bestaand, 5 tests)_.
- **Menu-toggle (MOBIEEL — bestaand):** zie TC-MENU in §8.3
  (`mobile-menu-functional.spec.ts`). Open/sluiten, focusbeheer, `Escape` en
  klik-buiten zijn geautomatiseerd.

### 5.2 Non-functioneel

- **Responsive:** correcte layout en menu per breakpoint; geen horizontale scroll, de
  nav-stijl op de grens en de compacte layout. **Bestaand:** de responsive-suite
  (`responsive.spec.ts`, 8 tests) meet op 1280×800, de grenzen 850×1024 en 849×1024, de
  grenzen 500×640 en 499×640, mobiel 390×844 en de ondergrens 320×568 — op alle 10
  pagina's, met toggle-zichtbaarheid, full-width knoppen, gestapelde hero-knoppen en de
  hero-tilt (`transform: none` op de compacte grens). De partitie ≤500px is gedekt door
  499×640, 390×844 en 320×568; `360×640` staat niet in de suite.
- **Accessibility:** keyboard-reikbare navigatie, focus-ordening, skip-link,
  `aria-expanded`, `aria-label`, decoratieve iconen met `aria-hidden`,
  Nederlandse section-labels, contrast, `lang`, afbeelding-`alt` en
  `forced-colors` fallback. **Bestaand:** de accessibility-suite (17 tests)
  bewijst dit structureel in Chromium — tabvolgorde-contract per pagina,
  focus-outline, skip-link-focus op `main`, `lang="nl"`, landmarks, `alt`-teksten,
  section-labels, gemeten placeholder-contrast en de `forced-colors`-fallback.
  axe-core (0 serious/critical violations) en Lighthouse Accessibility ≥ 95 blijven
  een **optioneel doel**: die staan niet in `package.json` en zijn niet opgenomen.
  De handmatige keyboardcheck blijft verplicht, en een kleurassert (zoals A11Y-04)
  is aanvullend bewijs, geen WCAG-conformiteit.
- **SEO:** unieke `<title>`, `meta description`, `lang="nl"`, `robots`-tag,
  één `h1` per pagina, geen duplicaat `id`.
- **Content-integriteit:** geen gebroken interne/externe links, geen 404-afbeeldingen,
  `404.html` als fallback.
- **Visual regression:** screenshot-baseline per pagina × breakpoint, vastgelegd
  in Chromium/Linux met vaste fonts; tolerantie `maxDiffPixelRatio: 0.01`
  (optioneel, fase 5).
- **Performance:** Lighthouse Performance ≥ 90, Accessibility ≥ 95,
  Best Practices ≥ 90 en SEO ≥ 90; LCP < 2,5 s, CLS < 0,1 en TBT < 200 ms.
  Dit zijn **targets**; de static site zit normaliter ruim onder de drempels.

### 5.3 Exploratorisch / handmatig

- Sessies op echte devices (iOS/Android) voor touch-gedrag, font-rendering,
  scroll, sticky-header, `backdrop-filter`-compat (oudere Safari), emoji/☰-fallback.
- Verifieer handmatig: echte Formward-eindpunt (éénmalige smoke, niet in CI),
  HTTPS + CSP/headers op de live-host, e-mail-daadwerkelijk ontvangen.

### 5.4 Testtypes volgens ISTQB — toewijzing aan dit project

ISTQB-categorieën overlappen elkaar: smoke, regression en confirmation beschrijven
_wanneer/waarom_ een test wordt uitgevoerd, niet _wat_ de test doet. Een functionele
navigatietest (bijv. `homepage-functional.spec.ts`) is tegelijk onderdeel van de
smoke-, regression- én acceptance-set.

| ISTQB-type    | Rol in dit project                                         | Prioriteit |
| ------------- | ---------------------------------------------------------- | ---------- |
| Functioneel   | core: navigatie, formulier, menu-toggle                    | ⭐⭐⭐⭐⭐ |
| Smoke         | kleine snel draaiende subset bij elke build/deploy         | ⭐⭐⭐⭐⭐ |
| Regression    | volledige suite als vangnet na wijzigingen                 | ⭐⭐⭐⭐⭐ |
| Confirmation  | specifieke test herhaald na bugfix                         | ⭐⭐⭐⭐   |
| Compatibility | cross-browser (Chromium/Firefox/WebKit) + viewports        | ⭐⭐⭐⭐   |
| Accessibility | automatische a11y-checks op belangrijkste pagina's         | ⭐⭐⭐⭐   |
| Usability     | gedeeltelijk automatisch (focus, contrast), rest handmatig | ⭐⭐⭐     |
| Performance   | Lighthouse-drempels + load-timing (apart van E2E)          | ⭐⭐⭐     |
| Security      | beperkt: honeypot, HTTPS, ongewenste navigatie             | ⭐⭐       |
| Exploratory   | handmatig buiten script; bevindingen → automatische test   | ⭐⭐⭐⭐   |

### 5.5 Testtechnieken (ISTQB)

De concrete techniek bepaalt _hoe_ de tests worden afgeleid:

- **Vereisten-gebaseerd** — uit de doelen G1–G13 en het formulier-gedrag (§7).
- **Error guessing / exploratorisch** — handmatige sessies; reproduceerbare bugs
  worden geautomatiseerd.
- **Boundary value analysis** — minimaal (1 teken) en de gemeten bovenwaarde (500
  tekens) op naam en bericht (§7 F6). De velden hebben géén `maxlength`, `minlength` of
  `pattern` in de HTML, dus F6 is een data-grens en geen specificatie-boundary. De
  viewport-breakpoints 850px/500px zijn wél échte grenzen: RESP-01 (§8.4) meet de grens
  zelf en de grens eronder — 850 en 849, 500 en 499.
- **Equivalence partitioning** — geldige vs. ongeldige e-mail, lege vs. gevulde
  verplichte velden (F1–F4), honeypot gevuld vs. leeg (F5).
- **State-transition testing** — menu-toggle toestand (closed → open → closed) en
  `aria-expanded` per toestand; formulier (leeg → invullen → submit → redirect).
- **Decision-table / scenario-based** — combinaties van veldstatussen voor het
  contactformulier (§7 matrix F1–F10).

---

## 6. Testdata & omgeving

### 6.1 Testdata

- **Bestaand:** `playwright/utils/test-data.ts` bevat vaste constanten
  (`FORMWARD_URL`, `THANK_YOU_PAGE`, `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL`,
  `OTHER_PAGES_TO_TEST`) en de formulierdatasets `VALID_CONTACT` en
  `INVALID_EMAIL_CONTACT`. `smoke.spec.ts` gebruikt de paginalijst;
  `contact-functional.spec.ts` gebruikt de formulierdatasets.
- **Formulierdatasets:** in `playwright/utils/test-data.ts`, met datasets die op de F-matrix (§7) mappen:

  | Dataset | Gebruik | Status |
  | --- | --- | --- |
  | `VALID_CONTACT` | F1, F9, F10 | Bestaand |
  | `INVALID_EMAIL_CONTACT` | F3 | Bestaand |
  | `OPTIONAL_SUBJECT_CONTACT` | F4 | Bestaand |
  | `BOUNDARY_CONTACT` | F6 | Bestaand |
  | `SPECIAL_CHARS_CONTACT` | F7 | Bestaand |
  | `missingRequired` | F2 | Gepland (F2 gebruikt lege velden) |
  | `honeypotFilled` | F5 | Bestaand |

  De bestaande datasets worden door de contacttests gebruikt; `missingRequired` is
  de lege-set-basis voor F2 en F3. De honeypot-waarde `HONEYPOT_FILLED` en de
  veldlijst `FORM_POST_FIELDS` dragen de F5-tests (payload en tabvolgorde).


### 6.2 Omgeving & determinisme

- **Huidige configuratie:** `baseURL = https://maartenka.github.io/Portfolio/` (live
  GitHub Pages) in `playwright.config.ts`; de standaard-suite heeft géén `webServer`
  en test dus de live-deploy. De `webServer`-code uit de vroegere lokale variant
  staat niet meer in die config (conventie PLAYWRIGHT §5).
- **Lokaal werk aan `docs/`:** de vaste hulpm-config `playwright.local.config.ts` in de
  repo — `npm run test:local`, met `baseURL: "http://127.0.0.1:8080/"` en
  `webServer: "npx http-server docs -p 8080 -s"` (`reuseExistingServer: !CI`, één
  chromium-project, geen retries). Eén vaste lokale poort: de vroegere ad-hoc
  3123-config en de `-p 3000`-variatie zijn daarmee vervangen (PLAYWRIGHT §7).
- **Verwachte basis van de suite:** de live-nightly (`playwright.yml`) blijft de
  functionele basis van de CI-history (max 30 runs, één writer op `main`);
  `npm run test:local` bewijst nieuwe of aangepaste site-markup vóór de deploy.
- **Live-site-preflight:** `npm run check:site` controleert alle `docs/*.html`
  vóór de suite op HTTP 200, met retries en timeouts. Een 5xx of timeout is een
  omgevingsfout, geen testflake; de online suite blijft tegen GitHub Pages draaien.
- **Externe netwerkaanroepen (Formward) worden gemockt** via `page.route(...)` zodat
  tests offline, snel en betrouwbaar draaien. **Geen** echte POST's in de suite.
- **Externe links (GitHub/LinkedIn):** in CI alleen **link-structuur** checken
  (URL/`target`/`rel`), niet de bereikbaarheid (flaky + rate-limits). Optioneel:
  éénmalige **live link-check** als aparte, niet-blokkerende job.
- **Determinisme:** geen wachttijden op externe services; waar nodig
  `expect(...).toBeVisible()` (auto-wait) i.p.v. `waitForTimeout`.

### 6.3 Browsers & viewports

- **Basis:** Chromium (Desktop Chrome) — reeds geconfigureerd.
- **Vaste waarden in de suite:** `DESKTOP_VIEWPORT` = `1920×1080` en
  `MOBILE_VIEWPORT` = `390×844` uit `playwright/utils/test-data.ts`; de menu- en
  navigatietests gebruiken die constanten, niet lokale literals per spec.
- **Responsive-viewporten (bestaand, RESP-01 in `responsive.spec.ts`):**
  `RESPONSIVE_VIEWPORTS` in `playwright/utils/test-data.ts` met desktop `1280×800`
  (nav inline), de grenzen `850×1024` en `849×1024` (toggle-zichtbaarheid op
  `max-width: 850px`), de grenzen `500×640` en `499×640` (compacte layout op
  `max-width: 500px`), mobiel `390×844` en de ondergrens `320×568` (extra check op
  horizontale scroll). De breakpoints zelf staan als constanten `NAV_BREAKPOINT` (850)
  en `COMPACT_BREAKPOINT` (500), en de nav-`data-testid`-lijst als
  `NAV_LINK_TEST_IDS` in dezelfde testdata.
- **Cross-browser (fase 7, optioneel):** Firefox + WebKit toevoegen (Playwright
  maakt dit triviaal via `devices`); prioriteit lager omdat de site simpel is.

---

## 7. Contactformulier — gedetailleerde testmatrix

De belangrijkste data-flow. Verwacht-gedrag per scenario:

| #   | Scenario                          | Input                                 | Verwacht resultaat                                                                                                | Status                                                                     |
| --- | --------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| F1  | Geldige submit                    | alle velden geldig                    | POST → redirect naar `bedankt.html` + tekst "Bedankt, uw bericht is ontvangen"                                    | Bestaand (mock; 1 request)                                                  |
| F2  | Lege verplichte velden            | name/email/bericht leeg               | géén submit (native validatie), blijft op `contact.html`, validatiemelding                                        | Bestaand (checkValidity + invalid fields + 0 requests)                     |
| F3  | Ongeldige e-mail                  | `ongeldig-email`                      | géén submit, e-mail-validatiemelding                                                                              | Bestaand (checkValidity + invalid field + 0 requests)                       |
| F4  | Alleen optioneel veld ontbreekt   | `subject` leeg                        | WEL geldige submit (subject is niet `required`)                                                                   | Bestaand (mock; 1 request)                                                  |
| F5  | Honeypot ingevuld (bot)           | `_gotcha` gevuld                      | de honeypot-waarde gaat mee in de Formward-POST (zes veldnamen en de `_gotcha`-waarde), het veld blijft verborgen en de tabvolgorde slaat het over; de verwijdering zelf is Formward-upstream (§3.2) | Bestaand (payload- en tabvolgorde-assert)                                 |
| F6  | Boundary: minimale/ extreme tekst | naam = 1 teken, bericht = 500 tekens | WEL geldige submit; geen fouten/truncatie in UI (data-grens; de HTML heeft geen `maxlength`, dus geen specificatiegrens — zie §5.5)                                         | Bestaand (mock; 1 request)                                                  |
| F7  | Speciale tekens / unicode         | emoji, quotes, accents                | WEL geldige submit; tekst wordt veilig gerenderd (geen HTML-injectie op static page)                              | Bestaand (mock; 1 request)                                                  |
| F8  | Dubbel submit                     | snel dubbel klikken op verstuurknop   | Maximaal één POST naar Formward; redirect blijft idempotent                                                       | Gepland                                                                    |
| F9  | Redirect-target is correct        | geldige submit                        | eind-URL = `bedankt.html` (subpath `/Portfolio/` behouden) + bedankt-tekst zichtbaar (geen lege/pagina-not-found) | Bestaand (met mock; bewijst afhandeling, niet de echte `_redirect`-waarde) |
| F10 | Terugnavigatie na redirect        | geldige submit → back                 | browser back werkt naar `contact.html` zonder crash; formulier is gereset/leeg (nieuwe context per test)          | Bestaand (back + 1 request)                                                 |

> **Testdata-koppeling:** de datasets staan in `playwright/utils/test-data.ts`:
> `VALID_CONTACT` (F1/F9/F10), `INVALID_EMAIL_CONTACT` (F3),
> `OPTIONAL_SUBJECT_CONTACT` (F4), `BOUNDARY_CONTACT` (F6) en
> `SPECIAL_CHARS_CONTACT` (F7).
> De Formward-mock (`FormwardMock`-fixture) blijft actief en registreert
> requests én de urlencoded POST-payload; F2/F3 asserten dat invalid submits
> **0 Formward-requests** veroorzaken. Er is geen `clearFormMock()` meer nodig.
>
> **Status:** F1–F7, F9 en F10 zijn geautomatiseerd; F5 dekt het payload- en
> tabvolgorde-contract van de honeypot en F8 is gepland.
> Deze matrix is een specificatie, geen bewijs van volledige dekking.
>
> **Aandachtspunt redirect (`_redirect`):** `contact.html` verstuurt
> `value="bedankt.html"` (bewust **relatief**, zodat Formward de redirect ten
> opzichte van de verzendende URL resolve en de `/Portfolio/`-subpath behouden
> blijft). De mock in F1/F9 gebruikt een relatieve `Location`, resolved tegen de huidige
> pagina-URL; F1/F9 bewijzen de _afhandeling_ van de redirect, niet
> de waarde van `_redirect` bij de echte Formward-redirect. Dekking daarvan:
> handmatige live-check na deploy (zie ook PLAYWRIGHT §8).

---

## 8. Testmatrix — overige testcases

Naast het formulier (§7) de concrete testcase-set per doelstelling. IDs volgen een
logische, CI-vriendelijke conventie; elke testcase is klein en gefocust (BestPractices §25).

De statuskolommen gebruiken de legenda uit §5. **Bestaand** betekent dat er een
test in een spec-bestand staat; **Deels** betekent dat slechts een subset is
geautomatiseerd. De huidige suite telt **131 tests in 10 spec-bestanden**: smoke 10,
homepage 12, contact 16, mobiel menu 17, CI-history 5, footer 3, accessibility 17,
content-integrity 11, SEO 32 en responsive 8. Deze matrix beschrijft de target-set; F8 is
nog gepland, en VIS-01 en PERF-01 zijn fase 5.

### 8.1 Smoke / sanity (G1) — `playwright/tests/smoke/smoke.spec.ts` _(bestaand)_

| ID    | Testcase                                      | Verwacht resultaat                                                        | Status                             |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| SM-01 | Home (`index.html`) laadt                     | HTTP 200, `.navbar`/`.hero`/`.footer` zichtbaar, geen console/page errors | Bestaand                           |
| SM-02 | Overige pagina's laden (curriculum … bedankt) | per pagina: HTTP 200 + geen console/page errors (8 pagina's)              | Bestaand                           |
| SM-03 | `404.html` fallback is bereikbaar             | `404.html` laadt met de fallback-content; unknown-path-fallback is een live-check | Bestaand |

### 8.2 Navigatie (G2) — `homepage-functional.spec.ts`, `mobile-menu-functional.spec.ts` en `footer-functional.spec.ts` _(bestaand)_

| ID     | Testcase                                             | Verwacht resultaat                                                                                                                                     | Status                                                                                        |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| NAV-01 | Elke `nav-*` link opent de juiste pagina             | URL matcht `NAV_ITEM_URLS[testId]`                                                                                                                     | Bestaand: homepage dekt alle 7 nav-links op desktop; mobiele suite dekt alle 7 via het geopende menu |
| NAV-02 | CTA's (`cta-projects`, `cta-curriculum`) navigeren   | correcte bestemming                                                                                                                                    | Bestaand (2 tests)                                                                            |
| NAV-03 | Card-links (`card-link-testing/automation/projects`) | correcte bestemming                                                                                                                                    | Bestaand (3 tests)                                                                            |
| NAV-04 | Footer-links (contact, github, linkedin, privacy)    | interne → juiste URL; externe → juiste `href`/`target`/`rel`                                                                                           | Bestaand                                                                                      |
| NAV-05 | Actieve footer-link op eigen pagina                  | `footer-contact` (contact) en `footer-privacy` (privacy): `class="active"` + kleur `rgb(134, 239, 172)`; overige pagina's: géén `.active` in de footer | Bestaand                                                                                       |

### 8.3 Mobiele menu-toggle (G4) — `playwright/tests/functional/mobile-menu-functional.spec.ts` _(bestaand)_

| ID      | Testcase                                           | Verwacht resultaat                                             | Status                                                          |
| ------- | -------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| MENU-01 | Initiale toestand (mobiel ≤850px)                  | menu closed, `aria-expanded="false"`, nav-links niet zichtbaar | Bestaand                                                        |
| MENU-02 | Toggle openen                                      | menu zichtbaar + alle nav-items zichtbaar, `aria-expanded="true"` | Bestaand                                                        |
| MENU-03 | Toggle sluiten                                     | menu op mobiel verborgen, `aria-expanded="false"`               | Bestaand                                                        |
| MENU-04 | State-transition closed → open → closed (herhaald) | toestand wisselt correct, geen stale state                     | Bestaand: herhaalde cyclus; alle menu-items verborgen bij sluiten |
| MENU-05 | Navigatie via geopend menu werkt                   | nav-link klikt + juiste URL; menu gesloten na navigatie        | Bestaand (7 nav-links in de loop + 1 extra contact-navigatietest) |
| MENU-06 | Op desktop (≥850px) is toggle niet nodig/zichtbaar | menu inline zichtbaar zonder toggle                            | Bestaand                                                        |
| MENU-07 | `Escape` sluit geopend menu                        | menu verborgen, `aria-expanded="false"`, focus terug naar toggle | Bestaand                                                        |
| MENU-08 | Klik buiten geopend menu sluit het menu            | menu verborgen, `aria-expanded="false"`, focus terug naar toggle | Bestaand                                                        |
| MENU-09 | Focus na openen gaat naar eerste nav-link          | eerste nav-link is gefocust                                    | Bestaand                                                        |
| MENU-10 | `Escape` op gesloten menu verandert de focus niet  | focus blijft op huidige actieve locator                        | Bestaand                                                        |

### 8.4 Non-functioneel (G5–G10) — `responsive.spec.ts`, `seo.spec.ts`, `content-integrity.spec.ts` en `accessibility.spec.ts` _(bestaand)_ ; VIS-01 en PERF-01 blijven fase 5

| ID      | Categorie           | Testcase                                                           | Verwacht resultaat (concreet)                                                                                                                                                         | Status                                          |
| ------- | ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| RESP-01 | Responsive          | Layout per breakpoint (desktop/tablet/mobiel)                      | 8 tests op 1280×800, de grenzen 850×1024 en 849×1024, de grenzen 500×640 en 499×640, 390×844 en de ondergrens 320×568, op alle 10 pagina's: geen horizontale scroll, toggle-zichtbaarheid en ingeklapt menu tot en met de nav-grens, full-width knoppen en gestapelde hero-knoppen op de compacte grens, hero-tilt aan op desktop en `transform: none` op de grens. De viewports staan als `RESPONSIVE_VIEWPORTS` in `test-data.ts`; `360×640` is niet opgenomen — de partitie ≤500px wordt getest op 499×640, 390×844 en 320×568 | **Bestaand** (`responsive.spec.ts`, 8 tests)        |
| A11Y-01 | Accessibility       | Keyboard-only navigatie + focus-visible                            | alle interactieve elementen toetsbaar bereikbaar; zichtbare focus-indicator (WCAG 2.4.7)                                                                                              | **Bestaand** (`accessibility.spec.ts`)                                |
| A11Y-02 | Accessibility       | `aria-expanded` / labels / `lang="nl"` / img `alt`                 | attributen aanwezig en correct; `lang="nl"` op elke pagina; elk formulierveld heeft een eigen label; elke `<img>` heeft een niet-lege `alt`                                                                        | **Bestaand** (`accessibility.spec.ts`)                                |
| A11Y-03 | Accessibility       | Skip-link, decoratieve iconen en section-labels                    | skip-link → `#hoofdinhoud` met focus op het doel; decoratieve emoji/pijlen `aria-hidden="true"`; section-labels in het Nederlands                                                     | **Bestaand** (`accessibility.spec.ts`)                                |
| A11Y-04 | Accessibility       | Placeholder-contrast en `forced-colors` fallback                   | computed `::placeholder`-kleur `rgb(148, 163, 184)`; contrast ≥ 4.5:1 tegen de invoerachtergrond (meting, geen alleen CSS-waarde); in forced-colors `CanvasText`, geen gradient-clip  | **Bestaand** (`accessibility.spec.ts`)                                |
| SEO-01  | SEO                 | unieke `<title>` + meta description per pagina                     | titel begint met `Maarten Kamps`, lengte 10–60; description 15–160 tekens; 10 titels en 10 descriptions site-wide uniek; de taal is Nederlands                                                      | **Bestaand** (`seo.spec.ts`, 11 tests)            |
| SEO-02  | SEO                 | één `h1` per pagina, geen duplicaat `id`, `robots`-meta per pagina  | precies één `<h1>`; geen duplicaten in `id`-attributen; `robots` = `noindex, nofollow` op alle 10 pagina's                                                                                          | **Bestaand** (`seo.spec.ts`, 10 tests)            |
| SEO-03  | SEO                 | canonical + Open Graph/Twitter cards per pagina                    | canonical = eigen absolute URL `https://maartenka.github.io/Portfolio/<pagina>`; `og:url` = canonical; `og:type=website`, `og:locale=nl_NL`, `og:site_name`, `og:image` met `width`/`height`/`alt`; `twitter:card=summary` met titel, description en image      | **Bestaand** (`seo.spec.ts`, 10 tests)            |
| SEO-04  | SEO                 | `docs/sitemap.xml` + `docs/robots.txt`                             | sitemap dekt exact de 8 content-pagina's, `404`/`bedankt` staan er niet in, alle locaties zijn bestaande bestanden; `robots.txt` sluit indexering uit (`User-agent: *` + `Disallow: /`). Vinding: de sitemap publiceert indexeerbare URLs terwijl de site expliciet niet indexeerbaar is — die spanning is gedocumenteerd, niet geassert                                  | **Bestaand** (`seo.spec.ts`, 1 test)              |
| HTML-01 | Content-integriteit | `npx html-validate "docs/**/*.html"` (config `.htmlvalidate.json`) | 0 errors (o.a. `no-implicit-close`, `close-order`, `element-case`, `no-raw-characters`, `no-utf8-bom`; stijlstijlen `doctype-style`/`void-style`/`no-implicit-button-type` staan uit) | **Bestaand** (CI-poort `npm run validate:html`) |
| LINK-01 | Content-integriteit | interne links op alle pagina's                                     | elke interne `<a href>` targett een bekend site-bestand (`ALL_PAGES`, `css/style.css`, `js/ts/main.js`, `images/logoipsum-407.png`, `data/playwright-history.json`, `robots.txt`, `sitemap.xml`); elk in-page anchor heeft een element met die id; geen HTTP-check van externe hosts (§6.2)  | **Bestaand** (`content-integrity.spec.ts`)        |
| LINK-02 | Content-integriteit | externe links (`href^="https://"`)                                 | elke externe link heeft `target="_blank"` + `rel="noopener noreferrer"`                                                                                                               | **Bestaand** (`content-integrity.spec.ts`)        |
| IMG-01  | Content-integriteit | afbeeldingen en asset-referenties                                  | elke `<img>` heeft een niet-lege `alt`, een interne bron uit de asset-set en is geladen; elke interne referentie in `img[src]`, `link[href]` en `script[src]` is een bekend site-bestand; de load-state van de externe shields.io-badge is niet geassert (§6.2) | **Bestaand** (`content-integrity.spec.ts`)        |
| VIS-01  | Visual (fase 5)     | screenshot-baseline per pagina × breakpoint                        | geen onbedoelde regressies; baseline gemaakt in CI/Linux met vaste fonts; tolerantie max 1% diff-pixels                                                                               | Gepland (fase 5)                                |
| PERF-01 | Performance         | Lighthouse (Perf/A11y/BestPractices/SEO) ≥ drempel                 | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90; LCP < 2,5 s, CLS < 0,1 en TBT < 200 ms                                                                           | Gepland (fase 5)                                |

### 8.5 CI-history & dashboard (G13) — `playwright/tests/functional/ci-history-functional.spec.ts` _(bestaand, 5 tests)_

De kaarten en de geschiedenis-tabel op `automation.html` worden client-side gevuld
uit `docs/data/playwright-history.json` (schema `schemaVersion: 1`, entries met
`total`, `passed`, `failed`, `flaky`, `passRate`), gerenderd door `src/ts/main.ts`.
Deze sectie test het **eindpunt van de weergave** (data → kaarten/tabel), niet de
producerende kant (`scripts/ci-summary.mjs`) en niet de CI/deploy-keten zelf
(zie `CI-PLAYWRIGHT-HISTORY.md` en `PLAN-CI-HISTORY-TESTS.md` §2–§3 en §7).

| ID     | Testcase                                                       | Verwacht resultaat                                                                                                                                                                                                                   | Status   |
| ------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| CIH-01 | Laatste-run kaarten tonen de nieuwste run                      | `ci-suite-size` = "40 tests", `ci-runs` = "3", `ci-total-tests` = "40", `ci-pass-rate` = "100%", `ci-status` = "Geslaagd"                                                                                                            | Bestaand |
| CIH-02 | Aggregate kaarten poolen alle runs (Σ passed / Σ total)        | `ci-total-executed` = "120", `ci-total-passed` = "108 van 120", `ci-pass-ratio` = "90%", `ci-streak` = "1", `ci-flaky-runs` = "1", `ci-failed-runs` = "2", `ci-metrics-note` bevat "Over 3 CI-runs" en "108 van 120 tests geslaagd." | Bestaand |
| CIH-03 | Geschiedenis-tabel toont één rij per run met werkende run-link | 3 rijen in `ci-history-body`; per rij Run/Datum/Status/Tests/Geslaagd/Flaky geassert; link "Run 42" heeft de juiste `href` naar de GitHub Actions-run | Bestaand |
| CIH-04 | Runs zonder noemer (`total = 0`) vallen buiten de totalen      | alleen 2 van 3 runs geteld: `ci-total-executed` = "80", `ci-pass-ratio` = "90%", `ci-streak` = "0", `ci-status` = "Geannuleerd"; notering bevat "2 van 3 CI-runs geteld"                                                             | Bestaand |
| CIH-05 | Lege geschiedenis: placeholders en placeholder-rij             | alle kaarten tonen "—", `ci-history-body` bevat "Geen CI-historie beschikbaar."                                                                                                                                                      | Bestaand |

> **Bewijs:** `npx playwright test --list` telt 5 tests in dit spec-bestand (80 in
> de hele suite). De tabel heeft in de markup 6 kolommen (Run, Datum, Status,
> Tests, Geslaagd, Flaky) en géén `data-testid` per rij; rijen worden via
> `getByRole("row")` geteld. Er is **géén** aparte JSON-schema- of 404-fallback-test **in dit spec-bestand**.
>
> **Roadmap:** CIH-06 (de component-test op `scripts/ci-summary.mjs`) is november 2026
> **gescopeerd**: de Playwright-runner in een **niet-browser project**
> (`playwright/tests/unit/`, geen `devices`-use en geen `page`-fixture), met
> `npm run test:ci-summary` als CI-poort vóór de browserinstall, na `validate:html`.
> De cases staan in `PLAN-CI-HISTORY-TESTS.md` §7. CIH-07 (schema v2 met `suiteTests`)
> en CIH-08 (a11y van de CI-sectie) volgen daarna. **Gepland**, niet uitgevoerd: de
> suite telt nog 131 tests in 10 spec-bestanden.

---

## 9. Risico-analyse & mitigatie

Risico's gerangschikt op impact × waarschijnlijkheid voor een statische site.
Mitigaties zijn bewust verweven in BestPractices (determinisme, mocking, isolation).

| #   | Risico                                                                                                                                                                                                                                                                           | Impact | Waarschijnlijkheid | Mitigatie                                                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | :----------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Formward-down/vertraagd → flaky suite                                                                                                                                                                                                                                            |  Hoog  |       Middel       | Altijd `page.route(...)` mock in CI; géén echte POST's (BestPractices §10, §22)                                                                                                                                                    |
| R2  | Menu-regressie na CSS/JS-wijziging                                                                                                                                                                                                                                               |  Hoog  |       Middel       | TC MENU-01…10; bestaande suite groen houden en nieuwe focus/Escape/klik-buiten-cases automatiseren in fase 2                                                                                                                       |
| R3  | Flaky tests door timing/external deps                                                                                                                                                                                                                                            |  Hoog  |       Middel       | Auto-wait + web-first asserts; geen `waitForTimeout`; retries alleen als vangnet (BestPractices §13)                                                                                                                               |
| R4  | Gebroken link/afbeelding na wijziging                                                                                                                                                                                                                                            | Middel |       Middel       | LINK-01 / IMG-01 in regression-set                                                                                                                                                                                                 |
| R5  | Design-regressie (CSS) onopgemerkt                                                                                                                                                                                                                                               | Middel |       Middel       | Visual baseline VIS-01 (fase 4), kleine tolerantie                                                                                                                                                                                 |
| R6  | Externe links (GitHub/LinkedIn) flaky in CI                                                                                                                                                                                                                                      |  Laag  |        Hoog        | In CI alleen link-structuur checken, niet bereikbaarheid (§6.2)                                                                                                                                                                    |
| R7  | a11y/SEO-regressie                                                                                                                                                                                                                                                               | Middel |    Laag-Middel     | A11Y/SEO-asserts (fase 4); optioneel axe-core                                                                                                                                                                                      |
| R8  | Performance-degradatie                                                                                                                                                                                                                                                           |  Laag  |        Laag        | Lighthouse-drempels PERF-01, apart van E2E                                                                                                                                                                                         |
| R9  | Legacy-mappen (`old/`) onbedoeld aangepakt                                                                                                                                                                                                                                       | Middel |        Laag        | Uit scope (§3.2); niet in `testDir` / config                                                                                                                                                                                       |
| R10 | SEO-meta/canonical/sitemap raken inconsistent na nieuwe pagina                                                                                                                                                                                                                   | Middel |       Middel       | SEO-03/SEO-04 asserts; sitemap en canonical-explicitie per pagina (PLAYWRIGHT §4)                                                                                                                                                  |
| R11 | HTML-structuurdefecten (onafgesloten `<p>`, `</P>`, raw `&`) blijven onopgemerkt in statische HTML                                                                                                                                                                               | Middel |       Middel       | HTML-01 `html-validate` als poort vóór de E2E-suite (browser repareert impliciet, dus E2E detecteert dit niet)                                                                                                                     |
| R12 | Lege placeholder-content (logo, favicon) of lege CI-history wekt onvolledige indruk                                                                                                                                                                                              |  Laag  |       Middel       | Logo/favicon gedocumenteerd (§3.2); CI-history kan leeg zijn als er nog geen run is; CIH-05 dekt de placeholder-fallback |
| R13 | De history-data is er, maar de weergave (kaarten/Geschiedenis-tabel) ontbreekt of is onvolledig → bezoeker ziet lege kaarten                                                                                                                                                     | Middel |    Laag-Middel     | CIH-01…05 in `ci-history-functional.spec.ts`; placeholder-fallback CIH-05; `data-testid`-contract in de HTML (PLAYWRIGHT §4)                                                                                                       |
| R14 | Één incidentele (niet-reproduceerbare) testmislukking in de suite: bij de eerste volledige lokale run na de kwaliteitspoorten viel de homepage-CTA-test weg; in isolatie en in een volledige herhaling was 41/41 groen. Determinisme is daarmee een gemeten risico, geen aanname | Middel |        Laag        | 5 opeenvolgende groene runs als exit-metric (§11); `retries: 2` in CI maar `0` lokaal (`playwright.local.config.ts`) zodat een lokale bevinding zichtbaar blijft; bij herhaling: trace/screenshot (`retain-on-failure`) analyseren |
| R15 | Live GitHub Pages/CDN geeft tijdelijk 5xx of timeout, waardoor een smoke-check faalt terwijl de site zelf niet defect is | Middel | Middel | `npm run check:site` als preflight; `BasePage.gotoWithRetry()` voor smoke; hostfout wordt als infra behandeld, niet als testflake (run #64: `testing.html` 503) |


**Schaal en eigenaarschap:** Impact en waarschijnlijkheid zijn labels op een
3-puntschaal (Laag / Middel / Hoog) en geen formele FMEA-score. Elke rij heeft
de QA Engineer als risico-eigenaar (§13); de mitigerende testcases hebben de
status uit §7/§8. De tabel wordt bij elke release-review opnieuw beoordeeld en
de datum van die review wordt in het CI-/releaselog vastgelegd.

---

## 10. Roadmap (gefaseerde aanpak)

Elke fase is self-contained en draait al na afloop groen in CI. Volgorde volgt
impact: eerst de grootste functionele gap, dan non-functioneel, tenslotte polish/CI.

| Fase | Scope                                                                                                                           | Levert / exit-criterium                                                                                                                                            |
| :--: | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1   | Bestaande suite stabiliseren (smoke + navigatie + contact)                                                                      | Alle huidige tests groen, deterministisch, gemockt; geen flaky                                                                                                     |
|  2   | **Mobiele menu-toggle stabiliseren & uitbreiden** (TC MENU-01…10, bestaand + nieuwe focus/Escape/klik-buiten-cases)             | Suite groen + deterministisch op `DESKTOP_VIEWPORT` (1920×1080) en `MOBILE_VIEWPORT` (390×844); ARIA state-transition, focusbeheer, `Escape`-sluiten en klik-buiten-het-menu gedekt. De extra viewports (850×1024, 360×640) zijn niet toegevoegd — die staan in RESP-01 (fase 4) |
|  3   | Testdata centraliseren (`utils/test-data.ts`) + F4/F6/F7/F10-cases; F8 blijft gepland | Formulier-testdataset centraal; F-matrix grotendeels gedekt                                                                                                        |
|  4   | Non-functioneel: responsive, a11y, SEO, links/img checks — **af** (a11y 17, SEO 32, content-integrity 11, responsive 8) | A11Y-01…04, SEO-01…04, LINK-01/02, IMG-01 en RESP-01 groen op alle 10 pagina's; VIS-01 en PERF-01 zijn fase 5                                                                                             |
|  5   | Visual regression + Lighthouse-drempels                                                                                         | Baselines + PERF-01 in CI (niet-blokkerend waar zinvol)                                                                                                            |
|  6   | CI-keten (GitHub Actions, bestaand: `playwright.yml`): npm ci → typecheck → lint → html-validate → test → artifacts → history   | Playwright HTML-report, JSON-report en CI-history als artifact; history op `main` gecommit; Chromium-only browserinstall uitgevoerd. De history-**data** wordt pas gedekt door CIH-06 (geplande `test:ci-summary`-poort)                                |
|  7   | Optioneel: pre-deploy/PR-gate (push-trigger op de poorten), cross-browser (Firefox/WebKit) + exploratoire device-sessies        | Gate-besluit (§10.2), browser-coverage & handmatige findings geformaliseerd                                                                                        |
| 8  | Showcase-media: video's van de suite op de portfolio-site, wanneer de portfolio-inrichting vastligt | Kijkmodus-artifacten uit §10.4 gekozen, als site-asset opgeslagen en ingebet op automation.html; de site-copy is bijgewerkt |

### 10.1 CI-pipeline (fase 6, in lijn met BestPractices §18)

**Uitgevoerd in `.github/workflows/playwright.yml`** (single source of truth; er is
bewust géén tweede workflow). De poorten staan vóór de browserinstall. De suite
draait met **1 worker** en **2 retries** in CI (zie §6.2 en §11):

```yaml
# .github/workflows/playwright.yml — de realiteit (trigger: nightly 18:17 UTC + dispatch)
steps:
  - run: npm ci
  - run: npm run typecheck # tsc --noEmit
  - run: npm run lint # ESLint 10, eslint-plugin-playwright
  - run: npm run validate:html # HTML-01: structuur van de site-pagina's
  - run: npx playwright install --with-deps chromium # alleen het ene chromium-project
  - run: npm run test # suite (1 worker in CI, 2 retries)
  - run: node scripts/ci-summary.mjs # Playwright JSON-report → CI-history
  - uses: actions/upload-artifact # HTML report + JSON report + CI-history
```

> **Uitgevoerd:** de workflow installeert alleen Chromium
> (`npx playwright install --with-deps chromium`), want `playwright.config.ts`
> definieert alleen het `chromium`-project. De vroegere beperking — alle engines
> installeren bij één project — is in de werkbom opgelost (§10.3 punt 3,
> BESTPRACTICES §18).
>
> **Gepland:** de vierde poort `npm run test:ci-summary` — CIH-06, de component-test
> op `scripts/ci-summary.mjs` — staat in de keten na `validate:html` en vóór de
> browserinstall, als niet-browser-poort (PLAN-CI-HISTORY-TESTS §7 fase B). De code is
> er nog niet, dus deze snippet toont de drie bestaande poorten.

### 10.2 Gate-besluit (open beslispunt)

Het vroegere _concept_ van een aparte `ci.yml` als push/PR-gate is een **open
beslispunt**: de push-trigger staat nu uit in `playwright.yml` (handmatig draaien
bij een push). Een push-gate vraagt om een push-trigger op de poorten (geen tests),
met een eigen concurrency-groep, zodat de nightly-history-keten (één writer op
`main`) onaangeraakt blijft. Zolang dit besluit open is, formuleert G12 (§2) dit
als **doel/aspiratie**, niet als huidige werkelijkheid.

### 10.3 Bekende CI-beperkingen

| #   | Beperking                                                                            | Gevolg                                                                                                        | Status                                                                          |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | CI draait met `workers: 1`                                                           | De CI-run is niet parallel; `fullyParallel: true` betekent alleen dat tests parallel-draaibaar zijn ontworpen | Bewust; lokaal draait de suite met default workers                              |
| 2   | `retries: 2` in CI; de smoke-set heeft `retries: 0`                                   | Een retry kan flakiness maskeren; smoke-hostfouten moeten juist failen                        | Bewust vangnet; een test die alleen via een retry slaagt telt als flaky (§12.1) |
| 3   | `npx playwright install --with-deps chromium` — alleen het `chromium`-project | Was: onnodige downloadtijd bij alle engines                                      | **Opgelost** in de werkbom (BESTPRACTICES §18, §10.1)                          |
| 4   | trace/screenshot/video-bestanden in `playwright/test-results/` worden niet als artifact geüpload; alleen `report.json` wordt geüpload | Failure-debugging via trace ontbreekt in CI                                                                   | Verbeterpunt: `test-results/` uploaden bij failure                              |
| 5   | Geen pre-deploy gate                                                                 | Een push naar `main` wordt niet automatisch op de suite gevalideerd                                           | Open beslispunt (§10.2)                                                         |
| 6   | Live host kan tijdelijk 5xx/timeout geven                                            | Smoke-tests kunnen als flaky worden geregistreerd als de host niet beschikbaar is                             | Mitigatie: `check:site`-preflight; `BasePage.gotoWithRetry()` voor smoke; hostfout telt als infra, niet als testflake |

### 10.4 Open taak: showcase-media (video's) op de portfolio

De kijkmodus staat in de werkbom en is gemeten: de env-vlag `PW_VIEW=1`
(`npm run test:localVideo`, `scripts/view-tests.mjs`) zet `video: { mode: 'on' }`,
`trace: 'on'`, `screenshot: 'on'`, headed en open HTML-rapport, zodat ook een
geslaagde run na te kijken is (PLAYWRIGHT §7, BESTPRACTICES §35). De standaardrun
`npm run test:local` blijft `retain-on-failure`: bij een groene run blijft de
artifactmap leeg.

**Uitgesteld tot de portfolio-inrichting vastligt.** De site-opmaak en de portfolio-claims
moeten definitief zijn; dan wordt deze taak uitgevoerd. Nu is er de taakomschrijving.

| Aspect | Wat er dan te doen is |
| --- | --- |
| Keus | Bepalen welke suite-onderdelen showcase-media krijgen. Kandidaat: de CI-history-kaarten en de geschiedenis-tabel op `automation.html`, want daar staat de site-belofte "Screenshots, video's en de volledige HTML-report volgen in een volgende stap". |
| Techniek | `test.use({ video: { mode: 'on', size: { width: 800, height: 450 }, show: { test: { level: 'step' }, actions: { duration: 400 } } } })` in het gekozen spec-bestand. De artifacts in `playwright/test-results/` zijn gitignore-gebied en geen publicatiebron; de clip gaat expliciet naar een site-asset (bijv. `docs/media/`) via `page.video().saveAs(...)`. |
| Site | De "volgen in een volgende stap"-copy in `docs/automation.html` wordt een actieve embed: `<video>` met poster, Nederlandse `figcaption` en `aria-label`. De opname laat de vaste site-header weg (conventie van de element-screenshot, PLAYWRIGHT §7). |
| Acceptatie | `npm run check` groen, `npm run test:local` groen, `npx playwright test --list` telt de gekozen tests, en de embed is speelbaar op `http://127.0.0.1:8080/automation.html` en op de live site na deploy. |
| Beperking | Binaire media groeien met de suite: gemeten ~112 KB video, ~1.24 MB trace en ~610 KB screenshot per test. Bewaar alleen de gekozen clips, niet de artifactmap. Een clip met de CI-cijfers van één run is snapshot-data, geen regressie-bewijs (§6.2 en §8.5). |

---

## 11. Entry- & exit-criteria

### Entry criteria (voordat een release getest mag worden)

- De site is bereikbaar op de geconfigureerde `baseURL`: de live GitHub Pages-deploy
  voor de standaardsuite, of `docs/` via `playwright.local.config.ts` voor lokaal werk.
- **Live-site-preflight:** `npm run check:site` is groen; alle live pagina's geven
  HTTP 200. Een 5xx/timeout is een omgevingsfout en geen testflake.
- De suite is draaibaar: `npm ci` is uitgevoerd, Chromium is geïnstalleerd en de
  Formward-mock is beschikbaar (geen echte POST's nodig).
- Type-check en lint schoon via de CI-poorten: `npm run typecheck` (`tsc --noEmit`) en
  `npm run lint` (`eslint . --max-warnings=0`): de poort faalt op errors én op elke
  warning. De vroegere vier `no-raw-locators`-warnings zijn opgelost — `home.page.ts`
  asserts semantisch via `getByRole` en `mobile.page.ts` via `getByTestId("nav-links")`,
  met `data-testid="nav-links"` in de navigatielijst van alle 10 pagina's (PLAYWRIGHT §8).
- HTML-validiteit schoon: `npm run validate:html` → 0 errors op alle 10 pagina's (HTML-01).
  De raw `&` in `docs/curriculum.html` is opgeruimd naar `&amp;` (het was een
  openstaand, gedocumenteerd defect). De validering draait vóór de tests in `playwright.yml`.
- **Gepland als vierde poort:** `npm run test:ci-summary` (CIH-06, de component-test op
  `scripts/ci-summary.mjs`) draait als niet-browser-poort vóór de browserinstall, in
  dezelfde keten als deze drie poorten. De code is er nog niet, dus de drie bestaande
  poorten zijn de entry-criteria.
- Geen openstaande blokkerende defects uit de vorige run.
- De testdata en verwachtingen zijn deterministisch: gemockte endpoints, vaste
  fixtures en geen afhankelijkheid van live CI-cijfers.

### Exit criteria — huidige baseline (suite zoals nu, 131 tests)

1. **Poorten groen** — `npm run check` (typecheck + lint + html-validate) slaagt.
2. **Suite groen** — 131/131 tests slagen lokaal (`npm run test:local`), 0 failures en
   0 skipped in het JSON-report. De 131-suite heeft nog niet in de CI gedraaid: de laatst
   gelogde CI-run is 63/63 (run 71).
3. **Geen blokkerende of hoge defects** in de gedekte gebieden; bekende
   niet-blokkerende issues zijn gedocumenteerd. De sitemap/robots-contradictie (SEO-04)
   en de compacte-layout-dekking (8 van de 10 pagina's hebben `.button`-elementen) zijn
   documentvindingen, geen defecten.
4. **Determinisme** — de suite is herhaalbaar groen: lokaal met `retries: 0`, CI met
   `retries: 2` als vangnet. Een test die alleen via een retry slaagt, telt als
   **flaky** en moet worden onderzocht (zie §12.1).
5. **Beperkingen benoemd** — F8 is gepland; VIS-01 en PERF-01 uit fase 5 ontbreken nog;
   de E2E-laag (S1–S6) en de pyramide-basis (CIH-06 als `npm run test:ci-summary`-poort;
   scoping in PLAN-CI-HISTORY-TESTS §7) zijn nog niet gebouwd. De
   accessibility-, responsive-, SEO- en content-integriteit-suite zijn bestaand en lokaal
   groen: A11Y-01…04 (17), RESP-01 (8), SEO-01…04 (32) en LINK-01/LINK-02/IMG-01 (11).

### Exit criteria — release-target (na fase 1–7)

Deze criteria gelden pas wanneer de bijbehorende tests daadwerkelijk bestaan; ze zijn
het acceptatieniveau van een volledige release, niet de huidige stand.

1. **Smoke 100%** — alle pagina's laden, geen console/page errors (SM-01…SM-03,
   inclusief de 404-fallback).
2. **Functioneel** — navigatie NAV-01…NAV-05, formulier F1–F10, menu-toggle
   MENU-01…MENU-10 en CI-history CIH-01…CIH-05 groen (§7, §8, G13).
3. **Non-functioneel** — RESP-01, A11Y-01…A11Y-04, SEO-01…SEO-04, LINK-01, LINK-02,
   IMG-01, VIS-01 en PERF-01 groen op alle 10 pagina's; HTML-01 blijft groen.
4. **Geen blokkerende defects**; geen open defects met severity Hoog zonder
   workaround; Middel/Laag zijn gedocumenteerd met workaround of acceptatie.
5. **Stabiliteit** — 5 opeenvolgende groene runs op dezelfde commit, 0 flaky tests.

### Meetbare exit-metrics

| Metric                  | Doel (release-target)                                                                                                                                                                           | Bron / meting                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Uitgevoerde testcases   | 100% van de cases in §7/§8 die status **Bestaand** of **Deels** hebben                                                                                                                          | Playwright JSON-report (`stats.expected`)                        |
| Vereisten-dekking       | Elk in-scope productdoel G1–G10 en G13 heeft ≥1 **bestaande** testcase; G11/G12 worden door CI-config en een CI-run bewezen, niet door een testcase; geplande cases tellen niet mee als dekking | Traceerbaarheid §15 + `npx playwright test --list`               |
| Pass-rate               | 100% pass, 0 fail, 0 skipped, 0 unexpected                                                                                                                                                      | Playwright JSON-report                                           |
| Flaky-aandeel           | 0% (geen test die alleen via een retry slaagt)                                                                                                                                                  | JSON-report `flaky`-veld + 5 groene runs met `retries: 0` lokaal |
| Dekking van de F-matrix | 9/10 cases bestaand (F8 gepland)                                                                                                                                                      | §7                                                               |
| CI-history              | CIH-01…CIH-05 bestaand en groen (5/5); CIH-06 gepland als niet-browser-poort                       | `ci-history-functional.spec.ts`; CIH-06: `playwright/tests/unit/` + `npm run test:ci-summary` (gepland) |

> Let op: de CI draait met `workers: 1` (`playwright.config.ts`). "Parallel" betekent
> hier dat tests **parallel-draaibaar ontworpen** zijn (`fullyParallel: true`), niet dat
> de CI zelf meerdere workers gebruikt. Lokaal draait de suite met de default workers.

---

## 12. Defectbeheer & opschortings-/herstartcriteria

### 12.1 Defectcategorieën & ernst (severity)

| Ernst      | Definitie                                   | Voorbeeld                           |
| ---------- | ------------------------------------------- | ----------------------------------- |
| Blokkerend | site onbruikbaar / data-verlies             | pagina laadt niet; formulier crasht |
| Hoog       | kernfunctionaliteit defect, geen workaround | navigatie-link naar verkeerde URL   |
| Middel     | functioneel gebrekkig met workaround        | focus-ordening verstoord            |
| Laag       | kosmeetisch / typografisch                  | tyfo in tekst; kleine margin        |

> **Infrastructuur vs. testflaky:** een 5xx/timeout van de live host is een
> omgevingsfout. `npm run check:site` controleert de site vóór de suite;
> `BasePage.gotoWithRetry()` retryt host-5xx in de smoke-checks. De smoke-set
> heeft `retries: 0`, zodat een blijvende hostfout als failure telt en niet via
> een Playwright-retry als flaky wordt gemaskeerd. Een test die alleen via een
> Playwright-retry slaagt, blijft flaky; een hostfout wordt niet als testflake
> geteld.

Defects worden gerapporteerd als issue (of notitie bij het portfolio) met:
stappen tot reproduceren, verwacht vs. daadwerkelijk resultaat, viewport/browser,
screenshot/trace (Playwright `retain-on-failure`). Triage door de QA Engineer;
fix-ownership bij de ontwikkelaar/site (zie §13 Rollen).

### 12.2 Opschortingscriteria (test suspension)

Testing wordt opgeschort wanneer:

- ≥ **3 blokkerende defects** in één testrun, óf
- de testomgeving niet stabiel is (bijv. live-deploy offline en lokale server niet startbaar), óf
- een vereiste/ontwerp verandert waardoor bestaande testcases obsoleet zijn.

### 12.3 Herstartcriteria (test resumption)

Testing hervat wanneer:

- alle blokkerende defects gefixt én geconfirmeerd (confirmation testing), óf
- de omgeving weer stabiel is, óf
- de gewijzigde vereisten zijn opgenomen in de testcases.

### 12.4 Test closure

Na de laatste run van een release-target worden vastgelegd:

- het definitieve JSON/HTML-report en de CI-history als bewijs;
- de flaky-analyse (tests die alleen via een retry slaagden);
- de open defecten met severity en workaround;
- de actuele traceabilitytabel (§15), inclusief welke cases **Bestaand** zijn;
- lessons learned en de reden van een planwijziging; bij een volgende release
  wordt de planversie in de kop van dit document bijgewerkt.

---

## 13. Rollen & verantwoordelijkheden

| Rol                  | Verantwoordelijkheid                                              |
| -------------------- | ----------------------------------------------------------------- |
| QA Engineer (auteur) | Testplan, testcases, suite-onderhoud, CI-config, defectanalyse    |
| Ontwikkelaar/site    | `data-testid`-contract, Page Object-aanpassingen, bugfixes        |
| Reviewer             | PR-review op testkwaliteit (BestPractices §31 Definition of Done) |

> Voor een 1-persoons portfolio is "QA" en "ontwikkelaar" dezelfde persoon;
> de split bewaart wél het onderscheid tussen _testen_ en _implementeren_.

---

## 14. Definitie van Done (per test)

Een testcase is klaar wanneer (BestPractices §31, samengevat):

- gedrag is gebruikersgericht en in een duidelijke NL-testnaam benoemd;
- locators zijn semantisch/stabiel (`getByRole`/`getByLabel`/`getByTestId`);
- géén onnodige sleeps; web-first assertions gebruikt;
- test is geïsoleerd, deterministisch en parallel-draaibaar;
- Page Objects en mocks worden via typed fixtures opgezet waar van toepassing;
- externe dependencies (Formward) zijn bewust gemockt waar relevant;
- `tsc --noEmit` + lint schoon; lokaal herhaald groen.

---

## 15. Traceerbaarheid (doel → testcases)

De kolom **Status** gebruikt de legenda uit §5. Alleen een testcase met status
**Bestaand** telt als dekking; **Deels** en **Gepland** zijn zichtbaar als open
werk, niet als bewijs.

| Doel | Testcases                           | Spec-bestand                                                    | Status                                                            | Bewijs / resultaat                     |
| ---- | ----------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| G1   | SM-01, SM-02, SM-03                 | `smoke.spec.ts`                                                 | Bestaand                                                          | 10 smoke-tests                         |
| G2   | NAV-01…NAV-05                       | `homepage-functional.spec.ts`, `mobile-menu-functional.spec.ts`, `footer-functional.spec.ts` | NAV-01–05 bestaand                                               | 12 homepage + 17 menu + 3 footer-tests |
| G3   | F1…F10                              | `contact-functional.spec.ts`                                    | F1–F7, F9, F10 bestaand; F8 gepland                               | 16 contact-tests                       |
| G4   | MENU-01…MENU-10                     | `mobile-menu-functional.spec.ts`                                | MENU-01–10 bestaand                                               | 17 menu-tests                          |
| G5   | RESP-01                             | `responsive.spec.ts`                                          | Bestaand                                                          | 8 responsive-tests                   |
| G6   | A11Y-01…A11Y-04                     | `accessibility.spec.ts`                                         | Bestaand                                                          | 17 accessibility-tests             |
| G7   | SEO-01…SEO-04                       | `seo.spec.ts`                                                 | Bestaand                                                          | 32 SEO-tests                       |
| G8   | LINK-01, LINK-02, IMG-01, HTML-01   | `content-integrity.spec.ts` + CI-poort                        | Bestaand                                                          | 11 content-integrity-tests + `npm run validate:html` |
| G9   | VIS-01                              | nog te maken (fase 5)                                           | Gepland                                                           | —                                      |
| G10  | PERF-01                             | nog te maken (fase 5)                                           | Gepland                                                           | —                                      |
| G11  | procesdoel — geen producttestcase   | `playwright.config.ts`, CI-run                                  | Bewezen door CI-config, niet door een testcase                    | `fullyParallel: true`; CI `workers: 1` |
| G12  | procesdoel — geen producttestcase   | `.github/workflows/playwright.yml`                              | Poorten + suite bestaand; pre-deploy gate open beslispunt (§10.2) | workflow-run + artifacts               |
| G13  | CIH-01…CIH-05; CIH-06/07/08 gepland | `ci-history-functional.spec.ts`; CIH-06: `playwright/tests/unit/` (gepland)       | Bestaand: CIH-01…05                                               | 5 CI-history-tests; CIH-06 als `npm run test:ci-summary`-poort gepland |

> G11 en G12 zijn **procesdoelen**; ze worden niet door een Playwright-testcase
> bewezen. Daarom geldt de dekkingseis uit §11 alleen voor de productdoelen
> G1–G10 en G13, plus de procesbewijzen van G11/G12.

### 15.1 Exacte suite-testnamen (alleen bestaande cases)

| Case | Spec-bestand | Suite-testnaam |
| --- | --- | --- |
| SM-01 | `smoke.spec.ts` | `index pagina laadt zonder fouten en structuur is correct` |
| SM-02 | `smoke.spec.ts` | `${url} laadt zonder kritieke fouten` (8 pagina's) |
| SM-03 | `smoke.spec.ts` | `404.html laadt met de fallback-content` |
| NAV-01 | `homepage-functional.spec.ts` | `NAV-01: nav-link "<testId>" opent de <pagina>` (7 nav-links, desktop) |
| NAV-01 | `mobile-menu-functional.spec.ts` | `nav-link "<testId>" navigeert naar <url>` (7 nav-links) |
| NAV-02 | `homepage-functional.spec.ts` | `CTA-knop "Bekijk mijn projecten" opent de projectenpagina`; `CTA-knop "Bekijk mijn Curriculum vitae" opent de curriculumpagina` |
| NAV-03 | `homepage-functional.spec.ts` | `NAV-03: card-link "card-link-testing" opent de testing-pagina`; `NAV-03: card-link "card-link-automation" opent de automatiseringspagina`; `NAV-03: card-link "card-link-projects" opent de projectenpagina` |
| NAV-04 | `footer-functional.spec.ts` | `footer-links hebben de juiste bestemming en veilige externe attributen` |
| NAV-05 | `footer-functional.spec.ts` | `actieve footer-link op contact`; `actieve footer-link op privacy` |
| MENU-01 | `mobile-menu-functional.spec.ts` | `toggle is zichtbaar en menu is initieel gesloten` |
| MENU-02 | `mobile-menu-functional.spec.ts` | `klik op toggle opent het menu` |
| MENU-03 | `mobile-menu-functional.spec.ts` | `klik op toggle sluit het menu weer` |
| MENU-04 | `mobile-menu-functional.spec.ts` | `MENU-04: herhaalde open-sluit-cyclus houdt de state correct` |
| MENU-05 | `mobile-menu-functional.spec.ts` | `klik op nav-link in open menu sluit het menu en navigeert`; `nav-link "<testId>" navigeert naar <url>` |
| MENU-06 | `mobile-menu-functional.spec.ts` | `menu-toggle is niet zichtbaar en nav-links staan inline` |
| MENU-07 | `mobile-menu-functional.spec.ts` | `Escape sluit het menu en geeft focus terug` |
| MENU-08 | `mobile-menu-functional.spec.ts` | `klik buiten het menu sluit het menu en geeft focus terug` |
| MENU-09 | `mobile-menu-functional.spec.ts` | `focus na openen gaat naar de eerste nav-link` |
| MENU-10 | `mobile-menu-functional.spec.ts` | `Escape op gesloten menu verandert de focus niet` |
| F1/F9 | `contact-functional.spec.ts` | `geldig formulier redirect naar bedanktpagina` |
| F2 | `contact-functional.spec.ts` | `formulier zonder verplichte velden redirect niet` |
| F3 | `contact-functional.spec.ts` | `formulier met ongeldige e-mail redirect niet` |
| F4 | `contact-functional.spec.ts` | `F4: geldige submit zonder optioneel subject` |
| F5 | `contact-functional.spec.ts` | `honeypot-veld is verborgen`, `F5: honeypot-waarde zit in de submit-payload`, `F5: tabvolgorde laat het honeypot-veld overslaan` |
| F6 | `contact-functional.spec.ts` | `F6: boundary-waarden worden geaccepteerd` |
| F7 | `contact-functional.spec.ts` | `F7: speciale tekens worden geaccepteerd` |
| F10 | `contact-functional.spec.ts` | `F10: browser back na redirect werkt` |
| CIH-01 | `ci-history-functional.spec.ts` | `laatste-run kaarten tonen de nieuwste CI-run` |
| CIH-02 | `ci-history-functional.spec.ts` | `aggregate kaarten poolen alle runs en de ratio is Σ passed / Σ total` |
| CIH-03 | `ci-history-functional.spec.ts` | `geschiedenis toont een rij per run met een werkende run-link` |
| CIH-04 | `ci-history-functional.spec.ts` | `runs zonder noemer worden uitgesloten van de totalen` |
| CIH-05 | `ci-history-functional.spec.ts` | `lege geschiedenis toont placeholders en de placeholder-rij` |
| A11Y-02/A11Y-03 | `accessibility.spec.ts` | `A11Y-02 en A11Y-03: <pagina> heeft taal, landmarks, alt-teksten, Nederlandse labels en een skip-link` (10 pagina's) |
| A11Y-01 | `accessibility.spec.ts` | `A11Y-01: het toetsenbord loopt de contractvolgorde over de homepage`; `A11Y-01: het toetsenbord laat het honeypot-veld in het contactformulier overslaan`; `A11Y-01: de focus-indicator is zichtbaar bij toetsenbordnavigatie` |
| A11Y-03 | `accessibility.spec.ts` | `A11Y-03: de skip-link brengt de focus naar de hoofdinhoud` |
| A11Y-02 | `accessibility.spec.ts` | `A11Y-02: elk veld van het contactformulier heeft een eigen label` |
| A11Y-04 | `accessibility.spec.ts` | `A11Y-04: de placeholder heeft voldoende contrast tegen de invoerachtergrond`; `A11Y-04: de hero-tekst blijft leesbaar in forced-colors-modus` |
| HTML-01 | CI-poort | `npm run validate:html` (geen Playwright-test) |
| RESP-01 | `responsive.spec.ts` | `RESP-01: <width>×<height> heeft de juiste nav-stijl en geen horizontale scroll` (7 viewports, alle 10 pagina's per viewport) + `RESP-01: de hero-tilt is aan op desktop en uitgezet op de compacte grens` |
| SEO-01 | `seo.spec.ts` | `SEO-01: <pagina> heeft een eigen, Nederlandse titel en description` (10 pagina's) + `SEO-01: titels en descriptions zijn site-wide uniek` |
| SEO-02 | `seo.spec.ts` | `SEO-02: <pagina> heeft één h1, unieke id's en indexatie uit` (10 pagina's) |
| SEO-03 | `seo.spec.ts` | `SEO-03: <pagina> heeft canonical, Open Graph en Twitter card` (10 pagina's) |
| SEO-04 | `seo.spec.ts` | `SEO-04: sitemap.xml dekt de 8 content-pagina's en robots.txt sluit indexering uit` |
| LINK-01, LINK-02, IMG-01 | `content-integrity.spec.ts` | `LINK-01, LINK-02 en IMG-01: <pagina> heeft valide links en afbeeldingen` (10 pagina's) + `IMG-01: elke asset-referentie op de site verwijst naar een bekend site-bestand` |

> Cases zonder rij in deze tabel zijn nog open: F8 is gepland, en VIS-01 en PERF-01 zijn
> fase 5. De tabel beschrijft de bestaande suite — inclusief de non-functionele suites
> uit stap 2 (RESP-01, SEO-01…04, LINK-01/LINK-02/IMG-01) en de accessibility-suite.

---

## 16. Deliverables, planning en goedkeuring

| Onderdeel         | Deliverable                                     | Bron / bewijs                                                          |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| Testplan          | dit document, met status per testcase           | `Project-documentation/TESTPLAN.md`                                    |
| Testsuite         | 10 spec-bestanden, 131 tests                    | `playwright/tests/` + `npx playwright test --list`                     |
| Testrapportage    | HTML-report en JSON-report per run              | `playwright/playwright-report/`, `playwright/test-results/report.json` |
| CI-history        | `docs/data/playwright-history.json` + dashboard | `scripts/ci-summary.mjs`, `automation.html`                            |
| Kwaliteitspoorten | typecheck, lint en html-validate (plus de geplande `test:ci-summary`, CIH-06) | `npm run check`, `playwright.yml`                                      |
| CI-history datalaag | component-test op `scripts/ci-summary.mjs` — CIH-06, gepland | `playwright/tests/unit/` + `npm run test:ci-summary`; plan `PLAN-CI-HISTORY-TESTS.md` §7 |
| Showcase-media | video-clips van de suite op de portfolio (gepland, §10.4) | kijkmodus in `playwright.local.config.ts` (`PW_VIEW=1`) |

**Planning en inspanning:** de fasering staat in §10. Fase 1–3 zijn de
functionele basis, fase 4–5 de non-functionele kwaliteit en fase 6–7 de
CI-keten en optionele cross-browser/device-sessies. Voor een 1-persoons
portfolio is de inspanning per fase klein en iteratief; er wordt geen formele
personeelsplanning beloofd.

**Goedkeuring:** de QA Engineer stelt het plan en de suite op; de Reviewer
(§13) beoordeelt testkwaliteit en Definition of Done. Acceptatie van een
release gebeurt tegen de release-target-criteria in §11; de baseline-criteria
in §11 gelden voor de huidige suite en zijn geen release-goedkeuring.

---

## Bijlage A — Terminologie & afkortingen

- **Smoke:** kleine, snel draaiende subset die de kritieke paden bevestigt.
- **Regression:** volledige suite als vangnet na wijzigingen.
- **Honeypot:** verborgen formulier-veld (`_gotcha`) als spamfilter.
- **ARIA:** Accessible Rich Internet Applications (toegankelijkheids-attributen).
- **WCAG 2.1 AA:** international accessibility-standaard (niveau AA).
- **Playwright E2E:** end-to-end browser-tests via `@playwright/test`.
- **Canonical:** `<link rel="canonical">` — de voorkeur-URL van een pagina.
- **Open Graph / Twitter cards:** `og:*`- en `twitter:*`-metas voor previews bij
  social sharing (onafhankelijk van indexatie).
- **Sitemap:** `docs/sitemap.xml` — machine-leesbare lijst van indexeerbare
  pagina's.
- **html-validate:** statische HTML-structureel validator (regels zoals
  `no-implicit-close`, `close-order`, `element-case`, `no-raw-characters`).
- **Page Object Model (POM):** UI-interactie gecentraliseerd in page objects.
