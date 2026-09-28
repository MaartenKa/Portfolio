# Testplan & Teststrategie — Portfolio Website

> **Scope:** de statische portfolio-website in `public/` (9 pagina's, CSS-design-systeem,
> één klein JS-module voor de mobiele menu-toggle, contactformulier via Formward)
> en de bijbehorende Playwright-testsuit in `playwright/`.
> **Taal:** Nederlands (website en test-namen).
> **Doel:** een professioneel, reproduceerbaar en CI-ready kwaliteitsniveau voor
> een static site — met een heldere testpyramide, een uitvoerbare testmatrix en
> duidelijke exit-criteria.

---

## 1. Samenvatting (executive summary)

De website is **statisch** (geen backend/framework). De belangrijkste
kwaliteitsrisico's liggen daarom op vier vlakken:

1. **Inhoud & navigatie** — pagina's laden, links kloppen, structuur is compleet.
2. **Contactformulier** — validatie, spamfilter (honeypot), submit + redirect (de
   enige echte "data-flow" van de site; loopt via externe dienst Formward).
3. **Client-side gedrag** — de mobiele menu-toggle (de enige echte site-JS).
4. **Non-functioneel** — responsive, accessibility, SEO, performance, cross-browser.

De huidige suite dekt (1) en (2) goed. **Het grootste gat is de mobiele
menu-toggle**: dat is de enige echte JavaScript-functionaliteit, maar die is
momenteel niet geautomatiseerd. Daarnaast ontbreken responsive, accessibility,
SEO, visual-regression, performance en een CI/CD-pipeline.

Deze strategie vult die gaten op met een gestructureerde, gefaseerde aanpak
(zie §8 Roadmap) zodat het portfolio een professioneel, compleet testprofiel
toont.

---

## 2. Testdoelstellingen

| # | Doelstelling | Type |
|---|---|---|
| G1 | Alle pagina's laden zonder kritieke fouten (HTTP 200, geen JS/console errors) | Functioneel / Smoke |
| G2 | Navigatie (navbar, footer, CTA's, cards) leidt naar de juiste pagina | Functioneel |
| G3 | Contactformulier valideert correct en stuurt alleen geldige berichten | Functioneel |
| G4 | Mobiele menu-toggle opent/sluit de navigatie en zet `aria-expanded` correct | Functioneel |
| G5 | Website is responsive op desktop, tablet en mobiel | Non-functieel (responsive) |
| G6 | Website is toegankelijk (WCAG 2.1 AA, keyboard-navigatie, ARIA) | Non-functieel (a11y) |
| G7 | SEO-basis is correct (titel, meta, lang, robots, unieke headings) | Non-functieel (SEO) |
| G8 | Geen gebroken links of afbeeldingen (intern + extern) | Non-functieel (content-integriteit) |
| G9 | Visueel stabiel (geen onbedoelde design-regressies) | Non-functieel (visual) |
| G10 | Prestaties blijven binnen acceptabele marges (static site) | Non-functieel (performance) |
| G11 | Tests draaien deterministisch, in parallel en in CI | Proces |
| G12 | Elke release wordt geautomatiseerd gevalideerd voorafgaand aan deploy | Proces (CI/CD) |

---

## 3. Test scope

### 3.1 In scope
- Alle 9 product-pagina's:
  `index.html`, `curriculum.html`, `testing.html`, `automation.html`,
  `projects.html`, `personal.html`, `contact.html`, `privacy.html`,
  `bedankt.html`, plus de `404.html`-fallback.
- Navigatie-elementen met `data-testid` (`nav-*`, `cta-*`, `card-link-*`, `footer-*`,
  `menu-toggle`).
- Contactformulier (`contact.html`) incl. honeypot, native validatie, Formward-submit.
- Client-side JS: `main.js` (menu-toggle).
- Externe links (GitHub, LinkedIn, e-mail/`mailto`, Formforward-referenties in privacy).
- Responsive gedrag (viewport media-queries: ≥850px, ≤850px, ≤500px).
- Accessibility (focus, keyboard, `aria-*`, contrast, semantiek).
- SEO-basis en content-integriteit (links/afbeeldingen).
- Visual regression en performance (als kwaliteitseisen, zie §8).

### 3.2 Uit scope (bewust)
- **`public/old/`, `playwright/pages/old/`, `playwright/tests/old/`** — legacy/verouderde
  kopieën; niet testen of wijzigen (tenzij expliciet gevraagd).
- De echte backend/verwerking van Formward (die ligt buiten onze infra; wordt
  gemockt — zie §6).
- Server-side / hosting-specifiek gedrag van de live-deploy (wel de `404`-fallback
  lokaal simuleren).
- i18n/vertaling (website is monolingual Nederlands).
- Security-penetratie (static site, geen auth/backend; wél basis: HTTPS + honeypot-check).

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

---

## 5. Testtypes (met concrete toepassing)

### 5.1 Functioneel
- **Smoke / sanity:** elke pagina laadt (HTTP 200), geen console/page errors. *(bestaand)*
- **Navigatie:** elke `nav-*`-link, CTA en card-link opent de juiste URL. *(bestaand, uitbreiden)*
- **Formulier:** zie §7 (validatie, honeypot, submit, redirect).
- **Menu-toggle (MOBIEEL — nieuw, hoogste prioriteit):** zie TC-MENU hieronder.

### 5.2 Non-functioneel
- **Responsive:** vaststellen correct layout + menu per breakpoint.
- **Accessibility:** keyboard-reikbare navigatie, focus-ordening, `aria-expanded`,
  contrast, labels, `lang`, afbeelding-`alt`.
- **SEO:** unieke `<title>`, `meta description`, `lang="nl"`, `robots`-tag,
  één `h1` per pagina, geen duplicaat `id`.
- **Content-integriteit:** geen gebroken interne/externe links, geen 404-afbeeldingen,
  `404.html` als fallback.
- **Visual regression:** screenshot-baseline per pagina × breakpoint (optioneel, fase 4).
- **Performance:** Lighthouse-scores (Performance/Best Practices/SEO/A11y) binnen
  drempels; timing van paginaload (static → snel).

### 5.3 Exploratorisch / handmatig
- Sessies op echte devices (iOS/Android) voor touch-gedrag, font-rendering,
  scroll, sticky-header, `backdrop-filter`-compat (oudere Safari), emoji/`☰`-fallback.
- Verifieer handmatig: echte Formward-eindpunt (éénmalige smoke, niet in CI),
  HTTPS + CSP/headers op de live-host, e-mail-daadwerkelijk ontvangen.

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
- **Lokaal/CI server:** `http-server` op `127.0.0.1:3000` (via `webServer` in
  `playwright.config.ts`).
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

| # | Scenario | Input | Verwacht resultaat |
|---|---|---|---|
| F1 | Geldige submit | alle velden geldig | POST → redirect naar `/bedankt.html` + tekst "Bedankt uw bericht is ontvangen" |
| F2 | Lege verplichte velden | name/email/bericht leeg | géén submit (native validatie), blijft op `contact.html`, validatiemelding |
| F3 | Ongeldige e-mail | `ongeldig-email` | géén submit, e-mail-validatiemelding |
| F4 | Alleen optioneel veld ontbreekt | `subject` leeg | WEL geldige submit (subject is niet `required`) |
| F5 | Honeypot ingevuld (bot) | `_gotcha` gevuld | spamfilter: géén geldig bericht (Formward verwijdert; lokaal: assert veld blijft hidden + tabindex -1) |
| F6 | Boundary: minimale invoer | 1 teken per veld | geldige submit (mock) |
| F7 | Boundary: zeer lange invoer | 1000+ tekens bericht | geldige submit, geen crash/overflow |
| F8 | Speciale tekens | emoji/quotes/`<script>` in velden | geen JS-fout, tekst wordt veilig gerenderd (static) |
| F9 | Dubbele submit | tweemaal op Verstuur | geen dubbele ongecontroleerde navigatie (bestuurbaar gedrag) |
| F10 | Redirect-veld aanwezig | — | hidden `_redirect` = `/bedankt.html` correct ingesteld |

> **Aandachtspunt (bug-candidaat):** F1/F2 gebruiken momenteel native
> formulier-validatie. Check expliciet dat `required` op name/email/message staat
> en op `subject` **niet** (zie §9 openstaande items).

---

## 8. Roadmap & prioriteiten (gestaagd, portfolio-waarde)

Elke fase is zelfstandig bruikbaar en toonbaar. Volgorde is op ROI voor een
statische portfolio-site afgestemd.

### Fase 1 — Functionele core afmaken (P0, hoogste impact)
- **[MOBIEEL MENU-TOGGLE]** nieuwe spec `playwright/tests/functional/mobile-menu.spec.ts`:
  - viewport ≤850px: `#menu-toggle` is zichtbaar, `#nav-links` is initial closed.
  - klik toggle → `#nav-links` krijgt `class="open"` (visible), `aria-expanded="true"`.
  - klik nogmaals → closed, `aria-expanded="false"`.
  - klik een nav-link binnen open menu → menu sluit + navigatie werkt.
- **Nieuwe Page Object** `playwright/pages/navigation.page.ts` (of uitbreiding
  `BasePage`): `openMobileMenu()`, `closeMobileMenu()`, `expectMenuState(open)`.
- **Nav-coverage:** uitbreiden met *alle* `nav-*` links (ook curriculum/testing/
  automation/personal) op **elke** pagina (parametriseer over pagina's), niet alleen home.
- **Exit:** 100% nav-elementen over alle pagina's geassert; menu-toggle gedekt.

### Fase 2 — Non-functieel basis (P1)
- **Accessibility** (`tests/a11y/accessibility.spec.ts`):
  - keyboard: Tab door navbar → focus-visible ring → Enter opent link.