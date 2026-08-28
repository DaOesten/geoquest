import { test, expect, type Page } from "@playwright/test";

const QUEST_ID = "22222222-2222-4222-8222-222222222222";
const STATION_ID = "33333333-3333-4333-8333-333333333333";

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

function station(id: string, name: string, modules: unknown[] = [], overrides: Record<string, unknown> = {}) {
  return {
    id,
    name,
    lat: 52.5,
    lng: 13.4,
    radiusMeters: 10,
    modules,
    ...overrides,
  };
}

async function seedQuest(page: Page, quest: unknown, stationId: string) {
  await page.goto("/create");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
  }, quest);
  await page.goto(`/create/${(quest as { id: string }).id}/station/${stationId}`);
}

test.describe("PROJ-8: Creator — Modul-Editor", () => {
  test.describe("Navigation zur Modul-Liste", () => {
    test("tapping the puzzle icon on a station navigates to its module list", async ({ page }) => {
      await page.goto("/create");
      await page.evaluate(
        ({ quest }) => {
          localStorage.setItem("gq_first_visit_done", "true");
          localStorage.setItem("gq_quests", JSON.stringify([quest]));
        },
        { quest: draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Der alte Brunnen")]) }
      );
      await page.goto(`/create/${QUEST_ID}`);
      await page.getByRole("button", { name: "Module bearbeiten" }).click();
      await expect(page).toHaveURL(`/create/${QUEST_ID}/station/${STATION_ID}`);
      await expect(page.getByText("Der alte Brunnen")).toBeVisible();
    });

    test("back button returns to the station list", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Der alte Brunnen")]), STATION_ID);
      await page.getByRole("link", { name: "Zurück" }).click();
      await expect(page).toHaveURL(`/create/${QUEST_ID}`);
    });
  });

  test.describe("Modul-Liste", () => {
    test("shows an empty state with a hint and an add-module button when the station has no modules", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Leere Station")]), STATION_ID);
      await expect(page.getByText("Noch keine Module")).toBeVisible();
      await expect(page.getByRole("button", { name: "Modul hinzufügen" })).toBeVisible();
    });

    test("shows all modules in saved order with type icon and short preview", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [
          station(STATION_ID, "Station", [
            { type: "text", content: "Willkommen an dieser Station!" },
            { type: "image", url: "https://example.com/pics/brunnen.jpg" },
            { type: "task", taskType: "code", question: "Welcher Code?", answer: "1789" },
          ]),
        ]),
        STATION_ID
      );
      const items = page.locator("ul li");
      await expect(items).toHaveCount(3);
      await expect(items.nth(0)).toContainText("1. Text");
      await expect(items.nth(0)).toContainText("Willkommen an dieser Station!");
      await expect(items.nth(1)).toContainText("2. Bild");
      await expect(items.nth(1)).toContainText("brunnen.jpg");
      await expect(items.nth(2)).toContainText("3. Code-Eingabe");
      await expect(items.nth(2)).toContainText("Welcher Code?");
    });

    test("shows a warning badge on an incomplete module", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station", [{ type: "text", content: "" }])]),
        STATION_ID
      );
      await expect(page.getByText("Kein Inhalt")).toBeVisible();
    });
  });

  test.describe("Modultyp-Auswahl", () => {
    test("shows a 5-tile type picker when tapping 'Modul hinzufügen'", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await expect(page.getByText("Modultyp wählen")).toBeVisible();
      for (const label of ["Text", "Bild", "Audio", "Video", "Aufgabe"]) {
        await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
      }
    });

    test("choosing 'Aufgabe' reveals the 3 task subtypes", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await expect(page.getByText("Aufgabentyp wählen")).toBeVisible();
      for (const label of ["Code-Eingabe", "Multiple Choice", "Sortierung"]) {
        await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
      }
    });

    test("picking a type opens the matching empty editor sheet", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Bild", exact: true }).click();
      await expect(page.getByText("Bild-Modul", { exact: true })).toBeVisible();
      await expect(page.locator("#media-url")).toHaveValue("");
    });
  });

  test.describe("Text-Modul-Editor", () => {
    test("saves multi-line text with list markers unchanged", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Text", exact: true }).click();
      await page.locator("#text-content").fill("Zeile 1\n- Punkt A\n- Punkt B");
      await page.getByRole("button", { name: "Speichern" }).click();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules[0]
      );
      expect(saved).toEqual({ type: "text", content: "Zeile 1\n- Punkt A\n- Punkt B" });
    });
  });

  test.describe("Bild-/Audio-/Video-Modul-Editor", () => {
    test("rejects a non-https URL with an inline error and keeps the sheet open", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Bild", exact: true }).click();
      await page.locator("#media-url").fill("http://unsicher.de/bild.jpg");
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Nur HTTPS-URLs sind erlaubt.")).toBeVisible();
      await expect(page.locator("#media-url")).toBeVisible();
    });

    test("saves a valid https URL with an optional caption", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Bild", exact: true }).click();
      await page.locator("#media-url").fill("https://example.com/bild.jpg");
      await page.locator("#media-caption").fill("Der geheime Eingang");
      await page.getByRole("button", { name: "Speichern" }).click();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules[0]
      );
      expect(saved).toEqual({ type: "image", url: "https://example.com/bild.jpg", caption: "Der geheime Eingang" });
    });
  });

  test.describe("Code-Eingabe-Task-Editor", () => {
    test("saves question and answer", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Code-Eingabe", exact: true }).click();
      await page.locator("#code-question").fill("Welcher Code steht auf dem Schild?");
      await page.locator("#code-answer").fill("1789");
      await page.getByRole("button", { name: "Speichern" }).click();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules[0]
      );
      expect(saved).toEqual({ type: "task", taskType: "code", question: "Welcher Code steht auf dem Schild?", answer: "1789" });
    });
  });

  test.describe("Multiple-Choice-Task-Editor", () => {
    test("adds a new empty option field, up to the max of 5", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Multiple Choice", exact: true }).click();
      const options = page.locator('input[placeholder^="Option "]');
      await expect(options).toHaveCount(2);
      const addBtn = page.getByRole("button", { name: "Option hinzufügen" });
      await addBtn.click();
      await addBtn.click();
      await addBtn.click();
      await expect(options).toHaveCount(5);
      await expect(addBtn).toBeDisabled();
    });

    test("removing an option keeps at least 2, disabling remove at the minimum", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Multiple Choice", exact: true }).click();
      await page.getByRole("button", { name: "Option hinzufügen" }).click(); // 3 options now
      const removeButtons = page.locator('button[aria-label^="Option "][aria-label$=" entfernen"]');
      await expect(removeButtons).toHaveCount(3);
      await removeButtons.nth(2).click();
      await expect(page.locator('input[placeholder^="Option "]')).toHaveCount(2);
      await expect(removeButtons.nth(0)).toBeDisabled();
      await expect(removeButtons.nth(1)).toBeDisabled();
    });

    test("saves marked-correct options as correctIndices", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Multiple Choice", exact: true }).click();
      await page.locator("#mc-question").fill("Was siehst du hier?");
      const options = page.locator('input[placeholder^="Option "]');
      await options.nth(0).fill("Einen Brunnen");
      await options.nth(1).fill("Ein Auto");
      await page.getByRole("checkbox", { name: "Option 1 als korrekt markieren" }).click();
      await page.getByRole("button", { name: "Speichern" }).click();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules[0]
      );
      expect(saved).toEqual({
        type: "task",
        taskType: "multiple-choice",
        question: "Was siehst du hier?",
        options: ["Einen Brunnen", "Ein Auto"],
        correctIndices: [0],
      });
    });

    test("removing a marked-correct option re-indexes correctIndices instead of leaving a stale index", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Multiple Choice", exact: true }).click();
      await page.getByRole("button", { name: "Option hinzufügen" }).click(); // 3 options
      await page.locator("#mc-question").fill("Frage");
      const options = page.locator('input[placeholder^="Option "]');
      await options.nth(0).fill("A");
      await options.nth(1).fill("B");
      await options.nth(2).fill("C");
      // Mark option 2 ("B") as correct, then remove option 1 ("A") — the surviving
      // correct answer must still point at "B" (now at index 0), not silently
      // shift onto "A"'s old slot or "C".
      await page.getByRole("checkbox", { name: "Option 2 als korrekt markieren" }).click();
      const removeButtons = page.locator('button[aria-label^="Option "][aria-label$=" entfernen"]');
      await removeButtons.nth(0).click();
      await page.getByRole("button", { name: "Speichern" }).click();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules[0]
      );
      expect(saved.options).toEqual(["B", "C"]);
      expect(saved.correctIndices).toEqual([0]);
    });
  });

  test.describe("Sortierungs-Task-Editor", () => {
    test("input order becomes the items array on save", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Sortierung", exact: true }).click();
      await page.locator("#sorting-question").fill("Bringe in Reihenfolge");
      const items = page.locator('input[placeholder^="Item "]');
      await items.nth(0).fill("Zuerst");
      await items.nth(1).fill("Dann");
      await items.nth(2).fill("Zuletzt");
      await page.getByRole("button", { name: "Speichern" }).click();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules[0]
      );
      expect(saved).toEqual({
        type: "task",
        taskType: "sorting",
        question: "Bringe in Reihenfolge",
        items: ["Zuerst", "Dann", "Zuletzt"],
      });
    });

    test("dragging an item updates the order in the local draft before save", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Sortierung", exact: true }).click();
      const items = page.locator('input[placeholder^="Item "]');
      await items.nth(0).fill("Zuerst");
      await items.nth(1).fill("Dann");
      await items.nth(2).fill("Zuletzt");

      const handles = page.getByLabel("Reihenfolge ändern");
      const sourceBox = await handles.nth(0).boundingBox();
      const targetBox = await handles.nth(2).boundingBox();
      await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, sourceBox!.y + sourceBox!.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.move(sourceBox!.x + sourceBox!.width / 2, targetBox!.y + 5, { steps: 10 });
      await page.waitForTimeout(200);
      await page.mouse.up();

      await expect(items.nth(0)).toHaveValue("Dann");
    });

    test("removing an item keeps at least 3, disabling remove at the minimum", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Aufgabe", exact: true }).click();
      await page.getByRole("button", { name: "Sortierung", exact: true }).click();
      await page.getByRole("button", { name: "Item hinzufügen" }).click(); // 4 items
      const removeButtons = page.locator('button[aria-label^="Item "][aria-label$=" entfernen"]');
      await expect(removeButtons).toHaveCount(4);
      await removeButtons.nth(3).click();
      await expect(page.locator('input[placeholder^="Item "]')).toHaveCount(3);
      await expect(removeButtons.nth(0)).toBeDisabled();
    });
  });

  test.describe("Speichern (Entwurfsprinzip)", () => {
    test("saves an incomplete module (empty text content) and closes the sheet", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Text", exact: true }).click();
      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.locator("#text-content")).not.toBeVisible();
      await expect(page.getByText("Kein Inhalt")).toBeVisible();
    });

    test("cancel discards all changes", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Text", exact: true }).click();
      await page.locator("#text-content").fill("Sollte nicht gespeichert werden");
      await page.getByRole("button", { name: "Abbrechen" }).click();
      await expect(page.getByText("Noch keine Module")).toBeVisible();
    });

    test("updates the quest's lastModified when a module is saved", async ({ page }) => {
      await seedQuest(page, draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station")]), STATION_ID);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Text", exact: true }).click();
      await page.locator("#text-content").fill("Inhalt");
      await page.getByRole("button", { name: "Speichern" }).click();
      const lastModified = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0].lastModified);
      expect(lastModified).not.toBe("2026-01-01T00:00:00.000Z");
    });
  });

  test.describe("Reihenfolge (Drag & Drop)", () => {
    test("persists a new module order after a drag, surviving reload", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [
          station(STATION_ID, "Station", [
            { type: "text", content: "A" },
            { type: "text", content: "B" },
          ]),
        ]),
        STATION_ID
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

      const orderAfterDrag = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules.map((m: { content: string }) => m.content)
      );
      expect(orderAfterDrag).toEqual(["B", "A"]);

      await page.reload();
      const orderAfterReload = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules.map((m: { content: string }) => m.content)
      );
      expect(orderAfterReload).toEqual(["B", "A"]);
    });
  });

  test.describe("Bearbeiten", () => {
    test("opens the matching sheet prefilled with the module's existing values", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [
          station(STATION_ID, "Station", [{ type: "image", url: "https://example.com/a.jpg", caption: "Eingang" }]),
        ]),
        STATION_ID
      );
      await page.locator("ul li").first().click();
      await expect(page.getByText("Bild-Modul bearbeiten")).toBeVisible();
      await expect(page.locator("#media-url")).toHaveValue("https://example.com/a.jpg");
      await expect(page.locator("#media-caption")).toHaveValue("Eingang");
    });
  });

  test.describe("Löschen", () => {
    test("shows a confirmation dialog before deleting", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station", [{ type: "text", content: "Zu löschen" }])]),
        STATION_ID
      );
      await page.getByLabel("Modul-Aktionen").click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await expect(page.getByText("Modul wirklich löschen?")).toBeVisible();
    });

    test("removes the module after confirming", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station", [{ type: "text", content: "Zu löschen" }])]),
        STATION_ID
      );
      await page.getByLabel("Modul-Aktionen").click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();
      await expect(page.getByText("Noch keine Module")).toBeVisible();
    });

    test("keeps the module when the confirmation is cancelled", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station", [{ type: "text", content: "Bleibt erhalten" }])]),
        STATION_ID
      );
      await page.getByLabel("Modul-Aktionen").click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Abbrechen" }).click();
      await expect(page.getByText("Noch keine Module")).not.toBeVisible();
      await expect(page.locator("ul li")).toHaveCount(1);
    });
  });

  test.describe("Edge Case: Navigation zu ungültiger stationId", () => {
    test("shows a not-found state for a deleted/invalid station id", async ({ page }) => {
      await page.goto("/create");
      await page.evaluate(
        ({ quest }) => {
          localStorage.setItem("gq_first_visit_done", "true");
          localStorage.setItem("gq_quests", JSON.stringify([quest]));
        },
        { quest: draftQuest(QUEST_ID, "Quest", []) }
      );
      const response = await page.goto(`/create/${QUEST_ID}/station/does-not-exist`);
      expect(response?.status()).toBe(404);
    });
  });

  test.describe("Regression: PROJ-6/PROJ-7 station list reacts to PROJ-8 modules", () => {
    test("station list shows the module count, and last module deletion returns the station to 'Entwurf'", async ({ page }) => {
      await seedQuest(
        page,
        draftQuest(QUEST_ID, "Quest", [station(STATION_ID, "Station", [{ type: "text", content: "Einziges Modul" }])]),
        STATION_ID
      );
      await page.getByLabel("Modul-Aktionen").click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();

      await page.goto(`/create/${QUEST_ID}`);
      await expect(page.getByText("0 Module")).toBeVisible();
    });
  });
});
