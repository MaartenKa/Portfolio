# Portfolio — Maarten Kamps (QA Engineer / Software Tester)

[![Playwright Tests](https://img.shields.io/github/actions/workflow/status/MaartenKa/Portfolio/playwright.yml?label=Playwright%20CI)](https://github.com/MaartenKa/Portfolio/actions/workflows/playwright.yml)

Live-site: <https://maartenka.github.io/Portfolio/> · Repo: <https://github.com/MaartenKa/Portfolio>

Dit project is een **statische portfolio-website** (geen backend, geen framework) met daar
bij een **Playwright testautomatiseringssuite** die dezelfde site test. De site rapporteert
daarna over haar eigen tests: `automation.html` toont de CI-resultaten uit de Playwright
`JSON`-report die de GitHub Actions-run terugcommt naar de repo. Alles is Nederlands — de
site, de testnamen en de documentatie.

## Stack

| Onderdeel         | Technologie                                                        |
| ----------------- | ------------------------------------------------------------------ |
| Website           | Statisch HTML/CSS in `docs/` (10 pagina's), GitHub Pages           |
| Site-JS           | TypeScript: `src/ts/main.ts` → gebouwd naar `docs/js/ts`           |
| Testframework     | Playwright (`@playwright/test` v1.62) met Page Object Model        |
| Taal tests        | TypeScript, strict mode                                            |
| Browser           | Chromium (Desktop Chrome)                                          |
| Testomgeving      | Standaard: live GitHub Pages; lokaal: `playwright.local.config.ts` |
| CI                | GitHub Actions (`.github/workflows/playwright.yml`)                |
| Kwaliteitspoorten | `tsc --noEmit`, ESLint, html-validate                              |
| Rapportage        | Playwright HTML-report, JSON-report, CI-history JSON               |

## Structuur

```
package.json                 # scripts + devDependencies
tsconfig.json                # TS-config (strict, noEmit → type-check only)
tsconfig.site.json           # site-JS build → docs/js/ts
playwright.config.ts         # standaard-suite: draait tegen de live site
playwright.local.config.ts   # hulpm-config: zelfde suite tegen docs/ (poort 8080)
eslint.config.mjs            # ESLint 9 flat config
.htmlvalidate.json           # html-validate regels voor de site-pagina's
docs/                        # de statische website (site-root op GitHub Pages)
  data/playwright-history.json  # CI-history data voor automation.html
  js/ts/main.js                 # gebouwd bestand: nooit met de hand aanpassen
src/ts/main.ts               # bron site-JS: menu-toggle + CI-history UI
scripts/ci-summary.mjs       # Playwright JSON-report → CI-history JSON
playwright/
  pages/                     # Page Objects (base, home, contact, mobile, ci-history)
  fixtures/test-fixtures.ts  # eigen fixtures (nu lege placeholder)
  utils/test-data.ts         # gedeelde constants en testdata
  tests/smoke/               # smoke
  tests/functional/          # homepage, contact, mobile-menu, ci-history
  tests/accessibility/       # leeg — TESTPLAN fase 4 (A11Y-01…04)
  tests/compatibility/       # leeg — TESTPLAN fase 7 (Firefox/WebKit)
  tests/e2e/                 # leeg — gebruikersflows
  tests/regression/          # leeg — LINK/IMG/HTML-integriteit
Project-documentation/       # testplan, CI-docu, projectdoc, best practices
AGENTS.md                    # welke documentatie relevant is
```

## Aan de slag

```bash
npm ci                        # dependencies, exact uit package-lock.json
npx playwright install        # browsers voor lokale runs
npm run build                 # site-JS → docs/js/ts + type-check van al het TS
npm test                      # standaard-suite: draait tegen de LIVE site
npm run test:local            # zelfde suite tegen de lokale docs/ (http-server 8080)
npm run test:ui               # interactieve Playwright UI-mode
npm run test_list_tests       # tests opsommen
npm run check                 # typecheck + lint + html-validate
```

Voor werk aan `docs/` is `npm run test:local` de enige manier om nieuwe markup vóór deploy
te verifiëren: de standaard-suite draait tegen de live site, die de wijziging nog niet
heeft.

## Kwaliteitspoorten

| Commando                | Betekenis                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `npm run typecheck`     | `tsc --noEmit` — TypeScript strict, zonder output             |
| `npm run lint`          | `eslint . --max-warnings=4` — ESLint 9 incl. `eslint-plugin-playwright` |
| `npm run validate:html` | `html-validate "docs/**/*.html"` (testcase HTML-01)           |
| `npm run check`         | alle drie achter elkaar                                       |

Dezelfde drie poorten draaien in `playwright.yml` vóór de tests, zodat een rode typecheck,
lint of HTML-structuur de suite niet haalt (`TESTPLAN.md` §11, entry-criteria).

## CI/CD en de CI-history

Elke nacht om **18:17 UTC** (en handmatig via `workflow_dispatch`) draait de suite op GitHub
Actions: checkout → Node.js → `npm ci` → typecheck → lint → html-validate → browsers →
tests → artifacts → `scripts/ci-summary.mjs` → bot-commit van de history-JSON met
`[skip ci]` → GitHub Pages publiceert opnieuw.

`automation.html` toont daarop de shields.io-badge, de laatste-run kaarten, zes
QA-aggregaatcijfers (o.a. de gepoolde ratio = Σ geslaagd / Σ uitgevoerd) en de laatste 10
CI-runs. Geen backend, geen database, geen API-token.

```
Playwright → report.json → ci-summary.mjs → playwright-history.json
           → bot-commit → GitHub Pages → main.ts fetcht → kaarten + tabel
```

Schema's, velden en het productiebewijs per schakel:
`Project-documentation/CI-PLAYWRIGHT-HISTORY.md` §15.

## Documentatie

| Bestand                                        | Beantwoordt |
| ---------------------------------------------- | ----------- |
| `Project-documentation/PLAYWRIGHT.md`          | Projectopbouw, Page Objects, conventies, commando's |
| `Project-documentation/TESTPLAN.md`            | Teststrategie, testmatrix G1–G13, roadmap fase 1–7 |
| `Project-documentation/BESTPRACTICES.md`       | ISTQB- en Playwright-methodiek |
| `Project-documentation/CI-PLAYWRIGHT-HISTORY.md` | Technische CI-spec: schema's, CI-stappen, verificatie |
| `Project-documentation/CI-OVERVIEW.md`         | CI/CD in gewoon taalgebruik + bestandsgids |
| `Project-documentation/PLAN-CI-HISTORY-TESTS.md` | Testsoort van de CI-history tests + roadmap |
| `AGENTS.md`                                    | Welke documentatie relevant is bij een nieuwe taak |

## Bekende beperkingen (eerlijk benoemd)

- De suite draait tegen de live site: nieuwe UI-tests slagen pas ná deploy plus de
  Pages-cache (`max-age=600`, tot tien minuten). Een harde reload na een deploy is dus
  normaal gedrag en geen bug.
- `docs/js/ts/main.js` is een gebouwd bestand in de repo. Na een wijziging in
  `src/ts/main.ts`: eerst `npm run build`, dan committen. De CI bouwt niet.
- De kaart "Suite omvang" is nu `max(total)` uit de gelogde runs — een proxy. Plan voor
  een echt `suiteTests`-veld: `PLAN-CI-HISTORY-TESTS.md` fase C.
- De site is bewust `noindex, nofollow` met `docs/robots.txt` (`Disallow: /`). Canonical
  en sitemap zijn er wél; die worden getest op aanwezigheid en consistentie, niet op
  indexatie-effect.
- De producerende kant (`scripts/ci-summary.mjs`) heeft nog geen eigen geautomatiseerde
  test (CIH-06, fase B). De weergavelaag is wél gedekt door vijf UI-tests met gemockte
  data.
- `accessibility/`, `compatibility/`, `e2e/` en `regression/` zijn lege mappen: de
  non-functionele suites (RESP / A11Y / SEO / LINK / IMG / VIS / PERF) staan als fase 4–5
  in het testplan en zijn nog niet gebouwd.

## Contact & licentie

- E-mail: <Maarten.kamps.bee@outlook.com>
- LinkedIn: <https://www.linkedin.com/in/maarten-kamps-a6909527/>
- GitHub: <https://github.com/MaartenKa/Portfolio>
- Licentie: zie `LICENSE`
