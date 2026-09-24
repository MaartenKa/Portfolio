import { test } from "@playwright/test";
import { HomePage } from "../../pages/home.page";

test.describe("Smoke test – index pagina", () => {
  test("index pagina laadt zonder fouten", async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();
    await home.expectStructureVisible();
    await home.expectNoConsoleErrors();
  });
});
