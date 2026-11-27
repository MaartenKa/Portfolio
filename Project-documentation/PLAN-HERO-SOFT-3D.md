# Plan — soft-3D terminal op de homepage

> **Status:** uitgevoerd — november 2026.
> **Doel:** de terminal-card op `index.html` een subtiele 3D-diepte geven
> zonder JavaScript, WebGL of een extra dependency.

## 1. Ontwerpkeuze

De terminal wordt **statisch soft-3D** met CSS:

- een wrapper met `perspective`;
- een kleine `rotateX`/`rotateY` op de card;
- diepte via meerdere schaduwlagen;
- een subtiele highlight/reflection op de card;
- een lichte diepte in de terminal-header en -content;
- géén interactieve tilt en géén animatie.

Dit is bewust geen echte 3D-terminal. De tekst blijft een plat, leesbaar
vlak; alleen de kaart krijgt perspectief en diepte.

## 2. Wijzigingen

### HTML
- `.hero-card` krijgt een wrapper `.hero-card-stage`.
- De wrapper is het grid-item; de card blijft de bestaande terminal.

### CSS
- `.hero-card-stage`: `perspective`, `width: 100%` en `min-width: 0`.
- `.hero-card`: `transform: rotateX(...) rotateY(...)`, `transform-style:
  preserve-3d`, `transform-origin: center`.
- `.hero-card`: meerdere `box-shadow`-lagen voor diepte en glow.
- `.hero-card::after`: subtiele highlight/reflection; `pointer-events: none`.
- `.terminal-header` en `.terminal-content`: lichte inset-diepte.
- Responsive: op `≤850px` minder tilt; op `≤500px` geen tilt.
- `prefers-reduced-motion`: de statische tilt uitschakelen.

## 3. Accessibility en responsive

- De 3D-transform verandert geen DOM-volgorde of tekstinhoud.
- Screenreaders blijven dezelfde informatie lezen.
- De card blijft op mobiel recht en leesbaar.
- Geen essentiële informatie in pseudo-elementen.
- De bestaande `forced-colors`-fallback blijft behouden.
- De bestaande reduced-motion-regel wordt uitgebreid voor de card.

## 4. Validatie

Na de wijziging:

- `npm run check` moet groen blijven;
- `npm run test:local` moet groen blijven (de suite telt inmiddels 139 tests);
- visueel controleren op desktop, tablet en mobiel;
- controleren dat er geen horizontale scroll ontstaat;
- controleren dat de terminaltekst leesbaar blijft.

## 5. Acceptatiecriteria

- De terminal-card heeft een zichtbare, maar subtiele diepte.
- De tekst is niet wazig of vervormd.
- Op mobiel is de tilt uitgeschakeld of sterk verminderd.
- De bestaande tests en kwaliteitspoorten blijven groen.
- Er is geen nieuwe runtime-dependency of JavaScript nodig.

## 6. Risico's

- `overflow: hidden` op `.hero-card` kan delen van een 3D-zijvlak afknippen;
  daarom gebruiken we schaduwen en een highlight, geen uitstekende zijvlakken.
- Te grote rotaties maken tekst wazig; daarom blijven de hoeken klein.
- Een 3D-transform verandert screenshots; visuals baselines moeten later
  opnieuw worden vastgelegd.
