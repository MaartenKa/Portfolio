# Plan — CI-history tests: testsoort, plaats in het testplan en roadmap

> **Doel van dit bestand:** vastleggen wat voor soort test
> `ci-history-functional.spec.ts` is, waar hij in `TESTPLAN.md` hoort, en wat er
> nog moet gebeuren om de CI-resultatensectie volledig te dekken.
>
> **Ontstaan:** de CI-resultatensectie op `automation.html` is gebouwd (pooled
> ratio, suite- en aggregate-kaarten) en vijf tests zijn geschreven. Op de vraag
> "is dit echt een functionele test?" geeft `TESTPLAN.md` geen antwoord: de
> sectie, de tests en het bijbehorende doel ontbreken daar.
>
> **Relatie tot de andere docs:** `CI-PLAYWRIGHT-HISTORY.md` is de technische
> specificatie (schema's, velden, CI-stappen; §15 = het productiebewijs),
> `CI-OVERVIEW.md` is de uitleg in gewone taal, `TESTPLAN.md` is de bestaande
> strategie en `PLAYWRIGHT.md` is de projectdoc. Dit bestand is het **plan**: het
> beschrijft voorstellen en aannames, geen feiten die al in de andere docs staan.
>
> **Status:** document, november 2026. De uitvoeringsvorm van CIH-06/07 is **gebouwd**:
> de Playwright-runner in het niet-browser project `unit`
> (`playwright/tests/unit/ci-summary.spec.ts`, 9 tests inclusief CIH-07) met
> `npm run test:ci-summary` als CI-poort vóór de browserinstall en de gate-config
> `playwright.unit.config.ts`. De TESTPLAN-wijzigingen in §6 zijn doorgevoerd. De
> datasuite is lokaal gemeten: 9/9 groen, `npm run check` groen en de suite telt
> 148 tests in 12 spec-bestanden (139 browser + 9 datasuite, inclusief de E2E-laag). Run 72 zette de poort in de CI: de datasuite en de
> Chromium-install concludeerden success vóór de browserinstall, en de teststap gaf
> `Running 139 tests` met een record van `total = 139` (135 geslaagd, 4 faalden — RESP-01
> op de runner-fonts, niet de datasuite). Run 73 draaide de volledige suite groen: 139/139
> en `passRate` 100. CIH-07 (schema v2) is gebouwd; CIH-08 (a11y) volgt.

## 1. De vraag en het korte antwoord

Vraag: is `playwright/tests/functional/ci-history-functional.spec.ts` een
functionele test, of hoort hij bij een ander testtype?

**Antwoord in één regel:** het is een **functionele UI-test op systeemniveau met
een datamock** — hij test de weergavelaag, niet de CI-pipeline.

Dat tweede deel is de kern van het antwoord. De test bewijst dat `main.ts` de
cijfers juist maakt; hij bewijst niet dat de CI die cijfers produceert, commt of
publiceert.

## 2. Drie lagen, drie testsoorten

De feature is één keten met drie afzonderlijk testbare lagen, en elke laag heeft
een eigen juiste testsoort.

De feature is één keten met drie afzonderlijk testbare lagen, en elke laag heeft
| --- | --- | --- | --- | --- |
| **A — Weergave** | `src/ts/main.ts` + `docs/automation.html` | JSON → kaarten, totalen, ratio, tabel, lege staat, `suiteTests`-kaart en `max(total)`-valback | Functioneel (systeemniveau), met `page.route()`-mock | **Ja** — 7 tests |
| **B — Data** | `scripts/ci-summary.mjs` | `report.json` → history-entry: formules, `no-report`, dedup, `--max`, schema v2 en `suiteTests` | Component-/unittest van een Node-script, zonder browser | **Ja** — 9 tests in `playwright/tests/unit/ci-summary.spec.ts` (CIH-06a…h, CIH-07 datasuite), browserloos project `unit` |
| **C — Keten** | workflow → bot-commit → Pages → browser | dat de cijfers echt live verschijnen | E2E/acceptance van de CI zelf | **Nee voor schema v2** — wel handmatig bewezen voor schema v1 (`CI-PLAYWRIGHT-HISTORY.md` §15, §15.1 en §15.2, met runs 72 en 73 van de 139-suite) |

Waarom de mock in laag A bewust is: zonder mock hangt elke verwachting af van wat
er die nacht in de CI draaide. Dat is niet deterministisch en botst met de
determinisme-eis in `TESTPLAN.md` §6.2 (en exit-criterium 5 in §11). Met de mock
staan de verwachte cijfers vast
(120 / 108 van 120 / 90%) en draait de test onafhankelijk van de live data.

## 3. Toetsing tegen de testtypen uit TESTPLAN §5

| Testtype in `TESTPLAN.md` | Past deze test? | Motivering |
| --- | --- | --- |
| Smoke / sanity (§5.1) | Nee | De test controleert berekeningen en notatie, niet "laadt de pagina" |
| Functioneel (§5.1) | **Ja** | Gebruikersgedrag: de site toont cijfers uit een data-bron; label, notatie en uitzonderingen zijn de specificatie |
| Component/DOM-laag (§4) | Deels | De asserts zijn DOM-asserts op `data-testid`, maar de bron is een gemockte endpoint — meer dan een pure DOM-check |
| Non-functioneel (§5.2) | Nee (nog) | De tabel heeft `<caption class="sr-only">`, `scope="col"` en `aria-hidden` iconen, maar daar staat geen a11y-assert op (CIH-08) |
| E2E / acceptance (§4) | Nee | Er wordt geen echte CI-flow doorlopen; de data komt uit een mock |
| Regression (§5.4) | Ja, als rol | Na de eerste groene run hoort de test in de regression-set; "regression" is hier de rol, niet het type |

ISTQB-inbedding (`TESTPLAN.md` §4.1 en §5.4): niveau **system**, type
**functioneel**, in de ISTQB-rol tegelijk onderdeel van de regression-set.
`TESTPLAN.md` §5.4 stelt zelf dat smoke, regression en confirmation beschrijven
_wanneer_ een test draait en niet _wat_ hij doet — precies waarom "functioneel"
het correcte label is en "regression-test" niet.

## 4. Wat de test wel en niet bewijst

| Bewijst wel | Bewijst niet |
| --- | --- |
| `total = expected + flaky + unexpected`, `suiteTests = total + skipped` en `passRate` per run, zoals de specificatie | dat `ci-summary.mjs` die velden correct berekent — dat is de datasuite CIH-06/07 in `playwright/tests/unit/ci-summary.spec.ts` (laag B, gebouwd) |
| De gepoolde ratio is Σ passed / Σ total, niet het gemiddelde van percentages | dat de workflow de history commt en pusht (laag C) |
| Runs met `total = 0` vallen buiten de totalen en de notering zegt `2 van 3 CI-runs geteld` | dat GitHub Pages de JSON publiceert (laag C) |
| Eén rij per run, met een link die alleen op de eigen runs-URL reageert | dat de live site de nieuwe markup al bevat (laag C) |
| De lege toestand: `—` overal en `Geen CI-historie beschikbaar.` | a11y van de sectie (geen axe-core, geen toetsenbord-assert) |
| Geen console errors bij een lege of gemockte response | schaalgedrag bij 30 runs (alle mock-data is 3 runs) |

Een bezoeker die alleen naar de groene suite kijkt, ziet dus de helft van de keten
gedekt. Dat is de belangrijkste conclusie van dit plan.

## 5. Voorgestelde testcase-reeks CIH

ID-conventie volgt `TESTPLAN.md` §8: korte gefocuste cases met een reeks-ID per
doeleiding (SM, NAV, F, MENU, RESP, A11Y, SEO, LINK, IMG, VIS, PERF, HTML).

| ID | Testcase | Laag | Status |
| --- | --- | --- | --- |
| CIH-01 | Laatste-run kaarten tonen de nieuwste run (suite-omvang, testruns, `total`, `passRate`, status) | A | **bestaand** |
| CIH-02 | Aggregate kaarten poolen alle runs; ratio = Σ passed / Σ total; streak, flaky, failed | A | **bestaand** |
| CIH-03 | Eén rij per run, met een werkende en veilige run-link | A | **bestaand** |
| CIH-04 | Runs zonder noemer (`total = 0`) vallen buiten de totalen, met de notering `2 van 3 CI-runs geteld` | A | **bestaand** |
| CIH-05 | Lege geschiedenis: placeholders en de placeholder-rij, zonder console errors | A | **bestaand** |
| CIH-06 | `ci-summary.mjs`: vaste `report.json` → juiste entry; formules, `no-report`, dedup op `runId`, `--max` | B | **gebouwd** (nov 2026) |
| CIH-07 | Schema v2: `suiteTests` vult `ci-suite-size`; entries zonder veld vallen terug op `max(total)` | A+B | **gebouwd** (nov 2026), CI-productiebewijs open |
| CIH-08 | a11y van de CI-sectie: `caption`, `scope="col"`, `aria-hidden` iconen, tabellezing | A | **te bouwen** (fase D) |

## 6. Voorgestelde wijzigingen in TESTPLAN.md — **doorgevoerd** (nov 2026)

| Paragraaf | Voorstel |
| --- | --- |
| §2 Doelstellingen | Nieuw doel **G13**: "De CI-resultatensectie toont correcte cijfers uit de history-JSON, inclusief de uitzonderingen" — type: functioneel |
| §3.1 In scope | De CI-sectie van `automation.html`: kaarten, noteringsregel en history-tabel, inclusief de mock van `data/playwright-history.json` |
| §5.1 Functioneel | Nieuwe bullet **CI-resultatensectie** — zie CIH-01…CIH-05 (bestaand) |
| §8 Testmatrix | Nieuwe subsectie **8.5 CI-resultatensectie (G13)** met de CIH-tabel uit §5 van dit plan |
| §9 Risico-analyse | Nieuw risico **R13**: "De CI-sectie toont onjuiste of verouderde cijfers, of de producerende kant faalt stil" — impact middel, waarschijnlijkheid middel; mitigatie CIH-01…05 (weergave), CIH-06 (data) en de artifact-telling in de CI-log (keten) |
| §11 Exit criteria | Onder "Functioneel" toevoegen: CIH-01…CIH-05 groen |
| §15 Traceerbaarheid | **G13** → CIH-01…CIH-05, en CIH-06 zodra gebouwd |
| §10 Roadmap | Fase 6 (CI/CD) uitbreiden: "history-data gedekt door CIH-06, weergave door CIH-01…05" |
| §5.5 en §10 (verwijzingen naar "G1–G12") | Bereik optrekken naar **G1–G13**, en in §15 de traceerbaarheidstabel onder G12 aanvullen met G13 |

Bewust niet in `TESTPLAN.md` opnemen: de CI-keten zelf (laag C). Die blijft buiten
de Playwright-scope, want de suite draait tegen de live site en kan de eigen deploy
niet valideren. Laag C wordt gedekt door de drie artifacts als signaal, de
bot-commit in de git-log en `CI-PLAYWRIGHT-HISTORY.md` §15.

## 7. Roadmap

| Fase | Werk | Waarom | Risico |
| --- | --- | --- | --- |
| **A — klaar** | Pooled ratio, `Totaal uitgevoerde tests`, `Totaal geslaagd`, `Suite omvang`, notering, 7 UI-tests, vaste lokale hulpm-config | De kaarten beantwoorden "mijn suite slaagt voor X%" op één consistente manier | — |
| **B — gebouwd** | **CIH-06**: datasuite op `scripts/ci-summary.mjs` — 9 tests in `playwright/tests/unit/ci-summary.spec.ts` inclusief CIH-07, niet-browser project `unit`, poort `npm run test:ci-summary` vóór de browserinstall, gate-config `playwright.unit.config.ts` | De UI is gedekt, de producerende kant was niet gedekt. Een rekenfout geeft een groene suite én onjuiste kaarten | Laag — geen browser; de CI-poort is toegevoegd en met CIH-06 in runs 72 en 73 gedraaid; CIH-07 is nog niet in de CI bewezen |
| **C — gebouwd** | **CIH-07 schema v2**: `suiteTests` in de entry, geteld uit de JSON-report; UI kiest de laatste niet-lege `suiteTests` en valt terug op `max(total)` voor entries zonder veld | `ci-suite-size` is geen proxy meer voor schema v2; legacy schema v1-entries blijven renderen | Middel — schema-wijziging; CI-bewijsrun voor schema v2 staat nog open |
| **D** | **CIH-08** a11y van de CI-sectie, samen met de A11Y-fase uit `TESTPLAN.md` | De CI-sectie is de meest dynamische plek van de site en dus de meest a11y-gevoelige | Laag |
| **E** | Productiebewijs herhalen na fase B en C | De keten is bewezen in run #42, in run 72 (de 139-suite met de poort) en in run 73 (139/139 groen); na een schema-wijziging is een nieuwe dispatch-run nodig | — |

### Opzet voor CIH-06 (fase B)

Geen browser. Het principe is hetzelfde als de UI-mock: vaste input, vaste
verwachting.

```text
fixture report.json (temp)  ->  node scripts/ci-summary.mjs  ->  history.json (temp)
                                                                    |
                                                                    v
                                                          asserties op de entry
```

Cases: `total` / `passed` / `failed` / `flaky` uit `stats`; `suiteTests = total + skipped`; `passRate`-afronding;
`total = 0` → `passRate` 0 met de juiste `conclusion`; ontbrekende report →
`no-report`; `CI_SUMMARY_STATUS` → `conclusion`; dedup op `runId`; `--max` kapt bij;
de decoding van de CLI-args met de run-URL uit de CI-omgeving, schema v2 en `suiteTests`.
Uitvoering (gebouwd november 2026): de **Playwright-runner zonder browser** — project
`unit` in `playwright.config.ts` en `playwright.local.config.ts`, met geen
`devices`-use en geen `page`-fixture, dus geen browserstart. De 9 cases (CIH-06a…h + CIH-07 datasuite)
staan in `playwright/tests/unit/ci-summary.spec.ts`, zodat `npx playwright test --list`
de cases meetelt (148 tests in 12 files) en de traceability in `TESTPLAN.md` §15 bij
één telling blijft. Elke test bouwt een eigen temp-map: `docs/data/playwright-history.json`
blijft onaangeraakt. Het npm-script `test:ci-summary` draait de cases via de aparte
gate-config `playwright.unit.config.ts` (eigen `outputDir`, alleen de `list`-reporter,
`retries: 0`) als **poort vóór de browserinstall** in `playwright.yml`, in lijn met
`TESTPLAN.md` §11 waar typecheck, lint en html-validate al zo'n poort zijn — de suite-
rapporten blijven daardoor schoon voor `ci-summary.mjs`. Een kaal Node-script met eigen
asserts is
het alternatief; het is niet gekozen, omdat die cases dan buiten de suite-telling en
de traceability vallen.

## 8. Openstaande kleine punten

| # | Punt | Waar | Status |
| --- | --- | --- | --- |
| 1 | Cron-comment zei "om 06:17 UTC", cron is `17 18 * * *` | `.github/workflows/playwright.yml` regel 4 | **Opgelost** (comment zegt 18:17 UTC); zie `CI-OVERVIEW.md` §12.1 |
| 2 | `ci-suite-size` is `suiteTests` uit schema v2, met `max(total)` als valback voor legacy entries | `src/ts/main.ts` + `scripts/ci-summary.mjs` | **Afgebouwd (nov 2026)**: producer en UI geïmplementeerd; CI-bewijs voor schema v2 nog open |
| 3 | Geen test op `ci-summary.mjs` | `scripts/` | **Afgebouwd (nov 2026)**: fase B gebouwd — 9 tests in `playwright/tests/unit/ci-summary.spec.ts` inclusief CIH-07, project `unit`, poort `npm run test:ci-summary`, gate-config `playwright.unit.config.ts`; lokaal 9/9 groen |
| 4 | Lege mappen `compatibility/`, `regression/`; `accessibility/` is gevuld met de suite (17 tests); `unit/` is gevuld met de datasuite CIH-06/07 (9 tests) | `playwright/tests/` | `TESTPLAN.md` fase 4 (RESP/SEO/LINK/IMG) en fase 5–7 |
| 5 | Typo in de config-comment ("ont geeneret") | `playwright.config.ts` regel 9 | **Opgelost** (leesbare zin) |
| 6 | Raw `&` in `curriculum.html` | `docs/curriculum.html` | **Opgelost** (`&amp;`); html-validate draait als CI-poort en is groen op alle 10 pagina's |
| 7 | `docs/js/ts/main.js` moet handmatig gebouwd en gecommit worden | `npm run build` | Gedocumenteerd in `CI-OVERVIEW.md` §12.4 |
| 8 | Vier kwaliteitspoorten (typecheck/lint/html-validate/datasuite CIH-06/07) draaien nu vóór de tests | `playwright.yml`, `package.json`, `eslint.config.mjs`, `playwright.unit.config.ts` | **Uitgevoerd**; lokaal draait `npm run check` de drie checks en `npm run test:ci-summary` de datasuite |

## 9. Verificatieprotocol na een deploy

Volgorde die werkt, met de cache in gedachten (`CI-PLAYWRIGHT-HISTORY.md` §14):

1. `npm run build` en commit — de site-JS staat in de repo, Pages bouwt zelf niet.
2. Push naar `main` en wacht op `pages build and deployment` (rond de minuut).
3. Start `workflow_dispatch` — verwacht niet de cron: GitHub's scheduler is
   best-effort, en een scheduled run kan het oude workflow-bestand draaien
   (`CI-PLAYWRIGHT-HISTORY.md` §15, conclusie 2).
4. Tel de artifacts: drie = de nieuwe workflow, één = het oude bestand.
5. Zoek de bot-commit `chore(ci): update Playwright history [skip ci]`.
6. Wacht op de volgende Pages-deploy en houd rekening met `max-age=600`: tot tien
   minuten, daarna een harde reload.
7. Lees `docs/data/playwright-history.json` en vergelijk `schemaVersion`, `suiteTests` en de kaarten.

Voor werk vóór deploy: `playwright.local.config.ts` (zie `PLAYWRIGHT.md` §7).

## 10. Beslissingen vastgelegd

| Beslissing | Waarom |
| --- | --- |
| Pooled ratio (Σ passed / Σ total) in plaats van het gemiddelde van percentages | Een gemiddelde geeft een afgebroken run van 5 tests evenveel gewicht als een volledige run van 36; de pooled ratio is het percentage dat bij de twee totaal-kaarten hoort |
| Runs met `total = 0` buiten de totalen | `ci-summary.mjs` vult `passRate` op 0 als `total` 0 is; zo'n run heeft geen noemer en is geen meting van 0% |
| `ci-metrics-note` toont het aantal meegerekende runs | Zodat een bezoeker ziet wanneer de noemer kleiner is dan het aantal runs |
| Suite-omvang als eigen kaart met label "Suite omvang" | "Totaal uitgevoerde tests" is werkvolume over de runs; suite-omvang is een eigenschap van het project. Twee betekenissen van "tests" naast elkaar verwarren |
| Labels "(laatste run)" expliciet | De laatste-run kaart en de ratio-kaart zijn niet met elkaar te vergelijken |
| Mock boven live data in de UI-tests | Determinisme; de verwachting mag niet afhangen van wat er die nacht draaide |
| Datalaag en keten apart documenteren, niet in de UI-tests proppen | Eén testsoort per laag; een UI-test die ook de CI wil valideren wordt onbetrouwbaar en traag |
| CIH-06 in de Playwright-runner, als niet-browser project `unit` | De pyramide-basis blijft in dezelfde toolchain en in dezelfde telling: `npx playwright test --list` toont de cases en `TESTPLAN.md` §15 houdt één traceability-lijst. Geen browserstart, dus geen Pages- of deploy-afhankelijkheid |
| `test:ci-summary` als CI-poort vóór de browserinstall | De poort is geen browser-test; vóór de install valt een rekenfout goedkoop, in dezelfde keten als typecheck, lint en html-validate (`TESTPLAN.md` §11 entry-criteria) |
| CIH-07 in producer én UI, niet alleen UI | De UI mag niet gokken over suite-omvang; de producer telt `total + skipped`, de UI leest `suiteTests` en heeft `max(total)` als valback voor schema v1-entries |
| Schema v2 blijft backwards-compatible | Nieuwe entries zijn verrijkt met `suiteTests`; bestaande schema v1-entries blijven in de UI renderen zonder plotselinge `0 tests` |