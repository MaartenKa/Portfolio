# Review — TESTPLAN.md en BESTPRACTICES.md

> **Status:** reviewdocument, november 2026.
> **Doel:** de bevindingen vastleggen vóór de herziening van
> `Project-documentation/TESTPLAN.md` en `Project-documentation/BESTPRACTICES.md`.
> Dit document is geen vervanging van het testplan; het beschrijft wat klopt,
> wat niet klopt en wat als eerste moet worden aangepast.

## 1. Methode en bewijs

De review is gebaseerd op een kruiscontrole van:

- `Project-documentation/TESTPLAN.md`
- `Project-documentation/BESTPRACTICES.md`
- `Project-documentation/PLAN-CI-HISTORY-TESTS.md`
- `README.md`
- de actuele suite in `playwright/tests/`
- `playwright.config.ts`, `playwright.local.config.ts` en `.github/workflows/playwright.yml`
- de site-markup in `docs/`

Uitgevoerde, niet-destructieve controles:

- `npm run check` → groen: `tsc --noEmit`, ESLint en html-validate slagen.
- `npx playwright test --list` → **41 tests in 5 spec-bestanden**.
- De volledige suite is in deze review niet opnieuw uitgevoerd, om de bestaande
  testartifacts niet te overschrijven. De suite-inhoud en testcount zijn via
  `--list` en de spec-bestanden geverifieerd.

## 2. Kort oordeel

Het testplan is **professioneel opgezet**, maar **niet perfect en niet actueel
genoeg om als coverage-bewijs te dienen**. De structuur en de meeste
ISTQB/ISO-elementen zijn aanwezig; de grootste zwakte is dat “bestaand” en
“gepland” door elkaar lopen. Meerdere claims kloppen niet met de suite, de
README of `PLAN-CI-HISTORY-TESTS.md`.

Samengevat:

| Aspect | Beoordeling |
| --- | --- |
| Structuur en scope | Sterk |
| ISTQB/ISO-elementen | Grotendeels aanwezig, enkele gaten |
| Feitelijke accuratesse | Onvoldoende op dit moment |
| Traceerbaarheid | Aanwezig, maar te grof en deels incorrect |
| CI/CD-beschrijving | Deels achterhaald en deels niet onderbouwd |
| BestPractices | Grotendeels correct, met enkele onnauwkeurigheden |

## 3. Wat goed is

- **Scope en doelstellingen:** heldere in/out-of-scope, G1–G13 en onderscheid
  tussen functioneel en non-functioneel.
- **Teststrategie:** testpiramide, testniveaus, testtypes en testtechnieken
  worden benoemd.
- **ISTQB-technieken:** equivalence partitioning, boundary value analysis,
  state-transition testing en decision-table/scenario-based testing.
- **Risico-analyse:** R1–R14 met impact, waarschijnlijkheid en mitigatie.
- **Testdata en omgeving:** Formward-mocking, lokale config, viewports en
  determinisme.
- **Entry-/exit-criteria, defectbeheer, opschorting/herstart, rollen en
  Definition of Done.**
- **Traceerbaarheid:** doel → testcase-ID’s, al is de matrix te grof.
- **CI-kwaliteitspoorten:** typecheck, lint en html-validate vóór de tests;
  artifacts en CI-history.
- **Eerlijkheid over beperkingen:** live-site-afhankelijkheid, niet-gebouwde
  non-functionele suites en de ongeteste producerende kant.

## 4. Harde inconsistenties

Deze punten zijn geen cosmetische detailfouten: ze maken het plan as-is
onbetrouwbaar als beschrijving van de huidige coverage.

| ID | Locatie | Bewering in het plan | Werkelijkheid / bewijs | Actie |
| --- | --- | --- | --- | --- |
| F-01 | `TESTPLAN.md` §8.5 | CI-history is “bestaand, 8 tests” | `playwright/tests/functional/ci-history-functional.spec.ts` heeft **5 tests**; README noemt ook 5 | Terugbrengen naar 5; “+ 3 varianten” verwijderen of expliciet benoemen |
| F-02 | §8.5 | CIH-01…CIH-05 hebben de in TESTPLAN genoemde inhoud | `PLAN-CI-HISTORY-TESTS.md` §5 definieert CIH-01…05 als kaarten, aggregate, rij per run, `total=0` en lege history; de suite volgt dat plan | CIH-tabel uit `PLAN-CI-HISTORY-TESTS.md` overnemen |
| F-03 | §8.5 | Data staat in `docs/data/ci-history.json` | Werkelijk: `docs/data/playwright-history.json`; ook de default in `scripts/ci-summary.mjs` en `src/ts/main.ts` | Bestandsnaam corrigeren |
| F-04 | §8.5 CIH-02 | Schema heeft `version`, `total_tests`, `pass_percentage` | Werkelijk schema: `schemaVersion: 1`, `total`, `passRate`; de bestaande CIH-tests valideren het schema niet | Velden corrigeren of CIH-02 als gepland markeren |
| F-05 | §8.5 CIH-03 | `[data-testid="ci-history-run"]` en 5 cellen per rij | De tabel heeft **6 kolommen** (Run, Datum, Status, Tests, Geslaagd, Flaky) en géén `ci-history-run`-testid | Baseer de case op de echte markup; testids toevoegen als ze echt nodig zijn |
| F-06 | §8.1 | SM-03 (404-fallback) is bestaand | `smoke.spec.ts` heeft SM-01 en SM-02; 9 tests: index + 8 pagina’s. Geen 404-test | SM-03 implementeren of als gepland markeren |
| F-07 | §8.2 | NAV-01/03/04/05 zijn bestaand of worden “uitgebreid” | `homepage-functional.spec.ts` heeft 5 tests: 2 CTA’s, 2 nav-links en 1 card-link. Geen alle-nav-links, geen footer-links, geen actieve footer-link. NAV-01 is alleen deels via de mobiele suite gedekt | NAV-03/04/05 als gepland markeren; NAV-01 als “deels” |
| F-08 | §8.3 | MENU-01…10 zijn bestaand | Alleen MENU-01/02/03/05/06 hebben echte equivalenten; MENU-04 is deels gedekt; MENU-07 (Escape), MENU-08 (klik buiten), MENU-09 (focus eerste link) en MENU-10 (Escape op gesloten menu) ontbreken | Status per case toevoegen; “bestaand” is misleidend |
| F-09 | §7 | F1–F10 zijn de formulier-matrix | Alleen F1, F2 en F3 zijn geïmplementeerd; F4–F10 niet. F2 assert alleen “niet redirect”, niet de validatiemelding | F4–F10 als gepland markeren of bouwen |
| F-10 | §1 | “CI/CD-pipeline ontbreekt nog” | `.github/workflows/playwright.yml` bestaat; §10 zegt zelfs “Uitgevoerd” | Vervangen door: CI bestaat; release-gate is een open beslispunt |
| F-11 | §6.1 | `playwright/utils/test-data.ts` is “nu placeholder” | Het bestand bestaat en wordt door `smoke.spec.ts` gebruikt; formulier-datasets zijn nog niet centraal | Actuele rol beschrijven |
| F-12 | header vs. §3.1 | “9 pagina’s” versus “10 pagina’s” | `docs/` heeft 9 contentpagina’s + `404.html` | Consistent formuleren: “9 contentpagina’s + 404-fallback” |

**Waarom dit ernstig is:** de exit-criteria vragen om SM-03, F1–F10,
MENU-01…10, CIH-01…05 en alle non-functionele checks groen. Veel daarvan
bestaan niet. Als dat een **release-target** is, moet dat expliciet “target”
heten; nu leest het als een actuele baseline.

## 5. Gaten ten opzichte van ISTQB / ISO/IEC/IEEE 29119-3

Het plan bevat veel van de verwachte elementen, maar mist een aantal formele
onderdelen die in de testprofessional gangbaar zijn.

| Gebrek | Wat ontbreekt | Aanbeveling |
| --- | --- | --- |
| Testbasis | Geen expliciete bron van eisen of acceptatiecriteria; doelen zijn intern geformuleerd | Sectie “Testbasis en aannames” toevoegen: site-markup, WCAG 2.1 AA, sitemap, CI-workflow, formuliervereisten |
| Deliverables | Geen test deliverables, rapportage-afspraken of approval | Benoemen: HTML/JSON-report, CI-history, defectlijst, review/approval |
| Schedule en effort | Geen planning, inspanning of fase-status | Roadmap voorzien van status (done/planned) en eventueel effort |
| Traceability | Matrix is te grof; geen spec-bestand, testnaam, status of resultaat | Uitbreiden met requirement → testcase → spec file → status → laatste resultaat |
| Coverage-metriek | “100% in-scope doelen → ≥1 testcase” is te zwak | Coverage per acceptatiecriterium definiëren; “not covered” expliciet maken |
| Exit-criteria | “100% pass, 0 fail” en “0% flaky op 3 runs” zijn geen robuuste drempels | Thresholds, skipped tests, severity-drempels en N-run-flaky-definitie vastleggen |
| Testniveaus | “Component integration” voor Formward is eerder system integration/external interface; “acceptance” is geen UAT | Niveaus preciseren: static checks, smoke, system/functional, non-functioneel |
| Non-functionele drempels | Lighthouse “≥ drempel”, tolerantie “klein” en “acceptabele marges” zijn niet meetbaar | Concrete scores en baseline-omgeving vastleggen |
| Monitoring/control en closure | Geen monitoring/control- of closure/lessons-learned-sectie | Korte sectie toevoegen of expliciet als portfolio-scope benoemen |
| Risico’s | Impact/waarschijnlijkheid zijn labels zonder schaal, owner of reviewdatum | Eenvoudige risicomatrix en owner toevoegen |
| A11Y-bewijs | A11Y-04 assert een CSS-kleur, geen contrastratio of WCAG-conformiteit | axe-core/Lighthouse + handmatige controle; CSS-assert alleen als aanvulling |

## 6. CI/CD-bevindingen

- **G12 is niet onderbouwd.** §2/G12 zegt dat elke release vóór deploy
  geautomatiseerd wordt gevalideerd. In `playwright.yml` staat de push-trigger
  uit; de workflow draait alleen nightly en via `workflow_dispatch`. Er is dus
  geen pre-deploy gate. Formuleer dit als doel/aspiratie of voeg een
  push/PR-gate toe.
- **Paralleliteit in CI klopt niet.** De config gebruikt `workers: 1` in CI,
  terwijl de exit-criteria “in CI (parallel)” zeggen. Met één worker is CI
  niet parallel; gebruik meer workers of sharding als dat een doel is.
- **Browserinstallatie is niet optimaal.** De CI installeert alle browsers,
  terwijl alleen Chromium is geconfigureerd. BestPractices zegt terecht:
  installeer alleen wat nodig is.
- **Failure-artifacts zijn incompleet.** Alleen HTML-report, JSON-report en de
  history worden geüpload; `playwright/test-results/` met traces, screenshots
  en video’s niet. Als trace/debugging het doel is, upload ook die map.
- **Retries maskeren flakiness.** `retries: 2` in CI is een vangnet, geen
  bewijs van stabiliteit. De flaky-metric moet expliciet uit de JSON-report
  komen en retries moeten als uitzondering worden behandeld.

## 7. Review van BESTPRACTICES.md

`BESTPRACTICES.md` is **grotendeels correct** en sluit aan op de officiële
Playwright-best-practices: test gebruikersgedrag, isoleer tests, gebruik
auto-waiting en web-first assertions, vermijd sleeps, mock externe
dependencies, lint je tests, draai op CI en gebruik trace/report.

De belangrijkste onnauwkeurigheden en interne contradicties:

| # | Bevinding | Correctie |
| --- | --- | --- |
| B-01 | De locator-volgorde (role → label → testId → placeholder → text → alt → title) is niet de officiële Playwright-volgorde | Presenteer dit als **projectconventie**; officiële Quick Guide noemt role, text, label, placeholder, alt, title, testid. Testid is een expliciet contract, geen automatisch hogere prioriteit |
| B-02 | `page.$` en `page.$eval` worden “deprecated” genoemd | Ze zijn niet officieel deprecated; ze zijn **discouraged/afgeraden**. Vervang “deprecated” door “vermijd” |
| B-03 | Het voorbeeld assert `.open`-class, terwijl eerder “geen implementation details” staat | `.open` is een CSS-class-assert. Gebruik `toBeVisible()` + `aria-expanded` + `toBeFocused()`; class alleen als bewust testcontract |
| B-04 | Skip-link-voorbeeld assert alleen `toHaveCount(1)` | Dat bewijst alleen dat het doel bestaat, niet dat de skip-link werkt. Assert ook URL-hash, focus of zichtbaarheid van het doel |
| B-05 | `networkidle` wordt afgeraden, maar `BasePage.goto()` en `smoke.spec.ts` gebruiken het | Documenteer de uitzondering (shields.io-badge) of verwijder de onnodige `networkidle`; het is geen betrouwbaar readiness-signal |
| B-06 | Advies “installeer alleen Chromium” botst met de CI | Maak CI en documentatie consistent |
| B-07 | Geen bronnen of versies | Voeg references toe: ISTQB CTFL, ISO/IEC/IEEE 29119, Playwright Best Practices en Locators |
| B-08 | De doc is een checklist, geen gestructureerde standaard | Voeg headings, bronnen en voorbeeldcode als codeblokken toe; leg uit wanneer een regel geldt |

Het document is dus bruikbaar als interne richtlijn, maar niet als formele
ISTQB/Playwright-standaard zonder bronvermelding en zonder de bovenstaande
correcties.

## 8. Prioriteiten en voorgestelde wijzigingen

### P1 — moet direct

1. **Status per testcase toevoegen.** Gebruik `Implemented`, `Planned`,
   `Partial` of `Not covered`, plus spec-bestand en testnaam.
2. **§8.5 volledig vervangen** door de actuele CIH-tabel uit
   `PLAN-CI-HISTORY-TESTS.md` §5: 5 tests, `playwright-history.json`,
   `schemaVersion`, `total`, `passRate`.
3. **SM-03, F4–F10, MENU-07–10 en NAV-03/04/05** expliciet als gepland
   markeren of implementeren. NAV-01 is alleen deels gedekt.
4. **§1 en §10 tegen elkaar trekken:** CI bestaat; release-gate is een open
   beslispunt.
5. **Exit-criteria splitsen:** “huidige baseline” versus “release-target”.
6. **§6.1 en de paginatelling corrigeren:** test-data bestaat; 9
   contentpagina’s + 404-fallback.

### P2 — standards

7. Testbasis, referenties, aannames en acceptatiecriteria toevoegen.
8. Traceabilitymatrix uitbreiden met spec-bestand, testnaam, status en
   resultaat.
9. Concrete exit-metrics en defect-/flaky-drempels definiëren.
10. Non-functionele drempels concreet maken; A11Y niet alleen via CSS-waarde
    testen.
11. CI: pre-deploy gate of expliciet “geen gate”; trace-artifacts uploaden;
    alleen Chromium installeren; paralleliteitsclaim corrigeren.

### P3 — BestPractices

12. Locator-volgorde als projectconventie presenteren.
13. “Deprecated” corrigeren naar “discouraged”.
14. `.open`-class-asserts expliciet als testcontract documenteren of
    vervangen door zichtbaarheid/ARIA.
15. Skip-link-voorbeeld en `networkidle`-uitzondering corrigeren.
16. Bronnen en versies toevoegen; structuur/format verbeteren.

### Per sectie

| Sectie | Wijziging |
| --- | --- |
| §1 | “CI/CD ontbreekt” vervangen door actuele CI-status |
| §2 | G11/G12 als procesdoelen scheiden van productdoelen |
| §3.1 | Paginatelling consistent maken |
| §5.1 | Status per suite; CI-history 5 tests |
| §6.1 | `utils/test-data.ts` als bestaand beschrijven |
| §7 | Statuskolom voor F1–F10 |
| §8.1–8.3 | Status “bestaand/gepland” per case |
| §8.5 | Vervangen door CIH-tabel uit `PLAN-CI-HISTORY-TESTS.md` |
| §9 | Risico’s kwantificeren en owners toevoegen |
| §10 | Roadmap-status en CI-gate corrigeren |
| §11 | Baseline- en release-criteria scheiden; metrics aanscherpen |
| §15 | Traceability uitbreiden met spec-bestand en status |

## 9. Acceptatiecriteria voor de herziening

De herziening is pas klaar wanneer:

- er geen tegenstrijdigheden meer zijn tussen `TESTPLAN.md`, `README.md`,
  `PLAN-CI-HISTORY-TESTS.md` en de suite;
- elke testcase-ID een status, spec-bestand en testnaam heeft;
- de CI-history-sectie exact de 5 bestaande tests beschrijft;
- exit-criteria onderscheiden wat nu geldt en wat pas na fase 2–7 geldt;
- `npm run check` groen blijft;
- de suite niet stilzwijgend wordt beschreven als completer dan hij is;
- `BESTPRACTICES.md` geen onnauwkeurigheden meer bevat over locators,
  `page.$`, `.open`, skip-links, `networkidle` en browserinstallatie.

## 10. Status van deze stap

Ik heb alleen dit reviewdocument toegevoegd. `TESTPLAN.md` en
`BESTPRACTICES.md` zijn in deze stap **nog niet gewijzigd**. De volgende stap
is het doorvoeren van de P1-correcties; daarna kunnen P2 en P3 volgen.





