# CI Playwright History — technische documentatie

> **Doel van dit bestand:** exact documenteren hoe de Playwright CI-resultaten,
> de history-tabel en de QA-aggregaatcijfers op `docs/automation.html` werken.
>
> **Bereik:** JSON-report van Playwright, GitHub Actions,
> `docs/data/playwright-history.json`, site-JS rendering en lokale verificatie.
>
> **Niet in scope:** screenshots/video-links, externe GitHub API-runs,
> Formward-resultaten, Sentry/Dashboards of een backend-database.
> **Voor de makkelijkere uitleg en de bestandsgids per bestand:** zie `CI-OVERVIEW.md`.

## 1. Resultaat op de website

Op `docs/automation.html` staat een sectie **TESTRESULTATEN** met:

1. De bestaande shields.io statusbadge.
2. Drie kaarten voor de laatste CI-run:
   - `data-testid="ci-total-tests"` — aantal uitgevoerde tests.
   - `data-testid="ci-pass-rate"` — slagingspercentage van de laatste run.
   - `data-testid="ci-status"` — status van de laatste run.
3. Vier QA-aggregaatkaarten over de laatste 30 CI-runs:
   - `data-testid="ci-streak"` — groene runs op rij.
   - `data-testid="ci-average-pass-rate"` — gemiddelde slagingsratio.
   - `data-testid="ci-flaky-runs"` — aantal runs met minstens één flaky test.
   - `data-testid="ci-failed-runs"` — aantal runs met `conclusion="failure"`
     of `failed > 0`.
4. Een history-tabel met de laatste 10 CI-runs:
   - `data-testid="ci-history-table"` — de tabel zelf.
   - `data-testid="ci-history-body"` — de body van de tabel.
   - Kolommen: `Run`, `Datum`, `Status`, `Tests`, `Geslaagd`, `Flaky`.

Zonder CI-data toont de pagina placeholders (`—`) en één tabelrij met
`Geen CI-historie beschikbaar.`

## 2. Dataflow

```
Playwright tests
  └─ Playwright JSON reporter
       └─ playwright/test-results/report.json
            └─ scripts/ci-summary.mjs
                 └─ docs/data/playwright-history.json
                      ├─ GitHub Actions artifact
                      └─ git commit/push naar de repo
                           └─ GitHub Pages publiceert de JSON
                                └─ docs/js/ts/main.js fetcht de JSON
                                     └─ automation.html toont kaarten + tabel
```

Belangrijk: de website heeft géén backend. De JSON is een statisch bestand dat
door GitHub Pages vanaf dezelfde origin wordt gepubliceerd.

## 3. Playwright JSON-report

In `playwright.config.ts` staan twee reporters:

```ts
reporter: [
  ["html", { outputFolder: "./playwright/playwright-report", open: "never" }],
  ["json", { outputFile: "./playwright/test-results/report.json" }],
],
```

- De HTML-report blijft de bekende Playwright-rapportage voor artifacts.
- De JSON-report is de machine-leesbare bron voor de CI-history.
- `playwright/test-results/` staat in `.gitignore`, dus `report.json` wordt niet
  zelf in de repo gecommit.

De JSON-report bevat onder andere `stats`:

| Playwright JSON-veld | Betekenis voor deze site                          |
| -------------------- | ------------------------------------------------- |
| `stats.expected`     | Tests die in de eerste poging slaagden.           |
| `stats.flaky`        | Tests die na een retry alsnog slaagden.           |
| `stats.unexpected`   | Tests die niet hoorden te falen en faalden.       |
| `stats.skipped`      | Tests die overgeslagen werden.                    |
| `stats.duration`     | Doorlooptijd in milliseconden.                    |

Berekende cijfers per run:

```text
total   = expected + flaky + unexpected
passed  = expected + flaky
failed  = unexpected
passRate = (passed / total) * 100
```

`skipped` wordt niet in de noemer van `passRate` meegenomen. Als `total` 0 is,
wordt `passRate` 0.

## 4. CI-script: `scripts/ci-summary.mjs`

Dit script zet één Playwright JSON-report om naar één history-entry en voegt die
toe aan de history-JSON.

Startcommando in CI:

```bash
node scripts/ci-summary.mjs \
  --report=playwright/test-results/report.json \
  --history=docs/data/playwright-history.json \
  --max=30
```

### 4.1 Invoer

Het script leest:

- `--report`: Playwright JSON-report. Standaard:
  `playwright/test-results/report.json`.
- `--history`: bestaande history-JSON. Standaard:
  `docs/data/playwright-history.json`.
- `--max`: maximaal aantal runs dat bewaard blijft. Standaard: `30`.

Als de report-JSON ontbreekt of geen bruikbare `stats` bevat, faalt het script
niet. Het schrijft een entry met nullen en:

- `conclusion` uit `CI_SUMMARY_STATUS` als die is gezet;
- `no-report` als `CI_SUMMARY_STATUS` ontbreekt en er geen bruikbare `stats`
  zijn;
- `unknown` als `CI_SUMMARY_STATUS` ontbreekt en er wél bruikbare `stats` zijn.

De `event`-waarde wordt beperkt tot `schedule`, `workflow_dispatch`, `push`,
`pull_request`, `repository_dispatch`, `no-report` of `unknown`.

### 4.2 Omgevingsvariabelen

Het script gebruikt GitHub Actions-variabelen:

| Variabele              | Gebruik                                          |
| ---------------------- | ------------------------------------------------ |
| `GITHUB_RUN_ID`        | `runId` en de veilige run-URL.                   |
| `GITHUB_RUN_NUMBER`    | `runNumber` in de tabel.                         |
| `GITHUB_EVENT_NAME`    | Trigger: `schedule`, `workflow_dispatch`, etc.   |
| `GITHUB_REF_NAME`      | Branch-naam, valt af op `main`.                  |
| `GITHUB_SHA`           | Commit-SHA, afgekort naar 7 tekens.              |
| `GITHUB_SERVER_URL`    | Basis-URL voor de run-link.                      |
| `GITHUB_REPOSITORY`    | Repository voor de run-link.                     |
| `CI_SUMMARY_STATUS`    | Conclusie van de CI-job: `success`, `failure`, `cancelled`. |

In de workflow wordt `CI_SUMMARY_STATUS` gezet op `${{ job.status }}`.

Het script heeft een fallback-run-URL voor lokale runs zonder GitHub Actions
omgeving:

```text
https://github.com/MaartenKa/Portfolio/actions/workflows/playwright.yml
```

Deze fallback-URL is geen run-URL. De site toont hem daarom niet als link; de UI
accepteert alleen `https://github.com/MaartenKa/Portfolio/actions/runs/<runId>`.

### 4.3 Output per run

Een history-entry bevat:

```json
{
  "runId": 123,
  "runNumber": 456,
  "createdAt": "2026-10-22T18:17:00.000Z",
  "event": "workflow_dispatch",
  "branch": "main",
  "commit": "abcdef1",
  "conclusion": "success",
  "total": 14,
  "passed": 13,
  "failed": 1,
  "flaky": 1,
  "skipped": 1,
  "passRate": 92.9,
  "durationMs": 12345,
  "runUrl": "https://github.com/MaartenKa/Portfolio/actions/runs/123"
}
```

`runId` en `runNumber` zijn `null` als de bijbehorende GitHub Actions-variabelen
ontbreken. `commit` kan een lege string zijn als `GITHUB_SHA` ontbreekt.

### 4.4 Geschiedenisbestand

`docs/data/playwright-history.json` heeft dit schema:

```json
{
  "schemaVersion": 1,
  "workflow": "playwright.yml",
  "updated": "ISO-8601 tijd of null",
  "runs": []
}
```

Het script:

1. Zet de nieuwe entry bovenaan.
2. Verwijdert een bestaande entry met dezelfde `runId`.
3. Bewaart maximaal `--max` runs, standaard 30.
4. Schrijft `updated` als het moment van genereren.

Deduplicatie op `runId` voorkomt dubbele runs als de workflow opnieuw dezelfde
run bijwerkt.

## 5. GitHub Actions workflow

Bestand: `.github/workflows/playwright.yml`.

### 5.1 Triggers

- `schedule`: één dagelijkse run om `18:17` UTC.
- `workflow_dispatch`: handmatig starten.
- `push`: staat bewust uit.

De push-trigger staat uit om CI-recursie en ongewenste automatische runs te
voorkomen. De history-commit gebruikt daarom commit-tekst met `[skip ci]`.

### 5.2 Permissies en concurrency

```yaml
permissions:
  contents: write

concurrency:
  group: playwright-${{ github.ref }}
  cancel-in-progress: false
```

- `contents: write` is nodig om `docs/data/playwright-history.json` te committen
  en te pushen.
- `concurrency` voorkomt dat meerdere runs op dezelfde ref tegelijk pushen.

### 5.3 Stappen

De relevante CI-stappen na `npm run test`:

1. **Upload Playwright HTML report**
   - artifact: `playwright-report`
   - path: `playwright/playwright-report/`
   - draait als `!cancelled()`.

2. **Generate Playwright history**
   - draait als `!cancelled()`.
   - `CI_SUMMARY_STATUS: ${{ job.status }}`.
   - voert `scripts/ci-summary.mjs` uit.

3. **Upload Playwright JSON report**
   - artifact: `playwright-json-report`
   - path: `playwright/test-results/report.json`
   - alleen als het bestand bestaat.

4. **Upload Playwright history**
   - artifact: `playwright-history`
   - path: `docs/data/playwright-history.json`
   - handig voor debugging van de gegenereerde JSON.

5. **Commit Playwright history**
   - alleen op `refs/heads/main`.
   - configureert de git-bot als author/committer.
   - doet `git pull --rebase --autostash origin ${{ github.ref }}`.
   - voegt `docs/data/playwright-history.json` toe.
   - commit alleen als er iets in de staged changes staat.
   - push naar `HEAD:${{ github.ref }}`.

Commit-tekst:

```text
chore(ci): update Playwright history [skip ci]
```

`[skip ci]` voorkomt dat de eigen history-commit een nieuwe Playwright-workflow
start.

## 6. Startbestand `docs/data/playwright-history.json`

Het bestand staat in de repo als:

```json
{
  "schemaVersion": 1,
  "workflow": "playwright.yml",
  "updated": null,
  "runs": []
}
```

Dit is bewust leeg. Het bestaat wél zodat de site bij het openen van
`automation.html` geen 404 op de fetch krijgt. Een 404 zou een console error
kunnen veroorzaken, en de Playwright smoke tests checken op console errors.

## 7. Site-JS: `src/ts/main.ts`

De site-JS rendert de CI-data alleen op pagina's met:

```html
<tbody data-testid="ci-history-body">
```

Op andere pagina's doet de CI-code niets.

### 7.1 Fetch

De code doet:

```ts
fetch("data/playwright-history.json", { cache: "no-store" })
```

Op GitHub Pages is de actuele URL daardoor:

```text
https://maartenka.github.io/Portfolio/data/playwright-history.json
```

`cache: "no-store"` vermindert het risico dat GitHub Pages een oude JSON toont
door browsercache.

Bij een niet-ok response, netwerkfout, ongeldige JSON of ontbrekende `runs`-array
valt de UI terug op placeholders:

- kaarten tonen `—`
- tabel toont `Geen CI-historie beschikbaar.`
- er worden geen console errors gelogd vanuit de afhandeling.

### 7.2 Data-validatie

Elke run wordt genormaliseerd:

- `conclusion` wordt beperkt tot `success`, `failure`, `cancelled`,
  `no-report` of `unknown`.
- numerieke velden worden veilig naar niet-negatieve gehele getallen gezet.
- `passRate` wordt begrensd op `0` tot `100`.
- `createdAt` wordt als string bewaard; ongeldige data toont `—` in de tabel.
- entries die geen object zijn, worden genegeerd;
- `runUrl` wordt alleen als link getoond als deze exact matcht op:

```text
https://github.com/MaartenKa/Portfolio/actions/runs/<runId>
```

Andere URLs worden genegeerd.

### 7.3 Rendering

- De laatste run vult de drie kaarten:
  - `Tests uitgevoerd`
  - `Tests geslaagd`
  - `Laatste test run`
- De laatste 30 runs vullen de aggregaatkaarten.
- De laatste 10 runs worden als tabelrijen getoond.
- Een run met `runNumber = null` toont `—` in de Run-kolom; met een veilige
  `runUrl` toont de cel `Run <nummer>` als link.
- Datums worden geformatteerd met `Intl.DateTimeFormat("nl-NL", { dateStyle:
  "medium", timeStyle: "short" })`.
- Percentages worden geformatteerd met `Intl.NumberFormat("nl-NL", {
  maximumFractionDigits: 1 })`, bijvoorbeeld `92,9%`.

Statuslabels:

| `conclusion` | UI-label       |
| ------------ | -------------- |
| `success`    | `Geslaagd`     |
| `failure`    | `Gefaald`      |
| `cancelled`  | `Geannuleerd`  |
| `no-report`  | `Geen rapport` |
| `unknown`    | `Onbekend`     |

## 8. CSS

De nieuwe stijlen staan in `docs/css/style.css`:

| Selector                             | Doel                                             |
| ---------------------------------- | ------------------------------------------------ |
| `.automation-latest-grid`          | Ruimte onder de laatste-run kaarten.             |
| `.automation-metrics-grid`         | Ruimte onder de QA-aggregaatkaarten.             |
| `.automation-history`              | Ruimte en kop voor de history-sectie.            |
| `.automation-history-table-wrap`   | Scrollbare, kaart-achtige omlijsting rond tabel. |
| `.automation-history-table`        | Tabelstijl, minimaal 640px breed.                |
| `.automation-history-table th/td`  | Celopmaak en onderverdelers.                     |
| `.automation-history-table a`      | Run-links in de tabel.                           |
| `.sr-only`                         | Verborgen tabel-caption voor screen readers.     |

De tabel blijft mobiel bruikbaar doordat `.automation-history-table-wrap`
horizontaal scrollt.

## 9. HTML en toegankelijkheid

De geschiedenis-tabel gebruikt een `<caption class="sr-only">` met de tekst:

```text
Geschiedenis van de laatste Playwright CI-runs
```

De tabelkoppen hebben `scope="col"`. De lege staat is expliciet als tabelrij met
`colspan="6"` geformuleerd. Externe run-links krijgen:

```html
target="_blank" rel="noopener noreferrer"
```

De bestaande shields.io-badge blijft de run-status van de workflow tonen. De
nieuwe kaarten en tabel tonen testcijfers uit de JSON-report; de badge toont géén
testcijfers.

## 10. Gebouwde site-JS

Bron:

```text
src/ts/main.ts
```

Output:

```text
docs/js/ts/main.js
```

Build:

```bash
npm run build
```

Deze build compileert de site-JS naar `docs/js/ts` en doet daarna een
type-check van alle TypeScript-bestanden.

## 11. Lokaal verifiëren

### 11.1 Build en HTML

```bash
npm run build
npx html-validate docs/automation.html
```

### 11.2 CI-script

Het CI-script kan lokaal met een Playwright JSON-report worden getest:

```bash
node scripts/ci-summary.mjs \
  --report=playwright/test-results/report.json \
  --history=docs/data/playwright-history.json \
  --max=30
```

Voor een geïsoleerde test kan een tijdelijke report/history in een temp-map
worden gebruikt, zodat de repo niet direct wordt aangepast.

### 11.3 Playwright-suite lokaal

De Playwright-suite zelf draait standaard tegen de live GitHub Pages-site.
Daarom zijn lokale `docs/`-wijzigingen niet volledig via `npm test` te verifiëren
vóór deploy.

Voor lokale verificatie is een ad-hoc Playwright-config gebruikt met
`baseURL: "http://127.0.0.1:3123/"` en `webServer.command: "npx http-server docs
-p 3123 -s"`. Die config staat in een temp-map en is niet als vaste tooling
committed.

Exacte commando's:

```bash
npx playwright test -c "C:\Users\Laptop\AppData\Local\Temp\opencode\playwright.local.json"
node scripts/ci-summary.mjs --report="C:\Users\Laptop\AppData\Local\Temp\opencode\playwright-local-report.json" --history="C:\Users\Laptop\AppData\Local\Temp\opencode\playwright-local-history.json" --max=30
```

De ad-hoc lokale run gaf:

```text
36 passed
```

Daarna genereerde `scripts/ci-summary.mjs` uit die lokale JSON-report een
tijdelijke history-entry met:

```text
total: 36
passed: 36
failed: 0
flaky: 0
passRate: 100
conclusion: unknown
```

`conclusion: unknown` is correct voor een lokale run zonder
`CI_SUMMARY_STATUS`; in GitHub Actions wordt `CI_SUMMARY_STATUS` gezet met
`job.status`.

### 11.4 UI lokaal met dummy history

Voor de UI is tijdelijk een dummy `docs/data/playwright-history.json` met 3 runs
gezet en een ad-hoc Playwright UI-check gedraaid. Daarna is de dummy history
teruggezet op de lege startstatus en het ad-hoc UI-checkscript verwijderd.

De dummy history gaf in de UI:

```text
ci-total-tests: 14
ci-pass-rate: 92,9%
ci-status: Geslaagd
ci-streak: 1
ci-average-pass-rate: 93,2%
ci-flaky-runs: 1
ci-failed-runs: 2
ci-history rows: 3
console errors: []
```

`ci-failed-runs` is daar `2` omdat de UI een run telt als gefaald wanneer
`conclusion === "failure"` óf `failed > 0`.

## 12. Live gedrag na deploy

Nadat de wijzigingen op `main` staan:

1. GitHub Pages publiceert de nieuwe statische bestanden.
2. Een Playwright CI-run genereert `report.json`.
3. `scripts/ci-summary.mjs` voegt een run-entry toe aan
   `docs/data/playwright-history.json`.
4. De workflow committer en pusht de history-JSON.
5. GitHub Pages publiceert de bijgewerkte JSON.
6. De volgende pagina-load van `automation.html` toont de nieuwe cijfers.

De allereerste live-run na deploy is dus nodig voordat de kaarten en tabel
echte CI-cijfers tonen.

## 13. Bewuste ontwerpregels

- De geschiedenis is lokaal/same-origin; er wordt geen GitHub API gebruikt als
  primaire data-source.
- De JSON is publiek en bevat alleen CI-metagegevens: run-id, run-nummer,
  datum, event, branch, commit-prefix, status, aantallen, percentage, duur en
  een veilige run-URL.
- Er worden geen testschermen, console logs, screenshots of video's in de JSON
  opgenomen.
- De UI mag niet crashen op ontbrekende, ongeldige of oude data.
- De UI mag geen console errors veroorzaken bij een ontbrekende fetch.
- De history-limit is bewust 30 runs; de tabel toont de laatste 10.
- De push-trigger blijft uit; alleen de workflow zelf committer history op `main`.

## 14. Bekende beperkingen

- De UI toont geen link naar de HTML-report per run; alleen de GitHub Actions
  run-link.
- De UI toont geen screenshots/video's.
- De UI toont geen geschiedenis van lokale `npm test`-runs, alleen van CI-runs.
- De geschiedenis start leeg; historische runs vóór deze feature zijn niet
  beschikbaar.
- Als Playwright vroegtijdig wordt afgebroken, kan `report.json` ontbreken. De
  workflow schrijft dan een entry met nullen en de job-status.
- GitHub Pages kan cache-effecten hebben; de fetch gebruikt `no-store`, maar de
  Pages-deploy zelf blijft de bron van de gepubliceerde JSON.