import { test, expect, type Page } from "@playwright/test";

function draftQuestNoStations(id: string, name: string, lastModified: string) {
  return {
    version: 1, id, name, lastModified,
    intro: { text: "Willkommen" }, outro: { text: "Geschafft" }, stations: [], published: false,
  };
}

function playableQuest(id: string, name: string, lastModified: string, stationId: string, published: boolean) {
  return {
    version: 1, id, name, lastModified,
    intro: { text: "Willkommen" }, outro: { text: "Geschafft" },
    stations: [{ id: stationId, name: "Station 1", lat: 53.6, lng: 10.0, radiusMeters: 10, modules: [{ type: "text", content: "Hallo" }] }],
    published,
  };
}

async function seedQuests(page: Page, quests: unknown[]) {
  await page.goto("/create");
  await page.evaluate((quests) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify(quests));
  }, quests);
  await page.reload();
}

const NO_STATIONS_ID = "cccccccc-1111-4ccc-8ccc-cccccccccccc";
const PLAYABLE_STATION_ID = "eeeeeeee-1111-4eee-8eee-eeeeeeeeeeee";
const PLAYABLE_ID = "ffffffff-1111-4fff-8fff-ffffffffffff";

test.describe("PROJ-9: Creator — JSON-Export", () => {
  test.describe("Sicherung (Export, immer möglich)", () => {
    test("downloads a JSON file for a quest with 0 stations, sets lastExported, clears the 'nicht gesichert' badge", async ({ page }) => {
      await seedQuests(page, [draftQuestNoStations(NO_STATIONS_ID, "Leere Quest", "2020-01-01T00:00:00.000Z")]);

      const card = page.getByRole("listitem").filter({ hasText: "Leere Quest" });
      await expect(card.getByText("Nicht gesichert")).toBeVisible();

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.json$/);

      await page.reload();
      const cardAfter = page.getByRole("listitem").filter({ hasText: "Leere Quest" });
      await expect(cardAfter.getByText("Nicht gesichert")).not.toBeVisible();

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].lastExported).toBeDefined();
    });

    test("exported file content matches the quest and strips local-only fields (published, lastExported)", async ({ page }) => {
      await seedQuests(page, [playableQuest(PLAYABLE_ID, "Sichern Inhalt", "2020-01-01T00:00:00.000Z", PLAYABLE_STATION_ID, true)]);

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      const download = await downloadPromise;
      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) chunks.push(chunk as Buffer);
      const content = JSON.parse(Buffer.concat(chunks).toString());

      expect(content.name).toBe("Sichern Inhalt");
      expect(content.id).toBe(PLAYABLE_ID);
      expect(content.stations).toHaveLength(1);
      expect(content.published).toBeUndefined();
      expect(content.lastExported).toBeUndefined();
    });

    test("re-imports correctly and offers the overwrite dialog for the same quest id", async ({ page }) => {
      await seedQuests(page, [playableQuest(PLAYABLE_ID, "Re-Import Test", "2020-01-01T00:00:00.000Z", PLAYABLE_STATION_ID, true)]);

      const importedQuest = {
        version: 1, id: PLAYABLE_ID, name: "Re-Import Test Geändert", lastModified: new Date().toISOString(),
        intro: { text: "Willkommen" }, outro: { text: "Geschafft" },
        stations: [{ id: PLAYABLE_STATION_ID, name: "Station 1", lat: 53.6, lng: 10.0, radiusMeters: 10, modules: [{ type: "text", content: "Hallo" }] }],
      };
      await page.setInputFiles("input[type=file]", {
        name: "quest.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(importedQuest)),
      });
      await expect(page.getByText("existiert bereits", { exact: false })).toBeVisible();
    });
  });

  test.describe("'Nicht gesichert'-Hinweis", () => {
    test("appears when never exported, disappears once exported, reappears after a further edit", async ({ page }) => {
      await seedQuests(page, [playableQuest(PLAYABLE_ID, "Badge Test", "2020-01-01T00:00:00.000Z", PLAYABLE_STATION_ID, false)]);
      let card = page.getByRole("listitem").filter({ hasText: "Badge Test" });
      await expect(card.getByText("Nicht gesichert")).toBeVisible();

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      await downloadPromise;
      await page.reload();
      card = page.getByRole("listitem").filter({ hasText: "Badge Test" });
      await expect(card.getByText("Nicht gesichert")).not.toBeVisible();

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
      await page.locator("#quest-name").fill("Badge Test Geändert");
      await page.getByRole("button", { name: "Speichern" }).click();
      await page.reload();
      card = page.getByRole("listitem").filter({ hasText: "Badge Test Geändert" });
      await expect(card.getByText("Nicht gesichert")).toBeVisible();
    });
  });

  test.describe("Veröffentlichen (spielbare Quest)", () => {
    test("exports, sets published=true, removes draft badge, shows success toast", async ({ page }) => {
      await seedQuests(page, [playableQuest(PLAYABLE_ID, "Ver Test", "2020-01-01T00:00:00.000Z", PLAYABLE_STATION_ID, false)]);

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();
      await downloadPromise;
      await expect(page.getByText("Quest veröffentlicht")).toBeVisible();

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].published).toBe(true);

      await page.reload();
      const card = page.getByRole("listitem").filter({ hasText: "Ver Test" });
      await expect(card.locator(".border-dashed")).toHaveCount(0);
    });

    test("is repeatable: publishing an already-published quest again still exports and confirms the status", async ({ page }) => {
      await seedQuests(page, [playableQuest(PLAYABLE_ID, "Ver Wiederholt", "2020-01-01T00:00:00.000Z", PLAYABLE_STATION_ID, true)]);

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();
      await downloadPromise;
      await expect(page.getByText("Quest veröffentlicht")).toBeVisible();
    });
  });

  test.describe("Veröffentlichen (nicht spielbare Quest)", () => {
    /**
     * GEZOGEN AM 2026-09-27 (PROJ-9 Refinement), nicht gelöscht.
     *
     * Vorher hieß dieser Test "still exports (backup always happens) but
     * published stays false" und erwartete einen Download plus gesetztes
     * `lastExported`. Das war die alte Reihenfolge: exportieren, dann prüfen.
     * Genau daran ist der gemeldete Fehler entstanden — die unvollständige
     * Datei lag im Download-Ordner und wurde weitergegeben. Jetzt wird
     * geprüft, bevor geschrieben wird; "Sicherung" bleibt der Weg, der
     * bedingungslos exportiert (eigener Test oben).
     */
    test("does NOT export and leaves published false, showing the specific error", async ({ page }) => {
      await seedQuests(page, [draftQuestNoStations(NO_STATIONS_ID, "Nicht Spielbar", "2020-01-01T00:00:00.000Z")]);

      let downloadStarted = false;
      page.on("download", () => { downloadStarted = true; });

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();
      await expect(page.getByText("Quest braucht mindestens 1 Station, um veröffentlicht zu werden.")).toBeVisible();

      expect(downloadStarted).toBe(false);

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].published).toBe(false);
      // No file was written, so nothing was "gesichert" either.
      expect(stored[0].lastExported).toBeUndefined();

      await page.reload();
      const card = page.getByRole("listitem").filter({ hasText: "Nicht Spielbar" });
      await expect(card.locator(".border-dashed")).toBeVisible();
    });
  });

  /**
   * Der gemeldete Fehler (Refinement 2026-09-27): Eine Quest, deren zweite
   * Station kein Modul hatte, ließ sich veröffentlichen. Die Datei wurde
   * erzeugt, weitergegeben — und schlug beim Empfänger im Import fehl
   * ("Station 2 hat ein ungültiges Modul").
   *
   * Diese Wächter fehlten bisher ganz: Keine Assertion prüfte, ob die
   * Stationen einer veröffentlichten Quest überhaupt Inhalt haben.
   */
  test.describe("Veröffentlichen prüft den Inhalt der Stationen", () => {
    const LEER_ID = "aaaaaaaa-2222-4aaa-8aaa-aaaaaaaaaaaa";

    /** Die Datei des Betreibers, reduziert auf das Wesentliche. */
    function questMitLeererStation(name: string, zweiterName = "Café") {
      return {
        version: 1, id: LEER_ID, name, lastModified: "2020-01-01T00:00:00.000Z",
        intro: { text: "Willkommen" }, outro: { text: "Geschafft" },
        stations: [
          { id: "aaaaaaaa-3333-4aaa-8aaa-aaaaaaaaaaaa", name: "Langenhorn Markt", lat: 53.6497, lng: 10.0151, radiusMeters: 25, modules: [{ type: "text", content: "Ein Test" }] },
          { id: "aaaaaaaa-4444-4aaa-8aaa-aaaaaaaaaaaa", name: zweiterName, lat: 53.6498, lng: 10.0131, radiusMeters: 10, modules: [] },
        ],
        published: false,
      };
    }

    test("erzeugt KEINE Datei, wenn eine Station kein Modul hat", async ({ page }) => {
      await seedQuests(page, [questMitLeererStation("Test for EY and JH")]);

      let downloadStarted = false;
      page.on("download", () => { downloadStarted = true; });

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();

      // Das ist der Kern: Die Datei, die der Betreiber weitergegeben hat,
      // darf gar nicht erst entstehen.
      await expect(page.getByText(/hat noch kein Modul/)).toBeVisible();
      expect(downloadStarted).toBe(false);

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].published).toBe(false);
      expect(stored[0].lastExported).toBeUndefined();
    });

    test("nennt die betroffene Station beim Namen, nicht nur eine Anzahl", async ({ page }) => {
      await seedQuests(page, [questMitLeererStation("Namen Test")]);

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();

      // Bei bis zu 20 erlaubten Stationen ist "irgendwas ist unvollständig"
      // eine Suchaufgabe. Der Name erspart sie.
      await expect(page.getByText(/„Café" hat noch kein Modul/)).toBeVisible();
    });

    test("nennt die Position, wenn die Station keinen Namen hat", async ({ page }) => {
      await seedQuests(page, [questMitLeererStation("Ohne Namen", "   ")]);

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();

      // Kein leerer Name in Anführungszeichen ("„" hat kein Modul").
      await expect(page.getByText(/„Station 2" hat noch kein Modul/)).toBeVisible();
    });

    test("nennt die Gesamtzahl, wenn mehrere Stationen leer sind", async ({ page }) => {
      const q = questMitLeererStation("Mehrere Leer");
      q.stations[0].modules = [];
      await seedQuests(page, [q]);

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();

      await expect(page.getByText(/2 Stationen haben noch kein Modul/)).toBeVisible();
    });

    test("Sicherung exportiert dieselbe Quest weiterhin bedingungslos", async ({ page }) => {
      await seedQuests(page, [questMitLeererStation("Sicherung Trotzdem")]);

      // Der Backup-Weg darf durch dieses Refinement NICHT eingeschränkt
      // werden — ein unfertiger Arbeitsstand muss sicherbar bleiben.
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.json$/);
    });

    test("veröffentlicht, sobald die leere Station ein Modul bekommt", async ({ page }) => {
      const q = questMitLeererStation("Reparierbar");
      q.stations[1].modules = [{ type: "text", content: "Ziel erreicht" }];
      await seedQuests(page, [q]);

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();
      await downloadPromise;
      await expect(page.getByText("Quest veröffentlicht")).toBeVisible();

      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests") || "[]"));
      expect(stored[0].published).toBe(true);
    });

    test("die veröffentlichte Datei besteht den eigenen Import", async ({ page }) => {
      // Veröffentlichen und Import müssen dasselbe über eine gültige Quest
      // sagen — genau das lief auseinander und verursachte den Fehler.
      const q = questMitLeererStation("Reimport");
      q.stations[1].modules = [{ type: "text", content: "Ziel erreicht" }];
      await seedQuests(page, [q]);

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Veröffentlichen" }).click();
      const download = await downloadPromise;

      const stream = await download.createReadStream();
      const chunks: Buffer[] = [];
      for await (const c of stream) chunks.push(c as Buffer);
      const datei = JSON.parse(Buffer.concat(chunks).toString("utf-8"));

      // Jede Station der ausgelieferten Datei hat Inhalt.
      expect(datei.stations.length).toBeGreaterThan(0);
      for (const st of datei.stations) {
        expect(st.modules.length).toBeGreaterThan(0);
      }
    });

    test("die Quest bleibt in der Play-Liste sichtbar (keine Nebenwirkung)", async ({ page }) => {
      // isPlayable entscheidet auch über die Play-Sichtbarkeit. Eine
      // Verschärfung dort hätte bestehende Quests aus der Liste entfernt —
      // deshalb ist die Veröffentlichen-Prüfung eine eigene Funktion.
      await seedQuests(page, [questMitLeererStation("Sichtbar Im Play")]);
      await page.goto("/play");
      await expect(page.getByRole("listitem").filter({ hasText: "Sichtbar Im Play" })).toBeVisible();
    });
  });

  test.describe("Edge Cases", () => {
    test("two quests with the same name get distinct export filenames (unique id prefix)", async ({ page }) => {
      await seedQuests(page, [
        draftQuestNoStations("60606060-1111-4606-8606-606060606060", "Duplikat", "2020-01-01T00:00:00.000Z"),
        draftQuestNoStations("70707070-1111-4707-8707-707070707070", "Duplikat", "2020-01-02T00:00:00.000Z"),
      ]);
      const menuBtns = page.getByRole("button", { name: "Quest-Aktionen" });

      const downloadPromise1 = page.waitForEvent("download");
      await menuBtns.nth(0).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      const d1 = await downloadPromise1;

      const downloadPromise2 = page.waitForEvent("download");
      await menuBtns.nth(1).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      const d2 = await downloadPromise2;

      expect(d1.suggestedFilename()).not.toBe(d2.suggestedFilename());
    });

    test("special characters and emoji in the quest name produce a safe, slugified filename", async ({ page }) => {
      await seedQuests(page, [draftQuestNoStations("80808080-1111-4808-8808-808080808080", "Piraten's Schatz!! 🏴‍☠️", "2020-01-01T00:00:00.000Z")]);

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Sicherung" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/^[a-z0-9]+-[a-z0-9-]*\.json$/);
    });

    test("legacy quest without a published field defaults to published (isPublished fallback)", async ({ page }) => {
      await page.goto("/create");
      await page.evaluate(() => {
        localStorage.setItem("gq_first_visit_done", "true");
        localStorage.setItem("gq_quests", JSON.stringify([
          { version: 1, id: "90909090-1111-4909-8909-909090909090", name: "Altbestand", lastModified: "2020-01-01T00:00:00.000Z", intro: { text: "I" }, outro: { text: "O" }, stations: [] },
        ]));
      });
      await page.reload();
      const card = page.getByRole("listitem").filter({ hasText: "Altbestand" });
      await expect(card.locator(".border-dashed")).toHaveCount(0);
    });
  });

  test.describe("Touch-Targets", () => {
    test("BUG-5 regression: action menu items meet the 44px touch-target minimum", async ({ page }) => {
      await seedQuests(page, [draftQuestNoStations("d0d0d0d0-1111-4d0d-8d0d-d0d0d0d0d0d0", "TouchTest", "2020-01-01T00:00:00.000Z")]);
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      for (const label of ["Sicherung", "Veröffentlichen", "Bearbeiten", "Löschen"]) {
        const box = await page.getByRole("menuitem", { name: label }).boundingBox();
        expect(box?.height, `${label} height`).toBeGreaterThanOrEqual(44);
      }
    });
  });
});
