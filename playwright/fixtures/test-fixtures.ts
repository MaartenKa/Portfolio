// Portfolio / playwright / fixtures / test-fixtures.ts
import { test as base } from "@playwright/test";

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

// Placeholder: er zijn op dit moment geen eigen fixtures gedefinieerd.
// Record<string, never> is de expliciete vorm van "lege fixture-set".
type Fixtures = Record<string, never>;

export const test = base.extend<Fixtures>({});
export const expect = base.expect;
