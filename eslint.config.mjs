// Portfolio / eslint.config.mjs — ESLint 10 flat config
//
// Dekt: src/**, playwright/**, beide playwright-configs en scripts/**.
// `docs/**` blijft buiten de lint: docs/js/ts/main.js is het gebouwde resultaat
// van src/ts/main.ts en wordt niet met de hand geschreven.
//
// De plugin-preset wordt twee keer uitgerold: op testbestanden (volledig) en op
// page objects/fixtures/utils, waar de test-specifieke regels niet gelden.
import js from "@eslint/js";
import globals from "globals";
import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

// De flat-vorm en de legacy-vorm van de preset worden beide ondersteund.
const playwrightRules =
  (playwright.configs["flat/recommended"] ?? playwright.configs.recommended ?? {})
    .rules ?? {};

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "docs/**",
      "playwright/playwright-report/**",
      "playwright/test-results/**",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    // Basis voor al het TypeScript.
    files: ["**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // `response!.status()` in de page objects: de null-check staat in dezelfde
      // regel (`expect(response).not.toBeNull()`), dus de assertion is onderbouwd.
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  {
    // Testbestanden: de volledige Playwright-preset.
    files: ["playwright/tests/**/*.ts"],
    plugins: { playwright },
    languageOptions: { globals: { ...globals.node } },
    rules: {
      ...playwrightRules,
      // Asserts leven bewust in de page objects (PLAYWRIGHT.md §8); de specs
      // roepen those methods aan, dus de spec zelf bevat geen eigen expect.
      "playwright/expect-expect": "off",
      // Testnamen zijn Nederlandse gebruikersverhalen met hoofdletters en
      // spaties (TESTPLAN.md §6.1) — niet in kegel-case herschrijven.
      "playwright/prefer-lowercase-title": "off",
      // BasePage.goto() wacht bewust op networkidle: de externe shields.io-badge
      // staat lazy en onder de fold (PLAYWRIGHT.md §4 en §8).
      "playwright/no-networkidle": "off",
      "playwright/no-skipped-test": "warn",
      "playwright/no-focused-test": "warn",
      "playwright/no-slowed-test": "warn",
    },
  },

  {
    // Page objects, fixtures, utils en de Playwright-configs: geen testbestanden,
    // dus de regels die een test-omgeving verwachten zijn hier niet van toepassing.
    files: [
      "playwright/pages/**/*.ts",
      "playwright/fixtures/**/*.ts",
      "playwright/utils/**/*.ts",
      "playwright.config.ts",
      "playwright.local.config.ts",
    ],
    plugins: { playwright },
    languageOptions: { globals: { ...globals.node } },
    rules: {
      ...playwrightRules,
      "playwright/no-standalone-expect": "off",
      "playwright/expect-expect": "off",
      "playwright/no-export": "off",
      "playwright/no-networkidle": "off",
      "playwright/prefer-lowercase-title": "off",
      "playwright/require-top-level-describe": "off",
      "playwright/no-hooks": "off",
      // Sinds de testid-markup (data-testid="nav-links") en de semantische
      // structuur-locators in home.page.ts zijn er geen raw locators meer in de
      // page objects, dus de regel staat op error. De `--max-warnings=0`-drempel in
      // `npm run lint` maakt de 0-warnings-basislijn een harde poort.
      "playwright/no-raw-locators": "error",
    },
  },

  {
    // Node-scripts: draaien buiten de TypeScript-deks van tsconfig.json.
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
  },
);
