# Test suite status — portfolio

> **Status:** actueel status- en backlogdocument, november 2026, met de
> theorie–praktijkaudit in §4.
> Dit is de canonieke bron voor wat gedaan is, wat nog moet gebeuren en in welke mate de
> theorieclaims van `TESTPLAN.md` en `BESTPRACTICES.md` in de repo zijn omgezet.
> Historische reviews en afgeronde plannen staan in `Project-documentation/Obselete/`.

## 1. Baseline

- **152 tests in 12 spec-bestanden.**
- Smoke: 10, homepage: 12, contact: 16, mobiel menu: 17, CI-history: 7, footer: 3,
  accessibility: 21, content-integrity: 11, SEO: 32, responsive: 8, E2E-flows: 6,
  CIH-06/07 datasuite: 9.
- `npm run check` → groen (gemeten 28 november 2026, na de CIH-08-bouw).
- `npm run test:ci-summary` → **9/9 geslaagd** (de datasuite van CIH-06/07, zonder browser).
- `npm run test:local` → **152/152 tests geslaagd** (gemeten 28 november 2026: afsluitregel
  `152 passed`, 1 worker, `retries: 0`, tegen de lokale `docs/` op poort 8080, in 1,1 m). De
  zes E2E-flows draaiden lokaal 6/6 groen; de vier CIH-08-tests 4/4, en de
  accessibility-suite 21/21 in 15,4 s.
- `npx playwright test --list` → 152 tests in 12 files.
- Sequencering: lokaal **152/152** (gemeten 28 november). De 139-suite draaide voor het
  eerst in de CI in run **72**:
  **135 geslaagd, 4 faalden**. Alle vier faalden in de RESP-01-cases op de smalle viewports
  (500×640, 499×640, 390×844, 320×568), met 37–46 px horizontale overloop en in élke poging
  dezelfde maat — dus geen testflake, maar een environment-defect: de runner-uitvalfont is
  breder dan het lokale "Segoe UI". De site-CSS breekt lange woorden en URLs
  (`overflow-wrap: break-word` op `body`), gemeten met de wide-font proxy. Run **73**
  bevestigt de fix in de CI: **139 geslaagd, 0 faalden**, met alle CI-stappen success.
- **Laatste CI-record:** run **74** met `total` **145**, `passed` **145**, `failed` **0**
  en `passRate` **100** — de eerste groene CI-run met de zes E2E-flows, uit de nightly
  (`event: schedule`, commit `78dfc2e`), door de bot committed op `main`. De JSON bevat **30 entries met run 74 als
  nieuwste** (nieuwste vooraan). De 152-suite met CIH-07 en CIH-08 heeft nog
  **niet** in de CI gedraaid: de eerste CI-run van de 152-suite is het
  productiebewijs dat nog komt, en daarmee ook het CI-bewijs van CIH-07: geen van de 30
  entries in de JSON bevat `suiteTests`. De history-JSON is de bron van waarheid voor de
  README-claim
  over de laatste run (PLAYWRIGHT §10).
- **Werkbom na de CIH-06/07-bouw (november 2026):** de datasuite staat in
  `playwright/tests/unit/ci-summary.spec.ts` (9 cases uit `PLAN-CI-HISTORY-TESTS.md` §7),
  het niet-browser project `unit` staat in `playwright.config.ts`,
  `playwright.local.config.ts` en de nieuwe gate-config `playwright.unit.config.ts`,
  `npm run test:ci-summary` staat in `package.json`, en de CI-poort staat in
  `playwright.yml` na `validate:html` en vóór `check:site` en de browserinstall.
  Chromium-only install (`--with-deps chromium`) staat in de workflow. Gemeten:
  `npm run check` groen, `npm run test:ci-summary` 9/9, `npm run test:local` 152/152 en
  `--list` 152 tests in 12 files. De CIH-06-poort is bewezen in runs 72 en 73 met de
  139-suite; de CI-bewijsrun van de 152-suite met schema v2 is nog open. Run 72 zette
  deze stand in de CI: de vier poorten
  (typecheck, lint, html-validate, datasuite), de Chromium-install, `Running 139 tests`,
  de drie artifacts en de bot-commit concludeerden success; alleen de teststap faalde op
  de vier RESP-01-cases. Run 73 draaide dezelfde keten groen — alle 16 stappen success,
  139/139 en een record met `passRate` 100 — met de CSS-fix in `docs/css/style.css`.

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
| **Accessibility-suite** | `playwright/tests/accessibility/accessibility.spec.ts` met `AccessibilityPage` (`pages/a11y.page.ts`) en `utils/contrast.ts`: tabvolgorde-contract per pagina, focus-outline (2px, offset 3px), skip-link-focus op `main`, `lang="nl"`, landmarks, alt-teksten, Nederlandse section-labels, `aria-hidden` op decoratieve iconen, gemeten placeholder-contrast en `forced-colors`-fallback. |
| **Skip-link-focus** | `tabindex="-1"` op `main#hoofdinhoud` in alle 10 pagina's, zodat Enter op de skip-link de focus echt op de hoofdinhoud zet. |
| **CI-sectie a11y (CIH-08)** | 4 tests in `playwright/tests/accessibility/accessibility.spec.ts` op de gemockte CI-sectie van `automation.html`: de Nederlandse caption als accessible name van de tabel (`.sr-only`, dus niet `display: none`), de zes kolomkoppen met `scope="col"`, élke rij vult de zes kolommen (de `colspan` van de placeholder-rij telt mee), de run-link met leesbare runnaam plus `target`/`rel`, de elf kaartlabels met een niet-verborgen waarde, de accessible name van de statusbadge en de tabvolgorde langs de run-links in rijvolgorde. Page object: `pages/a11y.page.ts`. Gemeten: 4/4, accessibility 21/21 en de suite 152/152 (28 november 2026). |
| **Kleine fixes** | `networkidle` verwijderd; runtime-error-helper hernoemd; titel-regex escapet input; honeypot-assert gebruikersgericht. |
| **Kijkmodus** | `playwright.local.config.ts` kent de env-vlag `PW_VIEW=1`: `video: { mode: 'on' }`, `trace: 'on'`, `screenshot: 'on'`, headed en open HTML-rapport, zodat een geslaagde run na te kijken is. `npm run test:localVideo` (`scripts/view-tests.mjs`) start die modus; `npm run show:report` en `npm run show:trace` openen rapport en trace. De standaardrun blijft `retain-on-failure`. Gemeten: 12/12 en 3/3 groen met 12 resp. 3 video's, traces en screenshots; `npm run check` groen. |
| **Waarheidsvulling (stap 1)** | Claims op de gemeten stand gezet: `README.md` — laatste CI-run **63/63** (run 71) en de 80-suite heeft nog niet in de CI gedraaid; `PLAYWRIGHT.md` §10 — telling **80** in plaats van 61; `TESTPLAN.md` §6.3 — `DESKTOP_VIEWPORT` is **1920×1080**, extra viewports als **gepland** in RESP-01; §5.5 — BVA is een data-grens van 500 tekens, geen 1000+ en geen specificatiegrens, en de viewport-grenzen zijn gepland; §7 F6 — 500 tekens met de `maxlength`-aantekening; §10 fase 2 — de claim "extra viewports toegevoegd" is teruggedraaid naar RESP-01; §4 — de component-laag noemt menu-visibility en `aria-hidden` in plaats van `class="open"`; `CI-OVERVIEW.md` §12 punt 3 — `e2e/` heeft geen testcase in het plan; `eslint.config.mjs` regels 70–72 — de comment zegt nu `waitUntil: "load"`, niet `networkidle`. |

| **Content-integrity-suite** | `playwright/tests/content-integrity/content-integrity.spec.ts` + `ContentIntegrityPage` (`pages/content.page.ts`), 11 tests. LINK-01 per pagina: elke interne `<a href>` targett een bekend site-bestand uit `ALL_PAGES`, en elk in-page anchor (`#…`) heeft een element met die id. LINK-02: elke externe link heeft `target="_blank"` + `rel="noopener noreferrer"`. IMG-01: elke `<img>` heeft een niet-lege `alt`, een interne bron uit de asset-set en is geladen; een aparte test checkt de asset-referenties (`img[src]`, `link[href]`, `script[src]`) op alle 10 pagina's. De checks zijn structureel, tegen de bekende site-set — niet tegen HTTP-bereikbaarheid van externe hosts (TESTPLAN §6.2). |
| **SEO-suite** | `playwright/tests/seo/seo.spec.ts` + `SeoPage` (`pages/seo.page.ts`), 32 tests. De waarden worden uit de DOM gelezen (`page.evaluate`), omdat de site-opmaak meta-attributes op aparte regels zet — een regex op de bron is niet betrouwbaar. SEO-01 per pagina: titel met voorvoetsel `Maarten Kamps`, lengte 10–60, description 15–160 tekens, plus één site-wide uniekheidstest (10 titels en 10 descriptions uniek). SEO-02 per pagina: precies één `<h1>`, geen duplicaten in `id`-attributen en `robots` = `noindex, nofollow`. SEO-03 per pagina: canonical = `https://maartenka.github.io/Portfolio/<pagina>`, `og:url` gelijk aan de canonical, `og:type=website`, `og:locale=nl_NL`, `og:site_name`, `og:image` met `width`/`height`/`alt`, `twitter:card=summary` en de Twitter-titel, -description en -image. SEO-04: `sitemap.xml` dekt exact de 8 content-pagina's, `404.html` en `bedankt.html` staan er niet in, en `robots.txt` sluit indexering uit (`User-agent: *` + `Disallow: /`). |
| **Responsive-suite** | `playwright/tests/responsive/responsive.spec.ts` + `ResponsivePage` (`pages/responsive.page.ts`), 8 tests op de viewports 1280×800, 850×1024, 849×1024, 500×640, 499×640, 390×844 en 320×568. Elke viewport-test loopt alle 10 pagina's: geen horizontale scroll (`scrollWidth` van de document-root vs `innerWidth`), de nav-stijl op de CSS-grens (toggle zichtbaar en nav ingeklapt tot en met 850px, toggle verborgen en nav inline erboven), en op de compacte grens (≤500px) de full-width knoppen en de gestapelde hero-knoppen. De achtste test: hero-tilt aan op 1280 en `transform: none` op de grenzen 500 en 499. |
| **Viewport-constanten** | `RESPONSIVE_VIEWPORTS` (7 viewports), `NAV_BREAKPOINT` (850), `COMPACT_BREAKPOINT` (500) en `NAV_LINK_TEST_IDS` (de 7 nav-`data-testid`'s) in `playwright/utils/test-data.ts`. De grenzen zelf (850, 500) en de grens eronder (849, 499) zijn opgenomen — boundary value analysis op de media queries van `style.css`. `DESKTOP_VIEWPORT` en `MOBILE_VIEWPORT` zijn onveranderd. |
| **Site-constanten** | `SITE_BASE_URL`, `OG_IMAGE_URL`, `TITLE_PREFIX`, `MIN_TITLE_LENGTH`/`MAX_TITLE_LENGTH`, `MIN_DESCRIPTION_LENGTH`/`MAX_DESCRIPTION_LENGTH`, `ROBOTS_CONTENT`, de OG-waarden (`OG_TYPE`, `OG_LOCALE`, `OG_SITE_NAME`, `OG_IMAGE_WIDTH`, `OG_IMAGE_HEIGHT`, `TWITTER_CARD`), `SITEMAP_PAGES` (8), `NON_SITEMAP_PAGES` (2), `SITE_ASSETS` (6) en `LOCAL_IMAGE_SOURCES`. De grenswaarden zijn gemeten op de 10 pagina's, niet geschat. |
| **Fix stap 2** | Drie page objects (`content.page.ts`, `seo.page.ts`, `responsive.page.ts`) en drie fixtures (`contentPage`, `seoPage`, `responsivePage`). `SeoPage` krijgt de `request`-fixture voor `sitemap.xml` en `robots.txt`; de fixtures navigeren niet, de specs doen dat per pagina. De viewport-vertakking staat in `ResponsivePage.expectViewportContract()`, niet in het test-lichaam. |
| **Chromium-only browserinstall (workflows)** | `.github/workflows/playwright.yml` installeert `npx playwright install --with-deps chromium`, omdat `playwright.config.ts` en `playwright.local.config.ts` elk één project `chromium` definiëren. Open punt §3 punt 7 en audit §4.1 punt 8 zijn damit opgelost in de werkbom (TESTPLAN §10.1 en §10.3 punt 3, BESTPRACTICES §18). De CI-run bevestigt dit pas in een run met het nieuwe workflow-bestand. |
| **CIH-06/07 datasuite** | `playwright/tests/unit/ci-summary.spec.ts` met 9 tests (CIH-06a…h + CIH-07) op `scripts/ci-summary.mjs`: formules uit `stats`, `passRate`-afronding op één decimaal, `total = 0` en getalnormalisatie, `no-report` bij een ontbrekend rapport, `CI_SUMMARY_STATUS`-normalisatie, dedup op `runId`, `--max`-kappen en de decoding van de CLI-args met de run-URL uit de CI-omgeving. Het project `unit` is browserloos (geen `devices`-use, geen `page`-fixture); de gate-config `playwright.unit.config.ts` heeft een eigen `outputDir` en alleen de `list`-reporter, zodat het suite-rapport voor `ci-summary.mjs` schoon blijft. `npm run test:ci-summary` is de CI-poort vóór de browserinstall. Elke test schrijft in een eigen temp-map, dus `docs/data/playwright-history.json` blijft onaangeraakt. |
| **E2E-gebruikersflows (stap 4)** | `playwright/tests/e2e/e2e.spec.ts` + `FlowPage` (`pages/flows.page.ts`), 6 tests E2E-01…E2E-06 op de scenarios S1–S6 uit `TESTPLAN.md` §8.6: de navigatietour langs de zeven nav-links, de contactjourney (lege validatie → invullen → submit → `bedankt.html` → back, met één POST en de Formward-velden), het mobiele menu op 390×844 (open, focus op de eerste link, navigeer, gesloten op de landing), het CI-dashboard met drie gemockte runs (laatste-run kaarten, aggregate ratio Σ 431/435 = 99,1%, drie rijen, run-link met `target`/`rel`, terug naar home), de footerreis (contract van de vier links, actieve state op contact en privacy, geen actieve link op home) en de 404-herstelroute. De landingscheck is URL + zichtbare `h1`; de detail-asserts blijven in de gefocuste suites en de URL-contracten zijn de bestaande mappen uit de page objects (BESTPRACTICES §25, TESTPLAN risico R16). De fixture `flowPage` staat in `test-fixtures.ts`. Doel G14, de conditie-actietabel §7.1 en de traceability §15 zijn in het plan opgenomen. Gemeten: `npm run check` groen, `--list` 148 tests in 12 files, E2E 6/6 en de suite 148/148 lokaal (27 november 2026). |
| **Responsive-defect in CI — opgeheven in run 73** | Vier RESP-01-cases (500×640, 499×640, 390×844, 320×568) faalden in CI op de check "geen horizontale scroll": de documentbreedte liep 37–46 px boven de viewport, in elke poging met dezelfde maat. Root-cause is environment-gevoelig: de runner-uitvalfont is breder dan het lokale "Segoe UI", dus is de min-content van lange onbreekbare woorden groter dan de kolom — h1 "Automatiseren" (`automation.html`), h1 "Laten we kennismaken" (`contact.html`), h2 "Van handmatig naar geautomatiseerd" (`testing.html`) en de URL-link op `privacy.html`. De fix staat in `docs/css/style.css` (op `body`) en is gecommit en gedeployed. Met de wide-font proxy gemeten: vóór de fix overloop op automation (533/533/432/355 px op 500/499/390/320), testing (342 px op 320), contact (393/323 px) en privacy (337 px); na de fix is `scrollWidth == innerWidth` op alle 10 pagina's in alle 7 viewports. Lokaal opnieuw groen: `npm run check` en `npm run test:local` 139/139 (27 november). Run **73** bevestigt de groene CI-stand op de runner: 139/139, `passRate` 100, 3 artifacts en alle 16 stappen success. |

## 3. Wat nog open is

| # | Open punt | Bewijs / locatie | Actie |
| --- | --- | --- | --- |
| 1 | **F8** | Dubbel submit / maximaal één POST is niet geautomatiseerd. | Productbesluit: submit-guard toevoegen, F8 meten met `dblclick` en een `≤ 1`-request-assert, of F8 als niet-lokaal-automatiseerbaar documenteren. |
| 2 | **SM-03 live fallback** | Lokaal is `404.html` direct getest; unknown-path-fallback is een live/GitHub-Pages-check. | Live fallback handmatig of via live-only test afdekken. |
| 3 | **Non-functioneel** | A11Y (21, inclusief CIH-08 op de CI-sectie), RESP-01 (8), SEO-01…04 (32) en LINK-01/02 + IMG-01 (11) zijn gebouwd en lokaal groen. VIS-01 en PERF-01 ontbreken nog; screenreader-gedrag blijft een handmatige check. | VIS-01 en PERF-01: besluit over visual baselines en Lighthouse (stap 8 in §6). |
| 4 | **CI-history data/keten** | CIH-06 is gebouwd en in runs 72 en 73 via de CI-poort gemeten. CIH-07 is gebouwd: 9 datasuite-tests inclusief schema v2 en `suiteTests`, plus 7 UI-tests met `suiteTests` en `max(total)`-fallback. CIH-08 is gebouwd: 4 a11y-tests op de CI-sectie in `accessibility.spec.ts`. De CI-bewijsrun van de 152-suite is nog open. | CI-bewijs voor CIH-07 via `workflow_dispatch` op de current HEAD (`PLAN-CI-HISTORY-TESTS.md` §9 en §10). |
| 5 | **Showcase-media op de portfolio** | De kijkmodus is gereed en gemeten; de video's op de site staan gepland in TESTPLAN §10.4, en `docs/automation.html` belooft ze "in een volgende stap". | Uitvoeren zodra de portfolio-inrichting vastligt: keus van de suite-onderdelen, `test.use` met `video: 'on'`, de clip naar een site-asset en de site-copy bijwerken. |
| 6 | **Dekking van de theorie** | 2 van de 11 productdoelen (G9, G10) hebben geen test; G5, G7 en G8 zijn sinds stap 2 gedekt. De pyramide-basis is sinds de CIH-06/07-bouw gevuld (9 datasuite-tests) en de **pyramide-kern is sinds stap 4 gevuld** (6 E2E-flows, G14); §4.2 noemt de gedeclareerde theorieonderdelen die geen test hebben. | De acties staan in §6, stap 5, 7 en 8. |

## 4. Theorie–praktijkaudit (november 2026)

Deze sectie is de canonieke lijst van wat `TESTPLAN.md` en `BESTPRACTICES.md` als theorie
claimen en wat de suite werkelijk dekt. Elk bewijs is een meting in de repo, niet een
reconstructie uit het geheugen. De bijbehorende acties staan in §6.

### 4.1 Documentclaims die de code niet waarmaakt

> De claims in deze tabel zijn de staat **vóór stap 1** (november 2026). De zeven
> documentclaims (punten 1–7) zijn gecorrigeerd in de werkbom; de correcties staan in
> §2 en de afgeronde lijst in §5. Punt 8 is geen documentclaim maar een
> workflow-wijziging; die is november 2026 in de werkbom uitgevoerd (zie §2 en §5) en
> staat daardoor niet meer als open punt in §3. De tabel blijft staan als audit-sporen,
> zodat de root-cause vindbaar blijft.

| # | De documentatie claimt | Gemeten in de repo | Actie |
| --- | --- | --- | --- |
| 1 | `README.md` regel 23: "Laatste gelogde CI-run **41/41** geslaagd (100%; suite telt nu 80 tests)" | De nieuwste run in `docs/data/playwright-history.json` is run **71** met `total` **63** (63/63, 100%). | README-claim op de bron van waarheid (PLAYWRIGHT §10, "niet met de hand"). |
| 2 | `PLAYWRIGHT.md` §10-tabel: "Aantal tests per suite + totaal (61)" | `npx playwright test --list` = **80 tests in 7 files**. | Tellings in de §10-tabel en in de README op 80. |
| 3 | `TESTPLAN.md` §6.3: viewports 1280×800, 850×1024/820×1180, 390×844, 360×640, 320×568; §5.5: BVA op de grenzen 850px/500px; §10 fase 2 claimt als uitgevoerd: "extra viewports (850×1024, 360×640) toegevoegd" | `playwright/utils/test-data.ts` kent alleen `DESKTOP_VIEWPORT` (1920×1080) en `MOBILE_VIEWPORT` (390×844). Grep op `850`, `360`, `320` en `1280` in `playwright/**` vindt geen viewport; de CSS-grenzen (850px, 500px) worden nooit getest. | RESP-01 op de échte grenzen (stap 2) en de fase-2-claim in het plan correcteren. |
| 4 | `TESTPLAN.md` §5.5 en §7 F6: BVA met "1 teken en 500+/1000+ tekens" | `BOUNDARY_CONTACT` is `"x".repeat(500)`; er is geen 1000+-case. Op geen enkel veld van `docs/contact.html` staat `maxlength`, `minlength`, `pattern` of `max` — er is geen specificatiegrens om te bounderen. | BVA-claim verlagen tot wat er is, of de grens in de HTML zetten (`maxlength`) en F6 op echte grenzen. |
| 5 | `eslint.config.mjs` regels 70–72: "BasePage.goto() wacht bewust op networkidle" | `playwright/pages/base.page.ts` navigeert op `waitUntil: "load"`; `networkidle` is verwijderd. | Commentaar in de lint-config corrigeren. |
| 6 | `CI-OVERVIEW.md` regel 412: `TESTPLAN.md` "beschrijft al testcases" voor `accessibility/`, `compatibility/`, `e2e/` en `regression/` | Voor `e2e/` staat in het plan geen testcase, geen ID, geen doel en geen roadmapfase; de map is leeg. | Claim beperken tot de mappen met cases; het E2E-besluit (stap 4) eerst. **Uitgevoerd in stap 4**: G14, E2E-01…E2E-06, §8.6, §15 en de map `e2e/` zijn gevuld; de claim in `CI-OVERVIEW.md` §12 punt 3 staat op de gemeten stand. |
| 7 | `TESTPLAN.md` §4: de component/DOM-laag met "aria-expanded, `class="open"`, honeypot-zichtbaarheid" | De `.open`-class-asserts zijn vervangen door zichtbaarheid en ARIA (§2 en §5 in dit document). | De bullet in `TESTPLAN.md` §4 bijwerken. |
| 8 | `BESTPRACTICES.md` §18 en `TESTPLAN.md` §10.3 (bekende beperking): de CI installeert alle engines terwijl er één project is | `.github/workflows/playwright.yml` draait `npx playwright install --with-deps`; `playwright.config.ts` kent alleen het project `chromium`. | **Uitgevoerd** in de werkbom: `--with-deps chromium` (zie §2 en §5). |

### 4.2 Gedeclareerde theorie zonder test in de suite

| Theoriebron | Wat het claimt | Wat de repo dekt | Gevolg |
| --- | --- | --- | --- |
| `TESTPLAN.md` §11 dekkings-metric: elk productdoel G1–G10 en G13 heeft ≥1 bestaande testcase; geplande cases tellen niet | Volledige doeldekking | G9 (visual) en G10 (performance) hebben geen test: **2 van de 11 productdoelen**. G5, G7 en G8 zijn sinds stap 2 gedekt (responsive 8, SEO 32, content-integrity 11); G13 is gedekt door 7 UI-tests, de datasuite CIH-06/07 (9 tests) en de a11y van de CI-sectie (CIH-08, 4 tests). | De metriek is gehaald behalve voor G9 en G10, die in fase 5 staan. |
| `TESTPLAN.md` §4 pyramide en `BESTPRACTICES.md` §23: "Gebruik niet alles als E2E; unit/integration/API voor logica" | E2E als kern met een lagere laag eronder | Van de 152 tests zijn 143 browser-tests en 9 datasuite-tests. `scripts/ci-summary.mjs` is sinds de CIH-06-bouw gedekt (formules, `no-report`, dedup op `runId`, `--max`, `CI_SUMMARY_STATUS`, CLI-decoding) in `playwright/tests/unit/ci-summary.spec.ts`; `src/ts/main.ts` wordt alleen via gemockte UI-cijfers gedekt (`PLAN-CI-HISTORY-TESTS.md` §2: laag B "**Ja**", laag C "**Nee voor schema v2**"). | **Gesteld in stap 4**: de pyramide-basis is gevuld (9 datasuite-tests) én de kernlaag is gevuld (6 E2E-flows in `playwright/tests/e2e/e2e.spec.ts`). De E2E-kern bewijst journey-continuity, niet de detail-asserts — de verhouding is vastgelegd in TESTPLAN §8.6 en risico R16. |
| `TESTPLAN.md` §4: "E2E/acceptance: volledige gebruikersflows" als kern van de pyramide, en `CI-OVERVIEW.md` §5 (bestandsgids) als gereserveerde map | De E2E-laag als projectkern | **Gebouwd november 2026**: doel G14 in §2, zes cases E2E-01…E2E-06 (flows S1–S6) in §8.6, de rij in §15, exacte testnamen in §15.1, en 6 tests in `playwright/tests/e2e/e2e.spec.ts` met page object `pages/flows.page.ts`. Lokaal 6/6 en 148/148 (27 nov 2026). | **Gesloten.** De eerste CI-run van de 152-suite is het resterende productiebewijs. |
| `TESTPLAN.md` §5.4 Compatibility (⭐⭐⭐⭐) en §6.4/§7 cross-browser | Firefox en WebKit als risicogedekte engines | Alleen Chromium; `compatibility/` is leeg (fase 7). | Het testtype met de hoogste prioriteit heeft geen test. |
| `TESTPLAN.md` §5.4 Security (⭐⭐) | HTTPS, honeypot-check, ongewenste navigatie | Geen security-ID in de matrix en geen security-deliverable in §16. De honeypot-structuur is wél gedekt (F5, A11Y-01). | Type met een prioriteit en zonder testcase. |
| `TESTPLAN.md` §5.2 en §5.4 Performance (⭐⭐⭐) | Lighthouse ≥ 90/95/90/90, LCP < 2,5 s, CLS < 0,1, TBT < 200 ms | Lighthouse staat niet in `package.json`; PERF-01 is gepland. | De drempels bestaan, de meting bestaat niet. |
| `TESTPLAN.md` §5.4 Visual | VIS-01, `maxDiffPixelRatio` 0,01 | Geen baseline en geen dependency (fase 5). | Analoog. |
| `TESTPLAN.md` §5.4 Smoke: "kleine subset bij elke build/deploy" | Smoke draait bij elke build | De push-trigger in `playwright.yml` is uitgeschakeld en er is geen pre-deploy gate. Smoke draait één keer per nacht: 10 van de 139 tests. | De smoke-rol is niet als rol geconfigureerd; G12 is een open beslispunt. |
| `TESTPLAN.md` §5.3 en §12.4: exploratoire sessies en closure | Handmatige sessies op iOS/Android, lessons learned, open defecten met severity | Geen sessieregister, geen findingsregister, geen closure-log in de repo. | Gedeclareerde practice zonder artefact. |
| `TESTPLAN.md` §12.1, §12.4 en §14 DoD: defectbeheer | Issue met severity; een defect is geen testcase | De echte defects (raw `&` in `curriculum.html`, skip-link `tabindex`, de P2-a11y-fixes) staan als prose in de documentatie, zonder defect-ID en zonder link naar een testcase. | Geen defectregister en geen trace testcase ↔ defect. |
| `TESTPLAN.md` §13: reviewer "PR-review op testkwaliteit" | Reviews via PR's op de DoD | Er is geen PR-workflow: pushes gaan direct naar `main`, de history-commit komt van de bot, de CI is nightly + dispatch. | Een rol zonder proces. |
| `Obselete/REVIEW-TESTPLAN.md` regels 103–105, in `TESTPLAN.md` §3.3 en §15 opgenomen | Dekking per acceptatiecriterium, "not covered" expliciet | §15 mapt doel → testcase, niet criterium → testcase. "Non-functioneel binnen drempels" (§3.3) is nu onmeetbaar. | De dekkingsmetriek staat op doelen, niet op criteria. |
| `TESTPLAN.md` §7 scenarios S1–S6 en §5.5 "decision table / scenario testing" | Zes gebruikersflows en een condities-acties-tabel op het formulier | **Omgezet november 2026**: de condities × acties-tabel staat als §7.1 (regels R1–R8 met de F-cases), en de zes flows zijn gebouwd als E2E-01…E2E-06 in §8.6 met een traceability-rij in §15. De S1–S6-labels zijn nu testcase-definities, niet narratief. | **Gesloten.** De partitie "honeypot gevuld" (R5, F5) én "leeg bij een geldige submit" (R1, F1) is beide geassert. |
| `TESTPLAN.md` §5.5 equivalence partitioning | Partities op het formulier | "Honeypot gevuld" is geassert in F5; "leeg bij een geldige submit" is niet geassert (F1 assert één request). | De partitiepair is half gedekt. |
| `BESTPRACTICES.md` §25 en `TESTPLAN.md` §8: "elke testcase klein en gefocust, één logisch gedrag" | Kleine tests, één gedrag per test | De 10 per-pagina a11y-tests bundelen 7 asserts; "alle formuliervelden zijn zichtbaar" op contact bundelt 4; de footer-tests bundelen per test meerdere links en attributen. | Keus voor test-efficiëntie boven de eigen norm; als projectkeus in §14 van het plan zetten. |
| `BESTPRACTICES.md` §3 en §26: geen sleeps | Geen vaste sleep in tests | `BasePage.gotoWithRetry()` gebruikt `setTimeout` van 1 s en 2 s als host-retry. | Onderbouwd als infrastructuur; als expliciete uitzondering in de richtlijn documenteren. |
| `BESTPRACTICES.md` §2 en §16: semantische locators eerst, `page.evaluate` als laatste middel | Locators vóór DOM-berekening | `playwright/no-raw-locators` staat op **error** in page objects, dus meta- en style-checks (`og:*`, `meta[name="description"]`, computed styles) moeten via `page.evaluate`. | De lint-regel dwingt `evaluate` af voor metadata; de bewuste voorrang boven de Playwright-locatorgids documenteren. |
| `BESTPRACTICES.md` §20 en §21: `trace`/`video` niet standaard `on` | Beperkte artefacten | De kijkmodus (`PW_VIEW=1`) zet `trace`, `video` en `screenshot` op `on` voor élke run. | Al gedocumenteerd als lokale showcase-modus; de CI blijft `retain-on-failure`. Geen breuk, wel een afwijking met rationale. |

### 4.3 Wat géén breuk is

Expliciet vastgelegd, zodat de audit niet als afrekening gelezen wordt.

- **Asserts in page objects** — projectkeuze (PLAYWRIGHT §8; `playwright/expect-expect` en
  `playwright/no-standalone-expect` staan uit in `eslint.config.mjs`). Playwright's eigen
  Page Object-voorbeelden bevatten asserts in de methods.
- **Formward-mock** — determinisme (TESTPLAN §6.2), en het echte endpoint is één keer
  handmatig met een geldige submit gecheckt (TESTPLAN §5.3, BESTPRACTICES §10: niet blind
  alles mocken).
- **Test isolation, typed fixtures, Nederlandse testnamen met ID's, traceability (TESTPLAN
  §15), de preflight `npm run check:site` en de vier kwaliteitspoorten vóór de tests** — in
  lijn met de eigen richtlijnen en met de workflow.
- **Geen `waitForTimeout` en geen raw locators in de page objects** — gemeten met grep, en
  lint groen op `--max-warnings=0`.
- **State-transition op het menu (MENU-04) en equivalence partitioning op e-mail (F2/F3)** —
  technieken die wél in tests zijn omgezet.
- **Risico-analyse met ID's (R1–R13), entry-/exit-criteria en opschortingscriteria** — de
  structuur van TESTPLAN §9, §11 en §12 staat en wordt gebruikt.
- **Kijkmodus** — een bewuste afwijking van BESTPRACTICES §20/§21 met rationale, eigen
  npm-scripts en een meting (12/12 en 3/3 groen met 12 resp. 3 video's, traces en
  screenshots).

## 5. Wat niet meer op de backlog staat

- F5 honeypot-payload en tabvolgorde.
- A11Y-01…04 en CIH-08 als structurele Playwright-suite (21 tests).
- Skip-link-focus: `tabindex="-1"` op `main#hoofdinhoud` in alle 10 pagina's.
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
- **CIH-08**: a11y van de CI-sectie — Nederlandse caption als accessible name, zes kolomkoppen
  met `scope`, rijstructuur tegen de zes kolommen, run-link met `target`/`rel`, elf
  kaartlabels, badge-name en tabvolgorde langs de run-links (4 tests in
  `accessibility.spec.ts`).
- Waarheidsvulling stap 1: README (CI-run 63/63), PLAYWRIGHT §10 (80 tests), TESTPLAN
  §6.3 (1920×1080), §5.5 (BVA), §7 F6, §10 fase 2, §4 (`.open`-bullet),
  `CI-OVERVIEW.md` §12 punt 3 (`e2e/`) en `eslint.config.mjs` (`networkidle`).

- **E2E-01…E2E-06 (stap 4)**: zes gebruikersflows in `playwright/tests/e2e/e2e.spec.ts`
  met page object `pages/flows.page.ts` — navigatietour, contactjourney, mobiel menu,
  CI-dashboard, footerreis en 404-herstel. De landingscheck is URL + zichtbare `h1`; de
  URL-contracten zijn de bestaande mappen `NAV_ITEM_URLS` en `CARD_LINK_URLS`, en de
  footerstate-asserts staan in het page object (`expectFooterJourney`), niet in het
  test-lichaam (`playwright/no-conditional-in-test`).

- **RESP-01**: 8 tests op de échte CSS-grenzen 850/849 en 500/499, met het nav-contract
  (toggle-zichtbaarheid), full-width knoppen, gestapelde hero-knoppen en de hero-tilt
  (`transform: none` op de compacte grens).
- **SEO-01…SEO-04**: 32 tests — titel en description, site-wide uniekheid, één `<h1>`,
  unieke `id`-attributen, `robots` op elke pagina, canonical, Open Graph, Twitter card,
  sitemap en robots.txt.
- **LINK-01, LINK-02 en IMG-01**: 11 tests op alle 10 pagina's, structureel tegen de
  set van bekende site-bestanden.
- **Constanten en page objects** uit stap 2: `content.page.ts`, `seo.page.ts`,
  `responsive.page.ts`, fixtures `contentPage`, `seoPage`, `responsivePage`, en de
  viewport-, breakpoint-, OG-, sitemap- en asset-constanten in `test-data.ts`.
- **Voorwaarde uit het test-lichaam**: de viewport-vertakking staat in
  `ResponsivePage.expectViewportContract()`; de `playwright/no-conditional-in-test`-warning
  in de spec is daarmee opgelost (de rule is niet van toepassing op page objects, omdat
  die geen testbestand zijn).
- **Geen `buttons.length`-assert in de compacte layout**: `404.html` en `privacy.html`
  hebben geen `.button`-elementen, dus die twee pagina's vallen buiten het full-width-
  contract; 8 van de 10 pagina's dragen het contract. De assert op een lege lijst zou
  die pagina's onterecht laten falen.
- **Sitemap/robots-contradictie vastgelegd als documentvinding**, niet als assert: de
  sitemap publiceert 8 pagina-URLs alsof de site indexeerbaar is, terwijl de site
  expliciet niet indexeerbaar is (`noindex, nofollow` op elke pagina én `Disallow: /`
  in `robots.txt`). SEO-04 assert de onderlinge consistentie van de gepubliceerde
  bestanden en dat de indexatie-keus op elke pagina staat; de spanning zelf is een
  documentvinding (TESTPLAN §8.4, §10.2).
- **CI-uitvoering van de 139-suite is bewezen, en groen**: run 72 zette de vier poorten,
  de Chromium-only install, `Running 139 tests using 1 worker`, de drie artifacts en de
  history-record met `total = 139` in één run (135 geslaagd, 4 faalden, 97,1%). Run **73**
  draaide dezelfde keten volledig groen: 139/139, `passRate` 100, drie artifacts,
  bot-commit en alle 16 stappen success. De vier RESP-01-cases van run 72 zijn opgeheven
  door de CSS-fix (`overflow-wrap: break-word` op `body`), die op `main` staat.
- **Wide-font proxy als diagnosetechniek (november 2026)**: een tijdelijk Node-script
  diende de lokale `docs/`-build en forceerde een brede font
  (`* { font-family: Verdana, sans-serif !important; }` via `page.addStyleTag`) als proxy
  voor de runner-uitvalfont. De overloopende boxes werden gevonden door élk element één
  voor één op `display: none` te zetten en de pseudo-elementen per class uit te schakelen,
  met `documentElement.scrollWidth` als maat. Zo zijn de vier CI-faalden lokaal
  reproduceerbaar op dezelfde pagina's en viewports, en de fix is daarmee hertest. Het
  script stond buiten de suite en is na de meting verwijderd — het is niet in de repo.

## 6. Voorgestelde volgorde

1. **Waarheidsvulling** (audit §4.1) — **uitgevoerd, november 2026**: de claims in
   `README.md`, `PLAYWRIGHT.md` §10, `TESTPLAN.md` §4, §5.5, §6.3, §7 (F6), §8.4
   (RESP-01) en §10 (fase 2), `CI-OVERVIEW.md` §12 punt 3 en `eslint.config.mjs`
   regels 70–72 staan op de gemeten stand. De CI-record in §1 is het bewijs. De
   viewport-constanten zelf zijn nog niet toegevoegd; dat is stap 2.
2. **Non-functioneel: RESP-01, LINK-01/02, IMG-01 en SEO-01…04** — **uitgevoerd,
   november 2026**: 51 tests toegevoegd (responsive 8, SEO 32, content-integrity 11), suite
   van 80 naar 131, lokaal 131/131 groen en `npm run check` groen. G5, G7 en G8 zijn gedekt
   en de top-risico's R7, R8 en R9 zijn gedekt. De viewports zijn de gemeten CSS-grenzen:
   1280×800, 850×1024, 849×1024, 500×640, 499×640, 390×844 en de ondergrens 320×568. De
   `360×640` uit het eerdere plan is niet opgenomen: de partitie ≤500px wordt getest op
   499×640, 390×844 en 320×568. A11Y-01…04 was al af.
3. **CIH-06/07** als `test:ci-summary`-poort op `scripts/ci-summary.mjs` — **uitgevoerd,
   november 2026**: 9 datasuite-tests inclusief CIH-07 in `playwright/tests/unit/ci-summary.spec.ts` in het
   niet-browser project `unit` (geen `devices`, geen `page`-fixture), met de eigen
   gate-config `playwright.unit.config.ts` (eigen `outputDir`, `list`-reporter, `retries: 0`),
   de npm-script en de CI-poort vóór de browserinstall in `playwright.yml`. Vult de
   pyramide-basis (audit §4.2) en is de eerste niet-browser test in de repo. Gemeten:
   `npm run check` groen, `npm run test:ci-summary` 9/9, `npm run test:local` 152/152 en
   `--list` 152 tests in 12 files. De CIH-06-poort is bewezen in runs 72 en 73 met de
   139-suite; de CI-bewijsrun van de 152-suite met schema v2 is nog open. Run 72 zette deze stand
   in de CI — de poorten, de Chromium-install, 139 tests, de drie artifacts en de history-record.
   De datasuite is damit in CI bewezen; de teststap faalde toen op de vier RESP-01-cases. Run 73
   bevestigt dezelfde stand groen: 139/139 en `passRate` 100. CIH-07 (schema v2) is gebouwd; CIH-08 (a11y van de CI-sectie) is gebouwd — 4 tests in
`accessibility.spec.ts` (november 2026).
4. **De E2E-laag: flow-tests voor S1–S6** in `playwright/tests/e2e/`, met een doel (G14),
   ID's, een plaats in de §15-traceability en de F-matrix als decision table — **uitgevoerd,
   november 2026**: zes flows E2E-01…E2E-06 in `playwright/tests/e2e/e2e.spec.ts` met page
   object `pages/flows.page.ts` en fixture `flowPage`; doel G14 in TESTPLAN §2, de
   condities × acties-tabel als §7.1, de cases als §8.6, de traceability-rij in §15 en de
   exacte testnamen in §15.1, plus risico R16 en fase 9 in de roadmap. De landingscheck is
   URL + zichtbare `h1`; detail-asserts blijven in de gefocuste suites en de URL-contracten
   zijn de bestaande page-object-mappen, dus de flows dupliceren niet. Gemeten: `npm run
   check` groen, `--list` 148 tests in 12 files, E2E 6/6 en de suite 148/148 lokaal
   (27 november 2026). De eerste CI-run van de 152-suite is het productiebewijs dat nog
   komt. De flows raken `functional/` niet: de bestaande functionele specs zijn
   onveranderd.
5. **Testmanagement-artefacten:** defectregister met ID's en testcase-link, register voor de
   handmatige en exploratoire checks uit TESTPLAN §5.3, en dekking per acceptatiecriterium
   (§3.3) in §15.
6. **F8** — besluit over de submit-guard, samen met de BVA-grens in de HTML (`maxlength`).
7. **Poort per build** (TESTPLAN fase 7, G12): pre-deploy/PR-gate — de voorwaarde waaronder
   de smoke-rol in TESTPLAN §5.4 staat.
8. **Expliciete besluiten over de gedeclareerde types:** cross-browser (Firefox/WebKit),
   Lighthouse en visual baselines. Uitvoeren, of de prioriteiten in TESTPLAN §5.4 verlagen
   naar wat de repo dekt.
9. **Showcase-media op de portfolio** (TESTPLAN §10.4) — uitgesteld tot de
   portfolio-inrichting vastligt.

## 7. Documentatie

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

