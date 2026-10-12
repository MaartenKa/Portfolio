// Portfolio / playwright / fixtures / test-fixtures.ts
import { test as base, Page } from "@playwright/test";

/**
 * Custom Playwright fixtures.
 *
 * Gebruik dit bestand om runtime resources te definiëren die tests nodig
 * hebben: mocks, auth state, aangepaste page/context configuratie, etc.
 *
 * Voorbeeld:
 *   type Fixtures = {
 *     mockApi: () => Promise<() => void>;
 *   };
 *
 *   export const test = base.extend<Fixtures>({
 *     mockApi: async ({ page }, use) => {
 *       await page.route("https://api.example.com/**", (route) =>
 *         route.fulfill({ status: 200, body: "{}" }),
 *       );
 *       await use();
 *       // teardown
 *     },
 *   });
 */

type Fixtures = {
  // Voeg hier je eigen fixtures toe
};

export const test = base.extend<Fixtures>({});
export const expect = base.expect;
