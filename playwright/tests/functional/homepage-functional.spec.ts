import { test } from "@playwright/test";
import { HomePage } from "../../pages/home.page";

test.describe("Homepage - functionele navigatie", () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.navigate();
  });

  test('CTA-knop "Bekijk mijn projecten" opent de projectenpagina', async () => {
    await home.clickProjectsCta();
  });

  test('CTA-knop "Bekijk mijn Curriculum vitae" opent de curriculumpagina', async () => {
    await home.clickCurriculumCta();
  });

  test('navigatielink "Contact" opent de contactpagina', async () => {
    await home.clickContactNavLink();
  });

  test('navigatielink "Projecten" opent de projectenpagina', async () => {
    await home.clickProjectsNavLink();
  });

  test('card-link "Meer over testing" opent de testpagina', async () => {
    await home.clickTestingCardLink();
  });
});
