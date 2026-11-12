Dit is een showcase repo gehost op github met een statische portfolio website met playwright framework die de website test.

Revelante bestanden staan in de map "Project-documentation" van de portfolio folder.

- PLAYWRIGHT.md : Project documenentatie
- TESTPLAN.md : wat er getest moet worden
- BESTPRACTICES.md : ISTQB en playwright test methodieken
- CI-PLAYWRIGHT-HISTORY.md : technische CI-docu (Playwright history dataflow)
- CI-OVERVIEW.md : CI/CD in gewoon taalgebruik + bestandsgids van het CI-proces
- PLAN-CI-HISTORY-TESTS.md : plan voor de CI-history tests (testsoort, testplan-koppeling, roadmap)
- PLAN-DEPENDENCY-UPGRADES.md : plan voor versie-upgrades (de CI-deprecation-warns, Node-, npm- en action-peil)


Buiten die map, op de repo-root:

- README.md : startpunt van de repo — wat het project is, stack, structuur, commando's, CI-keten en bekende beperkingen
- playwright.local.config.ts : vaste hulpm-config om de suite lokaal tegen docs/ te draaien (port 8080)
- eslint.config.mjs + .htmlvalidate.json : de kwaliteitspoorten die in de CI vóór de tests draaien


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

