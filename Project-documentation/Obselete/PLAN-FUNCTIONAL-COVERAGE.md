# Plan — functionele coverage afwerken

> **Status:** uitgevoerd — november 2026.
> **Doel:** de resterende functionele testcases uit `TESTPLAN.md` toevoegen en de suite naar 53 tests brengen.
> **Baseline:** 41 tests in 5 spec-bestanden; lokaal groen.

## 1. Scope

- SM-03: 404-fallback
- MENU-07…10: Escape, klik-buiten, focus na openen, Escape op gesloten menu
- NAV-04/05: footer-links en actieve footer-link
- F4, F6, F7, F10: optioneel veld, boundary, speciale tekens, terug-navigatie

F5 en F8 blijven deels/gepland: lokale mocking simuleert geen echt spamfilter of dubbele POST-semantiek.

## 2. Wijzigingen

### Smoke
- Eén test voor `404.html`: HTTP 200, heading “Pagina niet gevonden”, geen runtime-errors.
- Lokaal testen we de pagina direct; de unknown-path-fallback is een live/GitHub-Pages-check.

### Mobiel menu
- `NavigationPage` krijgt `navItems`, `firstNavLink` en `clickOutsideMenu()`.
- Vier tests voor MENU-07…10.

### Footer
- Nieuwe `FooterPage` met link-, externe-attribuut- en active-asserts.
- Nieuwe fixture `footerPage`.
- Drie tests: footer-links, actieve footer op contact, actieve footer op privacy.

### Contact
- Nieuwe datasets: `OPTIONAL_SUBJECT_CONTACT`, `BOUNDARY_CONTACT`, `SPECIAL_CHARS_CONTACT`.
- Vier tests voor F4, F6, F7, F10.

## 3. Nieuwe aantallen

| Suite | Tests |
|---|---:|
| Smoke | 10 |
| Homepage | 5 |
| Contact | 14 |
| Mobiel menu | 16 |
| CI-history | 5 |
| Footer | 3 |
| **Totaal** | **53 tests in 6 spec-bestanden** |

## 4. Documentatie

Bijwerken: `README.md`, `TESTPLAN.md`, `PLAYWRIGHT.md`, `CI-OVERVIEW.md` en `PLAN-TEST-IMPROVEMENTS.md`.

## 5. Validatie

- `npm run test:local` → 53/53 groen
- `npm run check` → groen
- `npx playwright test --list` → 53 tests in 6 files

Alle geplande tests uit §2 zijn toegevoegd; F5 blijft deels en F8 blijft gepland.
