import { test, expect, type Page } from "@playwright/test";

const QUEST_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const STATION_A_ID = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const STATION_B_ID = "11111111-1111-4111-8111-111111111111";

function draftQuest(id: string, name: string, stations: unknown[] = []) {
  return {
    version: 1,
    id,
    name,
    lastModified: "2026-01-01T00:00:00.000Z",
    intro: { text: "" },
    outro: { text: "" },
    stations,
  };
}

function station(id: string, name: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name,
    lat: 52.5,
    lng: 13.4,
    radiusMeters: 10,
    modules: [],
    ...overrides,
  };
}

async function seedQuest(page: Page, quest: unknown) {
  await page.goto("/create");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
  }, quest);
  await page.goto(`/create/${(quest as { id: string }).id}`);
}

test.describe("PROJ-7: Creator — Stationen-Editor", () => {
  test.describe("Stationsliste", () => {
    test("shows an empty state with a hint and an add-station button when the quest has no stations", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await expect(page.getByText("Noch keine Stationen")).toBeVisible();
      await expect(page.getByRole("button", { name: "Station hinzufügen" })).toBeVisible();
    });

    test("shows all stations in saved order with name, module count, and position status", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest mit Stationen", [
          station(STATION_A_ID, "Der alte Brunnen", { modules: [{ type: "text", content: "Hallo" }] }),
          station(STATION_B_ID, "Zweite Station", { lat: undefined, lng: undefined }),
        ])
      );
      const items = page.locator("li");
      await expect(items).toHaveCount(2);
      await expect(items.nth(0)).toContainText("Der alte Brunnen");
      await expect(items.nth(0)).toContainText("1 Modul");
      await expect(items.nth(1)).toContainText("Zweite Station");
    });

    test("shows 'Keine Position gesetzt' instead of coordinates for a station without a position", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_A_ID, "Ohne Position", { lat: undefined, lng: undefined })]));
      await expect(page.getByText("Keine Position gesetzt")).toBeVisible();
    });
  });

  test.describe("Station hinzufügen", () => {
    test("opens the sheet with an empty name, no pin, and a 10m default radius", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await expect(page.getByLabel("Stationsname")).toHaveValue("");
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(0);
      await expect(page.getByText("10 m").first()).toBeVisible();
    });

    test("shows a usable map with no pin when the quest has no positioned station yet (Germany-wide default center, see GERMANY_CENTER)", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await expect(page.locator(".leaflet-container")).toBeVisible();
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(0);
    });

    test("shows other positioned stations as context pins when adding a new station", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_A_ID, "Bestehende Station")]));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
    });
  });

  test.describe("Position setzen", () => {
    test("tapping the map sets a pin at that location", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const map = page.locator(".leaflet-container");
      const box = await map.boundingBox();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
    });

    test("shows an error and keeps the map usable when the current-position lookup fails", async ({ page, context }) => {
      await context.clearPermissions();
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await page.getByRole("button", { name: /Aktuelle Position verwenden/ }).click();
      await expect(page.getByText("Standort nicht verfügbar.")).toBeVisible();
      const map = page.locator(".leaflet-container");
      const box = await map.boundingBox();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
    });
  });

  test.describe("Adresssuche", () => {
    async function mockNominatim(page: Page, results: Array<{ place_id: number; display_name: string; lat: string; lon: string }>) {
      await page.route("**/nominatim.openstreetmap.org/search**", async (route) => {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(results) });
      });
    }

    const BRANDENBURG_GATE = {
      place_id: 1,
      display_name: "Brandenburger Tor, Pariser Platz, Berlin, Deutschland",
      lat: "52.5162746",
      lon: "13.3777041",
    };

    test("shows a debounced suggestion list after typing, without an early request", async ({ page }) => {
      let requestCount = 0;
      await page.route("**/nominatim.openstreetmap.org/search**", async (route) => {
        requestCount++;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([BRANDENBURG_GATE]) });
      });

      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const search = page.getByPlaceholder("Adresse suchen, z.B. Musterstraße 1");
      await search.fill("Brandenburger Tor");

      // No request before the debounce window elapses.
      await page.waitForTimeout(200);
      expect(requestCount).toBe(0);

      await expect(page.getByText("Brandenburger Tor, Pariser Platz, Berlin, Deutschland")).toBeVisible();
      expect(requestCount).toBe(1);
    });

    test("selecting a suggestion sets the pin, centers the map, and closes the list", async ({ page }) => {
      await mockNominatim(page, [BRANDENBURG_GATE]);
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const search = page.getByPlaceholder("Adresse suchen, z.B. Musterstraße 1");
      await search.fill("Brandenburger Tor");

      const suggestion = page.getByText("Brandenburger Tor, Pariser Platz, Berlin, Deutschland");
      await expect(suggestion).toBeVisible();
      await suggestion.click();

      await expect(suggestion).not.toBeVisible();
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
    });

    test("shows a hint and keeps the map usable when the search has no results", async ({ page }) => {
      await mockNominatim(page, []);
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const search = page.getByPlaceholder("Adresse suchen, z.B. Musterstraße 1");
      await search.fill("xyzxyzxyz123");

      await expect(page.getByText("Keine Ergebnisse gefunden.")).toBeVisible();
      const map = page.locator(".leaflet-container");
      const box = await map.boundingBox();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
    });

    test("shows a hint and keeps the map usable when Nominatim is unreachable", async ({ page }) => {
      await page.route("**/nominatim.openstreetmap.org/search**", (route) => route.abort("failed"));
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const search = page.getByPlaceholder("Adresse suchen, z.B. Musterstraße 1");
      await search.fill("beliebige Adresse");

      await expect(page.getByText("Suche nicht verfügbar.")).toBeVisible();
      await expect(page.locator(".leaflet-container")).toBeVisible();
    });

    test("map tap and 'Aktuelle Position verwenden' still work alongside the search field", async ({ page }) => {
      await mockNominatim(page, [BRANDENBURG_GATE]);
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();

      const map = page.locator(".leaflet-container");
      const box = await map.boundingBox();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);

      await expect(page.getByRole("button", { name: /Aktuelle Position verwenden/ })).toBeEnabled();
    });

    test("the clear ('X') button empties the search field and closes the list without leaving blank space", async ({ page }) => {
      await mockNominatim(page, [BRANDENBURG_GATE]);
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const search = page.getByPlaceholder("Adresse suchen, z.B. Musterstraße 1");
      await search.fill("Brandenburger Tor");
      await expect(page.getByText("Brandenburger Tor, Pariser Platz, Berlin, Deutschland")).toBeVisible();

      await page.getByRole("button", { name: "Suchtext löschen" }).click();
      await expect(search).toHaveValue("");
      await expect(page.getByText("Brandenburger Tor, Pariser Platz, Berlin, Deutschland")).not.toBeVisible();
    });

    test("closing the sheet while a search is in flight does not throw or leave stale state", async ({ page }) => {
      await page.route("**/nominatim.openstreetmap.org/search**", async (route) => {
        await new Promise((r) => setTimeout(r, 1000));
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([BRANDENBURG_GATE]) });
      });

      const pageErrors: string[] = [];
      page.on("pageerror", (err) => pageErrors.push(err.message));

      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const search = page.getByPlaceholder("Adresse suchen, z.B. Musterstraße 1");
      await search.fill("langsame Suche");
      await page.waitForTimeout(600); // let the debounce fire so the request is in flight

      await page.getByRole("button", { name: "Abbrechen" }).click();
      await page.waitForTimeout(1200); // wait past the slow response

      expect(pageErrors).toEqual([]);
    });
  });

  test.describe("Name & Radius", () => {
    test("saves the entered name", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await page.getByLabel("Stationsname").fill("Der alte Brunnen");
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Der alte Brunnen")).toBeVisible();
    });

    test("moves the radius through its fixed steps and clamps at the max", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      const slider = page.getByRole("slider");
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("25 m").last()).toBeVisible();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("100 m").last()).toBeVisible();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("100 m").last()).toBeVisible();
    });

    test("BUG-2 regression: a non-step radius (e.g. from an import) keeps its value on save, and the first nudge moves up from its nearest step instead of collapsing to 10m", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_A_ID, "Imported", { radiusMeters: 37 })]));
      await page.getByLabel("Stations-Aktionen").click();
      await page.getByRole("menuitem", { name: "Station bearbeiten" }).click();
      await expect(page.getByText("37 m").last()).toBeVisible();

      // Saving without touching the slider must not silently change the value.
      await page.getByRole("button", { name: "Speichern" }).click();
      const savedUntouched = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].radiusMeters);
      expect(savedUntouched).toBe(37);

      // Nudging once from 37 (nearest step: 25) must move up to 50, not down to 25.
      await page.getByLabel("Stations-Aktionen").click();
      await page.getByRole("menuitem", { name: "Station bearbeiten" }).click();
      const slider = page.getByRole("slider");
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("50 m").last()).toBeVisible();
    });
  });

  test.describe("Speichern (Entwurfsprinzip)", () => {
    test("saves a station without a position and closes the sheet", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await page.getByLabel("Stationsname").fill("Ohne Position");
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByLabel("Stationsname")).not.toBeVisible();
      await expect(page.getByText("Keine Position gesetzt")).toBeVisible();
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0]);
      expect(saved.lat).toBeUndefined();
      expect(saved.lng).toBeUndefined();
    });

    test("discards changes when the sheet is cancelled", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await page.getByLabel("Stationsname").fill("Sollte nicht gespeichert werden");
      await page.getByRole("button", { name: "Abbrechen" }).click();
      await expect(page.getByText("Sollte nicht gespeichert werden")).not.toBeVisible();
      await expect(page.getByText("Noch keine Stationen")).toBeVisible();
    });

    test("updates the quest's lastModified when a station is saved", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await page.getByLabel("Stationsname").fill("Neue Station");
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Neue Station")).toBeVisible();
      const lastModified = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0].lastModified);
      expect(lastModified).not.toBe("2026-01-01T00:00:00.000Z");
    });
  });

  // The map's min-height used to win against flex-1 inside a non-scrolling SheetContent,
  // pushing the footer out of view and making the sheet unusable on small phones
  // (PROJ-7 refine 2026-09-06). 360x640 is the spec's reference viewport.
  test.describe("Sheet-Layout auf kleinen Bildschirmen", () => {
    const SMALL_VIEWPORT = { width: 360, height: 640 };

    async function openSheetOnSmallScreen(page: Page) {
      await page.setViewportSize(SMALL_VIEWPORT);
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await expect(page.getByLabel("Stationsname")).toBeVisible();
    }

    test("keeps both footer buttons inside the viewport without scrolling", async ({ page }) => {
      await openSheetOnSmallScreen(page);

      for (const label of ["Abbrechen", "Speichern"]) {
        const button = page.getByRole("button", { name: label });
        await expect(button).toBeVisible();
        const box = (await button.boundingBox())!;
        // A button flush against the viewport edge sits under the home indicator on a real
        // phone, so require the design system's 14px safe-area gutter below it.
        expect(box.y + box.height).toBeLessThanOrEqual(SMALL_VIEWPORT.height - 14);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });

    test("lays the footer buttons out side by side rather than stacking them", async ({ page }) => {
      await openSheetOnSmallScreen(page);

      const cancel = (await page.getByRole("button", { name: "Abbrechen" }).boundingBox())!;
      const save = (await page.getByRole("button", { name: "Speichern" }).boundingBox())!;
      expect(cancel.y).toBeCloseTo(save.y, 0);
    });

    test("the map does not overlap the save button", async ({ page }) => {
      await openSheetOnSmallScreen(page);
      await page.locator(".leaflet-container").waitFor();

      // The map may extend past the scroll container's edge — it is clipped there, not drawn
      // over the footer. What matters is that no *visible* map pixel reaches the save button.
      const scrollerBox = (await page.locator("div.overflow-y-auto").first().boundingBox())!;
      const mapBox = (await page.locator(".leaflet-container").boundingBox())!;
      const saveBox = (await page.getByRole("button", { name: "Speichern" }).boundingBox())!;

      const visibleMapBottom = Math.min(mapBox.y + mapBox.height, scrollerBox.y + scrollerBox.height);
      expect(visibleMapBottom).toBeLessThanOrEqual(saveBox.y);
    });

    test("saving works end to end on a small screen", async ({ page }) => {
      await openSheetOnSmallScreen(page);
      await page.getByLabel("Stationsname").fill("Kleines Display");
      await page.getByRole("button", { name: "Speichern" }).click();

      await expect(page.getByLabel("Stationsname")).not.toBeVisible();
      await expect(page.getByText("Kleines Display")).toBeVisible();
    });

    test("scrolls the middle band while the title and buttons stay put", async ({ page }) => {
      await openSheetOnSmallScreen(page);

      const title = page.getByText("Station hinzufügen", { exact: true }).last();
      const save = page.getByRole("button", { name: "Speichern" });
      const titleBefore = (await title.boundingBox())!;
      const saveBefore = (await save.boundingBox())!;

      const scroller = page.locator("div.overflow-y-auto").first();
      const scrolled = await scroller.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
        return el.scrollTop > 0;
      });
      expect(scrolled).toBe(true);

      expect((await title.boundingBox())!.y).toBeCloseTo(titleBefore.y, 0);
      expect((await save.boundingBox())!.y).toBeCloseTo(saveBefore.y, 0);
    });

    test("keeps the map usable rather than shrinking it away", async ({ page }) => {
      await openSheetOnSmallScreen(page);
      await page.locator(".leaflet-container").waitFor();

      // min-h-[220px] lives on the bordered wrapper around the map, so measure that.
      const wrapperHeight = await page
        .locator(".leaflet-container")
        .evaluate((el) => el.parentElement!.getBoundingClientRect().height);
      expect(wrapperHeight).toBeGreaterThanOrEqual(220);
    });

    test("leaves the sheet unscrolled on a large screen", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await seedQuest(page, draftQuest(QUEST_ID, "Leere Quest"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await expect(page.getByLabel("Stationsname")).toBeVisible();

      const scroller = page.locator("div.overflow-y-auto").first();
      const overflows = await scroller.evaluate((el) => el.scrollHeight > el.clientHeight + 1);
      expect(overflows).toBe(false);
      await expect(page.getByRole("button", { name: "Speichern" })).toBeVisible();
    });
  });

  test.describe("Reihenfolge (Drag & Drop)", () => {
    test("persists a new station order after a drag, surviving reload", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [
          station(STATION_A_ID, "Station A"),
          station(STATION_B_ID, "Station B"),
        ])
      );
      const handles = page.getByLabel("Reihenfolge ändern");
      const sourceBox = await handles.nth(1).boundingBox();
      const targetBox = await handles.nth(0).boundingBox();

      await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, sourceBox!.y + sourceBox!.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, targetBox!.y - 5, { steps: 10 });
      await page.waitForTimeout(200);
      await page.mouse.up();

      await expect(page.locator("li").first()).toContainText("Station B");

      await page.reload();
      await expect(page.locator("li").first()).toContainText("Station B");
    });
  });

  test.describe("Bearbeiten", () => {
    test("opens the sheet prefilled with the station's existing values", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_A_ID, "Der alte Brunnen", { radiusMeters: 50 })]));
      await page.getByLabel("Stations-Aktionen").click();
      await page.getByRole("menuitem", { name: "Station bearbeiten" }).click();
      await expect(page.getByLabel("Stationsname")).toHaveValue("Der alte Brunnen");
      await expect(page.getByText("50 m").last()).toBeVisible();
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(1);
    });
  });

  test.describe("Löschen", () => {
    test("shows a confirmation dialog before deleting", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_A_ID, "Zu löschen")]));
      await page.getByLabel("Stations-Aktionen").click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await expect(page.getByText("Station wirklich löschen?")).toBeVisible();
    });

    test("removes the station after confirming", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_A_ID, "Zu löschen")]));
      await page.getByLabel("Stations-Aktionen").click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();
      await expect(page.getByText("Zu löschen")).not.toBeVisible();
      await expect(page.getByText("Noch keine Stationen")).toBeVisible();
    });

    test("keeps the station when the confirmation is cancelled", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_A_ID, "Bleibt erhalten")]));
      await page.getByLabel("Stations-Aktionen").click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Abbrechen" }).click();
      await expect(page.getByText("Bleibt erhalten")).toBeVisible();
    });
  });

  // The quest-edit pencil moved out of the header next to the quest title when PROJ-1 gave
  // every screen a burger menu (refine 2026-09-06). That change was verified by hand but had
  // no tests of its own in this suite — these close that gap.
  test.describe("Quest-Bearbeiten-Stift im Titel-Block", () => {
    test("sits next to the quest title, not in the header", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Rätsel am Fluss"));

      const pencil = page.getByRole("button", { name: "Quest bearbeiten" });
      await expect(pencil).toBeVisible();

      const title = page.getByRole("heading", { name: "Rätsel am Fluss" });
      const titleBox = (await title.boundingBox())!;
      const pencilBox = (await pencil.boundingBox())!;

      // Same band as the title, and to its right — not up in the header.
      expect(pencilBox.x).toBeGreaterThan(titleBox.x);
      expect(pencilBox.y).toBeGreaterThan(titleBox.y - 40);

      const header = page.locator("header");
      await expect(header.getByRole("button", { name: "Quest bearbeiten" })).toHaveCount(0);
    });

    test("opens the quest edit dialog", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Rätsel am Fluss"));

      await page.getByRole("button", { name: "Quest bearbeiten" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.locator("#quest-name")).toHaveValue("Rätsel am Fluss");
    });

    test("meets the 44px touch-target minimum", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Rätsel am Fluss"));

      const box = (await page.getByRole("button", { name: "Quest bearbeiten" }).boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test("stays on the first line when a long quest name wraps", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Die sehr lange Schnitzeljagd quer durch die ganze Altstadt und zurück")
      );

      const title = page.getByRole("heading", { level: 1 });
      const titleBox = (await title.boundingBox())!;
      const pencilBox = (await page.getByRole("button", { name: "Quest bearbeiten" }).boundingBox())!;

      // The title must actually wrap for this test to mean anything.
      expect(titleBox.height).toBeGreaterThan(60);
      // The pencil tracks the first line rather than centring on the wrapped block.
      expect(pencilBox.y).toBeLessThan(titleBox.y + titleBox.height / 2);
    });

    test("is hidden for a password-protected quest that has not been unlocked (PROJ-11)", async ({ page }) => {
      await page.goto("/create");
      await page.evaluate(() => {
        localStorage.setItem("gq_first_visit_done", "true");
        localStorage.setItem("gq_quests", JSON.stringify([{
          version: 1,
          id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          name: "Fremde Quest",
          lastModified: "2026-01-01T00:00:00.000Z",
          intro: { text: "" },
          outro: { text: "" },
          stations: [],
          // Imported from elsewhere: password set, not in gq_created_here, never unlocked here.
          passwordHash: "0".repeat(64),
        }]));
      });
      await page.goto(`/create/${QUEST_ID}`);

      await expect(page.getByRole("button", { name: "Quest bearbeiten" })).toHaveCount(0);
    });
  });

  test.describe("Regression: PROJ-6 Entwurf/Play-Sichtbarkeit reacts to PROJ-7 stations", () => {
    test("a quest becomes playable as soon as its first positioned station is added", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Frisch angelegt"));
      await page.getByRole("button", { name: "Station hinzufügen" }).click();
      await page.getByLabel("Stationsname").fill("Erste Station");
      const map = page.locator(".leaflet-container");
      const box = await map.boundingBox();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Erste Station")).toBeVisible();

      await page.goto("/play");
      await expect(page.getByText("Frisch angelegt")).toBeVisible();
    });
  });
});
