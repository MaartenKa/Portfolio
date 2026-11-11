Dit is een showcase repo gehost op github met een statische portfolio website met playwright framework die de website test.

Revelante bestanden staan in de map "Project-documentation" van de portfolio folder.

- PLAYWRIGHT.md : Project documenentatie
- TESTPLAN.md : wat er getest moet worden
- BESTPRACTICES.md : ISTQB en playwright test methodieken
- CI-PLAYWRIGHT-HISTORY.md : technische CI-docu (Playwright history dataflow)
- CI-OVERVIEW.md : CI/CD in gewoon taalgebruik + bestandsgids van het CI-proces
- PLAN-CI-HISTORY-TESTS.md : plan voor de CI-history tests (testsoort, testplan-koppeling, roadmap)

Buiten die map, op de repo-root:

- README.md : startpunt van de repo — wat het project is, stack, structuur, commando's, CI-keten en bekende beperkingen
- playwright.local.config.ts : vaste hulpm-config om de suite lokaal tegen docs/ te draaien (port 8080)
- eslint.config.mjs + .htmlvalidate.json : de kwaliteitspoorten die in de CI vóór de tests draaien

