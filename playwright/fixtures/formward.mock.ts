// Portfolio — playwright/fixtures/formward.mock.ts

import { Page, Request, expect } from "@playwright/test";
import { FORMWARD_URL, THANK_YOU_PAGE } from "../utils/test-data";

/** Eén geregistreerde Formward-request, inclusief de POST-payload. */
interface RecordedRequest {
  url: string;
  method: string;
  fields: Record<string, string>;
}

/**
 * Leest de request-body als tekst.
 *
 * Een HTML-formulier zonder `enctype` posted als `x-www-form-urlencoded`, dus
 * `postData()` is de normale weg. De buffer is de fallback voor een niet-tekst
 * encoding, zodat een payload-assert niet op een lege body uitkomt.
 *
 * @param request - De geïntercepteerde Formward-request.
 * @returns De request-body als tekst, of een lege string bij een lege body.
 */
async function readPostBody(request: Request): Promise<string> {
  const postData = await request.postData();
  if (postData !== null) return postData;

  return (await request.postDataBuffer())?.toString("utf8") ?? "";
}

/**
 * Parset een urlencoded form-body tot een map van veldnaam naar waarde.
 *
 * @param body - De urlencoded request-body.
 * @returns De velden van de submit.
 */
function parseFormFields(body: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(body));
}

/**
 * Geïsoleerde Formward-mock met registratie van requests en POST-payloads.
 *
 * De route blijft actief zolang de test duurt. Een ongeldige submit mag geen
 * request veroorzaken; tests kunnen dat expliciet asserten. De mock redirectt
 * altijd, dus de suite bewijst het submit- en payload-contract van de site —
 * niet de Formward-verwerking upstream (TESTPLAN.md §3.2).
 */
export class FormwardMock {
  private readonly requests: RecordedRequest[] = [];

  constructor(private readonly page: Page) {}

  async install(): Promise<void> {
    await this.page.route(FORMWARD_URL, async (route) => {
      const request = route.request();
      this.requests.push({
        url: request.url(),
        method: request.method(),
        fields: parseFormFields(await readPostBody(request)),
      });

      const redirectUrl = new URL(THANK_YOU_PAGE, this.page.url()).toString();

      await route.fulfill({
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    });
  }

  async expectRequestCount(count: number): Promise<void> {
    await expect
      .poll(() => this.requests.length, {
        message: `Verwacht ${count} Formward-request(s)`,
      })
      .toBe(count);
  }

  /**
   * Asserteert de HTTP-methode van de eerste Formward-request.
   *
   * @param method - De verwachte methode, bijvoorbeeld "POST".
   */
  async expectRequestMethod(method: string): Promise<void> {
    await expect
      .poll(() => this.requests[0]?.method, {
        message: `Verwacht een ${method}-request naar Formward`,
      })
      .toBe(method);
  }

  /**
   * De payload van de eerste geregistreerde request.
   *
   * Wacht op de request, zodat een payload-assert niet op een lege lijst uitloopt
   * wanneer de submit net is verstuurd.
   *
   * @returns De velden van de eerste submit.
   */
  private async firstFields(): Promise<Record<string, string>> {
    await expect
      .poll(() => this.requests.length, {
        message: "Verwacht één Formward-request vóór de payload-assert",
      })
      .toBe(1);

    return this.requests[0].fields;
  }

  /**
   * Asserteert dat één veld van de submit de verwachte waarde heeft.
   *
   * @param name - Veldnaam in de payload.
   * @param value - Verwachte waarde.
   */
  async expectPostedValue(name: string, value: string): Promise<void> {
    const fields = await this.firstFields();

    expect(
      fields[name],
      `Verwacht veld "${name}" met waarde "${value}" in de POST-payload`,
    ).toBe(value);
  }

  /**
   * F8d/F8e: asserteert de lengte van één veld in de submit-payload, zodat de
   * `maxlength`-afkapping doorwerkt tot de POST die Formward ontvangt.
   *
   * @param name - Veldnaam in de payload.
   * @param length - Verwachte aantal tekens.
   */
  async expectPostedLength(name: string, length: number): Promise<void> {
    const fields = await this.firstFields();

    expect(
      fields[name]?.length,
      `Verwacht ${length} tekens in payload-veld "${name}"`,
    ).toBe(length);
  }

  /**
   * Asserteert dat de submit precies de verwachte Formward-velden bevat.
   *
   * @param names - De verwachte veldnamen.
   */
  async expectPostedFieldNames(names: readonly string[]): Promise<void> {
    const fields = await this.firstFields();

    expect(
      Object.keys(fields).sort(),
      "De POST-payload bevat niet de verwachte Formward-velden",
    ).toEqual([...names].sort());
  }
}
