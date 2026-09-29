import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * PROJ-3 Refinement 2026-09-28 — Genaue Richtung und stabile Entfernung.
 *
 * Befund aus Handy-Tests: Der Pfeil zeigte „nicht immer in genau die richtige
 * Richtung", und die Entfernung sprang „bei 30 m und einen Schritt später bei
 * 10 m".
 *
 * Was hier prüfbar ist: Playwright liefert Positionen **mit `accuracy`**
 * (`setGeolocation({ …, accuracy })`), und synthetische Orientierungs-Events
 * erreichen die Seite. Damit sind Filter, Ankunftsbestätigung und die Wahl des
 * Bezugssystems (absolut vs. relativ) im echten Browser prüfbar. Nicht prüfbar:
 * wie ein echtes Android-Magnetometer und echtes GPS rauschen.
 */

const STATION = { lat: 53.61, lng: 10.04, radiusMeters: 20 };

const TEST_QUEST = {
  version: 1,
  id: "a3333333-3333-4333-8333-333333333333",
  name: "Richtung und Entfernung",
  lastModified: "2026-09-28T00:00:00.000Z",
  intro: { text: "Los!" },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "b3333333-3333-4333-8333-333333333333",
      name: "Brunnen",
      lat: STATION.lat,
      lng: STATION.lng,
      radiusMeters: STATION.radiusMeters,
      modules: [{ type: "text", content: "Am Brunnen" }],
    },
  ],
};

/** Breitengrad, der `meters` Meter südlich der Station liegt. */
const southOf = (meters: number) => STATION.lat - meters / 111_195;

async function setPosition(context: BrowserContext, metersSouth: number, accuracy = 0) {
  await context.setGeolocation({ latitude: southOf(metersSouth), longitude: STATION.lng, accuracy });
}

async function startNavigation(page: Page, context: BrowserContext, metersSouth = 400, accuracy = 0) {
  await context.grantPermissions(["geolocation"]);
  await setPosition(context, metersSouth, accuracy);
  await page.goto("/play");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
    localStorage.removeItem(`gq_progress_${quest.id}`);
  }, TEST_QUEST);
  await page.goto(`/play/${TEST_QUEST.id}`);
  await page.getByRole("button", { name: /Los geht/ }).click();
  await page.getByRole("button", { name: /Brunnen/ }).click();
  await expect(page.locator("svg[viewBox='0 0 100 100']")).toBeVisible();
}

/** Angezeigte Entfernung in Metern. */
async function readDistance(page: Page): Promise<number> {
  const text = await page.locator(".font-display.italic").first().innerText();
  return parseInt(text.replace(/\D/g, ""), 10);
}

async function readRotation(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const svg = document.querySelector("svg[viewBox='0 0 100 100']") as SVGElement | null;
    const match = svg ? /rotate\((-?[\d.]+)deg\)/.exec(svg.style.transform) : null;
    return match ? parseFloat(match[1]) : null;
  });
}

async function fireOrientation(page: Page, type: string, alpha: number, absolute: boolean) {
  await page.evaluate(
    ([t, a, abs]) => {
      const event = new Event(t as string);
      Object.defineProperty(event, "alpha", { value: a, configurable: true });
      Object.defineProperty(event, "absolute", { value: abs, configurable: true });
      window.dispatchEvent(event);
    },
    [type, alpha, absolute] as const
  );
}

const arrived = (page: Page) => page.getByText("Ziel erreicht!");

/**
 * Setzt eine Position und wartet, bis die Seite sie anzeigt.
 *
 * Nötig, weil Chrome zwei unmittelbar aufeinanderfolgende `setGeolocation`-
 * Aufrufe zu **einem** Rückruf zusammenfassen kann, solange die Seite
 * beschäftigt ist — gemessen: Liste der übernommenen Messungen `1,2` statt
 * `1,2,3`, die 5-m-Messung kam nie an. Echtes GPS liefert jede Messung einzeln
 * im Sekundentakt; das Warten stellt genau diesen Takt her. Nur für Positionen
 * außerhalb des Radius oder die erste im Radius — danach zeigt die Seite
 * womöglich schon den Gratulationsscreen.
 */
async function stepTo(page: Page, context: BrowserContext, metersSouth: number) {
  await setPosition(context, metersSouth);
  await expect.poll(() => readDistance(page)).toBe(metersSouth);
}

test.describe("PROJ-3: Genaue Richtung und stabile Entfernung (Refinement 2026-09-28)", () => {
  test.describe("Bezugssystem des Kompasses (Edge Case 29)", () => {
    test("richtet den Pfeil nach deviceorientationabsolute aus (Android)", async ({ page, context }) => {
      await startNavigation(page, context);
      // Station liegt genau nördlich (Peilung 0°). Gerät zeigt nach Osten
      // (Heading 90° ⇒ alpha 270°) → Pfeil muss nach links zeigen (−90° ≙ 270°).
      for (let i = 0; i < 40; i++) await fireOrientation(page, "deviceorientationabsolute", 270, true);
      await expect.poll(async () => {
        const r = await readRotation(page);
        return r === null ? null : Math.round((((r % 360) + 360) % 360));
      }).toBe(270);
    });

    test("ein relatives Heading dreht den Pfeil nicht — Hinweis „Laufe ein paar Schritte“", async ({ page, context }) => {
      await startNavigation(page, context);
      const before = await readRotation(page);
      for (let i = 0; i < 40; i++) await fireOrientation(page, "deviceorientation", 123, false);
      await page.waitForTimeout(300);
      expect(await readRotation(page)).toBe(before);
      await expect(page.getByText(/Laufe ein paar Schritte/)).toBeVisible();
    });

    test("folgt dem absoluten Heading, obwohl parallel relative Werte mit anderem Nullpunkt eintreffen", async ({ page, context }) => {
      await startNavigation(page, context);
      for (let i = 0; i < 40; i++) {
        await fireOrientation(page, "deviceorientation", 10, false);
        await fireOrientation(page, "deviceorientationabsolute", 270, true);
      }
      await expect.poll(async () => {
        const r = await readRotation(page);
        return r === null ? null : Math.round((((r % 360) + 360) % 360));
      }).toBe(270);
    });
  });

  test.describe("Ungenaue GPS-Messungen (Edge Cases 31/32)", () => {
    test("verwirft eine grobe Messung, solange eine genaue vorliegt", async ({ page, context }) => {
      await startNavigation(page, context, 400, 5);
      await expect.poll(() => readDistance(page)).toBe(400);

      // Grobe Messung (80 m Unsicherheit), die 200 m näher läge.
      await setPosition(context, 200, 80);
      await page.waitForTimeout(800);
      expect(await readDistance(page)).toBe(400);
    });

    test("übernimmt die erste Messung auch dann, wenn sie grob ist", async ({ page, context }) => {
      await startNavigation(page, context, 300, 90);
      await expect.poll(() => readDistance(page)).toBe(300);
    });

    test("dämpft einen einzelnen Ausreißer statt ihn anzuzeigen", async ({ page, context }) => {
      await startNavigation(page, context, 60, 15);
      for (const m of [60, 60, 60]) await setPosition(context, m, 15);
      await expect.poll(() => readDistance(page)).toBe(60);

      // Ein Ausreißer 25 m näher — unter der Filterschwelle, also übernommen,
      // aber gewichtet: die Anzeige darf nicht voll mitspringen.
      await setPosition(context, 35, 15);
      await page.waitForTimeout(500);
      const shown = await readDistance(page);
      expect(shown).toBeGreaterThan(40);
      expect(shown).toBeLessThan(60);
    });
  });

  test.describe("Ankunft mit Bestätigung (Edge Cases 4/31)", () => {
    test("ein einzelner Ausreißer in den Radius löst die Station nicht aus", async ({ page, context }) => {
      await startNavigation(page, context, 60);
      await stepTo(page, context, 5); // im Radius
      await stepTo(page, context, 60); // wieder draußen
      await page.waitForTimeout(1000);
      await expect(arrived(page)).toHaveCount(0);
    });

    test("zwei Messungen in Folge im Radius lösen die Station aus", async ({ page, context }) => {
      await startNavigation(page, context, 60);
      await stepTo(page, context, 5);
      await expect(arrived(page)).toHaveCount(0);
      await setPosition(context, 4);
      await expect(arrived(page)).toBeVisible({ timeout: 10_000 });
    });

    test("eine Messung außerhalb setzt den Zähler zurück", async ({ page, context }) => {
      await startNavigation(page, context, 60);
      await stepTo(page, context, 5); // 1 im Radius
      await stepTo(page, context, 60); // Zähler zurück
      await stepTo(page, context, 4); // wieder nur 1
      await page.waitForTimeout(1000);
      await expect(arrived(page)).toHaveCount(0);
      await setPosition(context, 3); // jetzt 2 in Folge
      await expect(arrived(page)).toBeVisible({ timeout: 10_000 });
    });

    test("wer schon im Radius startet, kommt nach der zweiten Messung an (Edge Case 3)", async ({ page, context }) => {
      await startNavigation(page, context, 2);
      await expect(arrived(page)).toHaveCount(0);
      await setPosition(context, 1);
      await expect(arrived(page)).toBeVisible({ timeout: 10_000 });
    });
  });
});
