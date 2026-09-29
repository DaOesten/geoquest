import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * PROJ-3, QA des Refinements 2026-09-28 (Genaue Richtung und stabile
 * Entfernung). Ergänzt `proj-3-richtung-entfernung.spec.ts` um das, was die
 * Frontend-Phase nicht prüfte: iPhone und Android im direkten Vergleich
 * (AC-3), die Rückfallfrist in Echtzeit, ungültige Werte im neuen
 * Android-Ereignis, und den Wächter für BUG-20.
 */

const ST = { lat: 53.61, lng: 10.04 };
const QUEST = {
  version: 1,
  id: "a5555555-5555-4555-8555-555555555555",
  name: "QA Richtung",
  lastModified: "2026-09-29T00:00:00.000Z",
  intro: { text: "Los" },
  outro: { text: "Ende" },
  stations: [
    {
      id: "b5555555-5555-4555-8555-555555555555",
      name: "Turm",
      lat: ST.lat,
      lng: ST.lng,
      radiusMeters: 20,
      modules: [{ type: "text", content: "Oben" }],
    },
  ],
};

const south = (m: number) => ST.lat - m / 111_195;

async function start(page: Page, context: BrowserContext, metersSouth = 400, accuracy = 0) {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: south(metersSouth), longitude: ST.lng, accuracy });
  await page.goto("/play");
  await page.evaluate((q) => {
    localStorage.setItem("gq_quests", JSON.stringify([q]));
    localStorage.removeItem(`gq_progress_${q.id}`);
  }, QUEST);
  await page.goto(`/play/${QUEST.id}`);
  await page.getByRole("button", { name: /Los geht/ }).click();
  await page.getByRole("button", { name: /Turm/ }).first().click();
  await expect(page.locator("svg[viewBox='0 0 100 100']")).toBeVisible();
}

async function rotation(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const svg = document.querySelector("svg[viewBox='0 0 100 100']") as SVGElement | null;
    const m = svg ? /rotate\((-?[\d.]+)deg\)/.exec(svg.style.transform) : null;
    return m ? ((parseFloat(m[1]) % 360) + 360) % 360 : null;
  });
}

async function fire(page: Page, type: string, props: Record<string, unknown>) {
  await page.evaluate(
    ([t, p]) => {
      const event = new Event(t as string);
      for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
        Object.defineProperty(event, k, { value: v, configurable: true });
      }
      window.dispatchEvent(event);
    },
    [type, props] as const
  );
}

/** Kürzester Winkelabstand in Grad. */
const angleGap = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

/**
 * Die Glättung hat eine Mindestschwelle von 0,75° je Schritt (Faktor 0,15) und
 * nähert sich einem Zielwert deshalb nur bis auf rund 5°. Gemessen wird sofort
 * nach den Events — wer danach pollt, läuft in die 3-s-Karenzzeit, nach der
 * der Kompass korrekt als ausgefallen gilt und der Pfeil richtungslos wird.
 */
const SMOOTHING_TOLERANCE_DEG = 6;

async function distance(page: Page): Promise<number> {
  const text = await page.locator(".font-display.italic").first().innerText();
  return parseInt(text.replace(/\D/g, ""), 10);
}

test.describe("PROJ-3 QA: Richtung und Entfernung (2026-09-29)", () => {
  test("AC-3: iPhone und Android zeigen bei gleicher Blickrichtung denselben Pfeil", async ({ page, context }) => {
    await start(page, context);
    // iPhone: Blick nach Osten (Heading 90°)
    for (let i = 0; i < 40; i++) await fire(page, "deviceorientation", { webkitCompassHeading: 90 });
    await expect.poll(async () => Math.round((await rotation(page)) ?? -1)).toBe(270);
    const ios = await rotation(page);

    // Android: dieselbe Blickrichtung — absolutes alpha = 360 − 90 = 270.
    // Frische Seite statt `reload`: ein Neuladen führt zurück in den
    // Quest-Start, nicht in die Stationsliste.
    const android = await context.newPage();
    await start(android, context);
    for (let i = 0; i < 40; i++) await fire(android, "deviceorientationabsolute", { alpha: 270, absolute: true });
    await expect.poll(async () => Math.round((await rotation(android)) ?? -1)).toBe(270);
    expect(angleGap((await rotation(android))!, ios!)).toBeLessThan(1.5);
  });

  test("Rückfallfrist in Echtzeit: nach 5 s ohne genaue Messung zählt die grobe", async ({ page, context }) => {
    await start(page, context, 400, 5);
    await expect.poll(() => distance(page)).toBe(400);
    await context.setGeolocation({ latitude: south(200), longitude: ST.lng, accuracy: 80 });
    await page.waitForTimeout(1500);
    expect(await distance(page)).toBe(400);

    await page.waitForTimeout(4200);
    await context.setGeolocation({ latitude: south(201), longitude: ST.lng, accuracy: 80 });
    // Erste übernommene grobe Messung — die Glättung zieht die Anzeige ein
    // gutes Stück, aber nicht ganz, zur neuen Position.
    await expect.poll(() => distance(page), { timeout: 5000 }).toBeLessThan(400);
  });

  test("ein ungültiger Wert im Android-Ereignis friert den Pfeil nicht ein (BUG-12 auf dem neuen Weg)", async ({ page, context }) => {
    await start(page, context);
    for (let i = 0; i < 20; i++) await fire(page, "deviceorientationabsolute", { alpha: 270, absolute: true });
    await expect.poll(async () => Math.round((await rotation(page)) ?? -1)).toBe(270);
    await fire(page, "deviceorientationabsolute", { alpha: NaN, absolute: true });
    await fire(page, "deviceorientationabsolute", { alpha: Infinity, absolute: true });
    for (let i = 0; i < 60; i++) await fire(page, "deviceorientationabsolute", { alpha: 90, absolute: true });
    const after = await rotation(page);
    expect(after).not.toBeNull();
    expect(angleGap(after!, 90)).toBeLessThan(SMOOTHING_TOLERANCE_DEG);
    const transform = await page.evaluate(
      () => (document.querySelector("svg[viewBox='0 0 100 100']") as SVGElement).style.transform
    );
    expect(transform).not.toMatch(/NaN|Infinity/);
  });

  test("ohne absolutes Heading zeigt die Bewegungsrichtung den Weg (Rückfall funktioniert)", async ({ page, context }) => {
    // Genauigkeit 0 = keine Glättung: prüft die reine Mechanik des Rückfalls.
    await start(page, context, 300, 0);
    for (let i = 0; i < 20; i++) await fire(page, "deviceorientation", { alpha: 45, absolute: false });
    for (let i = 1; i <= 3; i++) {
      await context.setGeolocation({ latitude: south(300 - 4 * i), longitude: ST.lng, accuracy: 0 });
      await page.waitForTimeout(600);
    }
    // Läuft genau auf die Station zu → Pfeil zeigt geradeaus (0°), nicht auf
    // den relativen Wert.
    await expect.poll(async () => Math.round((await rotation(page)) ?? -1)).toBe(0);
  });

  /**
   * BUG-20 (Medium): Die Glättung verzögert die Bewegungsrichtung.
   * `headingFromPositions` verlangt ≥ 2 m zwischen zwei aufeinanderfolgenden
   * Positionen — die geglätteten Positionen rücken anfangs weniger vor als die
   * Rohmessungen. Gemessen bei 2,5 m je Sekunde und 10 m Genauigkeit: Richtung
   * nach 4 s statt sofort (Vorgängerstand: sofort). Wird grün, sobald behoben.
   */
  test.fail("BUG-20: bei 2,5 m je Messung und 10 m Genauigkeit steht die Richtung nach 2 Messungen", async ({ page, context }) => {
    await start(page, context, 300, 10);
    for (let i = 1; i <= 2; i++) {
      await context.setGeolocation({ latitude: south(300 - 2.5 * i), longitude: ST.lng, accuracy: 10 });
      await page.waitForTimeout(1000);
    }
    expect(await rotation(page)).not.toBeNull();
  });
});
