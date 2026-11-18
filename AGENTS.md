Dit is een showcase repo gehost op GitHub met een statische portfoliowebsite en een
Playwright-framework dat de website test.

Relevante bestanden staan in de map `Project-documentation` van de portfoliofolder.

- PLAYWRIGHT.md : projectdocumentatie
- TESTPLAN.md : wat er getest moet worden
- BESTPRACTICES.md : ISTQB-, Playwright-testmethodieken en commentaarconventies
- CI-PLAYWRIGHT-HISTORY.md : technische CI-docu (Playwright history dataflow)
- CI-OVERVIEW.md : CI/CD in gewoon taalgebruik + bestandsgids van het CI-proces
- PLAN-CI-HISTORY-TESTS.md : plan voor de CI-history tests (testsoort, testplan-koppeling, roadmap)
- PLAN-DEPENDENCY-UPGRADES.md : plan voor versie-upgrades (de CI-deprecation-warns, Node-, npm- en action-peil)


Buiten die map, op de repo-root:

- README.md : startpunt van de repo — wat het project is, stack, structuur, commando's, CI-keten en bekende beperkingen
- playwright.local.config.ts : vaste hulpconfig om de suite lokaal tegen docs/ te draaien (poort 8080)
- eslint.config.mjs + .htmlvalidate.json : de kwaliteitspoorten die in de CI vóór de tests draaien


## Commitconventies

Committeksten zijn zichtbaar voor geïnteresseerden; schrijf ze als een korte,
professionele samenvatting van de wijziging.

- Begin met de bewerking in de verleden tijd: `Added`, `Updated`, `Removed`,
  `Fixed`, `Refactored`.
- Daarna de taak of het onderwerp, bijvoorbeeld:
  `Updated documentation: comment conventions in BESTPRACTICES`.
- Houd één stijl en één tijd aan. Meng niet `Create`, `Updated` en
  `chore(...)` door elkaar.
- Geen losse titels zoals alleen `Updated Documentation`; benoem wat is
  gewijzigd.
- Gebruik één taal consequent: Engels voor committeksten, Nederlands voor
  projectdocumentatie.
- Commit per logische stap, niet per bestandstype-only. Gegenereerde bestanden
  horen bij hun bron, bijvoorbeeld `src/ts/main.ts` samen met
  `docs/js/ts/main.js`.
- Conventional Commits is niet verplicht; deze repo gebruikt bewust de
  verb-first-conventie.

Voorbeeldreeks:

```text
Updated documentation: comment conventions in BESTPRACTICES
Updated documentation: references to comment conventions
Updated comments: page objects, fixtures and test data
Updated comments: test specifications
Updated comments: site JavaScript and CSS
Updated comments: scripts, configs and CI workflow
```


## Werkwijze voor agenten

- **Agent committet niet.** Laat wijzigingen in de werkbom staan (ongestaged); de gebruiker
  reviewt en committet zelf. De gebruiker uncommittert bewust (`git reset`) om het werk te
  kunnen controleren — een agent die dat wegcijfert naar een commit maakt de review
  onmogelijk.
- **Geen `git reset`, `git restore`, `git checkout` of `git clean` op werkbom of HEAD** zonder
  uitdrukkelijke opdracht. Een agent die "even opruimt" vernietigt het reviewwerk van de
  gebruiker.
- **Bewijs in documenten is de werkbom, niet de commit-SHA.** Vermijd commit-SHA's in
  statuslogs; beschrijf in plaats daarvan wat er in de bestanden staat en welke poorten
  groen zijn (`npm run check`, `npm run test:local`).

