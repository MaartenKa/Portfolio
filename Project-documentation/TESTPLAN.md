# Testplan & Teststrategie — Portfolio Website

> **Scope:** de statische portfolio-website in `docs/` (9 pagina's, CSS-design-systeem,
> één klein JS-module voor de mobiele menu-toggle, contactformulier via Formward)
> en de bijbehorende Playwright-testsuite in `playwright/`.
> **Taal:** Nederlands (website en test-namen).
> **Doel:** een professioneel, reproduceerbaar en CI-ready kwaliteitsniveau voor
> een static site — met een heldere testpyramide, een uitvoerbare testmatrix,
> testtechnieken, risico-analyse en duidelijke entry-/exit-criteria.

---

## 1. Samenvatting (executive summary)

De website is **statisch** (geen backend/framework). De belangrijkste
kwaliteitsrisico's liggen daarom op vier vlakken:

1. **Inhoud & navigatie** — pagina's laden, links kloppen, structuur is compleet.
2. **Contactformulier** — validatie, spamfilter (honeypot), submit + redirect (de
   enige echte "data-flow" van de site; loopt via externe dienst Formward).
3. **Client-side gedrag** — de mobiele menu-toggle (de enige echte site-JS).
4. **Non-functioneel** — responsive, accessibility, SEO, performance, cross-browser.

De huidige suite dekt (1), (2) **én (3)** — de mobiele menu-toggle is reeds
geautomatiseerd in `mobile-menu-functional.spec.ts` (incl. ARIA-asserts en
state-transities). De site bevat inmiddels P2-accessibility fixes (skip-link,
decoratieve `aria-hidden`-iconen, Nederlandse section-labels, placeholder-
contrast en `forced-colors` fallback), maar deze zijn nog niet als structurele
Playwright-suite gedekt. De resterende gaten liggen op vlak **(4)**:
responsive, geautomatiseerde accessibility-checks, SEO, visual-regression en
performance ontbreken nog als geautomatiseerde tests, evenals een
CI/CD-pipeline.

Deze strategie sluit die gaten op met een gestructureerde, gefaseerde aanpak
(zie §10 Roadmap) zodat het portfolio een professioneel, compleet testprofiel
toont. De ISTQB-indeling (testniveaus / testtypes / testtechnieken) wordt als
kader gebruikt om de scope te bepalen en prioriteiten te onderbouwen.

---

## 2. Testdoelstellingen

| #   | Doelstelling                                                                                                               | Type                                |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| G1  | Alle pagina's laden zonder kritieke fouten (HTTP 200, geen JS/console errors)                                              | Functioneel / Smoke                 |
| G2  | Navigatie (navbar, footer, CTA's, cards) leidt naar de juiste pagina                                                       | Functioneel                         |
| G3  | Contactformulier valideert correct en stuurt alleen geldige berichten                                                      | Functioneel                         |
| G4  | Mobiele menu-toggle opent/sluit de navigatie, zet `aria-expanded`/`aria-label` correct en beheert focus/Escape/klik-buiten | Functioneel                         |
| G5  | Website is responsive op desktop, tablet en mobiel                                                                         | Non-functieel (responsive)          |
| G6  | Website is toegankelijk (WCAG 2.1 AA, keyboard-navigatie, ARIA)                                                            | Non-functieel (a11y)                |
| G7  | SEO-basis is correct (titel, meta, lang, robots, unieke headings)                                                          | Non-functieel (SEO)                 |
| G8  | Geen gebroken links of afbeeldingen (intern + extern)                                                                      | Non-functieel (content-integriteit) |
| G9  | Visueel stabiel (geen onbedoelde design-regressies)                                                                        | Non-functieel (visual)              |
| G10 | Prestaties blijven binnen acceptabele marges (static site)                                                                 | Non-functieel (performance)         |
| G11 | Tests draaien deterministisch, in parallel en in CI                                                                        | Proces                              |
| G12 | Elke release wordt geautomatiseerd gevalideerd voorafgaand aan deploy                                                      | Proces (CI/CD)                      |

---

## 3. Test scope

### 3.1 In scope

- Alle 10 site-pagina's:
  `index.html`, `curriculum.html`, `testing.html`, `automation.html`,
  `projects.html`, `personal.html`, `contact.html`, `privacy.html`,
  `bedankt.html`, plus de `404.html`-fallback.
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
- Invullen van placeholders: logo-bestand (`images/logoipsum-407.png`), lege
  favicon (`href="data:,"`) en de CI-statistiek-kaarten op `automation.html`
  (uitcommentarieerd met TODO) — content-work, geen testcases.

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
            └─────────────────────────────┘
```

- **Component/DOM-laag:** snelle, gerichte asserts op `aria-expanded`, `class="open"`,
  honeypot-zichtbaarheid, heading-hierarchie — via Page Objects.
- **Non-functional:** viewport/a11y/SEO/links/visual/perf — eigen spec-bestanden.
- **E2E/acceptance:** volledige gebruikersflows (navigatie, formulier-gebruik, menu).

> **Conventie (bestaand, behouden):** gebruik Page Objects voor UI-interactie;
> alleen de lightweight smoke-laag mag rechtstreeks `page` gebruiken
> (netwerk/infrastructuurcheck).

### 4.1 Verhouding tot ISTQB-testniveaus

ISTQB onderscheidt component, integration, system en acceptance testing. Voor deze
statische site zijn er geen afzonderlijke componenten of externe integraties, dus:

| ISTQB-niveau          | Toepassing in dit project                               |
| --------------------- | ------------------------------------------------------- |
| Component / unit      | (bijna) niet van toepassing — vervangen door DOM-checks |
| Component integration | interactie formulier ↔ Formward (gemockt)               |
| System                | de volledige site als geheel (Playwright E2E)           |
| Acceptance            | gebruikersflows + non-functionele kwaliteit             |

De nadruk ligt dus bewust op **system** en **acceptance testing**; dat past bij het
risico-profiel van een statische portfolio-site.

---

## 5. Testtypes (met concrete toepassing)

### 5.1 Functioneel

- **Smoke / sanity:** elke pagina laadt (HTTP 200), geen console/page errors. _(bestaand)_
- **Navigatie:** elke `nav-*`-link, CTA en card-link opent de juiste URL. _(bestaand, uitbreiden)_
- **Formulier:** zie §7 (validatie, honeypot, submit, redirect).
- **Menu-toggle (MOBIEEL — bestaand, stabiliseren/uitbreiden):** zie TC-MENU
  in §8.3 (`mobile-menu-functional.spec.ts`). De site-code bevat naast
  open/sluiten ook focusbeheer, `Escape`-sluiten en klik-buiten-het-menu;
  deze gedragingen zijn ad-hoc lokaal geverifieerd en moeten nog als
  structurele Playwright-cases worden opgenomen.

### 5.2 Non-functioneel

- **Responsive:** vaststellen correct layout + menu per breakpoint.
- **Accessibility:** keyboard-reikbare navigatie, focus-ordening, skip-link,
  `aria-expanded`, `aria-label`, decoratieve iconen met `aria-hidden`,
  Nederlandse section-labels, contrast, `lang`, afbeelding-`alt` en
  `forced-colors` fallback.
- **SEO:** unieke `<title>`, `meta description`, `lang="nl"`, `robots`-tag,
  één `h1` per pagina, geen duplicaat `id`.
- **Content-integriteit:** geen gebroken interne/externe links, geen 404-afbeeldingen,
  `404.html` als fallback.
- **Visual regression:** screenshot-baseline per pagina × breakpoint (optioneel, fase 4).
- **Performance:** Lighthouse-scores (Performance/Best Practices/SEO/A11y) binnen
  drempels; timing van paginaload (static → snel).

### 5.3 Exploratorisch / handmatig

- Sessies op echte devices (iOS/Android) voor touch-gedrag, font-rendering,
  scroll, sticky-header, `backdrop-filter`-compat (oudere Safari), emoji/☰-fallback.
- Verifieer handmatig: echte Formward-eindpunt (éénmalige smoke, niet in CI),
  HTTPS + CSP/headers op de live-host, e-mail-daadwerkelijk ontvangen.

### 5.4 Testtypes volgens ISTQB — toewijzing aan dit project

ISTQB-categorieën overlappen elkaar: smoke, regression en confirmation beschrijven
_wanneer/waarom_ een test wordt uitgevoerd, niet _wat_ de test doet. Een functionele
`navigation.spec.ts` is tegelijk onderdeel van de smoke-, regression- én acceptance-set.

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

- **Vereisten-gebaseerd** — uit de doelen G1–G12 en het formulier-gedrag (§7).
- **Error guessing / exploratorisch** — handmatige sessies; reproduceerbare bugs
  worden geautomatiseerd.
- **Boundary value analysis** — minimale (1 teken) en extreme (500+/1000+ tekens)
  formulierwaarden, plus de viewport-breakpoints 850px/500px als grenzen (§7 F6/F7).
- **Equivalence partitioning** — geldige vs. ongeldige e-mail, lege vs. gevulde
  verplichte velden (F1–F4), honeypot gevuld vs. leeg (F5).
- **State-transition testing** — menu-toggle toestand (closed → open → closed) en
  `aria-expanded` per toestand; formulier (leeg → invullen → submit → redirect).
- **Decision-table / scenario-based** — combinaties van veldstatussen voor het
  contactformulier (§7 matrix F1–F10).

---

## 6. Testdata & omgeving

### 6.1 Testdata

- **Voorlopig** inline in Page Objects (`ContactPage.fillForm`).
- **Bevoorrading (fase 3):** centraal `playwright/utils/test-data.ts` (nu placeholder)
  met een kleine **testdataset** voor het formulier:
  - `valid`: geldige naam/e-mail/onderwerp/bericht.
  - `missingRequired`: lege verplichte velden.
  - `invalidEmail`: e-mail zonder `@`/domein.
  - `boundary`: minimale (1 char) en zeer lange (bv. 500+ char) waarden.
  - `specialChars`: unicode/emoji/quotes in velden (XSS-ish sanity op static render).
  - `honeypotFilled`: honeypot ingevuld → mag door spamfilter worden afgewezen.

### 6.2 Omgeving & determinisme

- **Huidige configuratie:** `baseURL = https://maartenka.github.io/Portfolio/`
  (live GitHub Pages). De `webServer`-blokken (`http-server` op `127.0.0.1:3000`)
  staan in `playwright.config.ts` gecommenteerd als fallback voor lokaal testen
  tegen de `docs/`-build.
- **Ad-hoc lokale verificatie:** voor wijzigingen in `docs/` is tijdelijk een
  Playwright-config met `baseURL: "http://127.0.0.1:3123"` en
  `webServer: "npx http-server docs -p 3123 -s"` gebruikt om de nieuwe
  menu-accessibility-gedragingen te controleren; deze ad-hoc config/spec is
  niet als vaste suite-committed.
- **Aanbeveling (fase 6 CI):** schakel in CI over naar de lokale `webServer`
  (`http-server docs -p 3000`) zodat tests deterministisch zijn en niet afhangen
  van de live-deploy; de live-URL blijft als handmatige smoke-omgeving.
- **Externe netwerkaanroepen (Formward) worden gemockt** via `page.route(...)` zodat
  tests offline, snel en betrouwbaar draaien. **Geen** echte POST's in de suite.
- **Externe links (GitHub/LinkedIn):** in CI alleen **link-structuur** checken
  (URL/`target`/`rel`), niet de bereikbaarheid (flaky + rate-limits). Optioneel:
  éénmalige **live link-check** als aparte, niet-blokkerende job.
- **Determinisme:** geen wachttijden op externe services; waar nodig
  `expect(...).toBeVisible()` (auto-wait) i.p.v. `waitForTimeout`.

### 6.3 Browsers & viewports

- **Basis:** Chromium (Desktop Chrome) — reeds geconfigureerd.
- **Responsive-viewporten (nieuw):**
  - Desktop: `1280×800` (≥850px, nav inline)
  - Tablet: `850×1024` / `820×1180` (≤850px, menu-toggle zichtbaar)
  - Mobiel: `390×844` en `360×640` (≤500px, compacte layout, knoppen full-width)
- **Cross-browser (fase 4, optioneel):** Firefox + WebKit toevoegen (Playwright
  maakt dit triviaal via `devices`); prioriteit lager omdat de site simpel is.

---

## 7. Contactformulier — gedetailleerde testmatrix

De belangrijkste data-flow. Verwacht-gedrag per scenario:

| #   | Scenario                          | Input                                 | Verwacht resultaat                                                                                                |
| --- | --------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| F1  | Geldige submit                    | alle velden geldig                    | POST → redirect naar `bedankt.html` + tekst "Bedankt, uw bericht is ontvangen"                                    |
| F2  | Lege verplichte velden            | name/email/bericht leeg               | géén submit (native validatie), blijft op `contact.html`, validatiemelding                                        |
| F3  | Ongeldige e-mail                  | `ongeldig-email`                      | géén submit, e-mail-validatiemelding                                                                              |
| F4  | Alleen optioneel veld ontbreekt   | `subject` leeg                        | WEL geldige submit (subject is niet `required`)                                                                   |
| F5  | Honeypot ingevuld (bot)           | `_gotcha` gevuld                      | spamfilter: géén geldig bericht (Formward verwijdert; lokaal: assert veld blijft hidden + tabindex -1)            |
| F6  | Boundary: minimale/ extreme tekst | naam = 1 teken, bericht = 500+ tekens | WEL geldige submit; geen fouten/truncatie in UI (boundary value analysis)                                         |
| F7  | Speciale tekens / unicode         | emoji, quotes, accents                | WEL geldige submit; tekst wordt veilig gerenderd (geen HTML-injectie op static page)                              |
| F8  | Dubbel submit                     | snel dubbel klikken op verstuurknop   | Maximaal één POST naar Formward; redirect blijft idempotent                                                       |
| F9  | Redirect-target is correct        | geldige submit                        | eind-URL = `bedankt.html` (subpath `/Portfolio/` behouden) + bedankt-tekst zichtbaar (geen lege/pagina-not-found) |
| F10 | Terugnavigatie na redirect        | geldige submit → back                 | browser back werkt naar `contact.html` zonder crash; formulier is gereset/leeg (nieuwe context per test)          |

> **Testdata-koppeling:** de datasets uit §6.1 (`valid`, `missingRequired`,
> `invalidEmail`, `boundary`, `specialChars`, `honeypotFilled`) mappen 1-op-1 op
> F1–F7. De Formward-mock (`ContactPage.mockFormSubmit`) garandeert dat er nooit
> een echt POST/mailtje weggaat; tests die native validatie controleren roepen
> zelf `clearFormMock()` aan (bestaand patroon in `contact-functional.spec.ts`).
>
> **Aandachtspunt redirect (`_redirect`):** `contact.html` verstuurt
> `value="bedankt.html"` (bewust **relatief**, zodat Formward de redirect ten
> opzichte van de verzendende URL resolve en de `/Portfolio/`-subpath behouden
> blijft). De mock in F1/F9 asserts de door de mock zelf gezette absolute
> `Location`-header, dus F1/F9 bewijzen de _afhandeling_ van de redirect, niet
> de waarde van `_redirect` bij de echte Formward-redirect. Dekking daarvan:
> handmatige live-check na deploy (zie ook PLAYWRIGHT §8).

---

## 8. Testmatrix — overige testcases

Naast het formulier (§7) de concrete testcase-set per doeleiding. IDs volgen een
logische, CI-vriendelijke conventie; elke testcase is klein en gefocust (BestPractices §25).

### 8.1 Smoke / sanity (G1) — `smoke.spec.ts` _(bestaand)_

| ID    | Testcase                                      | Verwacht resultaat                                                        |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------- |
| SM-01 | Home (`index.html`) laadt                     | HTTP 200, `.navbar`/`.hero`/`.footer` zichtbaar, geen console/page errors |
| SM-02 | Overige pagina's laden (curriculum … bedankt) | per pagina: HTTP 200 + geen console/page errors                           |
| SM-03 | `404.html` fallback is bereikbaar             | onbekende pad → 404-fallback render, geen crash                           |

### 8.2 Navigatie (G2) — `homepage-functional.spec.ts` _(bestaand, uitbreiden)_

| ID     | Testcase                                             | Verwacht resultaat                                                                                                                                     |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NAV-01 | Elke `nav-*` link opent de juiste pagina             | URL matcht `NAV_ITEM_URLS[testId]`                                                                                                                     |
| NAV-02 | CTA's (`cta-projects`, `cta-curriculum`) navigeren   | correcte bestemming                                                                                                                                    |
| NAV-03 | Card-links (`card-link-testing/automation/projects`) | correcte bestemming                                                                                                                                    |
| NAV-04 | Footer-links (contact, github, linkedin, privacy)    | interne → juiste URL; externe → juiste `href`/`target`/`rel`                                                                                           |
| NAV-05 | Actieve footer-link op eigen pagina                  | `footer-contact` (contact) en `footer-privacy` (privacy): `class="active"` + kleur `rgb(134, 239, 172)`; overige pagina's: géén `.active` in de footer |

### 8.3 Mobiele menu-toggle (G4) — `mobile-menu-functional.spec.ts` _(bestaand, hoogste prioriteit)_

| ID      | Testcase                                           | Verwacht resultaat                                             |
| ------- | -------------------------------------------------- | -------------------------------------------------------------- |
| MENU-01 | Initiale toestand (mobiel ≤850px)                  | menu closed, `aria-expanded="false"`                           |
| MENU-02 | Toggle openen                                      | `.open` + alle nav-items zichtbaar, `aria-expanded="true"`     |
| MENU-03 | Toggle sluiten                                     | geen `.open`, `aria-expanded="false"`                          |
| MENU-04 | State-transition closed → open → closed (herhaald) | toestand wisselt correct, geen stale class                     |
| MENU-05 | Navigatie via geopend menu werkt                   | nav-link klikt + juiste URL                                    |
| MENU-06 | Op desktop (≥850px) is toggle niet nodig/zichtbaar | menu inline zichtbaar zonder toggle                            |
| MENU-07 | `Escape` sluit geopend menu                        | geen `.open`, `aria-expanded="false"`, focus terug naar toggle |
| MENU-08 | Klik buiten geopend menu sluit het menu            | geen `.open`, `aria-expanded="false"`, focus terug naar toggle |
| MENU-09 | Focus na openen gaat naar eerste nav-link          | eerste nav-link is gefocust                                    |
| MENU-10 | `Escape` op gesloten menu steelde geen focus       | focus blijft op huidige actieve locator                        |

### 8.4 Non-functioneel (G5–G10) — nieuwe spec-bestanden _(fase 2–4)_

| ID      | Categorie           | Testcase                                                        | Verwacht resultaat                                                                                                                                                                    |
| ------- | ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RESP-01 | Responsive          | Layout per breakpoint (desktop/tablet/mobiel)                   | juiste nav-stijl, geen horizontale scroll                                                                                                                                             |
| A11Y-01 | Accessibility       | Keyboard-only navigatie + focus-visible                         | alle interactieve elementen toetsbaar bereikbaar                                                                                                                                      |
| A11Y-02 | Accessibility       | `aria-expanded` / labels / `lang="nl"` / img `alt`              | attributen aanwezig en correct                                                                                                                                                        |
| A11Y-03 | Accessibility       | Skip-link, decoratieve iconen en section-labels                 | skip-link → `#hoofdinhoud`; decoratieve emoji/pijlen `aria-hidden="true"`; bruikbare section-labels in het Nederlands                                                                 |
| A11Y-04 | Accessibility       | Placeholder-contrast en `forced-colors` fallback                | `input::placeholder` / `textarea::placeholder` = `#94a3b8`; `.hero h1 span` → `CanvasText` + geen gradient-clip in forced-colors mode                                                 |
| SEO-01  | SEO                 | unieke `<title>` + meta description per pagina                  | geen duplicaten, NL-taal                                                                                                                                                              |
| SEO-02  | SEO                 | één `h1` per pagina, geen duplicaat `id`, robots.txt            | structuur correct                                                                                                                                                                     |
| SEO-03  | SEO                 | canonical + Open Graph/Twitter cards per pagina                 | canonical = eigen absolute URL; `og:title`/`og:url` = eigen `<title>`/URL; `og:image` absolute; `twitter:card=summary`                                                                |
| SEO-04  | SEO                 | `docs/sitemap.xml`                                              | geldige XML, 8 content-pagina's, `404`/`bedankt` uitgesloten, alle locaties = bestaande bestanden                                                                                     |
| HTML-01 | Content-integriteit | `npx html-validate "docs/*.html"` (config `.htmlvalidate.json`) | 0 errors (o.a. `no-implicit-close`, `close-order`, `element-case`, `no-raw-characters`, `no-utf8-bom`; stijlstijlen `doctype-style`/`void-style`/`no-implicit-button-type` staan uit) |
| LINK-01 | Content-integriteit | interne links op alle pagina's                                  | geen gebroken interne links                                                                                                                                                           |
| LINK-02 | Content-integriteit | externe links (`href^="https://"`)                              | elke externe link heeft `target="_blank"` + `rel="noopener noreferrer"`                                                                                                               |
| IMG-01  | Content-integriteit | afbeeldingen laden                                              | geen 404/bron-fouten; alle `<img>` hebben niet-lege `alt`                                                                                                                             |
| VIS-01  | Visual (fase 4)     | screenshot-baseline per pagina × breakpoint                     | geen onbedoelde regressies (tolerantie % klein)                                                                                                                                       |
| PERF-01 | Performance         | Lighthouse (Perf/A11y/BestPractices/SEO) ≥ drempel              | scores binnen marges; snelle static-load                                                                                                                                              |

---

## 9. Risico-analyse & mitigatie

Risico's gerangschikt op impact × waarschijnlijkheid voor een statische site.
Mitigaties zijn bewust verweven in BestPractices (determinisme, mocking, isolation).

| #   | Risico                                                                                             | Impact | Waarschijnlijkheid | Mitigatie                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------- | :----: | :----------------: | -------------------------------------------------------------------------------------------------------------- |
| R1  | Formward-down/vertraagd → flaky suite                                                              |  Hoog  |       Middel       | Altijd `page.route(...)` mock in CI; géén echte POST's (BestPractices §10, §22)                                |
| R2  | Menu-regressie na CSS/JS-wijziging                                                                 |  Hoog  |       Middel       | TC MENU-01…10; bestaande suite groen houden en nieuwe focus/Escape/klik-buiten-cases automatiseren in fase 2   |
| R3  | Flaky tests door timing/external deps                                                              |  Hoog  |       Middel       | Auto-wait + web-first asserts; geen `waitForTimeout`; retries alleen als vangnet (BestPractices §13)           |
| R4  | Gebroken link/afbeelding na wijziging                                                              | Middel |       Middel       | LINK-01 / IMG-01 in regression-set                                                                             |
| R5  | Design-regressie (CSS) onopgemerkt                                                                 | Middel |       Middel       | Visual baseline VIS-01 (fase 4), kleine tolerantie                                                             |
| R6  | Externe links (GitHub/LinkedIn) flaky in CI                                                        |  Laag  |        Hoog        | In CI alleen link-structuur checken, niet bereikbaarheid (§6.2)                                                |
| R7  | a11y/SEO-regressie                                                                                 | Middel |    Laag-Middel     | A11Y/SEO-asserts (fase 3); optioneel axe-core                                                                  |
| R8  | Performance-degradatie                                                                             |  Laag  |        Laag        | Lighthouse-drempels PERF-01, apart van E2E                                                                     |
| R9  | Legacy-mappen (`old/`) onbedoeld aangepakt                                                         | Middel |        Laag        | Uit scope (§3.2); niet in `testDir` / config                                                                   |
| R10 | SEO-meta/canonical/sitemap raken inconsistent na nieuwe pagina                                     | Middel |       Middel       | SEO-03/SEO-04 asserts; sitemap en canonical-explicitie per pagina (PLAYWRIGHT §4)                              |
| R11 | HTML-structuurdefecten (onafgesloten `<p>`, `</P>`, raw `&`) blijven onopgemerkt in statische HTML | Middel |       Middel       | HTML-01 `html-validate` als poort vóór de E2E-suite (browser repareert impliciet, dus E2E detecteert dit niet) |
| R12 | Lege placeholder-content (CI-kaarten, logo, favicon) wekt onvolledige indruk                       |  Laag  |       Middel       | Kaarten uitcommentarieerd met TODO; placeholders expliciet gedocumenteerd (§3.2)                               |

---

## 10. Roadmap (gefaseerde aanpak)

Elke fase is self-contained en draait al na afloop groen in CI. Volgorde volgt
impact: eerst de grootste functionele gap, dan non-functioneel, tenslotte polish/CI.

| Fase | Scope                                                                                                               | Levert / exit-criterium                                                                                                                                            |
| :--: | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1   | Bestaande suite stabiliseren (smoke + navigatie + contact)                                                          | Alle huidige tests groen, deterministisch, gemockt; geen flaky                                                                                                     |
|  2   | **Mobiele menu-toggle stabiliseren & uitbreiden** (TC MENU-01…10, bestaand + nieuwe focus/Escape/klik-buiten-cases) | Suite groen + deterministisch; extra viewports (850×1024, 360×640) toegevoegd; ARIA state-transition, focusbeheer, `Escape`-sluiten en klik-buiten-het-menu gedekt |
|  3   | Testdata centraliseren (`utils/test-data.ts`) + boundary/special-char cases (F6/F7)                                 | Formulier-testdataset centraal; F-matrix compleet gedekt                                                                                                           |
|  4   | Non-functioneel: responsive, a11y, SEO, links/img checks                                                            | RESP/A11Y/SEO/LINK/IMG groen op alle 10 pagina's                                                                                                                   |
|  5   | Visual regression + Lighthouse-drempels                                                                             | Baselines + PERF-01 in CI (niet-blokkerend waar zinvol)                                                                                                            |
|  6   | CI/CD-pipeline (GitHub Actions): install → typecheck → lint → test → artifacts                                      | Elke PR auto gevalideerd; HTML report + trace als artifact                                                                                                         |
|  7   | Optioneel: cross-browser (Firefox/WebKit) + exploratoire device-sessies                                             | Browser-coverage & handmatige findings geformaliseerd                                                                                                              |

### CI-pipeline (fase 6, in lijn met BestPractices §18)

```yaml
# .github/workflows/ci.yml (concept)
steps:
  - run: npm ci
  - run: npx playwright install --with-deps chromium
  - run: npx tsc --noEmit # typecheck
  - run: npx eslint . # lint (vergeten awaits, etc.)
  - run: npx html-validate "docs/*.html" # HTML-01: structuur van de site-pagina's
  - run: npx playwright test # suite (1 worker in CI)
  - uses: actions/upload-artifact # HTML report + traces bij failure
```

---

## 11. Entry- & exit-criteria

### Entry criteria (voordat een release getest mag worden)

- Statische site lokaal/CI serveerbaar op de geconfigureerde `baseURL`.
- TypeScript compileert zonder fouten (`tsc --noEmit`); lint schoon.
- HTML-validiteit schoon: `npx html-validate "docs/*.html"` → 0 errors (HTML-01).
- Geen openstaande blokkerende defects uit de vorige run.

### Exit criteria (acceptatie van een release)

1. **Smoke 100%** — alle pagina's laden, geen console/page errors (SM-01…03).
2. **Functioneel** — navigatie (NAV-\*) én formulier-matrix F1–F10 groen; menu-toggle MENU-01…10 groen.
3. **Non-functioneel** — RESPONSIVE/A11Y/SEO/LINK/IMG checks groen op alle 10 pagina's; SEO-01…SEO-04 en HTML-01 (html-validate) groen.
4. **Geen blokkerende defects**; bekende niet-blokerende issues gedocumenteerd.
5. **Determinisme** — suite lokaal herhaaldelijk én in CI (parallel) reproduceerbaar groen; géén flaky tests.

### Meetbare exit-metrics

| Metric                                  | Doel                               | Bron                        |
| --------------------------------------- | ---------------------------------- | --------------------------- |
| Testcase-executie (G1–G8)               | 100% uitgevoerd                    | Playwright HTML-report      |
| Vereisten-dekking (traceerbaarheid §15) | 100% in-scope doelen → ≥1 testcase | Traceerbaarheidsmatrix      |
| Pass-fail ratio                         | 100% pass, 0 fail                  | CI-run                      |
| Flaky-test-aandeel                      | 0%                                 | 3 opeenvolgende groene runs |

---

## 12. Defectbeheer & opschortings-/herstartcriteria

### 12.1 Defectcategorieën & ernst (severity)

| Ernst      | Definitie                                   | Voorbeeld                           |
| ---------- | ------------------------------------------- | ----------------------------------- |
| Blokkerend | site onbruikbaar / data-verlies             | pagina laadt niet; formulier crasht |
| Hoog       | kernfunctionaliteit defect, geen workaround | navigatie-link naar verkeerde URL   |
| Middel     | functioneel gebrekkig met workaround        | focus-ordening verstoord            |
| Laag       | kosmeetisch / typografisch                  | tyfo in tekst; kleine margin        |

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
- externe dependencies (Formward) zijn bewust gemockt waar relevant;
- `tsc --noEmit` + lint schoon; lokaal herhaald groen.

---

## 15. Traceerbaarheid (doel → testcases)

| Doel | Testcases                                    |
| ---- | -------------------------------------------- |
| G1   | SM-01, SM-02, SM-03                          |
| G2   | NAV-01…NAV-04                                |
| G3   | F1–F10                                       |
| G4   | MENU-01…MENU-10                              |
| G5   | RESP-01                                      |
| G6   | A11Y-01, A11Y-02, A11Y-03, A11Y-04           |
| G7   | SEO-01, SEO-02, SEO-03, SEO-04               |
| G8   | LINK-01, LINK-02, IMG-01, HTML-01            |
| G9   | VIS-01                                       |
| G10  | PERF-01                                      |
| G11  | CI-pipeline (fase 6) + determinisme-criteria |
| G12  | CI/CD exit-criterium §11                     |

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
