Playwright Best Practices — Coding Agent Reference

Doel: schrijf Playwright-tests die betrouwbaar, onderhoudbaar, snel, deterministisch en gebruikersgericht zijn.

1. Kernprincipes

   Test gebruikersgedrag, niet implementation details.

   Houd tests onafhankelijk, geïsoleerd en deterministisch.

   Gebruik Playwright's auto-waiting en web-first assertions.

   Vermijd vaste sleeps en fragiele selectors.

   Gebruik de UI voor wat je daadwerkelijk als gebruiker wilt testen; gebruik API/helpers voor efficiënte setup.

   Mock externe dependencies wanneer controle/reproduceerbaarheid belangrijk is.

   Maak tests geschikt voor parallel execution.

   Gebruik Playwright tooling (trace/report/inspector) om failures te onderzoeken.

2. Locators

Voorkeursvolgorde:

    getByRole()

    getByLabel()

    getByPlaceholder()

    getByText()

    getByAltText()

    getByTitle()

    getByTestId()

    CSS/XPath alleen wanneer nodig

Goed:

page.getByRole('button', { name: 'Save' })
page.getByLabel('Email')
page.getByTestId('checkout-submit')

Vermijd:

page.locator('.btn-primary')
page.locator('div:nth-child(3)')
page.locator('//div[2]/button')

Regels:

    Maak locators specifiek genoeg om één logisch element te identificeren.

    Gebruik chaining/filtering bij lijsten:
    locator.filter({ hasText: '...' }).

    Geef voorkeur aan user-facing/semantische selectors.

    Gebruik data-testid als expliciet stabiel testcontract wanneer semantische locators onvoldoende zijn.

    Vermijd selectors gebaseerd op toevallige DOM/CSS-structuur.

    Gebruik geen ElementHandle/laag-niveau DOM API als een Locator volstaat.

3. Acties & waiting

Gebruik normale Playwright-acties:

await page.getByRole('button', { name: 'Submit' }).click();

Playwright wacht automatisch op actionability.

NIET:

await page.waitForTimeout(2000);

Vermijd ook onnodige:

page.waitForSelector(...)
page.waitForLoadState(...)

Gebruik alleen expliciete waits wanneer er een echte specifieke reden voor is.

Synchroniseer op betekenisvolle toestand:

await expect(page.getByText('Saved')).toBeVisible();
await expect(page).toHaveURL(/dashboard/);

Nooit een sleep gebruiken om een race condition te verbergen. 4. Assertions

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

Assertions moeten gebruikersrelevant zijn; vermijd assertions op irrelevante DOM-details. 5. Test isolation

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

Playwright Browser Contexts zorgen voor geïsoleerde cookies/storage/session state. 6. Testdata & database

Maak testdata voorspelbaar.

Prefer:

test → gecontroleerde data/state → test

over:

test → willekeurige gedeelde omgeving

Gebruik unieke data wanneer parallelle tests elkaar anders kunnen beïnvloeden.

Gebruik API/database helpers voor snelle setup wanneer de setup zelf niet het gedrag is dat je wilt testen.

Gebruik de UI alleen voor setup wanneer de UI-flow onderdeel van de test is. 7. Authentication

Gebruik storageState om login-state te hergebruiken wanneer passend.

Bijvoorbeeld:

use: {
storageState: 'playwright/.auth/user.json',
}

Bewaar auth-state nooit in Git:

playwright/.auth

Als tests server-side dezelfde account-state wijzigen:

    gebruik aparte accounts per worker, of

    ontwerp tests zodat ze geen conflicterende state delen.

Kies shared auth alleen wanneer tests server-side veilig dezelfde state kunnen delen. 8. Fixtures

Gebruik fixtures voor gedeelde test-infrastructuur:

    authenticated users

    Page Objects

    API clients

    testdata

    database setup

    reusable environment setup

Gebruik fixtures om setup/teardown en dependencies expliciet te maken.

Gebruik beforeEach voor eenvoudige per-test setup.

Gebruik beforeAll/afterAll alleen voor echte worker-level/global setup; maak tests niet afhankelijk van hook-volgorde. 9. Page Objects

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

Kleine tests mogen direct Locators gebruiken. 10. Network & external dependencies

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

Mock niet blind alles: houd belangrijke integratiepaden met echte systemen waar die integratie zelf onderdeel van het risico is. 11. API testing

Gebruik APIRequestContext voor API-tests en efficiënte setup.

Typisch patroon:

API → setup/testdata
UI → gebruikersgedrag

Gebruik API calls bijvoorbeeld om een user/order/entity te creëren voordat de UI-test begint.

Zo voorkom je lange UI-setup voor state die niet relevant is voor de test. 12. Parallelism

Ontwerp tests vanaf het begin voor parallel execution.

Elke test moet:

    eigen state/data hebben;

    geen andere test beïnvloeden;

    geen volgorde aannemen.

Voor zeer grote suites kan sharding worden gebruikt:

npx playwright test --shard=1/3

Gebruik test.describe.configure({ mode: 'parallel' }) alleen wanneer tests daadwerkelijk onafhankelijk zijn. 13. Retries & flaky tests

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

Verhoog niet simpelweg retries/timeouts om flakiness te verbergen. 14. Timeouts

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

Gebruik globalTimeout in CI om runaway suites te begrenzen. 15. Time-dependent behavior

Voor tests die afhankelijk zijn van tijd:

    gebruik Playwright Clock wanneer relevant;

    maak tijd deterministisch;

    vermijd wachten op echte tijd.

Bij een vaste tijd kan bijvoorbeeld page.clock.setFixedTime(...) worden gebruikt. 16. page.evaluate()

Gebruik page.evaluate() alleen wanneer directe browser-JS daadwerkelijk nodig is.

Prefer:

await page.getByRole('button', { name: 'Submit' }).click();

over:

await page.evaluate(() => {
document.querySelector('#submit')?.click();
});

E2E-tests moeten zoveel mogelijk via normale browser/user-interactie werken. 17. Browser coverage

Test bewust op de browser engines die relevant zijn:

    Chromium

    Firefox

    WebKit

Gebruik meerdere browser projects wanneer cross-browser gedrag onderdeel van het risico is. 18. CI

CI moet minimaal:

    dependencies installeren;

    benodigde Playwright browsers installeren;

    typecheck uitvoeren;

    lint uitvoeren;

    tests uitvoeren;

    artifacts/reports bewaren bij failures.

Voorbeeld:

npm ci
npx playwright install --with-deps chromium
npx tsc --noEmit
npx eslint .
npx playwright test

Installeer alleen browsers die de pipeline daadwerkelijk nodig heeft.

Gebruik bij CI bewust worker-count/parallelism. Een conservatieve default is één worker voor stabiliteit; schaal via workers/sharding wanneer de CI-omgeving dat betrouwbaar ondersteunt. 19. TypeScript & linting

Gebruik TypeScript waar mogelijk.

Gebruik linting en voorkom vooral vergeten awaits.

Aanbevolen controle:

tsc --noEmit

Een vergeten await kan tot zeer verwarrend testgedrag leiden. 20. Debugging

Gebruik Playwright tooling:

    Inspector

    UI Mode

    Codegen

    Trace Viewer

    HTML Reporter

    screenshots/videos waar nuttig

Codegen is een startpunt, niet automatisch finale code. Maak gegenereerde selectors daarna onderhoudbaar.

Gebruik bijvoorbeeld:

use: {
trace: 'on-first-retry',
}

om traces vooral bij problematische tests te verzamelen. 21. Reports

Gebruik de HTML reporter voor lokale/CI debugging.

Bij failures zijn traces vaak waardevoller dan alleen stack traces.

Bewaar relevante CI artifacts:

    HTML report

    trace

    screenshot

    video indien nodig

Gebruik video niet standaard als trace/screenshot voldoende is; artifacts kosten opslag. 22. Determinisme

Minimaliseer afhankelijkheid van:

    echte tijd

    random data

    gedeelde database state

    externe APIs

    netwerkfluctuaties

    testvolgorde

    lokale machine state

    onvoorspelbare third-party services

Een goede test heeft dezelfde uitkomst wanneer hij opnieuw, alleen of parallel wordt uitgevoerd. 23. Test pyramid

Gebruik niet alles als E2E.

Richtlijn:

        E2E
      /     \

API/integration
/ \
 unit

Gebruik E2E voor belangrijke gebruikersflows en browsergedrag.

Gebruik unit/integration/API-tests voor logica en lagere lagen waar browsergedrag niet relevant is.

Doel: maximale confidence met minimale dure/flaky browser-tests. 24. Test naming

Testnamen moeten het gedrag beschrijven:

Goed:

test('user can complete checkout', ...)
test('invalid password shows an error', ...)

Minder goed:

test('button works', ...)
test('test login', ...)

Beschrijf wat de gebruiker/business-flow verwacht. 25. Test structure

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

Splits onafhankelijke scenario's op. 26. Anti-patterns

Vermijd:

await page.waitForTimeout(...)

await page.$(...)

await page.$eval(...)

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

27. Recommended default config

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

Pas dit aan de daadwerkelijke CI/browser/teststrategie aan; kopieer geen instellingen blind. 28. Agent decision rules

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

13. Locator decision tree

Element zoeken
│
├─ Heeft het een duidelijke ARIA/user-facing betekenis?
│ └─ getByRole()
│
├─ Form field met label?
│ └─ getByLabel()
│
├─ Duidelijke placeholder/tekst/alt/title?
│ └─ getByPlaceholder/getByText/getByAltText/getByTitle
│
├─ Geen betrouwbare user-facing locator?
│ └─ getByTestId()
│
└─ Nog steeds niet mogelijk?
└─ CSS/XPath, zo specifiek/stabiel mogelijk

30. Assertion decision tree

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

Vermijd eerst data ophalen en daarna een gewone assertion doen wanneer een web-first assertion bestaat. 31. Definition of Done

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

32. Prioriteitsvolgorde bij trade-offs

Wanneer meerdere oplossingen mogelijk zijn, geef voorkeur aan:

    Correctheid

    Determinisme

    Gebruikersgerichtheid

    Test isolation

    Onderhoudbaarheid

    Leesbaarheid

    Performance

    Complexe abstractions alleen wanneer nodig

Een kortere test is niet automatisch beter als hij daardoor fragiel wordt. 33. Golden rule

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
