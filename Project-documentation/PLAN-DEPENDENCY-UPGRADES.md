# Plan — verouderde versies, CI-warnings en de upgrade-reeks

> **Doel van dit bestand:** vastleggen welke verouderde versies de waarschuwingen in de
> CI-log veroorzaken, waar ze vandaan komen, welke upgrades wel en bewust **niet** worden
> uitgevoerd, en in welke volgorde dat gebeurt.
>
> **Ontstaan:** de nachtelijke CI-run (`playwright.yml`) is groen, maar de `npm ci`-stap
> print drie deprecation-warns en de workflow gebruikt een action-major (`upload-artifact`)
> die niet meer de actuele is. `npm outdated` toont een deel daarvan niet, omdat drie
> packages op de top van hun caret-major staan.
>
> **Relatie tot de andere docs:** `CI-OVERVIEW.md` en `CI-PLAYWRIGHT-HISTORY.md` beschrijven
> de CI-keten zoals die nu draait, `PLAYWRIGHT.md` de projectopbouw, `TESTPLAN.md` de
> teststrategie en `PLAN-CI-HISTORY-TESTS.md` het testplan voor de CI-history tests. Dit
> bestand is het **plan**: metingen en voorstellen, geen al bestaande feiten.
>
> **Status:** plan + uitvoeringslog. Golf 1–3 zijn op 2026-11-12 doorgevoerd en de
> documentatie is bijgewerkt. Dependabot is niet toegepast: de config en trigger
> waren ongeldig en zijn verwijderd.
>
> **Gemeten op:** 2026-11-12, uitgangscommit `2ef9712`, lokaal Node v22.16.0.
> De definitieve poorten zijn met Node 24.22.3 (`npx -y node@24`) gevalideerd.

## 1. Wat er in de CI-log te zien is

De run faalt niet; hij print ruis. Dat is het punt: een groene pipeline met waarschuwingen
verliest zijn betekenis als signaal, en de CI-cijfers op `automation.html` zijn precies het
bewijs dat deze repo etaleert.

| Warn / signaal in de CI-log | Komt van | Nu | Actueel |
| --- | --- | --- | --- |
| `npm warn deprecated eslint@9.39.5: This version is no longer supported` | eigen devDependency | ESLint 9.39.5 | ESLint 10.14.0 |
| `npm warn deprecated glob@11.1.0: Old versions of glob are not supported` | via `html-validate@10.0.0` | glob 11.1.0 | via html-validate 11 |
| `npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead` | via `http-server@14.1.1` → `html-encoding-sniffer@3.0.0` | whatwg-encoding 2.0.0 | via `html-encoding-sniffer` 7 override |
| action-major onder de actuele | `actions/upload-artifact@v6` (3 stappen) | v6 | v7.0.2 |

De eerste drie staan als `"deprecated"`-veld in de oorspronkelijke `package-lock.json`.
npm printte ze bij elke `npm ci`. Na de uitvoering zijn alle drie uit de lockfile
verwijderd: ESLint 10 en html-validate 11 lossen de eerste twee op, en de derde
komt niet van html-validate maar van `http-server`. Daarvoor is
`html-encoding-sniffer@7` als gerichte override gebruikt (zie §5).

## 2. Meting: de packages en hun actuele stand

Registry-cijfers uit `npm view` (dist-tags), de ESLint-versieondersteuningspagina
(https://eslint.org/version-support) en de release-overzichten van de acties.

| Package / action | Uitgangssituatie | Laatste | Oordeel |
| --- | --- | --- | --- |
| `eslint` | 9.39.5 | **10.14.0** (`maintenance` = 9.39.5) | **EOL-lijn**, moet Major |
| `@eslint/js` | 9.39.5 | **10.0.1** | moet major-matchen met eslint |
| `html-validate` | 10.0.0 | **11.21.0** | Major, nodig voor 2 van de 3 warns |
| `typescript-eslint` | 8.72.1 | **8.72.2** | patch |
| `@playwright/test` | 1.62.1 | **1.65.0** | minor |
| `@types/node` | 24.13.3 | 24.19.2 (major 26: 26.6.6) | minor op major 24 |
| `eslint-plugin-playwright` | 2.12.2 | **2.12.2** | al current |
| `globals` | 17.14.0 | **17.14.0** | al current |
| `http-server` | 14.1.1 | **14.1.1** | al current |
| `typescript` | 5.9.3 | 7.0.2 | **buiten boord** (zie §5) |
| `actions/checkout` | v7 | 7.0.1 | ok |
| `actions/setup-node` | v7 | 7.1.0 | ok |
| `actions/upload-artifact` | v6 | **7.0.2** | **verouderd** |

Na uitvoering: `eslint` 10.14.0, `@eslint/js` 10.0.1, `html-validate` 11.21.0,
`@playwright/test` 1.65.0, `@types/node` 24.19.2 en `typescript-eslint` 8.72.2.
De lockfile bevat geen `"deprecated"`-velden meer.

Onderbouwingsgegevens die de keuzes bepalen:

- ESLint-supporttabel: `v9.0.0–v9.39.5` is **EOL sinds 2026-08-06** (laatste release
  2026-07-10); `v10.x` is *Current* (eerste release 2026-02-06).
- `eslint@10.14.0` engines: `^20.19.0 || ^22.13.0 || >=24`.
- `html-validate@11.21.0` engines: `^22.22.0 || >= 24.8.0`.
- `typescript-eslint@8.72.2` peers: `eslint ^8.57.0 || ^9.0.0 || ^10.0.0` én
  `typescript >=4.8.4 <6.1.0`.
- `eslint-plugin-playwright@2.12.2` peer: `eslint >=8.40.0` — dus al ESLint-10-klaar.
- Meten tijdens golf 1 (2026-11-12): de **huidige** tree trekt al `eslint-visitor-keys@5.0.1`
  met engines `^20.19.0 || ^22.13.0 || >=24`. Op Node v20.17.0 print npm dus nú al
  `npm warn EBADENGINE` bij `npm install`/`npm ci` — de Node-vloer is dus geen toekomstig
  ESLint-10-probleem, hij geldt al. In de CI (toen nog `node-version: lts/*` = Node 24) doet hij niet
  zeer.

## 3. Herkomst van de transitieve waarschuwingen

Twee van de drie waarschuwingen zijn transitief, maar ze komen uit **verschillende** takken:

```
html-validate@10.0.0
  └── glob@11.1.0                      → deprecated ("Old versions of glob…")

http-server@14.1.1
  └── html-encoding-sniffer@3.0.0
        └── whatwg-encoding@2.0.0      → deprecated ("Use @exodus/bytes instead")
```

Gevolg: `html-validate` 11 lost de `glob`-warning op. De `whatwg-encoding`-warning
komt echter van `http-server` — dat is al de laatste versie (14.1.1) en pinnt nog
`html-encoding-sniffer@^3`, dus upgraden van `http-server` helpt niet. Daarvoor is een
gerichte override op `html-encoding-sniffer@7` gebruikt (zelfde default-export/API,
maar met `@exodus/bytes`). Een override op `glob` is niet nodig: html-validate 11
heeft hem niet meer in de boom.

## 4. De drie keuzes die ik maak, en waarom

| Keuze | Onderbouwing voor deze repo |
| --- | --- |
| **ESLint 9 → 10** | EOL-lijn verlaten is een compliance-punt, geen cosmetica. Een QA-repo die "kwaliteitspoorten" etaleert mag niet draaien op een release-lijn zonder ondersteuning. Dit is waarschuwing #1. |
| **html-validate 10 → 11** | Dekt waarschuwing #2 (`glob`). De `.htmlvalidate.json`-regels (`html-validate:recommended`, lowercase doctype, selfclosing voids) blijven; html-validate 11 haalt de deprecated `glob` uit de boom. Waarschuwing #3 (`whatwg-encoding`) zit in `http-server` en is met de override uit §5 opgelost. |
| **Node 20 → 24 (lokaal)** | Node 20 is zelf EOL, CI draait `lts/*` (= Node 24), en ESLint 10 en html-validate 11 vragen allebei een nieuwere vloer (§2). Zonder deze stap is lokaal niet reproduceerbaar wat in de CI gebeurt — en dat is precies het domein van testautomatisering. |

Daarnaast structureel: **Dependabot is bewust niet toegepast.** De config leverde
alleen een ongeldige trigger en een ongeldig schema op, en de repo had dit mechanisme
voorheen niet. Voor dit doel is de expliciete upgrade-reeks voldoende; periodieke
controle kan met `npm outdated` en `npm view`, zonder server-side config.

## 5. Bewust buiten boord (en waarom)

| Niet doen | Motief |
| --- | --- |
| `typescript` 5.9.3 → 7.0.2 | `typescript-eslint@8.72.2` heeft als peer `typescript >=4.8.4 <6.1.0`. TS 7 valt daar buiten: de lint-poort zou breken. TypeScript 5.9.x is prima en blijft. |
| `@types/node` → 26.x | Major 24 sluit aan bij de CI (`engines.node` = Node 24) en dus bij de Node-tak waarin de suite draait. Wél 24.13.3 → 24.19.2. |
| `eslint-plugin-playwright`, `globals`, `http-server` | al op de laatste versie (gemeten in §2). |
| `actions/checkout`, `actions/setup-node` | al op major 7; latest 7.0.1 / 7.1.0. |
| `overrides` op `glob`/`whatwg-encoding` om html-validate te maskeren | niet gedaan: html-validate 11 lost `glob` zelf op. |
| `html-encoding-sniffer@7` override voor `http-server` | wél gedaan: `http-server@14.1.1` is de laatste versie en pinnt nog `html-encoding-sniffer@^3`, dat `whatwg-encoding@2` meebrengt. Versie 7 heeft dezelfde default-export/API en gebruikt `@exodus/bytes`. De lokale suite is hiermee getest. |

## 6. Node-beleid: één bron van waarheid

Uitgangssituatie was `node-version: lts/*` in de workflow en niets lokaals: GitHub
bepaalde wat "de CI-Node" is. Dat is nu als volgt vastgelegd en uitgevoerd:

| Onderdeel | Voorstel |
| --- | --- |
| `package.json` → `engines.node` | `">=24.8.0 <25"` — één veld, twee consumenten: npm toetst het (warn bij afwijking) én `setup-node` lost het op |
| `playwright.yml` → setup-node | `node-version-file: package.json` in plaats van `lts/*` |
| `playwright.yml` → setup-node | `cache: npm` + `cache-dependency-path: package-lock.json` (winst op `npm ci`) |
| `playwright.yml` → job | `timeout-minutes: 20` (begrenst de run; `globalTimeout` in `playwright.config.ts` is 10 min) |

**Geen `.nvmrc`.** De broncode van setup-node (`src/util.ts`, functie
`getNodeVersionFromFile`) parseert het opgegeven bestand als JSON en leest op volgorde
`volta.node`, daarna `devEngines.runtime` (met `name: node`), daarna `engines.node`. De
`action.yml` noemt `package.json` als eerste voorbeeld van de input. Een `.nvmrc` op de
repo-root voegt dus niets toe: `package.json` is zelf al een geldige node-versiebron, en
een extra dotfile op de root is enkel extra rommel.

De `<25`-grens is bewust: setup-node lost een semver-range op tot de hoogste beschikbare
matching versie. Zonder grens zou Node 25 (later 26) de CI stil overnemen — precies de
drift die met `lts/*` is weggehaald. npm verstaat dezelfde range, dus de vloer die npm
print en de tak die de CI pakt zijn één getal.


## 7. De uitvoering in golven (één commit per golf)

De commit-reeks volgt de bestaande stijl (`chore(ci): …`, zie de historie met
`chore(ci): update Playwright history [skip ci]`).

| Golf | Commit-tekst | Bestanden | Inhoud |
| --- | --- | --- | --- |
| **1** | `chore(deps): playwright 1.65, @types/node 24.19, typescript-eslint 8.72.2` | `package.json`, `package-lock.json` | minor/patch-upgrades die geen hogere Node vragen; `npm install` + drie poorten |
| **2** | `chore(ci): upload-artifact v7, actions:write, node uit engines.node, npm-cache` | `.github/workflows/playwright.yml`, `package.json` (`engines`) | zie §8 |
| **3** | `chore(deps): eslint 10 en html-validate 11` | `package.json`, `package-lock.json`, `eslint.config.mjs` | de majors + herbouwen van de `--max-warnings`-basislijn (§10) |
| **4** | `docs: versies op trekken` | zie §11 | documentatie op de nieuwe peil |

Uitvoering: golf 1, 2 en 3 zijn doorgevoerd; golf 4 is bijgewerkt. De Dependabot-stap
uit golf 2 is geschrapt (zie §9).

Zingevolle volgorde: golf 1 en 2 zijn veilig op Node 20 en maken de CI-log al stiller; golf 3
is de eigenlijke EOL-stap en valt samen met de Node-beslissing; golf 4 houdt de documentatie
in de pas met de code (nu staat er "ESLint 9" en "v1.62" in zes documenten, zie §11).

Golf 3 is bewust het laatst: die verhoogt de Node-eis, dus de documentatie en `engines.node`
(golf 2) moeten al op tafel liggen voordat de lint- en HTML-poort lokaal dreigen te vallen.

## 8. Workflow-diffs (`.github/workflows/playwright.yml`)

1. **`permissions`-blok**: `contents: write` **plus** `actions: write`.
   Een niet-genoemde scope in een `permissions`-blok valt op `read`; upload-artifact v7
   heeft `actions: write` nodig. Zonder deze regel is de upgrade zelfondermijnend.
   (`contents: write` blijft nodig voor de bot-commit van de history-JSON.)
2. **Drie stappen** `uses: actions/upload-artifact@v6` → `@v7` (regels 76, 94 en 102).
   Inputs (`name`, `path`, `retention-days`) blijven; de `!cancelled()`-voorwaarden blijven.
3. **setup-node**: `node-version: lts/*` → `node-version-file: package.json`, plus npm-cache (§6).
4. **`timeout-minutes: 20`** op de job.
5. **Comment-regels** 5-10 (cron-meting) en de stap-opmerkingen (regels 57-59) laten
   meebewegen met de wijziging, zodat comment en werk in de pas blijven — de vastlegging in
   `CI-OVERVIEW.md` §12.1-2 is precies om dit soort afzwijking te voorkomen.

## 9. Dependabot — bewust niet in de repo

Dependabot is voor dit doel niet nodig en is na de meting verwijderd. Het mechanisme
leverde twee concrete fouten op:

- `on.dependabot` is geen geldige Actions-trigger. GitHub wees de workflow af met
  `Unexpected value 'dependabot'` (regel 39); de run had daardoor **0 jobs**. Dependabot-
  PR's zijn gewone `pull_request`-events; auto-merge is een repo-instelling of een
  expliciete merge-stap, geen trigger.
- De config had `groups` top-level en gebruikte `apply: "all"`. In het Dependabot v2-
  schema hoort `groups` **onder een `updates`-entry**, en de geldige sleutel is
  `applies-to` (`version-updates` of `security-updates`), niet `apply`.

Daarom zijn `.github/dependabot.yml`, de `pull_request`-trigger en het `dependabot`-
trigger-blok verwijderd. De workflow heeft weer alleen `schedule` en
`workflow_dispatch`. Voor de upgrade-reeks is dat voldoende; periodieke controle kan
met `npm outdated` / `npm view`, zonder server-side config. Als Dependabot later terug
moet, gebruik dan de correcte schema-opbouw en test de config eerst; voeg niet opnieuw
een niet-bestaand trigger-event toe.


## 10. De lint-basislijn na ESLint 10

`package.json` eist nu `eslint . --max-warnings=0`. In `eslint.config.mjs` staat de
toelichting dat die drempel de 0-warnings-basislijn hard maakt, met de drie
`playwright/*`-regels op `warn` als restposten.

ESLint 10 voegt regels toe aan `js.configs.recommended` en aan de
typescript-eslint-preset. De basislijn is na de upgrade gemeten:

1. `npm run lint` is met ESLint 10 schoon; er waren geen nieuwe echte bevindingen.
2. De drempel is naar **0** gezet. "0 warnings" is het sterkste cijfer dat deze repo
   in de CI kan laten zien; `--max-warnings=4` was een ratchet, geen doel.
3. De config-comment noemt nu `--max-warnings=0` en dezelfde reden (dezelfde discipline
   als §12.1-2 in `CI-OVERVIEW.md`).

## 11. Documentatie-impact (zes plekken, bijgewerkt)

| Bestand | Plek | Nu → nieuw |
| --- | --- | --- |
| `README.md` | stack-tabel | "`@playwright/test` v1.62" → v1.65 |
| `README.md` | structuur- en commandotabel | "ESLint 9 flat config" / "ESLint 9 incl. plugin" → ESLint 10 |
| `eslint.config.mjs` | regel 1 (head-comment) | "ESLint 9 flat config" → ESLint 10 flat config |
| `Project-documentation/PLAYWRIGHT.md` | stack-tabel + commandotabel + §lint | v1.62.x → v1.65.x; ESLint 9 → 10 |
| `Project-documentation/CI-OVERVIEW.md` | §4 stap 3 en 6, bestandskaart, §12.8 | `lts/*` → `node-version-file: package.json` (Node 24); ESLint 9 → 10 |
| `Project-documentation/TESTPLAN.md` | CI-codefragment (lint-stap) | comment "ESLint 9" → ESLint 10 |

Waarom dit in het plan hoort: deze repo's eigen argument is dat documentatie en
realiteit overeenkomen (`CI-OVERVIEW.md` §12). Een upgrade die de documentatie op "ESLint 9"
en "v1.62" laat staan, is niet af. Deze zes plekken zijn nu bijgewerkt; README noemt
daarnaast de Node-vloer uit `engines.node`.

Verder: `AGENTS.md` en de documentatiewijzer in `README.md` verwijzen naar dit plan,
zodat het vindbaar blijft voor de volgende ronde.

## 12. Risico's en terugval

| Risico | Gevolg | Afvang |
| --- | --- | --- |
| ESLint 10 voegt regels toe | lint-poort faalt in CI | golf 3 pas na een lokale lint-draai; drempel herbouwen (§10) |
| html-validate 11 schroeft de Node-vloer op (`>= 24.8.0`) | lokale poort valt weg op Node 20 | `engines.node` (golf 2) vóór golf 3; CI is al Node 24 |
| Playwright 1.65 vraagt verse browsers | lokale runs falen | `npx playwright install`; de CI installeert al elke run (`--with-deps`) |
| upload-artifact v7 zonder `actions: write` | artifact-stappen falen | §8 punt 1, in dezelfde commit |
| `report.json`-veld `"version"` schuift (1.62.1 → 1.65.x) | de geschiedenis-data krijgt hogere versiewaarden | Gemeten na golf 1: in 1.65 staat de versie in `config.version`, niet meer op het top-level van `report.json`. `scripts/ci-summary.mjs` leest alleen `report.stats` (regels 84-93) en is er onafhankelijk van; dezelfde run via `ci-summary.mjs` leverde `total 41 / passed 41 / passRate 100 / durationMs 83268` op. Geen schema-wijziging nodig. |
| Pages-cache na de deploy (CI-OVERVIEW §11) | nieuwe cijfers pas na ~10 min zichtbaar | normaal gedrag, geen bug; `workflow_dispatch` plus een reload |

Terugval is goedkoop en dat is een bewuste eigenschap van deze opzet: `npm ci` is
lockfile-gedreven, dus een golf is terug te nemen met één `git revert` — package.json en
package-lock.json zitten in dezelfde commit en de CI is ermee weer exact de oude run.

## 13. Wat de handmatige stap is (nodig voor golf 3)

Node 24 lokaal is nodig om dezelfde poorten te draaien als de CI. Op deze machine stond
systeem-Node v22.16; de definitieve validatie is daarom met `npx -y node@24` gedaan
(Node 24.22.3). Permanent lokaal zetten:

```
winget install OpenJS.NodeJS.LTS      # of: nvm install 24  (vervolgens nvm use 24)
node -v                               # verwachte uitkomst: v24.x (>= 24.8)
```

Zonder die stap geeft npm `EBADENGINE` voor het project en voor html-validate 11; de
CI is dan de gezaghebbende poort, want daar staat Node 24. In `README.md` "Aan de slag"
staat daarom de Node-vloer uit `engines.node` (dat is `package.json` zelf, dus er is
geen apart versiebestand voor nodig).

## 14. Openstaande beslissingen en statuslog

| # | Beslissing | Status |
| --- | --- | --- |
| 1 | Scope: volledige reeks (§4), TypeScript 7 en `@types/node` 26 **buiten** (§5) | **aangenomen** |
| 2 | Golf 1 + 2 uitvoeren (geen Node-verandering) | **uitgevoerd** (2026-11-12) |
| 3 | Golf 3 (ESLint 10, html-validate 11) — vereist Node 24 lokaal (§13) | **uitgevoerd** (2026-11-12) |
| 4 | Drempel `--max-warnings` herbouwen, doel 0 (§10) | **uitgevoerd**: drempel staat op 0 |
| 5 | Acties op SHA-pin (supply-chain-hardening) in plaats van major-tags | **open punt** — major-tags zijn leesbaarder in een showcase, SHA-pins veiliger; geen Dependabot meer |
| 6 | Node-beleid in `engines.node` (`>=24.8.0 <25`) met `node-version-file: package.json`; géén `.nvmrc` | **besloten/uitgevoerd** (2026-11-12, gebruiker: geen extra dotfile op de root) |
| 7 | Dependabot als onderhoudsmechanisme | **verwijderd** (2026-11-12): ongeldige trigger/schema en niet nodig voor dit doel |

Statuslog:

- **2026-11-12 — plan geschreven.** Metingen §1, §2, §3 genomen op commit `2ef9712`
  (werkboom schoon).
- **2026-11-12 — golf 1 uitgevoerd.** `package.json` en `package-lock.json` naar
  `@playwright/test` 1.65.0 (met `playwright` en `playwright-core` in spoor), `@types/node`
  24.19.2 en `typescript-eslint` 8.72.2. `npm install`: "changed 17 packages in 27s", met één
  warn (`EBADENGINE` voor `eslint-visitor-keys@5.0.1`, zie §2). Poorten: `npm run typecheck`,
  `npm run lint` (`--max-warnings=4`) en `npm run validate:html` **alle drie groen**.
  Browsers: `npx playwright install chromium` (chromium-1254, chromium-headless-shell-1254,
  ffmpeg-1013). `npm run test:local`: **41 van 41 tests geslaagd**, officiële afsluit
  `41 passed (1.4m)` als officiële afsluitregel van de run (chromium, 1 worker, 0 retries, tegen `docs/` op poort 8080);
  `report.json` -> `stats: expected 41, unexpected 0, skipped 0, flaky 0, duration 83268.817 ms`
  (`ci-summary.mjs` afkapt dat op 83268).
  Extra compatiblesiteitstoets: `node scripts/ci-summary.mjs` op diezelfde report (naar een
  tijdelijke history, de echte `docs/data/playwright-history.json` is niet aangeraakt) gaf
  `total 41 / passed 41 / passRate 100` — de geschiedenis-pijplijn verstaat de 1.65-report
  ongewijzigd (§12). Bij golf 1 stonden ESLint 9 en html-validate 10 nog op 9 / 10;
  golf 3 heeft ze bijgewerkt.
  Kanttekening bij het meten: deze shell-harness velt een draaiend proces zodra er een nieuw
  commando start; de suite is daarom afgeschermd (`Start-Process`) gedraaid en uitsluitend met
  bestandslezingen gepold, anders knipt men de afsluitregel van de run af.
- **2026-11-12 — golf 2 uitgevoerd** (toen niet apart gecommit, zie de slotregel van dit
  log). Golf 2:
  `.github/workflows/playwright.yml` naar `actions/upload-artifact@v7` (3 stappen), `permissions`
  uitgebreid met `actions: write`, `actions/setup-node` leest de Node-tak uit
  `package.json` (`node-version-file`) met `cache: npm` op `package-lock.json`, en
  `timeout-minutes: 20` op de job. `package.json` kreeg
  `engines.node = ">=24.8.0 <25"`. Dependabot hoorde bij golf 2 maar is later verwijderd
  (zie §9).
  Bewijs: de workflow-AST toont `permissions.actions = "write"`,
  `timeout-minutes = 20`, `node-version-file = "package.json"` en driemaal
  `upload-artifact@v7`; `package.json` parseert en `npm run check` is groen.
- **2026-11-12 — `.nvmrc` weer vervallen** op verzoek van de gebruiker ("dit verontreinigt
  de repo"). Terecht, en gemeten in de bron van setup-node: `src/util.ts`, functie
  `getNodeVersionFromFile`, parseert het opgegeven bestand als JSON en leest op volgorde
  `volta.node`, `devEngines.runtime` (`name: node`) en `engines.node`; de `action.yml` noemt
  `package.json` als eerste voorbeeld van `node-version-file`. Actie: `.nvmrc` verwijderd,
  `engines.node` naar `">=24.8.0 <25"` (de `<25`-grens houdt Node 25/26 van de CI af, want
  setup-node lost een range op tot de hoogste matching versie), en
  `node-version-file: package.json` in de workflow. Eén veld, twee consumenten: npm toetst
  de vloer, setup-node pakt de tak.
- **2026-11-12 — geen committeren door de agent.** Het reflog
  (`git --no-pager reflog`) toont dat elke commit die ik aanmaakte (`655508b`, `3b26ce8`,
  `90056fc`, `f1cc0d7`, `4e456ae`, `31c41f6`, `61c3db5`, `269e26f`) door de gebruiker weer
  is weggezet met `reset: moving to HEAD~`. Dat is geen ongeluk: de gebruiker uncommittert
  bewust om het werk in de werkbom te kunnen reviewen, en dat kan niet als een agent het
  wegcijfert naar een commit. Consequentie voor dit document: **commit-SHA's zijn hier niet
  de waarheid, de werkbom is de waarheid.** Meetbare status na de laatste reset:
  `git --no-pager log --oneline -2` = `2ef9712`, `00e057c` (en `2ef9712` = `origin/main`);
  `git status --short` = `M .github/workflows/playwright.yml`, `M AGENTS.md`, `M README.md`,
  `M package-lock.json`, `M package.json`, `?? .github/dependabot.yml`,
  `?? Project-documentation/PLAN-DEPENDENCY-UPGRADES.md`; `git diff --stat` = 5 bestanden,
  125 toegevoegd / 110 verwijderd (de twee nieuwe bestanden staan er als `??` bij).
  `git ls-files` bevat **geen** `.nvmrc`.

- **2026-11-12 — Dependabot verwijderd en workflow gerepareerd.** De trigger
  `on.dependabot` is geen geldig Actions-event: GitHub wees de workflow af met
  `Unexpected value 'dependabot'` (line 39), en run #56 had **0 jobs**. De config had
  `groups` top-level en `apply: "all"`, wat volgens het Dependabot v2-schema ongeldig is.
  `.github/dependabot.yml`, de `pull_request`-trigger en het `dependabot`-blok zijn
  verwijderd; de workflow heeft weer `schedule` + `workflow_dispatch`.
- **2026-11-12 — golf 3 uitgevoerd.** `eslint` 10.14.0, `@eslint/js` 10.0.1 en
  `html-validate` 11.21.0. De lockfile heeft geen `"deprecated"`-velden meer. Voor de
  laatste transitive warning (`whatwg-encoding` via `http-server`) is
  `html-encoding-sniffer@7` als gerichte override toegevoegd; die API is compatibel.
  `npm run lint` is schoon op `--max-warnings=0`, en `npm ci`, `npm run check` en
  `npm run test:local` zijn onder Node 24.22.3 gevalideerd. De suite blijft 41/41.
- **Les voor de schrijver van dit document:** dit statuslog verwees eerst naar commits die
  niet in de geschiedenis zitten (eerst `3b26ce8`/`90056fc`/`655508b`, daarna `f1cc0d7`,
  daarna `61c3db5`). Twee fouten, één richting: een bewijsdocument mag geen referenties uit
  het eigen geheugen halen, en in deze repo is een commit van de agent geen eindstaat.
  De regel in `AGENTS.md` ("agent committet niet, de gebruiker reviewt en committet") lost
  beide op: er zijn dan geen SHA's om na te kijken, alleen een werkbom die je kunt lezen.


- **Niet te bewijzen claim, bijgesteld:** `report.json` kent geen top-level `version`-veld
  (`node -e "...r.version"` gaf `undefined`). De versie van de draaiende Playwright-tak is
  daarom niet uit de report af te lezen; wél uit `package-lock.json` (1.65.0, §2).



