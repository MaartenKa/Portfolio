# CI/CD Playwright — overzicht in gewone taal

> **Doel van dit bestand:** het CI/CD-proces van deze repo uitleggen zoals je het aan
> een collega uitlegt die er voor het eerst naar kijkt: wat er gebeurt, waarom, en
> **welk bestand** er precies bij betrokken is.
>
> **Voor wie:** voor gesprekken over je portfolio (uitleg zonder CI-achtergrond), en
> voor bezoekers van `automation.html` die zich afvragen waar die cijfers vandaan
> komen.
>
> **Relatie tot de andere docs:** dit is de uitleg plus de bestandsgids. De
> technische specificatie (schema's, JSON-velden, exacte CI-stappen, lokale
> verificatie) staat in `CI-PLAYWRIGHT-HISTORY.md`. Projectdoc: `PLAYWRIGHT.md`.
> Testopzet: `TESTPLAN.md`. Methodiek: `BESTPRACTICES.md`.

## 1. De kortste versie

Elke nacht om **18:17 UTC** draait GitHub Actions mijn Playwright-tests tegen de live
GitHub Pages-site. Een eigen script vertaalt de rauwe testrapportage naar een
compacte geschiedenis-JSON. De CI-bot commit die JSON terug naar de repo, GitHub
Pages publiceert hem opnieuw, en mijn eigen site toont daar de kaarten,
QA-aggregaten en de history-tabel op `automation.html`.

Zonder backend. Zonder database. Zonder API-token. De site rapporteert over haar
eigen tests.

Deze keten is in productie bewezen: één run, drie artifacts, een bot-commit met
`[skip ci]`, direct daarna een Pages-deploy, en de kaarten gevuld in de browser.
De cijfers per schakel staan in `CI-PLAYWRIGHT-HISTORY.md` §15.

## 2. De analogie: een winkel met een eigen kwaliteitscontroleur

| In de winkel | In dit project |
| --- | --- |
| De winkel staat in de straat | De statische site in `docs/` op GitHub Pages |
| 's Nachts komt de controleur binnen | GitHub Actions start de Playwright-suite |
| De controleur vult een inspectieformulier in | Playwright schrijft `playwright/test-results/report.json` |
| Hij noteert de uitslag in het dagboekje | `scripts/ci-summary.mjs` → `docs/data/playwright-history.json` |
| Het dagboekje gaat in de etalage | De bot pusht de JSON, GitHub Pages publiceert hem |
| Klanten lezen de uitslag bij binnenkomst | `src/ts/main.ts` fetcht de JSON en vult de kaarten |

Het ongewone aan dit project: de etalage is tegelijk het kantoor. Het dagboekje
staat in dezelfde map als de website, dus één commit van de bot is tegelijk "data
bijhouden" én "site publiceren".

## 3. De zeven rollen

| Rol | Wie of wat | Wat die doet |
| --- | --- | --- |
| Wekker | `schedule` in `playwright.yml` | Start de job dagelijks om 18:17 UTC |
| Handmatige knop | `workflow_dispatch` | Jij start een run vanaf GitHub |
| Werkplaats | `runs-on: ubuntu-latest` | Een tijdelijke Linux-computer, per run leeg en daarna weg |
| Uitvoerder | Playwright via `npm run test` | Opent Chromium en draait de suite op de live site |
| Verslaggever | HTML- en JSON-reporter | HTML-rapport voor mensen, JSON voor machines |
| Rekenmeester | `scripts/ci-summary.mjs` | Maakt van één run één rij in het dagboekje |
| Postbode | `git`-stap als `github-actions[bot]` | Zet de JSON terug op `main`, zodat Pages publiceert |

## 4. De reis van één run, stap voor stap

1. **Trigger** — de wekker (cron) of jij via `workflow_dispatch`.
2. **Repo pakken** — `actions/checkout@v7`: een verse kopie op een lege machine.
3. **Node.js neerzetten** — `actions/setup-node@v7` met
   `node-version-file: package.json`: de range uit `engines.node` (>=24.8, <25).
4. **Dependencies** — `npm ci`: exact uit `package-lock.json`, geen verrassingen.
5. **Type-check** — `npm run typecheck` (`tsc --noEmit`): tests én site-JS in één
  poort, vóórdat er een browser wordt gedownload.
6. **Lint** — `npm run lint` (ESLint 10, flat config `eslint.config.mjs`,
   inclusief `eslint-plugin-playwright`, met `--max-warnings=0`: elke
   warning is een rode poort).
7. **HTML-validate** — `npm run validate:html` (`docs/**/*.html`): de structuur
   van alle 10 site-pagina's (testcase HTML-01).
8. **Browser** — `npx playwright install --with-deps`: Chromium plus de
   Linux-bibliotheken die Chromium nodig heeft.
9. **Tests** — `npm run test` → `playwright test`. De suite gaat naar
   `https://maartenka.github.io/Portfolio/`, dus de live site en niet lokaal.
10. **Rapporten ontstaan** — `playwright/playwright-report/` (HTML) en
    `playwright/test-results/report.json` (JSON).
11. **Bewaren** — drie artifacts: `playwright-report`, `playwright-json-report` en
    `playwright-history`, elk 30 dagen.
12. **Dagboekje vullen** — `node scripts/ci-summary.mjs`, met
    `CI_SUMMARY_STATUS: ${{ job.status }}` in de environment.
13. **Terugsturen** — de bot commit `chore(ci): update Playwright history [skip ci]`
    en pusht naar `main`.
14. **Publiceren** — GitHub Pages bouwt `docs/` opnieuw, inclusief de nieuwe JSON.
15. **Tonen** — de volgende bezoeker van `automation.html` ziet de nieuwe cijfers.

Stap 5 t/m 7 (de poorten) staan bewust vóór stap 8: een rode poort kost geen
browserdownload. Stap 11 en 12 draaien ook **als een eerdere stap faalt**, door
`if: ${{ !cancelled() }}`. Een rode run verdwijnt dus niet, die wordt
geregistreerd — ook een run die door de lint- of HTML-poort werd gestopt. Dat is
de bedoeling: een dashboard dat ook de slechte dagen laat zien.

## 5. Bestandsgids: alles wat bij dit proces hoort

Paden zijn relatief aan de repo-root (`Portfolio/`).

### 5.1 Root-bestanden (de regie)

| Bestand | Rol in één zin | Wat het met CI te maken heeft | Risico bij aanpassen |
| --- | --- | --- | --- |
| `package.json` | Opdrachtenlijst en dev-afhankelijkheden (`@playwright/test`, `typescript`, `http-server`, `@types/node`) | CI roept `npm ci` en `npm run test` op; `"test": "playwright test"` is dus hét CI-commando | Commando hernoemen → de workflow-stap faalt |
| `package-lock.json` | De exacte versie-lock | `npm ci` weigert te draaien zonder lockbestand; dit maakt CI reproduceerbaar | Handmatig aanpassen → `npm ci` crasht |
| `playwright.config.ts` | De speelwijze van de suite: `testDir`, reporters, retries, workers, `baseURL`, timeouts, trace/screenshot/video | Bepaalt wat er draait, én dat er een JSON-report komt waar `ci-summary.mjs` uit leest | JSON-reporter of `outputFile` veranderen → het dagboekje vult niet meer |
| `tsconfig.json` | Type-check-config (`noEmit`) voor `src/`, `playwright/tests`, `playwright/pages`, `playwright/utils`, `playwright/fixtures` en `playwright.config.ts` | Haalt tests en site in één type-check, lokaal én via `npm run build` | Map weglaten → typefouten blijven onopgemerkt |
| `tsconfig.site.json` | Bouwt uitsluitend `src/ts/` naar `docs/js/ts` | Dit is de build van de site-JS die de JSON rendert | `outDir` veranderen → `automation.html` mist zijn JS |
| `.gitignore` | Negeert `playwright/playwright-report/`, `playwright/test-results/`, `node_modules/`, `dist/`, `.env*` | Houdt de rauwe rapporten uit de repo; `docs/data/` blijft wél getrackt | `docs/data/` per ongeluk negeren → de site krijgt een 404 op de fetch |
| `.htmlvalidate.json` | HTML-regels (`html-validate:recommended`, lowercase doctype, selfclosing voids) | Bewaakt de HTML van `docs/*.html`, dus ook de `data-testid`-ankers van de CI-sectie | Regels versoepelen → kapotte HTML die de UI-tests niet vangen |
| `eslint.config.mjs` | ESLint 10 flat config: `src/`, `playwright/` en `scripts/`, met de Playwright-plugin op de testbestanden | `npm run lint` is een van de drie poorten vóór de tests in de workflow | Config weglaten of rules uitzetten → de lint-poort in CI faalt of maskeert defects |
| `playwright.local.config.ts` | Lokale override van de speelfile-config: neemt `playwright.config.ts` over en zet `baseURL` op `http://127.0.0.1:8080/` | Draait de suite tegen de lokale `docs/`-build, wanneer de live site de nieuwe markup nog niet bevat | In CI gebruiken: dan test je lokaal in plaats van live |
| `AGENTS.md` | Wijsplaatje naar de relevante documentatie | Verwijst naar de docs in `Project-documentation/` | — |

### 5.2 De CI-kern: drie bestanden

#### `.github/workflows/playwright.yml` — de werkbeschrijving

De enige workflow in deze repo. Dit bestand bepaalt **wanneer**, **op welke machine**
en **met welke rechten**.

- `on:` → `schedule` met cron `"17 18 * * *"` (dagelijks 18:17 UTC) plus
  `workflow_dispatch` voor handmatig starten. De `push`-trigger staat bewust uit
  (volledig gecommentarieerd).
- `permissions: contents: write` → mag terugpushen naar de repo.
- `concurrency: playwright-${{ github.ref }}` met `cancel-in-progress: false` →
  twee runs pushen niet tegelijk naar dezelfde branch.
- `env: CI: "1"` → Playwright ziet dat het CI is, dus `retries: 2`, `workers: 1` en
  `forbidOnly: true` uit `playwright.config.ts` gaan op.
- Stappen: checkout → setup-node → `npm ci` → browsers installeren → `npm run test`
  → drie artifact-uploads → history-script → commit/push.
- De commit-stap draait alleen op `refs/heads/main`, zet `github-actions[bot]` als
  auteur, doet `git pull --rebase --autostash`, voegt alleen de history-JSON toe,
  commit alleen bij echte wijziging, en pusht naar `HEAD:${{ github.ref }}`.

#### `scripts/ci-summary.mjs` — de vertaler

Dit bestand bepaalt **wat er in het dagboekje komt te staan**.

- Argumenten: `--report=`, `--history=`, `--max=`. Standaard:
  `playwright/test-results/report.json`, `docs/data/playwright-history.json`, `30`.
- Rekent: `total = expected + flaky + unexpected`, `passed = expected + flaky`,
  `failed = unexpected`, `passRate = passed / total * 100`. `skipped` telt niet mee
  in de noemer; `total = 0` geeft `passRate = 0`.
- Leest de GitHub-omgeving: `GITHUB_RUN_ID`, `GITHUB_RUN_NUMBER`,
  `GITHUB_EVENT_NAME`, `GITHUB_REF_NAME`, `GITHUB_SHA` (afgekort naar 7 tekens),
  `GITHUB_SERVER_URL`, `GITHUB_REPOSITORY` en `CI_SUMMARY_STATUS`.
- Bouwt de run-URL uit server + repo + run-id; lokaal is er een fallback-URL naar de
  workflow-pagina.
- Normaliseert alles: geen negatieve getallen, `passRate` begrensd op 0–100,
  `conclusion` en `event` beperkt tot vaste toegestane waardes.
- Dedup op `runId`, nieuwe entry bovenaan, maximaal `--max` rijen, `updated` = het
  moment van genereren.
- **Faalt niet** als `report.json` ontbreekt of geen bruikbare `stats` heeft: dan
  schrijft hij nullen met `no-report` (of `unknown` als er wél stats zijn).

#### `docs/data/playwright-history.json` — het dagboekje

Het enige CI-resultaat dat daadwerkelijk in de repo staat. Dit bestand is de brug
tussen de CI en de site.

```json
{ "schemaVersion": 1, "workflow": "playwright.yml", "updated": null, "runs": [] }
```

- Bewust **leeg** in de repo. Het bestand móét bestaan, anders krijgt
  `automation.html` een 404 op de fetch, en die console error laat de eigen
  smoke-tests falen.
- Bevat per run: `runId`, `runNumber`, `createdAt`, `event`, `branch`, `commit`,
  `conclusion`, `total`, `passed`, `failed`, `flaky`, `skipped`, `passRate`,
  `durationMs`, `runUrl`.
- Publiek, en alleen CI-metagegevens: geen testschermen, console logs, screenshots
  of video's.

### 5.3 De site-kant (wat de cijfers toont)

| Bestand | Rol in één zin | Wat het met CI te maken heeft |
| --- | --- | --- |
| `docs/automation.html` | De pagina met de sectie **TESTRESULTATEN** | Bevat de shields.io-badge, vijf kaarten voor suite en laatste run, zes QA-aggregaatkaarten, de toelichtingsregel en de history-tabel, met de `data-testid`-ankers `ci-suite-size`, `ci-runs`, `ci-total-tests`, `ci-pass-rate`, `ci-status`, `ci-total-executed`, `ci-total-passed`, `ci-pass-ratio`, `ci-streak`, `ci-flaky-runs`, `ci-failed-runs`, `ci-metrics-note`, `ci-history-table` en `ci-history-body` |
| `src/ts/main.ts` | Bron-code van de site-JS | Fetch `data/playwright-history.json` met `cache: "no-store"`, normaliseert elke run, poolt de totalen (Σ `passed` / Σ `total`), berekent streak / flaky / failed, rendert de laatste 10 rijen. Werkt alleen op pagina's met `ci-history-body` |
| `docs/js/ts/main.js` | Het **gebouwde** resultaat van `main.ts` (via `tsconfig.site.json`) | Dit is wat de browser op GitHub Pages echt draait; het staat in de repo, dus Pages hoeft niets te bouwen |
| `docs/css/style.css` | Stijl van de site | `.automation-latest-grid`, `.automation-metrics-grid`, `.automation-history`, `.automation-history-table-wrap` (horizontaal scrollen op mobiel), `.automation-history-table` (minimaal 640px), `.sr-only` |
| `docs/index.html` | Home en navigatie | Linkt naar `automation.html`; de smoke-suite controleert die navigatie |
| `docs/robots.txt`, `docs/sitemap.xml` | Indexatiebeleid | Bewust `Disallow: /` plus `noindex, nofollow`, dus de CI-cijfers staan niet in zoekmachines |
| `docs/privacy.html` | Privacyverklaring | Sectie 9 legt uit dat de shields.io-badge één extern verzoek per pageview doet en geen persoonsgegevens bevat |

Twee dingen die opvallen:

1. **De site-JS wordt gecommit, niet door CI gebouwd.** De workflow draait géén
   `npm run build`. De build is een lokale stap, en `docs/js/ts/main.js` staat in de
   repo. Daardoor is de site die Pages serveert exact wat jij gebouwd hebt: geen
   verborgen CI-build-stap.
2. **De badge is niet de data.** De shields.io-badge toont de workflow-status
   (groen of rood). De kaarten en de tabel tonen testcijfers uit de JSON. Twee
   onafhankelijke bronnen, bewust gescheiden.

### 5.4 De test-kant (wat er gedraaid wordt)

| Bestand | Rol |
| --- | --- |
| `playwright/pages/base.page.ts` | Basis van alle page objects: console- én page-errors worden één keer per `page` geregistreerd (niet per `goto()`), `goto()` wacht op `networkidle`, `expectNoConsoleErrors()` assert dat de lijst leeg is |
| `playwright/pages/home.page.ts` | Page object voor de homepagina (CTA's, navigatie) |
| `playwright/pages/contact.page.ts` | Page object voor contact: formuliervelden, mock van Formward, check op privacy- en e-maillink (relatief `href`, want een absoluut pad geeft 404 op de `/Portfolio/`-subpath) |
| `playwright/pages/mobile.page.ts` | Mobiele menu-data: `NAV_ITEM_TEST_IDS` en `NAV_ITEM_URLS` |
| `playwright/utils/test-data.ts` | Gedeelde constanten: `FORMWARD_URL`, `THANK_YOU_PAGE`, `EMAIL`, `GITHUB_URL`, `LINKEDIN_URL` en `OTHER_PAGES_TO_TEST` (8 pagina's, waaronder `automation.html`) |
| `playwright/tests/smoke/smoke.spec.ts` | Deep check op `index.html` plus lightweight check op de overige pagina's, telkens zonder console errors |
| `playwright/tests/functional/homepage-functional.spec.ts` | CTA's en nav-links openen de juiste pagina's |
| `playwright/tests/functional/contact-functional.spec.ts` | Paginastructuur en formulierinzending (Formward gemockt; valide submit redirect naar `bedankt.html`) |
| `playwright/tests/functional/mobile-menu-functional.spec.ts` | Menu-toggle op desktop en mobiel, `aria-expanded`, focusbeheer, alle nav-links |
| `playwright/pages/ci-history.page.ts` | Page object `CiHistoryPage`: mockt `data/playwright-history.json` via `page.route()`, navigeert naar `automation.html`, leest kaarten per `data-testid` en de rijen van de history-tabel |
| `playwright/tests/functional/ci-history-functional.spec.ts` | Vijf tests over de CI-resultatensectie: laatste-run kaarten, gepoolde totalen en ratio, één rij per run met run-link, runs zonder noemer, en de lege staat. Testsoort en afbakening: `PLAN-CI-HISTORY-TESTS.md` |
| `playwright/tests/accessibility/`, `compatibility/`, `e2e/`, `regression/` | Nu lege mappen: de plek waar de volgende testcategorieën komen |
| `Project-documentation/` | `PLAYWRIGHT.md`, `TESTPLAN.md`, `BESTPRACTICES.md`, `CI-PLAYWRIGHT-HISTORY.md` en dit bestand |

Waarom `base.page.ts` zo belangrijk is voor de CI: de console-error check betekent
dat een kapotte fetch — bijvoorbeeld een ontbrekende history-JSON — de eigen tests
doet falen. Daarom moet `docs/data/playwright-history.json` in de repo bestaan. De
CI en de tests bijten elkaar hier niet, ze houden elkaar juist scherp.

## 6. De dataflow en de lus

```text
Playwright-run
  └─ JSON-reporter → playwright/test-results/report.json   (staat in .gitignore)
       └─ scripts/ci-summary.mjs
            └─ docs/data/playwright-history.json           (wél in de repo)
                 ├─ artifact op GitHub (30 dagen)
                 └─ git commit/push door de bot op main
                      └─ GitHub Pages publiceert docs/ opnieuw
                           └─ docs/js/ts/main.js fetcht de JSON
                                └─ automation.html toont kaarten en tabel
```

De lus sluit zichzelf: de CI schrijft naar een map van de site, en de site toont de
CI. Er is geen backend nodig, want het rapport is een statisch bestand vanaf
dezelfde origin.

### 6.1 Wat de cijfers betekenen

| Veld in `report.json` | Betekenis |
| --- | --- |
| `stats.expected` | Tests die in de **eerste** poging slaagden |
| `stats.flaky` | Tests die na een **retry** alsnog slaagden |
| `stats.unexpected` | Tests die hoorden te slagen en faalden |
| `stats.skipped` | Overgeslagen tests |
| `stats.duration` | Doorlooptijd in milliseconden |

```text
total    = expected + flaky + unexpected
passed   = expected + flaky
failed   = unexpected
passRate = (passed / total) * 100
```

Omdat CI met `retries: 2` draait, is "flaky" een eerlijke maat: een test die pas in
poging twee slaagt, telt mee als geslaagd, maar blijft zichtbaar als waarschuwing.
Voor een QA-portfolio is dat precies het verschil tussen "mijn CI is groen" en "ik
begrijp mijn CI".

### 6.2 Wat de kaarten en de tabel tonen

| Element | Bron |
| --- | --- |
| `ci-suite-size` — Suite omvang | Grootste `total` in de gelogde runs (proxy voor de suite-omvang) |
| `ci-runs` — Testruns | Aantal runs in de history (max 30) |
| `ci-total-tests` — Tests uitgevoerd (laatste run) | Laatste run: `total` |
| `ci-pass-rate` — Tests geslaagd (laatste run) | Laatste run: `passRate` |
| `ci-status` — Laatste test run | Laatste run: `conclusion` → Geslaagd / Gefaald / Geannuleerd / Geen rapport / Onbekend |
| `ci-total-executed` — Totaal uitgevoerde tests | Σ `total` over de gelogde runs met `total > 0` |
| `ci-total-passed` — Totaal geslaagd | Σ `passed`, getoond als `X van Y` |
| `ci-pass-ratio` — Geslaagde ratio | Σ `passed` / Σ `total` — het percentage bij de twee kaarten ervoor |
| `ci-streak` — Groene runs op rij | Aantal opeenvolgende `success` vanaf de nieuwste run |
| `ci-flaky-runs` — Flaky runs | Runs met minstens één flaky test |
| `ci-failed-runs` — Gefaalde runs | Runs met `conclusion = "failure"` **of** `failed > 0` |
| `ci-metrics-note` — Toelichting | Noemt het aantal meegerekende runs en Σ geslaagd / Σ uitgevoerd |
| `ci-history-table` — Laatste CI-runs | Laatste 10 runs: Run, Datum, Status, Tests, Geslaagd, Flaky |

`ci-pass-ratio` is bewust **geen** gemiddelde van de losse run-percentages. Een
gemiddelde geeft elke run evenveel gewicht, dus een afgebroken run van 5 tests
telt dan even zwaar als een volledige run van 36. De ratio hier is
Σ `passed` / Σ `total`, dus het percentage dat bij de twee totaal-kaarten ervoor
hoort. Runs met `total = 0` (geannuleerd, geen rapport) hebben geen noemer en
worden uit de totalen weggelaten; de `ci-metrics-note` zegt dan hoeveel runs wél
meetelden, bijvoorbeeld `2 van 3 CI-runs geteld`.

Zonder CI-data tonen de kaarten `—` en de tabel één rij met
`Geen CI-historie beschikbaar.`

## 7. Waarom de push-trigger uit staat (anti-recursie)

De workflow pusht zelf een commit naar `main`. Met een aanstaande `push`-trigger:

```text
run → commit → push → trigger → run → commit → push → ...
```

Daarom is `push:` in `playwright.yml` volledig gecommentarieerd en blijft de
workflow op `schedule` plus `workflow_dispatch`. Als tweede vangnet eindigt de
commit-tekst op `[skip ci]`.

| Mechanisme | Werking |
| --- | --- |
| `push`-trigger uit | De voornaamste afsnijding van de lus |
| `[skip ci]` in de commit-tekst | Extra sein, voor GitHub én voor mensen die de log lezen |
| `concurrency` | Geen twee pushes tegelijk op dezelfde branch |
| Commit alleen op `main` | Geschiedenis komt niet uit feature-branches |
| `git pull --rebase --autostash` | De bot werkt op een actuele basis, dus geen afwijzing |
| `git diff --cached --quiet` en dan pas `git commit`` | Alleen committen als er echt iets veranderde |

## 8. Wat er mis kan gaan, en hoe het afgevangen wordt

| Risico | Afvang in deze opzet |
| --- | --- |
| Tests falen | Upload- en history-stappen draaien door dankzij `!cancelled()`, conclusie wordt `failure` |
| Suite hangt | `globalTimeout: 10 * 60 * 1000` in `playwright.config.ts`: Playwright stopt zelf, zodat het HTML-rapport wél gegenereerd wordt |
| `report.json` ontbreekt | `ci-summary.mjs` schrijft nullen met `no-report`; de CI faalt er niet door |
| Runner mist een cron-trigger | `workflow_dispatch` als opvang, want GitHub's scheduler is best-effort |
| Twee runs botsen op `main` | `concurrency` plus `git pull --rebase --autostash` |
| JSON kapot of ongeldige data | `main.ts` normaliseert elke run en valt terug op placeholders, zonder console errors |
| JSON ontbreekt (404) | Het lege basisbestand staat in de repo; `main.ts` toont placeholders |
| Pages toont een oude JSON | `cache: "no-store"` in de fetch; de Pages-deploy blijft de bron |
| Flaky tests in CI | `retries: 2`, `workers: 1` en `trace: on-first-retry` |
| Onverwachte `runUrl` | `main.ts` toont alleen links die exact op de eigen runs-URL matchen |

## 9. Zelf draaien (lokaal)

```bash
npm run build                     # site-JS naar docs/js/ts/main.js + type-check
npm test                          # volledige suite
npm run test_smoke                # alleen de smoke-set
npm run test:ui                   # Playwright UI-modus
npx html-validate "docs/*.html"   # HTML-check van de site-pagina's
node scripts/ci-summary.mjs --report=playwright/test-results/report.json --history=docs/data/playwright-history.json --max=30
```

`npm test` draait standaard tegen `https://maartenka.github.io/Portfolio/`, want de
`baseURL` in `playwright.config.ts` wijst daar naartoe. Voor lokaal werk aan `docs/`
bestaat een ad-hoc `http-server`-variant: de `webServer`-blokken in
`playwright.config.ts` staan daarvoor gecommenteerd.

Een lokale run geeft overigens `conclusion: "unknown"`, omdat `CI_SUMMARY_STATUS`
daar ontbreekt, en de run-URL valt terug op de workflow-pagina. Die fallback-URL
toon de site niet als link: `main.ts` accepteert uitsluitend
`https://github.com/MaartenKa/Portfolio/actions/runs/<runId>`.

## 10. Begrippenlijst (als iemand tussentaal vraagt)

| Begrip | In gewone taal |
| --- | --- |
| CI/CD | Automatisch testen (CI) en publiceren (CD) |
| Workflow | YAML-bestand met de werkbeschrijving, in `.github/workflows/` |
| Runner | De tijdelijke computer die de werkbeschrijving uitvoert |
| Job | Een blok stappen op één runner |
| Stap | Eén commando of één actie binnen een job |
| Artifact | Bewaard bestand van een run, hier de rapporten, 30 dagen |
| Trigger | Wat de run start: tijd (cron), handmatig (dispatch), push of PR |
| Cron | Tijdsschema in UTC; GitHub's scheduler is best-effort |
| Pages | GitHub host statische bestanden als website, hier uit `docs/` |
| POM | Page Object Model: interactie in objecten, niet in tests |
| Flaky | Test die om de beurt slaagt of faalt; hier: geslaagd na een retry |
| Smoke test | Minimale set: werkt de basis überhaupt |
| Dedup | Dubbele rijen met dezelfde `runId` verwijderen |
| `no-store` | De browser mag de response niet uit de cache halen |

## 11. Bekende beperkingen (eerlijk naar bezoekers)

- De geschiedenis **start leeg**. De allereerste live-run is nodig voordat de kaarten
  echte cijfers tonen.
- Geen link per run naar het HTML-rapport, alleen de GitHub Actions run-link.
- Geen screenshots of video's op de site; die zitten in de artifacts.
- Alleen CI-runs in de tabel, geen lokale `npm test`-runs.
- GitHub's scheduler is best-effort. De workflow-comment meldt een meting van 2 runs
  uit 42 verwachte triggers (4 per uur), dus ongeveer 5% verlies. Met één dagelijkse
  run is een gemiste dag dus goed mogelijk.
- Nieuwe cijfers zijn pas na enkele minuten zichtbaar. Gemeten: de Pages-deploy
  zelf duurt rond de minuut, en GitHub Pages serveert met `max-age=600`, dus de
  JSON, de site-JS en de HTML kunnen tot tien minuten oud zijn. `cache: "no-store"`
  omzeilt de browsercache, niet de Pages-cache. Een harde reload na een deploy is
  dus normaal gedrag en geen bug.
- De HTML op de server bevat altijd de placeholders (`—` en
  `Geen CI-historie beschikbaar.`): de cijfers bestaan uitsluitend in de DOM nadat
  de site-JS de fetch heeft verwerkt. "Bron bekijken" toont daarom nooit cijfers.

## 12. Aandachtspunten uit deze rondgang

1. **Comment in `playwright.yml` en de cron zijn nu in lijn:** de comment zegt
   `18:17 UTC` en de cron is `"17 18 * * *"`. (Het was een achtergebleven
   `06:17 UTC`; `CI-PLAYWRIGHT-HISTORY.md` §5.1 had al het juiste uur.)
2. **Comment in `playwright.config.ts` is hersteld:** de regel zegt nu dat het
   HTML-rapport wél gegenereerd wordt als de suite hangt (het was een
   onleesbare zin geworden).
3. **`playwright/tests/accessibility/`, `compatibility/`, `e2e/` en `regression/` zijn
   lege mappen.** `TESTPLAN.md` beschrijft er al testcases voor, dus de CI-cijfers
   tonen nu alleen smoke en functioneel.
4. **`docs/js/ts/main.js` is een gebouwd bestand in de repo.** Na een wijziging in
   `src/ts/main.ts` moet `npm run build` gedraaid worden en het resultaat gecommit;
   de CI bouwt het niet.
5. **`ci-suite-size` is een proxy.** De kaart toont de grootste `total` uit de
   gelogde runs, niet de werkelijke suite-omvang. Die proxy blijft te hoog als de
   suite krimpt en te laag als de grootste run buiten de 30-run window valt. Plan:
   een `suiteTests`-veld in schema v2, geteld uit de JSON-report zelf — zie
   `PLAN-CI-HISTORY-TESTS.md` §7.
6. **De producerende kant heeft geen eigen test.** `scripts/ci-summary.mjs` wordt
   lokaal ad-hoc gecontroleerd; er draait geen geautomatiseerde test op de
   report→history-vertaling. De weergavelaag is wél gedekt door
   `ci-history-functional.spec.ts`. Plan: CIH-06 in `PLAN-CI-HISTORY-TESTS.md`.
7. **De suite draait tegen de live site.** Nieuwe UI-tests slagen pas ná deploy plus
   de cache-periode uit §11. Voor lokaal werk aan `docs/` staat er een vaste
   hulpm-config in de repo: `playwright.local.config.ts` (`npm run test:local`,
   poort 8080).
8. **Kwaliteitspoorten draaien vóór de tests in de workflow.** `npm run typecheck`
   (`tsc --noEmit`), `npm run lint` (ESLint 10 met `eslint.config.mjs`) en
   `npm run validate:html` (alle 10 pagina's slagen). Ze staan vóór de
   browserinstall, zodat een rode poort de run direct en goedkoop stop.
   Zie `TESTPLAN.md` §11 (entry-criteria) en §10 fase 6.



## 13. Landkaart van de documentatie

| Bestand | Beantwoordt |
| --- | --- |
| `CI-OVERVIEW.md` (dit bestand) | Hoe werkt het in gewoon taalgebruik, en welk bestand doet wat |
| `CI-PLAYWRIGHT-HISTORY.md` | Hoe zit het exact in elkaar: schema's, velden, CI-stappen, verificatie |
| `PLAYWRIGHT.md` | Hoe is het testproject opgebouwd: structuur, POM, conventies, commando's |
| `TESTPLAN.md` | Wat er getest moet worden, en wat er al is |
| `PLAN-CI-HISTORY-TESTS.md` | Testsoort van de CI-history tests, de plaats ervan in `TESTPLAN.md` en de roadmap |
| `BESTPRACTICES.md` | Hoe je goed test: ISTQB en Playwright methodiek |
| `AGENTS.md` | Welke documentatie relevant is |
