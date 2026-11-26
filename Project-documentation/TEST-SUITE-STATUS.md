# Test suite status — portfolio

> **Status:** actueel status- en backlogdocument, november 2026, met de
> theorie–praktijkaudit in §4.
> Dit is de canonieke bron voor wat gedaan is, wat nog moet gebeuren en in welke mate de
> theorieclaims van `TESTPLAN.md` en `BESTPRACTICES.md` in de repo zijn omgezet.
> Historische reviews en afgeronde plannen staan in `Project-documentation/Obselete/`.

## 1. Baseline

- **131 tests in 10 spec-bestanden.**
- Smoke: 10, homepage: 12, contact: 16, mobiel menu: 17, CI-history: 5, footer: 3,
  accessibility: 17, content-integrity: 11, SEO: 32, responsive: 8.
- `npm run check` → groen.
- `npm run test:local` → **131/131 tests geslaagd** (gemeten na stap 2, november 2026).
- `npx playwright test --list` → 131 tests in 10 files.
- Sequencering: lokaal **131/131**. De laatste gemeten live-stand is **79/80** van de
  80-suite: de skip-link-focustest (A11Y-03) faalde op GitHub Pages, omdat
  `tabindex="-1"` op `main#hoofdinhoud` nog niet gedepployed was — de werkbom bevat de
  fix wel. De 131-suite heeft nog niet op de live site gedraaid: de suites
  content-integrity, SEO en responsive zijn alleen lokaal gemeten. Live groen na deploy
  + de Pages-cache (`max-age=600`).
- **Laatste CI-record in `docs/data/playwright-history.json`:** run **71** met `total`
  **63** (63/63, 100%). De suite telt inmiddels 131 tests: de 131-testsuite heeft dus nog
  **nooit in de CI** gedraaid. De history-JSON is de bron van waarheid voor de README-claim
  over de laatste run (PLAYWRIGHT §10).
- **Werkbom na de documentatieronde (november 2026):** de browserinstall in de CI is
  teruggebracht naar Chromium (`playwright.yml`: `--with-deps chromium`), en de
  uitvoeringsvorm van CIH-06 is vastgelegd in `PLAN-CI-HISTORY-TESTS.md` §7 en §10,
  `TESTPLAN.md` §4, §8.5, §10.1, §10.3, §11 en §15, `BESTPRACTICES.md` §18,
  `CI-OVERVIEW.md` §5 en §12, `PLAYWRIGHT.md` §5 en §6 en `README.md`. De suite en de
  poorten zijn niet veranderd: `npm run check` groen en 131 tests in 10 files.

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
| **CIH-06-scoping (code volgende ronde)** | De uitvoeringsvorm is vastgelegd in `PLAN-CI-HISTORY-TESTS.md` §7 en §10: de component-test op `scripts/ci-summary.mjs` draait in de Playwright-runner in een **niet-browser project** `unit` (`playwright/tests/unit/ci-summary.spec.ts`, geen `devices`-use, geen `page`-fixture), met de 8 cases uit §7 — formules uit `stats`, `passRate`-afronding, `total = 0`, `no-report`, `CI_SUMMARY_STATUS`, dedup op `runId`, `--max`-kappen en de CLI-args. Poortplaatsing: `npm run test:ci-summary` in de CI-keten na `validate:html` en vóór de browserinstall. Er is nog geen code; de suite telt daardoor nog 131 tests in 10 files. |

## 3. Wat nog open is

| # | Open punt | Bewijs / locatie | Actie |
| --- | --- | --- | --- |
| 1 | **F8** | Dubbel submit / maximaal één POST is niet geautomatiseerd. | Productbesluit: submit-guard toevoegen, F8 meten met `dblclick` en een `≤ 1`-request-assert, of F8 als niet-lokaal-automatiseerbaar documenteren. |
| 2 | **SM-03 live fallback** | Lokaal is `404.html` direct getest; unknown-path-fallback is een live/GitHub-Pages-check. | Live fallback handmatig of via live-only test afdekken. |
| 3 | **Non-functioneel** | A11Y (17), RESP-01 (8), SEO-01…04 (32) en LINK-01/02 + IMG-01 (11) zijn gebouwd en lokaal groen. VIS-01 en PERF-01 ontbreken nog; screenreader-gedrag blijft een handmatige check. | VIS-01 en PERF-01: besluit over visual baselines en Lighthouse (stap 8 in §6). |
| 4 | **CI-history data/keten** | CIH-06 (ci-summary), CIH-07 (schema v2) en CIH-08 (a11y CI-sectie) ontbreken. De uitvoeringsvorm van CIH-06 is november 2026 vastgelegd: niet-browser project `unit` in de Playwright-runner, `playwright/tests/unit/ci-summary.spec.ts`, 8 cases uit `PLAN-CI-HISTORY-TESTS.md` §7, en poort `npm run test:ci-summary` vóór de browserinstall. | CIH-06 bouwen op de vastgelegde opzet (plan §7 fase B), daarna CIH-07 en CIH-08. |
| 5 | **Showcase-media op de portfolio** | De kijkmodus is gereed en gemeten; de video's op de site staan gepland in TESTPLAN §10.4, en `docs/automation.html` belooft ze "in een volgende stap". | Uitvoeren zodra de portfolio-inrichting vastligt: keus van de suite-onderdelen, `test.use` met `video: 'on'`, de clip naar een site-asset en de site-copy bijwerken. |
| 6 | **Dekking van de theorie** | 2 van de 11 productdoelen (G9, G10) hebben geen test; G5, G7 en G8 zijn sinds stap 2 gedekt. De pyramide-basis is leeg; de E2E-laag is leeg; §4.2 noemt de gedeclareerde theorieonderdelen die geen test hebben. | De acties staan in §6, stap 3, 4, 5, 7 en 8. |

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
| 6 | `CI-OVERVIEW.md` regel 412: `TESTPLAN.md` "beschrijft al testcases" voor `accessibility/`, `compatibility/`, `e2e/` en `regression/` | Voor `e2e/` staat in het plan geen testcase, geen ID, geen doel en geen roadmapfase; de map is leeg. | Claim beperken tot de mappen met cases; het E2E-besluit (stap 4) eerst. |
| 7 | `TESTPLAN.md` §4: de component/DOM-laag met "aria-expanded, `class="open"`, honeypot-zichtbaarheid" | De `.open`-class-asserts zijn vervangen door zichtbaarheid en ARIA (§2 en §5 in dit document). | De bullet in `TESTPLAN.md` §4 bijwerken. |
| 8 | `BESTPRACTICES.md` §18 en `TESTPLAN.md` §10.3 (bekende beperking): de CI installeert alle engines terwijl er één project is | `.github/workflows/playwright.yml` draait `npx playwright install --with-deps`; `playwright.config.ts` kent alleen het project `chromium`. | **Uitgevoerd** in de werkbom: `--with-deps chromium` (zie §2 en §5). |

### 4.2 Gedeclareerde theorie zonder test in de suite

| Theoriebron | Wat het claimt | Wat de repo dekt | Gevolg |
| --- | --- | --- | --- |
| `TESTPLAN.md` §11 dekkings-metric: elk productdoel G1–G10 en G13 heeft ≥1 bestaande testcase; geplande cases tellen niet | Volledige doeldekking | G5 (responsive), G7 (SEO), G9 (visual) en G10 (performance) hebben geen test: **4 van de 11 productdoelen, 36%**. G5 staat in §2 als high; R7 is in §9 de hoogste impact × waarschijnlijkheid. | De eigen metriek is niet gehaald, en de grootste risico's (R7, R8, R9) zijn precies de open punten. |
| `TESTPLAN.md` §4 pyramide en `BESTPRACTICES.md` §23: "Gebruik niet alles als E2E; unit/integration/API voor logica" | E2E als kern met een lagere laag eronder | Alle 131 tests zijn browser-E2E. `scripts/ci-summary.mjs` (formules, `no-report`, dedup op `runId`, `--max`) heeft geen enkele test; `src/ts/main.ts` wordt alleen via gemockte UI-cijfers gedekt (`PLAN-CI-HISTORY-TESTS.md` §2: laag B "**Nee**"). | De pyramide-basis is leeg. CIH-06 is het punt dat dit sluit: de uitvoeringsvorm (niet-browser project `unit` + `test:ci-summary`-poort vóór de browserinstall) is november 2026 vastgelegd in `PLAN-CI-HISTORY-TESTS.md` §7 en §10, de code volgt. |
| `TESTPLAN.md` §4: "E2E/acceptance: volledige gebruikersflows" als kern van de pyramide, en `CI-OVERVIEW.md` §5 (bestandsgids) als gereserveerde map | De E2E-laag als projectkern | Geen testcase, geen doel, geen fase, geen exit-criterium, geen testnaam; `playwright/tests/e2e/` is leeg. | De kernlaag van de pyramide is leeg. |
| `TESTPLAN.md` §5.4 Compatibility (⭐⭐⭐⭐) en §6.4/§7 cross-browser | Firefox en WebKit als risicogedekte engines | Alleen Chromium; `compatibility/` is leeg (fase 7). | Het testtype met de hoogste prioriteit heeft geen test. |
| `TESTPLAN.md` §5.4 Security (⭐⭐) | HTTPS, honeypot-check, ongewenste navigatie | Geen security-ID in de matrix en geen security-deliverable in §16. De honeypot-structuur is wél gedekt (F5, A11Y-01). | Type met een prioriteit en zonder testcase. |
| `TESTPLAN.md` §5.2 en §5.4 Performance (⭐⭐⭐) | Lighthouse ≥ 90/95/90/90, LCP < 2,5 s, CLS < 0,1, TBT < 200 ms | Lighthouse staat niet in `package.json`; PERF-01 is gepland. | De drempels bestaan, de meting bestaat niet. |
| `TESTPLAN.md` §5.4 Visual | VIS-01, `maxDiffPixelRatio` 0,01 | Geen baseline en geen dependency (fase 5). | Analoog. |
| `TESTPLAN.md` §5.4 Smoke: "kleine subset bij elke build/deploy" | Smoke draait bij elke build | De push-trigger in `playwright.yml` is uitgeschakeld en er is geen pre-deploy gate. Smoke draait één keer per nacht: 10 van de 80 tests. | De smoke-rol is niet als rol geconfigureerd; G12 is een open beslispunt. |
| `TESTPLAN.md` §5.3 en §12.4: exploratoire sessies en closure | Handmatige sessies op iOS/Android, lessons learned, open defecten met severity | Geen sessieregister, geen findingsregister, geen closure-log in de repo. | Gedeclareerde practice zonder artefact. |
| `TESTPLAN.md` §12.1, §12.4 en §14 DoD: defectbeheer | Issue met severity; een defect is geen testcase | De echte defects (raw `&` in `curriculum.html`, skip-link `tabindex`, de P2-a11y-fixes) staan als prose in de documentatie, zonder defect-ID en zonder link naar een testcase. | Geen defectregister en geen trace testcase ↔ defect. |
| `TESTPLAN.md` §13: reviewer "PR-review op testkwaliteit" | Reviews via PR's op de DoD | Er is geen PR-workflow: pushes gaan direct naar `main`, de history-commit komt van de bot, de CI is nightly + dispatch. | Een rol zonder proces. |
| `Obselete/REVIEW-TESTPLAN.md` regels 103–105, in `TESTPLAN.md` §3.3 en §15 opgenomen | Dekking per acceptatiecriterium, "not covered" expliciet | §15 mapt doel → testcase, niet criterium → testcase. "Non-functioneel binnen drempels" (§3.3) is nu onmeetbaar. | De dekkingsmetriek staat op doelen, niet op criteria. |
| `TESTPLAN.md` §7 scenarios S1–S6 en §5.5 "decision table / scenario testing" | Zes gebruikersflows en een condities-acties-tabel op het formulier | Geen flow-test (`e2e/` leeg); de F-matrix is een casolijst zonder condities × acties; de scenario's staan niet in de traceability. | De scenario-laag is narratief en niet getest. |
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
  §15), de preflight `npm run check:site` en de drie kwaliteitspoorten vóór de tests** — in
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
- A11Y-01…04 als structurele Playwright-suite (17 tests).
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
- Waarheidsvulling stap 1: README (CI-run 63/63), PLAYWRIGHT §10 (80 tests), TESTPLAN
  §6.3 (1920×1080), §5.5 (BVA), §7 F6, §10 fase 2, §4 (`.open`-bullet),
  `CI-OVERVIEW.md` §12 punt 3 (`e2e/`) en `eslint.config.mjs` (`networkidle`).

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
- **CI-uitvoering van de 131-suite is een open punt**: de history-record staat op
  63/63 (run 71) en de 131-suite heeft nog niet op de live site gedraaid. De
  browserinstall in de CI is in deze ronde wél teruggebracht naar Chromium
  (`playwright.yml`: `--with-deps chromium`), zodat een dispatch-run met het nieuwe
  workflow-bestand de 131-suite én de Chromium-install in één keer kan bewijzen.

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
3. **CIH-06** als `test:ci-summary`-poort op `scripts/ci-summary.mjs` — **de volgende
   stap**: vult de lege pyramide-basis (audit §4.2) en is de eerste niet-browser test in
   de repo. De uitvoeringsvorm is november 2026 **vastgelegd** (Playwright-runner in een
   niet-browser project `unit`, `playwright/tests/unit/ci-summary.spec.ts`, poort vóór de
   browserinstall — `PLAN-CI-HISTORY-TESTS.md` §7 en §10); de code is de eerstvolgende
   bouw. In deze ronde staan de scoping en de chromium-only browserinstall in de werkbom.
   Daarna CIH-07 (schema v2) en CIH-08 (a11y CI-sectie).
4. **De E2E-laag: flow-tests voor S1–S6** in `playwright/tests/e2e/`, met een doel (G14),
   ID's, een plaats in de §15-traceability en de F-matrix als decision table. Besluit vooraf,
   omdat dit de pyramide-top vult en `functional/` deels raakt.
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
