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
      await page.getByText("Imported").click();
      await expect(page.getByText("37 m").last()).toBeVisible();

      // Saving without touching the slider must not silently change the value.
      await page.getByRole("button", { name: "Speichern" }).click();
      const savedUntouched = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].radiusMeters);
      expect(savedUntouched).toBe(37);

      // Nudging once from 37 (nearest step: 25) must move up to 50, not down to 25.
      await page.getByText("Imported").click();
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
      await page.getByText("Der alte Brunnen").click();
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
