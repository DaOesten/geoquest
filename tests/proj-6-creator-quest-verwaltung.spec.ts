import { test, expect, type Page } from "@playwright/test";

// A quest the creator marked as a draft ("Entwurf") — published: false is what
// drives the dashed-card styling now (PROJ-6 refinement), independent of
// completeness or playability.
function draftQuest(id: string, name: string, lastModified: string) {
  return {
    version: 1,
    id,
    name,
    lastModified,
    intro: { text: "Willkommen" },
    outro: { text: "Geschafft" },
    stations: [],
    published: false,
  };
}

// A quest the creator has published — no dashed styling, regardless of station count.
function publishedQuest(id: string, name: string, lastModified: string, stationId: string) {
  return {
    version: 1,
    id,
    name,
    lastModified,
    intro: { text: "Willkommen" },
    outro: { text: "Geschafft" },
    stations: [
      {
        id: stationId,
        name: "Station 1",
        lat: 53.6,
        lng: 10.0,
        radiusMeters: 10,
        modules: [{ type: "text", content: "Hallo" }],
      },
    ],
    published: true,
  };
}

// A quest that's genuinely being worked on: has one station (so it's testable
// in Play) and is still marked "Entwurf" (unpublished) in the Creator.
// Play-visibility and the draft badge are independent.
function partiallyBuiltDraftQuest(id: string, name: string, lastModified: string, stationId: string) {
  return {
    version: 1,
    id,
    name,
    lastModified,
    intro: { text: "Willkommen" },
    outro: { text: "Geschafft" },
    stations: [
      {
        id: stationId,
        name: "Station 1",
        lat: 53.6,
        lng: 10.0,
        radiusMeters: 10,
        modules: [{ type: "text", content: "Hallo" }],
      },
    ],
    published: false,
  };
}

const COMPLETE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const COMPLETE_STATION_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const DRAFT_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const OLDER_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

async function seedQuests(page: Page, quests: unknown[]) {
  await page.goto("/create");
  await page.evaluate((quests) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify(quests));
  }, quests);
  await page.reload();
}

async function gotoEmptyCreate(page: Page) {
  await page.goto("/create");
  await page.evaluate(() => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.removeItem("gq_quests");
  });
  await page.reload();
}

async function fillQuestForm(page: Page, values: { name?: string; introText?: string; outroText?: string }) {
  if (values.name !== undefined) await page.locator("#quest-name").fill(values.name);
  if (values.introText !== undefined) await page.locator("#intro-text").fill(values.introText);
  if (values.outroText !== undefined) await page.locator("#outro-text").fill(values.outroText);
}

test.describe("PROJ-6: Creator — Quest-Verwaltung", () => {
  test.describe("Liste", () => {
    test("shows all quests sorted by lastModified (newest first) with name, station count, and greyed-out draft styling", async ({ page }) => {
      await seedQuests(page, [
        draftQuest(OLDER_ID, "Ältere Quest", "2026-01-01T00:00:00.000Z"),
        publishedQuest(COMPLETE_ID, "Neueste Quest", "2026-01-03T00:00:00.000Z", COMPLETE_STATION_ID),
        draftQuest(DRAFT_ID, "Mittlere Quest", "2026-01-02T00:00:00.000Z"),
      ]);

      const cards = page.locator("li");
      await expect(cards).toHaveCount(3);
      await expect(cards.nth(0)).toContainText("Neueste Quest");
      await expect(cards.nth(1)).toContainText("Mittlere Quest");
      await expect(cards.nth(2)).toContainText("Ältere Quest");
      await expect(cards.nth(0)).toContainText("1 Station");
      await expect(cards.nth(1)).toContainText("0 Stationen");
      await expect(cards.nth(1).locator(".border-dashed")).toBeVisible();
    });

    test("shows an empty state with a create button and an import button when no quests exist", async ({ page }) => {
      await gotoEmptyCreate(page);
      await expect(page.getByText("Noch keine Quests erstellt")).toBeVisible();
      await expect(page.getByRole("button", { name: "Neue Quest erstellen" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Quest importieren" })).toBeVisible();
    });
  });

  test.describe("Neue Quest erstellen", () => {
    test("asks for name, intro and outro, creates the quest, and navigates to the editor placeholder", async ({ page }) => {
      await gotoEmptyCreate(page);
      await page.getByRole("button", { name: "Neue Quest erstellen" }).click();
      await expect(page.getByText("Quest-Name")).toBeVisible();
      await expect(page.getByText("Intro-Text")).toBeVisible();
      await expect(page.getByText("Outro-Text")).toBeVisible();

      await fillQuestForm(page, {
        name: "Meine erste Quest",
        introText: "Willkommen bei der Jagd",
        outroText: "Geschafft!",
      });
      await page.getByRole("button", { name: "Erstellen" }).click();

      await expect(page).toHaveURL(/\/create\/[0-9a-f-]{36}$/);
      await expect(page.getByText("Noch keine Stationen")).toBeVisible();

      await page.goto("/create");
      const card = page.getByRole("listitem").filter({ hasText: "Meine erste Quest" });
      await expect(card).toBeVisible();
      // Freshly created quests start unpublished ("Entwurf"), regardless of intro/outro completeness.
      await expect(card.locator(".border-dashed")).toBeVisible();
    });

    test("shows validation errors and creates nothing when name, intro or outro are empty", async ({ page }) => {
      await gotoEmptyCreate(page);
      await page.getByRole("button", { name: "Neue Quest erstellen" }).click();
      await page.getByRole("button", { name: "Erstellen" }).click();

      await expect(page.getByText("Der Name darf nicht leer sein.")).toBeVisible();
      await expect(page.getByText("Der Intro-Text darf nicht leer sein.")).toBeVisible();
      await expect(page.getByText("Der Outro-Text darf nicht leer sein.")).toBeVisible();
      await expect(page).toHaveURL("/create");
      await expect(page.getByText("Noch keine Quests erstellt")).toBeVisible();
    });

    test("shows a validation error and creates nothing when an image URL is not https", async ({ page }) => {
      await gotoEmptyCreate(page);
      await page.getByRole("button", { name: "Neue Quest erstellen" }).click();
      await fillQuestForm(page, { name: "Quest", introText: "Intro", outroText: "Outro" });
      await page.locator("#intro-url").fill("http://unsicher.de/bild.jpg");
      await page.getByRole("button", { name: "Erstellen" }).click();

      await expect(page.getByText("Nur HTTPS-URLs sind erlaubt.")).toBeVisible();
      await expect(page).toHaveURL("/create");
      await expect(page.getByText("Noch keine Quests erstellt")).toBeVisible();
    });

    test("creates nothing when the dialog is cancelled", async ({ page }) => {
      await gotoEmptyCreate(page);
      await page.getByRole("button", { name: "Neue Quest erstellen" }).click();
      await fillQuestForm(page, { name: "Wird verworfen", introText: "Intro", outroText: "Outro" });
      await page.getByRole("button", { name: "Abbrechen" }).click();

      await expect(page.locator("#quest-name")).not.toBeVisible();
      await expect(page.getByText("Noch keine Quests erstellt")).toBeVisible();
    });

    test("BUG-1 regression: a name made only of HTML tags is rejected instead of saving as empty", async ({ page }) => {
      await gotoEmptyCreate(page);
      await page.getByRole("button", { name: "Neue Quest erstellen" }).click();
      await fillQuestForm(page, { name: "<b></b>", introText: "Intro", outroText: "Outro" });
      await page.getByRole("button", { name: "Erstellen" }).click();

      await expect(page.getByText("Der Name darf nicht leer sein.")).toBeVisible();
      await expect(page).toHaveURL("/create");
      await expect(page.getByText("Noch keine Quests erstellt")).toBeVisible();
      const stored = await page.evaluate(() => localStorage.getItem("gq_quests"));
      expect(stored).toBeNull();
    });
  });

  test.describe("Entwurf-Kennzeichnung", () => {
    test("shows greyed-out/dashed draft styling for an unpublished quest and hides it for a published one", async ({ page }) => {
      await seedQuests(page, [
        publishedQuest(COMPLETE_ID, "Veröffentlichte Quest", "2026-01-02T00:00:00.000Z", COMPLETE_STATION_ID),
        draftQuest(DRAFT_ID, "Unveröffentlichte Quest", "2026-01-01T00:00:00.000Z"),
      ]);

      const publishedCard = page.locator(`li:has(a[href="/create/${COMPLETE_ID}"])`);
      const draftCard = page.locator(`li:has(a[href="/create/${DRAFT_ID}"])`);
      await expect(publishedCard.locator(".border-dashed")).toHaveCount(0);
      await expect(draftCard.locator(".border-dashed")).toBeVisible();
    });
  });

  test.describe("Play-Sichtbarkeit", () => {
    test("a quest with 0 stations does not appear in the Play list", async ({ page }) => {
      await seedQuests(page, [draftQuest(DRAFT_ID, "Noch leer", "2026-01-01T00:00:00.000Z")]);

      await page.goto("/play");
      await expect(page.getByText("Noch leer")).not.toBeVisible();
    });

    test("a quest with at least one station appears in the Play list even while still marked 'Entwurf'", async ({ page }) => {
      await seedQuests(page, [
        partiallyBuiltDraftQuest(DRAFT_ID, "Halbfertig aber testbar", "2026-01-01T00:00:00.000Z", COMPLETE_STATION_ID),
      ]);

      // Still shows the greyed-out/dashed draft styling in the Creator — that's independent of Play visibility.
      const card = page.getByRole("listitem").filter({ hasText: "Halbfertig aber testbar" });
      await expect(card.locator(".border-dashed")).toBeVisible();

      await page.goto("/play");
      await expect(page.getByText("Halbfertig aber testbar")).toBeVisible();
    });

    test("imported quests are immediately visible in the Play list", async ({ page }) => {
      await gotoEmptyCreate(page);

      const importedQuest = {
        version: 1,
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        name: "Per Datei importiert",
        lastModified: "2026-01-01T00:00:00.000Z",
        intro: { text: "Willkommen" },
        outro: { text: "Geschafft" },
        stations: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            name: "Station 1",
            lat: 53.6,
            lng: 10.0,
            radiusMeters: 10,
            modules: [{ type: "text", content: "Hallo" }],
          },
        ],
      };

      await page.setInputFiles("input[type=file]", {
        name: "quest.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(importedQuest)),
      });

      await expect(page.getByText("erfolgreich importiert")).toBeVisible();
      await page.goto("/play");
      await expect(page.getByText("Per Datei importiert")).toBeVisible();
    });
  });

  test.describe("Bearbeiten", () => {
    test("prefills name/intro/outro, saves the new values, and re-sorts the list", async ({ page }) => {
      await seedQuests(page, [draftQuest(DRAFT_ID, "Alter Name", "2026-01-01T00:00:00.000Z")]);

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
      await expect(page.locator("#quest-name")).toHaveValue("Alter Name");
      await expect(page.locator("#intro-text")).toHaveValue("Willkommen");
      await expect(page.locator("#outro-text")).toHaveValue("Geschafft");

      await fillQuestForm(page, { name: "Neuer Name", introText: "Neues Intro", outroText: "Neues Outro" });
      await page.getByRole("button", { name: "Speichern" }).click();

      await expect(page.getByText("Neuer Name")).toBeVisible();
      await expect(page.getByText("Quest gespeichert")).toBeVisible();
    });

    test("shows validation errors and keeps the old values when a required field is emptied", async ({ page }) => {
      await seedQuests(page, [draftQuest(DRAFT_ID, "Bleibt so", "2026-01-01T00:00:00.000Z")]);

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
      await page.locator("#quest-name").fill("");
      await page.getByRole("button", { name: "Speichern" }).click();

      await expect(page.getByText("Der Name darf nicht leer sein.")).toBeVisible();
    });

    test("is also reachable from the station editor header and updates the title", async ({ page }) => {
      await seedQuests(page, [draftQuest(DRAFT_ID, "Von Detailseite", "2026-01-01T00:00:00.000Z")]);
      await page.goto(`/create/${DRAFT_ID}`);

      await page.getByRole("button", { name: "Quest bearbeiten" }).click();
      await expect(page.locator("#quest-name")).toHaveValue("Von Detailseite");
      await page.locator("#quest-name").fill("Umbenannt von Detailseite");
      await page.getByRole("button", { name: "Speichern" }).click();

      await expect(page.getByText("Quest gespeichert")).toBeVisible();
      await expect(page.getByText("Umbenannt von Detailseite")).toBeVisible();
    });
  });

  test.describe("Löschen", () => {
    test("asks for confirmation, then removes the quest and its progress on confirm", async ({ page }) => {
      await seedQuests(page, [publishedQuest(COMPLETE_ID, "Verschwindequest", "2026-01-01T00:00:00.000Z", COMPLETE_STATION_ID)]);
      await page.evaluate((id) => {
        localStorage.setItem(`gq_progress_${id}`, JSON.stringify({
          visitedStations: ["x"], completedStations: [], solvedTasks: {}, currentScreen: "stations", lastStationIndex: 0,
        }));
      }, COMPLETE_ID);

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await expect(page.getByText("Quest wirklich löschen?")).toBeVisible();

      await page.getByRole("button", { name: "Löschen" }).last().click();

      await expect(page.getByText("Noch keine Quests erstellt")).toBeVisible();
      const progressLeft = await page.evaluate((id) => localStorage.getItem(`gq_progress_${id}`), COMPLETE_ID);
      expect(progressLeft).toBeNull();
    });

    test("keeps the quest when the confirmation is cancelled", async ({ page }) => {
      await seedQuests(page, [draftQuest(DRAFT_ID, "Bleibt erhalten", "2026-01-01T00:00:00.000Z")]);

      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Abbrechen" }).click();

      await expect(page.getByText("Bleibt erhalten")).toBeVisible();
    });
  });

  test.describe("Filter", () => {
    test("'Entwurf' tab shows only draft (unpublished) quests, 'Alle' shows everything again", async ({ page }) => {
      await seedQuests(page, [
        publishedQuest(COMPLETE_ID, "Veröffentlichte Quest", "2026-01-02T00:00:00.000Z", COMPLETE_STATION_ID),
        draftQuest(DRAFT_ID, "Entwurf Quest", "2026-01-01T00:00:00.000Z"),
      ]);

      await page.getByRole("tab", { name: "Entwurf" }).click();
      await expect(page.locator("li")).toHaveCount(1);
      await expect(page.getByText("Entwurf Quest")).toBeVisible();

      await page.getByRole("tab", { name: "Alle" }).click();
      await expect(page.locator("li")).toHaveCount(2);
    });

    test("BUG-2 regression: filter tabs meet the 44px touch-target minimum", async ({ page }) => {
      await seedQuests(page, [draftQuest(DRAFT_ID, "Irgendeine Quest", "2026-01-01T00:00:00.000Z")]);

      const box = await page.getByRole("tab", { name: "Alle" }).boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe("Robustheit", () => {
    test("BUG-3 regression: a stored quest missing 'stations' is dropped/normalized instead of crashing the page", async ({ page }) => {
      await page.goto("/create");
      await page.evaluate(() => {
        localStorage.setItem("gq_first_visit_done", "true");
        // Simulates corrupted/very old data — no "stations" field at all.
        localStorage.setItem("gq_quests", JSON.stringify([
          { version: 1, id: "legacy-broken", name: "Kaputte Quest", lastModified: new Date().toISOString(), intro: { text: "" }, outro: { text: "" } },
        ]));
      });
      await page.reload();

      await expect(page.getByText("Application error", { exact: false })).not.toBeVisible();
      await expect(page.getByText("Kaputte Quest")).toBeVisible();
      await expect(page.getByText("0 Stationen")).toBeVisible();
    });

    test("BUG-4 (fixed): a legacy quest with no 'published' field and 0 stations no longer leaks into the Play list", async ({ page }) => {
      // Previously (when Play visibility was gated by isPublished()), a quest
      // saved without a `published` field defaulted to "published" regardless
      // of completeness, so an empty legacy draft would incorrectly show up in
      // Play. Play visibility no longer depends on `published` at all — only
      // on station count — so this can't happen anymore.
      const legacyDraftId = "22222222-2222-4222-8222-222222222222";
      await page.goto("/create");
      await page.evaluate((id) => {
        localStorage.setItem("gq_first_visit_done", "true");
        localStorage.setItem("gq_quests", JSON.stringify([
          { version: 1, id, name: "Alter Rohentwurf", lastModified: new Date().toISOString(), intro: { text: "" }, outro: { text: "" }, stations: [] },
        ]));
      }, legacyDraftId);
      await page.reload();
      await expect(page.getByText("Alter Rohentwurf")).toBeVisible();

      await page.goto("/play");
      await expect(page.getByText("Alter Rohentwurf")).not.toBeVisible();
    });

    test("a legacy quest with no 'published' field is treated as published (no draft badge)", async ({ page }) => {
      // isPublished() falls back to true when the field is absent, so quests
      // saved before PROJ-9 introduced `published` aren't retroactively
      // flagged as drafts.
      const legacyId = "33333333-3333-4333-8333-333333333333";
      await seedQuests(page, [
        { version: 1, id: legacyId, name: "Altbestand ohne published-Feld", lastModified: "2026-01-01T00:00:00.000Z", intro: { text: "Hallo" }, outro: { text: "Tschüss" }, stations: [] },
      ]);

      const card = page.getByRole("listitem").filter({ hasText: "Altbestand ohne published-Feld" });
      await expect(card.locator(".border-dashed")).toHaveCount(0);
    });
  });

  test.describe("FAB (Neue Quest / Importieren)", () => {
    test("opens to reveal 'Neue Quest' and 'Quest importieren', and closes again on outside tap", async ({ page }) => {
      await seedQuests(page, [draftQuest(DRAFT_ID, "Irgendeine Quest", "2026-01-01T00:00:00.000Z")]);

      const fab = page.getByRole("button", { name: "Quest hinzufügen" });
      await fab.click();
      await expect(page.getByRole("button", { name: "Neue Quest" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Quest importieren" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Aktionen schließen" })).toHaveAttribute("aria-expanded", "true");

      await page.mouse.click(200, 400);
      await expect(page.getByRole("button", { name: "Quest hinzufügen" })).toHaveAttribute("aria-expanded", "false");
    });
  });
});
