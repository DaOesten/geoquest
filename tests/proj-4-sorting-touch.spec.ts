import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-4 Refinement 2026-09-20: Touch-Sortierung im Player.
 *
 * Diese Datei deckt genau die Luecke ab, durch die der gemeldete Befund und der
 * beim Nachmessen gefundene Zweitbefund live gehen konnten: Die bestehende Suite
 * prueft, DASS sich die Reihenfolge aendern laesst — nicht, dass das Item sich
 * dabei sichtbar hebt, und nicht, dass ein blosses Scrollen sie in Ruhe laesst.
 *
 * Touch-Gesten werden ueber das Chrome DevTools Protocol gesendet. Playwrights
 * `touchscreen`-API kann keine Geste aus mehreren Move-Schritten mit definierter
 * Dauer senden, auf die es hier ankommt: Die 150ms-Schwelle des TouchSensors
 * misst echte Zeit, und genau daran entscheidet sich Ziehen gegen Scrollen.
 */

const QUEST_ID = "proj4-sorting-touch";

function quest(withPadding: boolean) {
  const modules: object[] = [];
  if (withPadding) {
    // Genug Inhalt ueber und unter der Aufgabe, damit die Seite wirklich scrollen kann.
    modules.push({ type: "text", content: "Vorspann\n".repeat(60) });
  }
  modules.push({
    type: "task",
    taskType: "sorting",
    question: "Sortiere aufsteigend",
    items: ["Eins", "Zwei", "Drei", "Vier", "Fuenf"],
  });
  if (withPadding) modules.push({ type: "text", content: "Nachspann\n".repeat(60) });

  return {
    version: 1,
    id: QUEST_ID,
    name: "Sorting Touch Quest",
    lastModified: "2026-09-20T00:00:00.000Z",
    intro: { text: "Los geht's" },
    outro: { text: "Geschafft" },
    stations: [
      { id: "s1", name: "Sortier Station", lat: 53.65, lng: 10.08, radiusMeters: 20, modules },
    ],
  };
}

async function openSortingStation(page: Page, withPadding = false) {
  await page.goto("/play");
  await page.evaluate(
    ({ q, id }) => {
      localStorage.setItem("gq_quests", JSON.stringify([q]));
      localStorage.setItem(
        `gq_progress_${id}`,
        JSON.stringify({
          visitedStations: ["s1"],
          completedStations: [],
          solvedTasks: {},
          currentScreen: "stations",
          lastStationIndex: 0,
        })
      );
    },
    { q: quest(withPadding), id: QUEST_ID }
  );
  await page.goto(`/play/${QUEST_ID}`);
  await page.getByRole("button", { name: /Sortier Station.*Aufgaben fortsetzen/ }).click();
  await rows(page).first().waitFor();
}

function rows(page: Page) {
  return page.locator('div:has(> button[aria-label$="verschieben"])');
}

/**
 * Zwei Gruppen, weil nur ein Teil dieser Zusicherungen echte Touch-Gesten braucht.
 * Was sich ohne CDP pruefen laesst, laeuft auf beiden Engines — sonst waere die
 * Haelfte der neuen Abdeckung auf WebKit blind, ausgerechnet der Engine des
 * iPhones, auf dem der Befund gemeldet wurde.
 */
test.describe("PROJ-4: Sortierung — Aufbau (beide Engines)", () => {
  test("das Handle ist Drag-Flaeche, der Zeilenkoerper Scroll-Flaeche", async ({ page }) => {
    await openSortingStation(page);

    const row = rows(page).first();
    const handle = row.getByRole("button");

    // Genau diese Aufteilung ist der technische Kern des Scroll-Konflikts.
    expect(await row.evaluate((el) => getComputedStyle(el).touchAction)).toBe("auto");
    expect(await handle.evaluate((el) => getComputedStyle(el).touchAction)).toBe("none");

    const box = await handle.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("im geloesten Zustand gibt es keine Greif-Buttons mehr", async ({ page }) => {
    await page.goto("/play");
    await page.evaluate(
      ({ q, id }) => {
        localStorage.setItem("gq_quests", JSON.stringify([q]));
        localStorage.setItem(
          `gq_progress_${id}`,
          JSON.stringify({
            visitedStations: ["s1"],
            completedStations: [],
            solvedTasks: { s1: [0] },
            currentScreen: "stations",
            lastStationIndex: 0,
          })
        );
      },
      { q: quest(false), id: QUEST_ID }
    );
    await page.goto(`/play/${QUEST_ID}`);
    await page.getByRole("button", { name: /Sortier Station.*Aufgaben fortsetzen/ }).click();

    await expect(page.getByText("Richtig")).toBeVisible();
    await expect(page.locator('button[aria-label$="verschieben"]')).toHaveCount(0);
    // Die korrekte Reihenfolge bleibt sichtbar (Edge Case 11).
    await expect(page.getByText("Eins")).toBeVisible();
    await expect(page.getByText("Fuenf")).toBeVisible();
  });
});

test.describe("PROJ-4: Sortierung — Touch-Gesten", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Touch-Gesten via CDP nur in Chromium");

  test("das gegriffene Item hebt sich sichtbar ab und folgt dem Finger", async ({ page }) => {
    await openSortingStation(page);

    const first = rows(page).first();
    const label = (await first.innerText()).trim();
    // An einen konkreten Knoten binden: Nach einer Umsortierung waere `.first()`
    // ein anderes Element, und die Messung wuerde still am falschen Ding haengen.
    const target = rows(page).filter({ hasText: new RegExp(`^${label}$`) });

    const idle = await target.evaluate((el) => {
      const c = getComputedStyle(el);
      return { transform: c.transform, shadow: c.boxShadow, zIndex: c.zIndex };
    });
    expect(idle.transform).toBe("none");
    expect(idle.shadow).toBe("none");

    const handle = await target.getByRole("button").boundingBox();
    const row0 = await rows(page).nth(0).boundingBox();
    const row1 = await rows(page).nth(1).boundingBox();
    const pitch = row1!.y - row0!.y;

    const cdp = await page.context().newCDPSession(page);
    const x = handle!.x + handle!.width / 2;
    const y = handle!.y + handle!.height / 2;

    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await page.waitForTimeout(220); // ueber die 150ms-Schwelle
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + 12 }] });
    await page.waitForTimeout(100);

    const held = await target.evaluate((el) => {
      const c = getComputedStyle(el);
      return { transform: c.transform, shadow: c.boxShadow, zIndex: c.zIndex };
    });
    // Das ist der gemeldete Befund: vorher stand hier in jeder Phase `none`.
    expect(held.transform).toContain("1.03");
    expect(held.shadow).not.toBe("none");
    expect(held.zIndex).toBe("10");

    // Folgt dem Finger: Der Translate-Anteil muss sich mit jeder Bewegung aendern.
    const seen: string[] = [];
    for (let i = 1; i <= 6; i++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y + (pitch * i) / 3 }],
      });
      await page.waitForTimeout(25);
      seen.push(await target.evaluate((el) => getComputedStyle(el).transform));
    }
    expect(new Set(seen).size).toBeGreaterThan(1);

    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(400);

    // Legt sich wieder ab.
    const settled = await target.evaluate((el) => {
      const c = getComputedStyle(el);
      return { transform: c.transform, shadow: c.boxShadow };
    });
    expect(settled.transform).toBe("none");
    expect(settled.shadow).toBe("none");
  });

  test("ein Wisch ueber dem Zeilentext scrollt die Seite und laesst die Reihenfolge in Ruhe", async ({ page }) => {
    await openSortingStation(page, true);

    const row = rows(page).nth(2);
    await row.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);

    const room = await page.evaluate(() => {
      const se = document.scrollingElement!;
      return se.scrollHeight - se.clientHeight - se.scrollTop;
    });
    // Ohne Scroll-Reserve wuerde der Test nichts beweisen.
    expect(room).toBeGreaterThan(200);

    const before = await rows(page).allTextContents();
    const scrollBefore = await page.evaluate(() => document.scrollingElement!.scrollTop);
    const box = await row.boundingBox();

    const cdp = await page.context().newCDPSession(page);
    // Rechts vom Handle: die Stelle, an der ein Finger zum Weiterlesen landet.
    const x = box!.x + box!.width - 40;
    const y = box!.y + box!.height / 2;

    // Ohne await zwischen den Schritten: eine echte schnelle Wischbewegung.
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    const moves = [];
    for (let i = 1; i <= 10; i++) {
      moves.push(
        cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - i * 25 }] })
      );
    }
    await Promise.all(moves);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(400);

    const after = await rows(page).allTextContents();
    const scrollAfter = await page.evaluate(() => document.scrollingElement!.scrollTop);

    // Der Zweitbefund: vorher tauschten hier Items die Plaetze, ohne dass der
    // Spieler sie anfassen wollte — er konnte eine richtige Loesung zerstoeren.
    expect(after).toEqual(before);
    expect(scrollAfter).not.toBe(scrollBefore);
  });

  test("ein Zug am Handle sortiert um", async ({ page }) => {
    await openSortingStation(page);

    const before = await rows(page).allTextContents();
    const row0 = await rows(page).nth(0).boundingBox();
    const row1 = await rows(page).nth(1).boundingBox();
    const pitch = row1!.y - row0!.y;
    const handle = await rows(page).nth(0).getByRole("button").boundingBox();

    const cdp = await page.context().newCDPSession(page);
    const x = handle!.x + handle!.width / 2;
    const y = handle!.y + handle!.height / 2;

    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await page.waitForTimeout(220);
    for (let i = 1; i <= 8; i++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y + (pitch * 2 * i) / 8 }],
      });
      await page.waitForTimeout(20);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(400);

    const after = await rows(page).allTextContents();
    expect(after).not.toEqual(before);
    expect(new Set(after)).toEqual(new Set(before));
  });

});
