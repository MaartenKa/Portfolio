# Plan — submit-guard en BVA-limieten van het contactformulier (F8)

**Status:** gebouwd en lokaal gemeten op 28 november 2026. Het CI-bewijs van de
submit-guard staat open tot de eerste run op de live site na de deploy van `main`.

## 1. Aanleiding

`TESTPLAN.md` §7 case F8 — "snel dubbel klikken op de verstuurknop, maximaal één POST
naar Formward, redirect blijft idempotent" — stond als Gepland. De
conditie-actietabel §7.1 regel R8 markeerde dit als het open F8-besluit, en
`TEST-SUITE-STATUS.md` §6 stap 6 plande de submit-guard samen met de BVA-grens in de
HTML (`maxlength`).

De stand vóór deze stap, gemeten in de repo:

- `docs/contact.html`: `required` op naam, e-mail en bericht; geen `id` op het
  formulier; géén `maxlength`, `minlength` of `pattern` op een van de velden.
- `src/ts/main.ts`: alleen de menu-toggle en de CI-history-UI — geen formuliocode,
  dus geen submit-guard.
- De contact-suite telde 16 tests, en F6 bounderde op een data-grens van 500 tekens
  zonder specificatiegrens (`TESTPLAN.md` §5.5).

## 2. Besluit

F8 is alléén deterministisch te asserten als de site de tweede submit zelf blokkeert:
native validatie en HTML-attributes voorkomen een dubbele submit niet. De
productwijziging is daarom in de scope opgenomen, in twee stappen die elk op zichzelf
groen zijn:

1. **BVA-limieten in de HTML** — `maxlength` op naam, onderwerp en bericht. F6
   boundert daardoor op een échte specificatiegrens.
2. **Submit-guard in de site-JS** — de eerste geldige submit markeert het formulier
   en deaktiveert de knop; een volgende submit wordt geblokkeerd.

De guard staat in `src/ts/main.ts` in het bestaande presence-patroon van de site
(`if (menuToggle && navLinks)`, `if (ciHistoryBody)`), dus op pagina's zonder
formulier doet de code niets.

## 3. De wijzigingen

### HTML (`docs/contact.html`)

- `<form>` krijgt `id="contact-form"` — de site-JS selecteert het formulier
  semantisch, niet via de `data-testid` (het testcontract uit PLAYWRIGHT §8).
- `maxlength="60"` op naam, `maxlength="100"` op onderwerp, `maxlength="500"` op bericht.
- De `data-testid`-contracten blijven onverandert; `html-validate` en de
  unique-id-check uit SEO-04 blijven de poorten.

### Site-JS (`src/ts/main.ts`, gebouwd naar `docs/js/ts/main.js`)

- Submit-handler op het formulier: bij de eerste geldige submit
  `dataset.submitted = "true"` en `disabled` op de submitknop; bij een volgende
  submit `preventDefault()`.
- Na een wijziging in `src/ts/main.ts` moet `npm run build` gedraaid worden; het
  gebouwde bestand staat in de repo en de CI bouwt het niet (`CI-OVERVIEW.md` §12 punt 4).

### Testcode

- `playwright/utils/test-data.ts`: `NAME_MAX_LENGTH` (60), `SUBJECT_MAX_LENGTH` (100),
  `MESSAGE_MAX_LENGTH` (500), `AT_LIMIT_CONTACT` (elk gelimiteerd veld op de limiet)
  en `EXCESS_CHAR` (één teken boven de limiet); `BOUNDARY_CONTACT` boundert nu op de
  limiet zelf.
- `playwright/pages/contact.page.ts`: `expectMaxLengthContract()`, `typeMessage()` met
  `expectMessageLength()`, `expectSubmitGuardIdle()` en `expectDoubleSubmitBlocked()`.
- `playwright/fixtures/formward.mock.ts`: `expectPostedLength()` — de lengte van één
  payload-veld, zodat de afkapping doorwerkt tot de POST die Formward ontvangt.
- `playwright/tests/functional/contact-functional.spec.ts`: de nieuwe describe-groep
  "Formulier-limieten en submit-guard (F8)" met vijf tests.

## 4. De vijf tests

| ID  | Test                                   | Assert                                                                                          |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| F8c | `F8c: de maxlength-limieten staan in het formulier` | de `maxlength`-attribute op naam (60), onderwerp (100) en bericht (500) |
| F8d | `F8d: de limietwaarden vullen het formulier volledig` | geldige submit, één POST, en de payload-lengtes 60 / 100 / 500 |
| F8e | `F8e: bericht boven de limiet wordt afgekapte tot de limiet` | één teken boven de limiet: `value.length === 500`, en de POST draagt de afgekapte lengte |
| F8a | `F8a: de submit-guard staat niet op bij een ongeldige submit` | geen redirect, formulier ongeldig, geen guard-markering, knop nog actief, 0 POSTs |
| F8b | `F8b: de dubbele submit-actie levert maximaal één POST op` | de guard markeert het formulier en deaktiveert de knop; de tweede submit voegt geen POST toe; de redirect blijft idempotent |

## 5. Metingsmethodiek en determinisme

- **Typen, niet `fill()`:** de browser past `maxlength` toe bij typen, terwijl
  `fill()` de `value` direct zet en de limiet omzeilt. De afkapping is daarom met
  typen gemeten (`keyboard.insertText`).
- **De dubbele submit in één page-script:** Playwright's `click()` wacht de navigatie
  van de submit af, dus na de eerste submit is de knop al weggevoerd en de guard-state
  op de pagina niet meer waarneembaar. De twee submits en de observatie van de guard
  gebeuren in één synchronisch page-script; de request-count van de Formward-mock
  bevestigt dat er maximaal één POST is gegaan.
- **Negatieve controle:** de guard werd tijdelijk offline gezet in het gebouwde JS.
  F8b faalde dan op "De submit-guard heeft het formulier niet gemarkeerd" — daarmee is
  bewezen dat de test de guard meet en niet het toeval van de klik. De eerste versie
  van F8b (met `dblclick`) slaagde ook zonder guard en was damit geen bewijs; die is
  vervangen.
- **Geen nieuwe formuliervelden:** F5 asserteert dat de POST exact de zes
  Formward-velden bevat, dus de guard is pure JS-state zonder hidden velden.
- **Native validatie blijft de poort vóór de guard:** de handler draait alleen bij een
  geldig formulier, dus F2 en F3 (lege velden, ongeldige e-mail, 0 POSTs) zijn
  onveranderd. F8a asserteert dat een ongeldige submit niet gemarkeerd wordt, zodat de
  gebruiker na het verbeteren wél kan versturen.
- **Terugnavigatie (F10):** `page.goBack()` geeft een verse pagina-context, dus de
  guard-state van een eerdere submit is daar niet van kracht.

## 6. Validatie en acceptatiecriteria

Gemeten op 28 november 2026, in de werkbom:

- `npm run build` → groen; `docs/js/ts/main.js` is bijgewerkt.
- `npm run check` → exit 0 (typecheck, ESLint `--max-warnings=0`, html-validate).
- `npm run test:ci-summary` → 9/9.
- Contact-suite → 21/21.
- `npm run test:local` → **157/157** (1 worker, `retries: 0`, lokale `docs/` op poort 8080).
- `npx playwright test --list` → **157 tests in 12 files**.
- `TESTPLAN.md` §5.5, §7, §7.1, §11, §15.1 en §16, `TEST-SUITE-STATUS.md` §1/§2/§3/§5/§6,
  `README.md`, `PLAYWRIGHT.md`, `CI-OVERVIEW.md` en `PLAN-HERO-SOFT-3D.md` zijn op deze
  stand gezet.

Acceptatiecriteria:

- Maximaal één POST bij een dubbele submit-actie, en de redirect blijft idempotent.
- De veldlimieten staan in de HTML en zijn getest op, boven en onder de grens.
- Ongeldige submits blijven door native validatie geblokkeerd, zonder guard-markering.
- De bestaande tests blijven groen: F8 voegt 5 tests toe en verandert geen assert.

## 7. Risico's

- De CI draait tegen de **live** site: het CI-bewijs van de guard komt pas na de
  deploy van `main`. De suite is lokaal groen tegen `docs/`.
- De afkapping is client-side; Formward beslist upstream over de verwerking van de
  payload. De POST-lengte is het lokale contract, niet de opslag.
- De guard is site-JS: zonder JavaScript is er geen guard, en kan een dubbele submit
  twee POSTs produceren. De site is expliciet JS-gesupporteerd (het formulier
  gebruikt `_redirect` voor de bedanktpagina).
- De limieten 60/100/500 zijn een QA-besluit, geen klantspecificatie. Ze staan
  expliciet in de HTML en in `test-data.ts`, dus een wijziging is een bewuste,
  traceerbare wijziging.
- De page-script-methode van F8b raakt de productcode direct via `requestSubmit()`.
  Verandert de guard van vorm, dan faalt deze test — dat is de bedoeling.

## 8. Roadmap-koppeling

- `TESTPLAN.md` §7 F8 en §7.1 regel R8: van Gepland naar Bestaand.
- `TESTPLAN.md` fase 3 ("F8 blijft gepland") is damit af.
- `TEST-SUITE-STATUS.md` §3 rij 1 en §6 stap 6: gesloten.
- `README.md`, `PLAYWRIGHT.md` en `CI-OVERVIEW.md`: telling 157 tests in 12 files.
- Open blijft de CI-bewijsrun van de guard op de live site na de deploy, en de overige
  punten uit `TEST-SUITE-STATUS.md` §3: VIS-01, PERF-01, het G12-gatebesluit,
  cross-browser, de testmanagement-artefacten en de showcase-media.
