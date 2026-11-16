import { test } from "../../fixtures/test-fixtures";

test.describe("Homepage - functionele navigatie", () => {
  test('CTA-knop "Bekijk mijn projecten" opent de projectenpagina', async ({
    homePage,
  }) => {
    await homePage.clickProjectsCta();
  });

  test('CTA-knop "Bekijk mijn Curriculum vitae" opent de curriculumpagina', async ({
    homePage,
  }) => {
    await homePage.clickCurriculumCta();
  });

  test('navigatielink "Contact" opent de contactpagina', async ({
    homePage,
  }) => {
    await homePage.clickContactNavLink();
  });

  test('navigatielink "Projecten" opent de projectenpagina', async ({
    homePage,
  }) => {
    await homePage.clickProjectsNavLink();
  });

  test('card-link "Meer over testing" opent de testpagina', async ({
    homePage,
  }) => {
    await homePage.clickTestingCardLink();
  });
});
