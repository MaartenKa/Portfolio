# Playwright Best Practices — Coding Agent Reference

| Veld | Waarde |
| --- | --- |
| **Versie** | 1.2 — november 2026 |
| **Status** | Interne projectrichtlijn; geen formele ISTQB/Playwright-standaard |
| **Bronnen** | Playwright Best Practices, Playwright Locator-guide, ISTQB CTFL-syllabus, ISO/IEC/IEEE 29119-3, Google TypeScript Style Guide, TSDoc, MDN CSS/HTML-comments |

**Doel:** schrijf Playwright-tests die betrouwbaar, onderhoudbaar, snel, deterministisch en gebruikersgericht zijn.

## 1. Kernprincipes

   Test gebruikersgedrag, niet implementation details.

   Houd tests onafhankelijk, geïsoleerd en deterministisch.

   Gebruik Playwright's auto-waiting en web-first assertions.

   Vermijd vaste sleeps en fragiele selectors.

   Gebruik de UI voor wat je daadwerkelijk als gebruiker wilt testen; gebruik API/helpers voor efficiënte setup.

   Mock externe dependencies wanneer controle/reproduceerbaarheid belangrijk is.

   Maak tests geschikt voor parallel execution.

   Gebruik Playwright tooling (trace/report/inspector) om failures te onderzoeken.

## 2. Locators

**Officiële Playwright-volgorde (user-facing eerst):**

```text
getByRole()
getByText()
getByLabel()
getByPlaceholder()
getByAltText()
getByTitle()
getByTestId()
CSS/XPath alleen als laatste redmiddel
```

**Projectconventie:** waar de site een expliciet `data-testid`-contract heeft,
mag `getByTestId()` als stabiel testcontract worden gebruikt. Dat is een
projectkeuze, niet omdat `getByTestId()` in de officiële volgorde hoger staat
dan tekst, label of placeholder. Gebruik het alleen wanneer de markup die ID
bewust garandeert.

Goed:

```ts
page.getByRole('button', { name: 'Save' });
page.getByLabel('Email');
page.getByTestId('checkout-submit'); // expliciet testcontract
```

Vermijd:

```ts
page.locator('.btn-primary');
page.locator('div:nth-child(3)');
page.locator('//div[2]/button');
```

Regels:

- Maak locators specifiek genoeg om één logisch element te identificeren.
- Gebruik chaining/filtering bij lijsten:
  `locator.filter({ hasText: '...' })`.
- Geef voorkeur aan user-facing/semantische selectors.
- Gebruik `data-testid` als expliciet stabiel testcontract wanneer semantische
  locators onvoldoende zijn.
- Vermijd selectors gebaseerd op toevallige DOM/CSS-structuur.
- Gebruik geen `ElementHandle`/laag-niveau DOM API als een Locator volstaat.


## 3. Acties & waiting

Gebruik normale Playwright-acties:

await page.getByRole('button', { name: 'Submit' }).click();

Playwright wacht automatisch op actionability.

NIET:

await page.waitForTimeout(2000);

Vermijd ook onnodige:

page.waitForSelector(...)
page.waitForLoadState(...)

Gebruik alleen expliciete waits wanneer er een echte specifieke reden voor is.

> **Projectgeschiedenis — `networkidle`:** `BasePage.goto()` en de
> smoke-check gebruikten vroeger `waitForLoadState('networkidle')`; dat is
> verwijderd. `networkidle` is geen betrouwbaar readiness-signaal. De
> ESLint-regel `playwright/no-networkidle` staat uit in `eslint.config.mjs`,
> maar dat is geen aanmoediging om de wait te gebruiken. Nieuwe tests
> gebruiken web-first assertions.

Synchroniseer op betekenisvolle toestand:

await expect(page.getByText('Saved')).toBeVisible();
await expect(page).toHaveURL(/dashboard/);

Nooit een sleep gebruiken om een race condition te verbergen.

## 4. Assertions

Gebruik altijd bij voorkeur web-first assertions:

await expect(locator).toBeVisible();
await expect(locator).toHaveText('Done');
await expect(locator).toHaveValue('foo');
await expect(locator).toBeEnabled();
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveTitle(/Dashboard/);

Vermijd:

expect(await locator.textContent()).toBe('Done');

Web-first assertions retryen tot de verwachte toestand bereikt is of de timeout verloopt.

Assertions moeten gebruikersrelevant zijn; vermijd assertions op irrelevante DOM-details.

## 5. Test isolation

Elke test moet zelfstandig kunnen draaien.

Niet:

test A maakt data
test B gebruikt data van A
test C gebruikt state van B

Wel:

test A → eigen state
test B → eigen state
test C → eigen state

Vereisten:

    Geen afhankelijkheid van testvolgorde.

    Geen gedeelde mutable browser state.

    Geen afhankelijkheid van een vorige test.

    Tests moeten parallel kunnen draaien waar mogelijk.

    Vermijd serial; gebruik het alleen wanneer echte state-afhankelijkheid onvermijdelijk is.

Playwright Browser Contexts zorgen voor geïsoleerde cookies/storage/session state.

## 6. Testdata & database

Maak testdata voorspelbaar.

Prefer:

test → gecontroleerde data/state → test

over:

test → willekeurige gedeelde omgeving

Gebruik unieke data wanneer parallelle tests elkaar anders kunnen beïnvloeden.

Gebruik API/database helpers voor snelle setup wanneer de setup zelf niet het gedrag is dat je wilt testen.

Gebruik de UI alleen voor setup wanneer de UI-flow onderdeel van de test is.

## 7. Authentication

Gebruik storageState om login-state te hergebruiken wanneer passend.

Bijvoorbeeld:

use: {
storageState: 'playwright/.auth/user.json',
}

Bewaar storageState-bestanden niet in Git. Ze bevatten cookies, tokens en sessiestate die per omgeving gelden. De login-credentials die je gebruikt om deze state aan te maken, hoort als secret behandeld te worden.

Voeg bijvoorbeeld toe aan `.gitignore`:

playwright/.auth/

Als tests server-side dezelfde account-state wijzigen:

    gebruik aparte accounts per worker, of

    ontwerp tests zodat ze geen conflicterende state delen.

Kies shared auth alleen wanneer tests server-side veilig dezelfde state kunnen delen.

## 8. Fixtures

Gebruik fixtures voor gedeelde test-infrastructuur:

    authenticated users

    Page Objects

    API clients

    testdata

    database setup

    reusable environment setup

Gebruik fixtures om setup/teardown en dependencies expliciet te maken.

Gebruik beforeEach voor eenvoudige per-test setup.

Gebruik beforeAll/afterAll alleen voor echte worker-level/global setup; maak tests niet afhankelijk van hook-volgorde.

## 9. Page Objects

Gebruik Page Objects wanneer de suite groot/complex genoeg is.

Een Page Object moet betekenisvolle gebruikersacties abstraheren:

loginPage.login(email, password)
checkoutPage.completeOrder()

Niet ieder DOM-element hoeft een aparte class/methode te krijgen.

Doel:

    selectors centraliseren

    herhaling verminderen

    onderhoudbaarheid verhogen

    tests leesbaar houden

Kleine tests mogen direct Locators gebruiken.

## 10. Network & external dependencies

Test externe systemen niet onnodig als onderdeel van jouw E2E-test.

Mock/route externe dependencies wanneer nodig voor:

    determinisme

    snelheid

    foutscenario's

    third-party services

    specifieke responses

Voorbeeld:

await page.route('\*\*/api/products', async route => {
await route.fulfill({
status: 200,
json: [{ id: 1, name: 'Product A' }],
});
});

Mock niet blind alles: houd belangrijke integratiepaden met echte systemen waar die integratie zelf onderdeel van het risico is.

## 11. API testing

Gebruik APIRequestContext voor API-tests en efficiënte setup.

Typisch patroon:

API → setup/testdata
UI → gebruikersgedrag

Gebruik API calls bijvoorbeeld om een user/order/entity te creëren voordat de UI-test begint.

Zo voorkom je lange UI-setup voor state die niet relevant is voor de test.

## 12. Parallelism

Ontwerp tests vanaf het begin voor parallel execution.

Elke test moet:

    eigen state/data hebben;

    geen andere test beïnvloeden;

    geen volgorde aannemen.

Voor zeer grote suites kan sharding worden gebruikt:

npx playwright test --shard=1/3

Gebruik `test.describe.configure({ mode: 'parallel' })` alleen wanneer tests daadwerkelijk onafhankelijk zijn.

Overweeg soft assertions (`expect.soft`) voor meerdere onafhankelijke checks in één test; zo falen ze niet direct maar rapporteert Playwright alle failing assertions aan het einde van de test.

## 13. Retries & flaky tests

Retries zijn een diagnostisch vangnet, geen oplossing.

Als een test:

first run → fail
retry → pass

is hij flaky.

Onderzoek de oorzaak:

    race condition

    slechte locator

    gedeelde state

    externe dependency

    timing

    testdata

    applicatiebug

Verhoog niet simpelweg retries/timeouts om flakiness te verbergen.

Een defect dat in élke retry met dezelfde maat terugkomt, is géén testflake: de retry is
een vangnet, geen reparatie. In run 72 faalden de vier RESP-01-cases in elke poging met
dezelfde overloop (537 px content in een viewport van 500 px) — dat is deterministisch
environment-gedrag van de runner, niet de suite.

## 14. Timeouts

Gebruik timeouts bewust.

Belangrijkste categorieën:

    test timeout

    expect timeout

    action timeout

    navigation timeout

    fixture timeout

    global timeout

Gebruik geen extreem hoge timeout om slechte synchronisatie te maskeren.

Als een test langzaam is, bepaal eerst waarom.

Gebruik globalTimeout in CI om runaway suites te begrenzen.

## 15. Time-dependent behavior

Voor tests die afhankelijk zijn van tijd:

    gebruik Playwright Clock wanneer relevant;

    maak tijd deterministisch;

    vermijd wachten op echte tijd.

Bij een vaste tijd kan bijvoorbeeld page.clock.setFixedTime(...) worden gebruikt.

## 16. page.evaluate()

Gebruik page.evaluate() alleen wanneer directe browser-JS daadwerkelijk nodig is.

Prefer:

await page.getByRole('button', { name: 'Submit' }).click();

over:

await page.evaluate(() => {
document.querySelector('#submit')?.click();
});

E2E-tests moeten zoveel mogelijk via normale browser/user-interactie werken.

## 17. Browser coverage

Test bewust op de browser engines die relevant zijn:

    Chromium

    Firefox

    WebKit

Gebruik meerdere browser projects wanneer cross-browser gedrag onderdeel van het risico is.

## 18. CI

CI moet minimaal:

    dependencies installeren;

    alleen de benodigde Playwright browsers installeren;

    typecheck uitvoeren (`tsc --noEmit`);

    lint uitvoeren (ESLint);

    tests uitvoeren;

    artifacts/reports bewaren bij failures.

Voorbeeld:

```bash
npm ci
npx playwright install --with-deps chromium
npx tsc --noEmit
npx eslint .
npx playwright test
```

Installeer alleen browsers die de pipeline daadwerkelijk nodig heeft.

> **Projectstatus:** `playwright.yml` installeert alleen Chromium
> (`npx playwright install --with-deps chromium`), want er is één `chromium`-project
> in `playwright.config.ts` en `playwright.local.config.ts`. De vroegere beperking —
> alle engines bij één project — is in de werkbom opgelost. Zie `TESTPLAN.md` §10.1
> en §10.3 punt 3.

De runner is niet de lokale machine: de system-uitvalfont is er breder. Een layout-assert
op documentbreedte ("geen horizontale scroll") is environment-gevoelig, dus een groene
live-run op eigen machine is geen bewijs voor CI. Reproduceer de CI-stand lokaal door een
brede font te forceren — `page.addStyleTag` met `* { font-family: Verdana, sans-serif
!important; }` op de lokale `docs/`-build — en zoek de overloopende box door elementen één
voor één te verbergen en de pseudo-elementen per class uit te schakelen. Fix de bron in de
site-CSS (woorden en URLs laten breken met `overflow-wrap: break-word` op `body`), niet de
assert: de check die hier faalde, vond een echt mobiel defect.

Gebruik Linux voor CI waar mogelijk (goedkoper en sneller). Schaal parallelism bewust via workers/sharding; een conservatieve default is één worker voor stabiliteit.

## 19. TypeScript & linting

Gebruik TypeScript waar mogelijk. Playwright ondersteunt `.ts`-tests out of the box.

Gebruik ESLint met `@typescript-eslint/no-floating-promises` om vergeten awaits op te sporen.

Aanbevolen controle in CI:

tsc --noEmit
npx eslint .

## 20. Debugging & tooling

Vooral voor CI-failures en lokale debugging is de **Trace Viewer** de belangrijkste bron: timeline, DOM-snapshots per actie, network requests en console logs in één PWA.

Lokale opties (in volgorde van aanbeveling):

1. VS Code extension — live breakpoints en locator-highlighting
2. `npx playwright test --debug` of `--trace on`
3. UI Mode (`npx playwright test --ui`)

Overig tooling:

    Inspector

    UI Mode

    Codegen (startpunt, niet automatisch finale code)

    Trace Viewer

    HTML Reporter

    screenshots/videos als aanvulling

Codegen is een startpunt; maak gegenereerde selectors daarna onderhoudbaar.

Gebruik bijvoorbeeld:

use: {
trace: 'on-first-retry',
}

om traces vooral bij problematische tests te verzamelen. Stel `trace` niet op `'on'` in voor alle tests, omdat dat prestatie-verzwakking geeft.

## 21. Reports

Gebruik de HTML reporter voor lokale/CI debugging.

Bij failures zijn traces vaak waardevoller dan alleen stack traces.

Bewaar relevante CI artifacts:

    HTML report

    trace

    screenshot

    video indien nodig

Gebruik video niet standaard als trace/screenshot voldoende is; artifacts kosten opslag.

## 22. Determinisme

Minimaliseer afhankelijkheid van:

    echte tijd

    random data

    gedeelde database state

    externe APIs

    netwerkfluctuaties

    testvolgorde

    lokale machine state

    onvoorspelbare third-party services

Een goede test heeft dezelfde uitkomst wanneer hij opnieuw, alleen of parallel wordt uitgevoerd.

## 23. Test pyramid

Gebruik niet alles als E2E.

Richtlijn:

        E2E
      /     \

API/integration
/ \
 unit

Gebruik E2E voor belangrijke gebruikersflows en browsergedrag.

Gebruik unit/integration/API-tests voor logica en lagere lagen waar browsergedrag niet relevant is.

Doel: maximale confidence met minimale dure/flaky browser-tests.

## 24. Test naming

Testnamen moeten het gedrag beschrijven:

Goed:

test('user can complete checkout', ...)
test('invalid password shows an error', ...)

Minder goed:

test('button works', ...)
test('test login', ...)

Beschrijf wat de gebruiker/business-flow verwacht.

## 25. Test structure

Houd tests kort en gefocust.

Een test moet idealiter één logisch gedrag of één belangrijke user flow bewijzen.

Vermijd enorme tests:

login
→ create user
→ create product
→ edit product
→ checkout
→ refund
→ logout

Als één stap faalt, wordt diagnose moeilijk en isolation slecht.

Splits onafhankelijke scenario's op.

## 26. Anti-patterns

Vermijd:

await page.waitForTimeout(...)

await page.$(...) // discouraged; gebruik Locator
await page.$eval(...) // discouraged; gebruik Locator

page.locator('div:nth-child(4)')

await page.evaluate(() => element.click())

expect(await locator.textContent()).toBe(...)

en:

test.describe.configure({ mode: 'serial' })

zonder expliciete reden.

Ook vermijden:

    gedeelde accounts met conflicterende state;

    tests die andere tests moeten uitvoeren;

    willekeurige production/staging data;

    enorme timeouts;

    retries als permanente workaround;

    overmatig gebruik van Page Objects;

    alles mocken;

    alles via UI opzetten.

## 27. Recommended default config

Gebruik een eenvoudige, expliciete configuratie als uitgangspunt:

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
testDir: './tests',

fullyParallel: true,

forbidOnly: !!process.env.CI,

retries: process.env.CI ? 2 : 0,

workers: process.env.CI ? 1 : undefined,

reporter: process.env.CI
? 'html'
: 'list',

use: {
baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

},

projects: [
{
name: 'chromium',
use: { ...devices['Desktop Chrome'] },
},
],
});

Pas dit aan de daadwerkelijke CI/browser/teststrategie aan; kopieer geen instellingen blind.

## 28. Agent decision rules

Bij het schrijven/wijzigen van een Playwright-test:

1. Wat is het gebruikersgedrag?
2. Kan ik het met een user-facing Locator vinden?
3. Kan Playwright auto-waiten?
4. Welke web-first assertion bewijst het gedrag?
5. Is de test onafhankelijk?
6. Is testdata gecontroleerd?
7. Kan setup via API/fixture sneller?
8. Is een externe dependency verantwoordelijk?
9. Moet die dependency gemockt worden?
10. Kan deze test parallel draaien?
11. Als hij flaky is: wat is de echte oorzaak?
12. Is een Page Object/fixture daadwerkelijk nodig?

## 29. Locator decision tree

Element zoeken
│
├─ Duidelijke ARIA/user-facing rol?
│ └─ getByRole()
│
├─ Duidelijke zichtbare tekst?
│ └─ getByText()
│
├─ Form field met label?
│ └─ getByLabel()
│
├─ Placeholder?
│ └─ getByPlaceholder()
│
├─ Alt-tekst?
│ └─ getByAltText()
│
├─ Title?
│ └─ getByTitle()
│
├─ Expliciet data-testid-contract?
│ └─ getByTestId()
│
└─ Nog steeds niet mogelijk?
  └─ CSS/XPath, zo specifiek/stabiel mogelijk

## 30. Assertion decision tree

Wil je browser/UI-state controleren?
│
└─ Gebruik expect(locator/page).<web-first assertion>()

Voorbeelden:
visible → toBeVisible()
enabled → toBeEnabled()
text → toHaveText()
value → toHaveValue()
attribute → toHaveAttribute()
URL → toHaveURL()
title → toHaveTitle()
count → toHaveCount()

Vermijd eerst data ophalen en daarna een gewone assertion doen wanneer een web-first assertion bestaat.

## 31. Definition of Done

Een nieuwe Playwright-test is klaar wanneer:

    gedrag vanuit gebruikersperspectief duidelijk is;

    locators stabiel en semantisch zijn;

    geen onnodige sleeps/waits aanwezig zijn;

    web-first assertions worden gebruikt;

    test onafhankelijk is;

    testdata deterministisch is;

    externe dependencies bewust zijn behandeld;

    test parallel kan draaien;

    geen onnodige evaluate()/DOM APIs worden gebruikt;

    TypeScript geen fouten geeft;

    lint geen relevante fouten geeft;

    test lokaal herhaaldelijk slaagt;

    failure/debugging via trace/report mogelijk is.

## 32. Prioriteitsvolgorde bij trade-offs

Wanneer meerdere oplossingen mogelijk zijn, geef voorkeur aan:

    Correctheid

    Determinisme

    Gebruikersgerichtheid

    Test isolation

    Onderhoudbaarheid

    Leesbaarheid

    Performance

    Complexe abstractions alleen wanneer nodig

Een kortere test is niet automatisch beter als hij daardoor fragiel wordt.

## 33. Golden rule

Bij twijfel:

    Gebruik de hoogste abstractielaag die nog het echte gedrag betrouwbaar test.

Dus:

user behavior
↓
Locator + Playwright action
↓
web-first assertion
↓
isolated deterministic test

en niet:

DOM manipulation
↓
manual sleep
↓
implementation-detail assertion
↓
shared state

## 34. Accessibility & keyboard testing

Test accessibility als gebruikersgedrag, niet als puur CSS/DOM-detail.

Goede Playwright-dekking:

- menu openen/sluiten via `getByRole('button', ...)`;
- focus verplaatsen met `Tab`, `Escape` en klik-buiten-het-menu;
- skip-link triggeren met toetsenbordfocus;
- `aria-expanded`, `aria-label`, `aria-hidden` en zichtbaarheid combineren;
- focus assertions met `toBeFocused()`.

Voorbeelden:

```ts
const toggle = page.getByRole('button', { name: 'Open navigatie' });
const menu = page.getByTestId('nav-links');

await toggle.click();

await expect(menu).toBeVisible();
await expect(toggle).toHaveAttribute('aria-expanded', 'true');
await expect(menu.getByRole('link').first()).toBeFocused();

await page.keyboard.press('Escape');

await expect(menu).toBeHidden();
await expect(toggle).toHaveAttribute('aria-expanded', 'false');
await expect(toggle).toBeFocused();
```

> `.open` is een project-specifiek CSS-contract. Assert die class alleen als je
> dat contract bewust test; voor gebruikersgedrag zijn `toBeVisible()`/
> `toBeHidden()` en `aria-expanded` de primaire assertions.

Voor skip-links:

```ts
const skip = page.getByRole('link', { name: 'Ga naar hoofdinhoud' });

await page.keyboard.press('Tab');
await expect(skip).toBeFocused();

await page.keyboard.press('Enter');
await expect(page).toHaveURL(/#hoofdinhoud$/);
await expect(page.locator('#hoofdinhoud')).toBeInViewport();

// Alleen toevoegen als het doel focusbaar is, bijvoorbeeld met tabindex="-1":
// await expect(page.locator('#hoofdinhoud')).toBeFocused();
```

Voor decoratieve iconen:

```ts
await expect(page.locator('.card-icon')).toHaveAttribute('aria-hidden', 'true');
```

Voor contrast, high contrast, forced-colors en screenreader-gedrag: gebruik
aanvullend axe-core, Lighthouse, CSS-analyse en handmatige controles;
Playwright kan alleen het DOM-/interactiegedrag bewijzen dat via de browser
toegankelijk is.

## 35. Local docs verification

Wanneer de Playwright-suite standaard tegen een live URL draait, zijn lokale
`docs/`-wijzigingen niet direct gedekt door `npx playwright test`.

Gebruik de vaste hulpm-config in de repo, `playwright.local.config.ts` (eigen `baseURL`
en eigen `webServer`), zodat de standaardconfig ongemoeid blijft:

```ts
use: {
  baseURL: 'http://127.0.0.1:8080/',
},

webServer: {
  command: 'npx http-server docs -p 8080 -s',
  url: 'http://127.0.0.1:8080',
  reuseExistingServer: !process.env.CI,
},
```

Start de tests met:

```bash
npm run test:local   # = npx playwright test -c playwright.local.config.ts
```

Vermijd ad-hoc configs met eigen poorten (3000 en 3123 zijn historical; één vaste
lokale poort houdt handleidingen en artifacts consistent). Tijdelijke specs zelf
verwijderen na verifiëring, bewezen gedrag naar `playwright/tests/`.

Dezelfde hulp-config kent een kijkmodus met de env-vlag `PW_VIEW=1`
(`npm run test:localVideo`): `video: { mode: 'on' }`, `trace: 'on'`,
`screenshot: 'on'`, headed en open HTML-rapport, zodat ook een geslaagde run na te
kijken is. `retain-on-failure` verwijdert de video van de geslaagde runs; er is dan
niets te kijken. De standaardrun blijft die lichte variant. Artifacten staan in
`playwright/test-results/` (gitignore-gebied) en als bijlage in het HTML-rapport;
de CI en de `report.json`-flow (`CI-PLAYWRIGHT-HISTORY.md §11.3`) blijven onverandert.

## 36. Commentaar en documentatie

Commentaar is geen tweede implementatie. Het legt intentie, randvoorwaarden en
trade-offs vast; de code blijft de bron van waarheid. Vermijd commentaar dat
alleen herhaalt wat de code al zegt.

### 36.1 Taal en toon

- Nederlands, met Engelse API- en technische termen waar ze gangbaar zijn
  (`page object`, `fixture`, `testid`, `console-error`, `CI-run`).
- Geen Dunglish, geen eerste persoon en geen changelog-achtige teksten.
- Volzinnen met hoofdletter en punt. Sectiebanners zijn labels en krijgen geen
  punt.

### 36.2 Bestandsheader

Handgeschreven TS/JS-modules (page objects, fixtures, utils, configs, scripts en
de site-JS) beginnen met één padregel. Test-specs krijgen geen verplichte header;
hun testnamen zijn de documentatie.

```ts
// Portfolio — playwright/pages/base.page.ts
```

Een korte tweede regel met de verantwoordelijkheid is toegestaan:

```ts
// Portfolio — src/ts/main.ts
// Menu-toggle en CI-history-UI voor de statische site.
```

HTML, JSON en build-output krijgen geen verplichte header.

### 36.3 JSDoc/TSDoc

Gebruik `/** ... */` voor geëxporteerde klassen, types/interfaces,
betekenisvolle constanten en publieke methods waarvan de betekenis, parameters of
returnwaarde niet vanzelfsprekend zijn:

```ts
/**
 * Navigeert naar de contactpagina en controleert titel en status.
 *
 * @param path - Relatief pad binnen de site.
 * @returns De HTTP-response van de navigatie.
 * @throws Als de pagina niet met status 200 laadt.
 */
```

Regels:

- In TypeScript geen types in JSDoc herhalen; de signatuur is de bron.
- `@param naam - beschrijving` en `@returns` alleen wanneer de betekenis niet
  vanzelfsprekend is.
- `@remarks` voor langere context, `@example` voor een verhelderend voorbeeld,
  `@see` voor verwijzingen naar `PLAYWRIGHT.md`, `TESTPLAN.md` of
  `CI-OVERVIEW.md`.
- Eénregel-JSDoc is toegestaan voor simpele constanten, bijvoorbeeld:
  `/** Testcase F1/F9: geldige formulierdataset. */`
- In `.mjs`-scripts zijn JSDoc-types toegestaan, omdat er geen TypeScript-
  signatuur is.

### 36.4 Inline comments

Gebruik `//` voor implementatiedetails, niet voor API-documentatie. Schrijf
*waarom* iets gebeurt, welke randvoorwaarde geldt of waarom een workaround nodig
is:

```ts
// Relatief pad (conventie PLAYWRIGHT.md §8): een absoluut "/privacy.html"
// levert een 404 op de GitHub Pages-subpath /Portfolio/.
```

Vermijd stap-voor-stap commentaar dat elke regel herhaalt:

```ts
// Open het menu
await navPage.toggleMenu();
// Klik opnieuw → gesloten
await navPage.toggleMenu();
```

In tests zijn testnamen de primaire documentatie. Commentaar alleen voor
mockopzet, rekentechnieken of niet voor de hand liggend fixturegedrag.

### 36.5 TODO, FIXME en uitgecommentarieerde code

- `// TODO(<naam of issue>): <wat en waarom>`
- `// FIXME: <wat er mis is en waarom het nog niet is opgelost>`
- Geen kale `TODO` zonder eigenaar of issue.
- Uitgecommentarieerde code alleen met reden en heropeningsinstructie, zoals de
  bewust uitgeschakelde `push`-trigger in `playwright.yml` of het lokale
  `webServer`-voorbeeld in `playwright.config.ts`.

### 36.6 Per bestandstype

| Type | Conventie |
| --- | --- |
| TypeScript/JavaScript | `//` voor implementatie; `/** ... */` voor documentatie |
| CSS | `/* ... */`; commentaar is niet nestbaar |
| HTML | `<!-- ... -->`; alleen voor echte toelichting, niet als sectielabel |
| YAML | `#`; commentaar boven het blok dat het toelicht |
| JSON | geen commentaar mogelijk; documenteer het schema elders |
| Gegenereerd | niet handmatig bewerken; bron aanpassen en opnieuw builden |

CSS-sectiebanners krijgen één vast formaat:

```css
/* =========================================================
   DESIGN SYSTEM — designtokens
   ========================================================= */
```

### 36.7 Definition of Done voor commentaar

Een comment is klaar wanneer hij:

- in correct Nederlands is geschreven;
- intentie of randvoorwaarde uitlegt, niet alleen de code herhaalt;
- bij een publieke API de juiste JSDoc/TSDoc-tags heeft;
- geen verouderde verwijzing of dode code bevat;
- in een gegenereerd bestand via de bron is aangepast.

## Bronnen

- Playwright — Best Practices: <https://playwright.dev/docs/best-practices>
- Playwright — Locators: <https://playwright.dev/docs/locators>
- ISTQB CTFL-syllabus (actuele versie) — testniveaus, testtypes en testtechnieken
- ISO/IEC/IEEE 29119-3 — testdocumentatie en traceerbaarheid
- Google TypeScript Style Guide — comments and documentation: <https://google.github.io/styleguide/tsguide.html>
- TSDoc — standaard voor TypeScript-doccomments: <https://tsdoc.org/>
- MDN — CSS comments: <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_syntax/Comments>
- MDN — HTML comments: <https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Comments>
- ESLint — regels voor commentaar: <https://eslint.org/docs/latest/rules/>
- Airbnb JavaScript Style Guide — comments: <https://github.com/airbnb/javascript#comments>

Deze lijst is een **projectrichtlijn**. Bij conflict tussen deze richtlijn en de
officiële Playwright-documentatie geldt de officiële documentatie.
