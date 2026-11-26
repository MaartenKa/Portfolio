// Portfolio — playwright/utils/contrast.ts

/**
 * WCAG-kleurberekeningen voor de accessibility-suite (A11Y-04).
 *
 * De suite meet computed kleuren in de browser en rekent hier de ratio. Een kale
 * CSS-waarde is geen bewijs: de invoerachtergrond is semi-transparant en moet
 * samengesteld worden over de achtergrond van de ancestors.
 */

/** RGB-kleur met alpha; `a = 1` is volledig dekkend. */
export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Zet een CSS-kleurstring om naar RGB. Ondersteunt `rgb()`, `rgba()` en `#rrggbb`;
 * `transparent` en `none` gelden als volledig doorzichtig.
 *
 * @param css - De kleurstring zoals `getComputedStyle` die oplevert.
 */
export function parseCssColor(css: string): Rgba {
  const trimmed = css.trim();

  if (trimmed === "transparent" || trimmed === "none") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  const hex = /^#([0-9a-f]{6})$/i.exec(trimmed);
  if (hex) {
    const digits = hex[1];
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: 1,
    };
  }

  const inner = /rgba?\(([^)]*)\)/.exec(trimmed)?.[1] ?? "";
  const parts = inner.split(",").map((part) => Number(part.trim()));
  const [r = 0, g = 0, b = 0, aRaw] = parts;

  return {
    r,
    g,
    b,
    a: aRaw === undefined ? 1 : Math.min(Math.max(aRaw, 0), 1),
  };
}

/**
 * Bronze compositie (source-over) van een voorgrond over een achtergrond.
 *
 * @param fg - De kleur die bovenop ligt.
 * @param bg - De kleur die eronder ligt.
 */
export function compositeOver(fg: Rgba, bg: Rgba): Rgba {
  const alpha = fg.a + bg.a * (1 - fg.a);

  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };

  return {
    r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / alpha,
    g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / alpha,
    b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / alpha,
    a: alpha,
  };
}

/**
 * Stelt een keten van CSS-kleuren samen; `colors[0]` staat boven op de rest.
 *
 * @param colors - Kleuren van het element tot de eerste dekkende ancestor.
 */
export function compositeChain(colors: Rgba[]): Rgba {
  if (colors.length === 0) return { r: 0, g: 0, b: 0, a: 0 };

  return colors.reduceRight((base, top) => compositeOver(top, base));
}

/** Relatieve luminantie volgens WCAG 2.x (lineaire RGB-kanalen). */
export function relativeLuminance(color: Rgba): number {
  const linear = (channel: number) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : Math.pow((scaled + 0.055) / 1.055, 2.4);
  };

  return (
    0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b)
  );
}

/**
 * De WCAG-contrastratio tussen twee kleuren (1..21).
 *
 * @param one - Eerste kleur.
 * @param other - Tweede kleur.
 */
export function contrastRatio(one: Rgba, other: Rgba): number {
  const first = relativeLuminance(one);
  const second = relativeLuminance(other);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}
