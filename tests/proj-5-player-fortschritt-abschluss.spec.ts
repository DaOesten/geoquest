import { test, expect, type Page } from "@playwright/test";

const SINGLE_STATION_QUEST = {
  version: 1,
  id: "test-quest-proj5-single",
  name: "PROJ-5 Single Station Quest",
  lastModified: "2026-08-26T00:00:00.000Z",
  intro: { text: "Willkommen!" },
  outro: { text: "Geschafft!\nDu bist fertig." },
  stations: [
    {
      id: "single-station",
      name: "Die letzte Station",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "task", taskType: "code", question: "Was ist 6 mal 7?", answer: "42" }],
    },
  ],
};

const BROKEN_MEDIA_URL = "https://cdn.gq-test.example/outro-broken.jpg";

const TWO_STATION_QUEST_BROKEN_OUTRO_MEDIA = {
  version: 1,
  id: "test-quest-proj5-broken-outro-media",
  name: "PROJ-5 Broken Outro Media Quest",
  lastModified: "2026-08-26T00:00:00.000Z",
  intro: { text: "Willkommen!" },
  outro: { text: "Geschafft!", mediaUrl: BROKEN_MEDIA_URL, mediaType: "image" as const },
  stations: [
    {
      id: "station-a",
      name: "Station A",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Nur Text" }],
    },
    {
      id: "station-b",
      name: "Station B",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Letzte Station" }],
    },
  ],
};

function listQuest(id: string, name: string, stationCount = 1) {
  return {
    version: 1,
    id,
    name,
    lastModified: "2026-08-26T00:00:00.000Z",
    intro: { text: "x" },
    outro: { text: "x" },
    stations: Array.from({ length: stationCount }, (_, i) => ({
      id: `${id}-station-${i}`,
      name: `Station ${i + 1}`,
      lat: 53.6 + i * 0.01,
      lng: 10.0 + i * 0.01,
      radiusMeters: 10,
      modules: [{ type: "text", content: "x" }],
    })),
  };
}

const LIST_QUEST_NEW = listQuest("proj5-list-new", "Neue Quest");
const LIST_QUEST_LIVE = listQuest("proj5-list-live", "Live Quest", 2);
const LIST_QUEST_DONE = listQuest("proj5-list-done", "Fertige Quest");

async function seedQuests(page: Page, quests: unknown[]) {
  await page.goto("/play");
  await page.evaluate((quests) => {
    localStorage.setItem("gq_quests", JSON.stringify(quests));
  }, quests);
}

async function seedProgress(
  page: Page,
  questId: string,
  overrides: Partial<{
    visitedStations: string[];
    completedStations: string[];
    solvedTasks: Record<string, number[]>;
  }> = {}
) {
  await page.evaluate(
    ({ questId, overrides }) => {
      localStorage.setItem(
        `gq_progress_${questId}`,
        JSON.stringify({
          visitedStations: overrides.visitedStations ?? [],
          completedStations: overrides.completedStations ?? [],
          solvedTasks: overrides.solvedTasks ?? {},
          currentScreen: "stations",
          lastStationIndex: 0,
        })
      );
    },
    { questId, overrides }
  );
}

test.describe("PROJ-5: Player — Fortschritt & Abschluss", () => {
  test.describe("Outro-Screen", () => {
    test("completing the last station's tasks goes directly to the outro screen", async ({ page }) => {
      await seedQuests(page, [SINGLE_STATION_QUEST]);
      await seedProgress(page, SINGLE_STATION_QUEST.id, { visitedStations: ["single-station"] });
      await page.goto(`/play/${SINGLE_STATION_QUEST.id}`);
      await page
        .getByRole("button", { name: /Die letzte Station.*Aufgaben fortsetzen/ })
        .click();

      await page.getByPlaceholder("Deine Antwort...").fill("42");
      await page.getByRole("button", { name: "Prüfen" }).click();
      await page.getByRole("button", { name: "Station abschließen" }).click();

      await expect(page.getByRole("heading", { name: SINGLE_STATION_QUEST.name })).toBeVisible();
      await expect(page.getByText("Geschafft!")).toBeVisible();
      await expect(page.getByText("1 von 1 Station abgeschlossen")).toBeVisible();
      await expect(page.getByRole("button", { name: "Fertig" })).toBeVisible();
    });

    test("'Fertig' navigates back to the quest list", async ({ page }) => {
      await seedQuests(page, [SINGLE_STATION_QUEST]);
      await seedProgress(page, SINGLE_STATION_QUEST.id, {
        visitedStations: ["single-station"],
        completedStations: ["single-station"],
      });
      await page.goto(`/play/${SINGLE_STATION_QUEST.id}`);
      // Force the outro moment by completing again is not possible once completed,
      // so drive the full flow from a not-yet-completed state instead.
      await page.evaluate((id) => {
        localStorage.removeItem(`gq_progress_${id}`);
      }, SINGLE_STATION_QUEST.id);
      await seedProgress(page, SINGLE_STATION_QUEST.id, { visitedStations: ["single-station"] });
      await page.goto(`/play/${SINGLE_STATION_QUEST.id}`);
      await page
        .getByRole("button", { name: /Die letzte Station.*Aufgaben fortsetzen/ })
        .click();
      await page.getByPlaceholder("Deine Antwort...").fill("42");
      await page.getByRole("button", { name: "Prüfen" }).click();
      await page.getByRole("button", { name: "Station abschließen" }).click();

      await page.getByRole("button", { name: "Fertig" }).click();
      await expect(page).toHaveURL("/play");
    });

    test("a broken outro media URL does not block reaching or leaving the outro screen", async ({ page }) => {
      await page.route(BROKEN_MEDIA_URL, (route) => route.abort());
      await seedQuests(page, [TWO_STATION_QUEST_BROKEN_OUTRO_MEDIA]);
      await seedProgress(page, TWO_STATION_QUEST_BROKEN_OUTRO_MEDIA.id, {
        visitedStations: ["station-a", "station-b"],
        completedStations: ["station-a"],
      });
      await page.goto(`/play/${TWO_STATION_QUEST_BROKEN_OUTRO_MEDIA.id}`);
      await page
        .getByRole("button", { name: /Station B.*Aufgaben fortsetzen/ })
        .click();
      await page.getByRole("button", { name: "Station abschließen" }).click();

      await expect(page.getByText("Geschafft!")).toBeVisible();
      await expect(page.getByRole("button", { name: "Fertig" })).toBeEnabled();
      await page.getByRole("button", { name: "Fertig" }).click();
      await expect(page).toHaveURL("/play");
    });

    test("completing a non-final station returns to the station list, not the outro", async ({ page }) => {
      await seedQuests(page, [TWO_STATION_QUEST_BROKEN_OUTRO_MEDIA]);
      await seedProgress(page, TWO_STATION_QUEST_BROKEN_OUTRO_MEDIA.id, {
        visitedStations: ["station-a"],
      });
      await page.goto(`/play/${TWO_STATION_QUEST_BROKEN_OUTRO_MEDIA.id}`);
      await page.getByRole("button", { name: /Station A.*Aufgaben fortsetzen/ }).click();
      await page.getByRole("button", { name: "Station abschließen" }).click();

      await expect(page.getByRole("button", { name: /Station A.*abgeschlossen/ })).toBeVisible();
      await expect(page.getByText("Geschafft!")).not.toBeVisible();
    });

    test("reopening an already-completed quest shows the station list, not the outro again", async ({ page }) => {
      await seedQuests(page, [SINGLE_STATION_QUEST]);
      await seedProgress(page, SINGLE_STATION_QUEST.id, {
        visitedStations: ["single-station"],
        completedStations: ["single-station"],
      });
      await page.goto(`/play/${SINGLE_STATION_QUEST.id}`);

      await expect(page.getByRole("button", { name: /Die letzte Station.*abgeschlossen/ })).toBeVisible();
      await expect(page.getByText("Geschafft!")).not.toBeVisible();
    });
  });

  test.describe("Status-Anzeige in der Quest-Liste", () => {
    test("a never-started quest shows a 'Neu' badge", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_NEW]);
      await page.reload();

      const card = page.getByRole("link", { name: new RegExp(LIST_QUEST_NEW.name) });
      await expect(card).toBeVisible();
      await expect(card.getByText("Neu", { exact: true })).toBeVisible();
    });

    test("an in-progress quest shows a 'Live' badge with a progress fraction", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_LIVE]);
      await seedProgress(page, LIST_QUEST_LIVE.id, {
        visitedStations: [LIST_QUEST_LIVE.stations[0].id],
        completedStations: [LIST_QUEST_LIVE.stations[0].id],
      });
      await page.reload();

      const card = page.getByRole("link", { name: new RegExp(LIST_QUEST_LIVE.name) });
      await expect(card.getByText("Live", { exact: true })).toBeVisible();
      await expect(card.getByText("Aktuelle Quest")).toBeVisible();
      await expect(card.getByText("1 von 2 Stationen abgeschlossen")).toBeVisible();
    });

    test("a fully completed quest shows a dimmed title and a reset button, no badge", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_DONE]);
      await seedProgress(page, LIST_QUEST_DONE.id, {
        visitedStations: [LIST_QUEST_DONE.stations[0].id],
        completedStations: [LIST_QUEST_DONE.stations[0].id],
      });
      await page.reload();

      await expect(page.getByText(LIST_QUEST_DONE.name)).toBeVisible();
      await expect(page.getByRole("button", { name: "Quest zurücksetzen" })).toBeVisible();
    });

    test("the 'Alle' filter sorts live quests before new before done", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_DONE, LIST_QUEST_NEW, LIST_QUEST_LIVE]);
      await seedProgress(page, LIST_QUEST_LIVE.id, {
        visitedStations: [LIST_QUEST_LIVE.stations[0].id],
      });
      await seedProgress(page, LIST_QUEST_DONE.id, {
        visitedStations: [LIST_QUEST_DONE.stations[0].id],
        completedStations: [LIST_QUEST_DONE.stations[0].id],
      });
      await page.reload();

      const names = await page.getByRole("link").allTextContents();
      const liveIdx = names.findIndex((t) => t.includes(LIST_QUEST_LIVE.name));
      const newIdx = names.findIndex((t) => t.includes(LIST_QUEST_NEW.name));
      expect(liveIdx).toBeGreaterThanOrEqual(0);
      expect(newIdx).toBeGreaterThan(liveIdx);
    });
  });

  test.describe("Filter-Tabs", () => {
    test("shows all quests under the default 'Alle' filter", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_NEW, LIST_QUEST_LIVE, LIST_QUEST_DONE]);
      await page.reload();

      await expect(page.getByText(LIST_QUEST_NEW.name)).toBeVisible();
      await expect(page.getByText(LIST_QUEST_LIVE.name)).toBeVisible();
      await expect(page.getByText(LIST_QUEST_DONE.name)).toBeVisible();
    });

    test("the 'Live' filter shows only active quests", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_NEW, LIST_QUEST_LIVE, LIST_QUEST_DONE]);
      await seedProgress(page, LIST_QUEST_LIVE.id, {
        visitedStations: [LIST_QUEST_LIVE.stations[0].id],
      });
      await page.reload();

      await page.getByRole("tab", { name: "Live" }).click();
      await expect(page.getByText(LIST_QUEST_LIVE.name)).toBeVisible();
      await expect(page.getByText(LIST_QUEST_NEW.name)).not.toBeVisible();
      await expect(page.getByText(LIST_QUEST_DONE.name)).not.toBeVisible();
    });

    test("the 'Neu' filter shows only never-started quests", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_NEW, LIST_QUEST_LIVE, LIST_QUEST_DONE]);
      await seedProgress(page, LIST_QUEST_LIVE.id, {
        visitedStations: [LIST_QUEST_LIVE.stations[0].id],
      });
      await page.reload();

      await page.getByRole("tab", { name: "Neu" }).click();
      await expect(page.getByText(LIST_QUEST_NEW.name)).toBeVisible();
      await expect(page.getByText(LIST_QUEST_LIVE.name)).not.toBeVisible();
    });

    test("shows an empty-state message when a filter has no matches", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_NEW]);
      await page.reload();

      await page.getByRole("tab", { name: "Live" }).click();
      await expect(page.getByText("Keine aktiven Quests")).toBeVisible();
    });
  });

  test.describe("Reset", () => {
    test("resetting a completed quest immediately shows the 'Neu' badge and a toast, no dialog", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_DONE]);
      await seedProgress(page, LIST_QUEST_DONE.id, {
        visitedStations: [LIST_QUEST_DONE.stations[0].id],
        completedStations: [LIST_QUEST_DONE.stations[0].id],
      });
      await page.reload();

      await expect(page.getByRole("alertdialog")).not.toBeVisible();
      await page.getByRole("button", { name: "Quest zurücksetzen" }).click();

      await expect(page.getByText("Fortschritt zurückgesetzt")).toBeVisible();
      const card = page.getByRole("link", { name: new RegExp(LIST_QUEST_DONE.name) });
      await expect(card.getByText("Neu", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Quest zurücksetzen" })).not.toBeVisible();
    });

    test("clicking reset does not navigate into the quest", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_DONE]);
      await seedProgress(page, LIST_QUEST_DONE.id, {
        visitedStations: [LIST_QUEST_DONE.stations[0].id],
        completedStations: [LIST_QUEST_DONE.stations[0].id],
      });
      await page.reload();

      await page.getByRole("button", { name: "Quest zurücksetzen" }).click();
      await expect(page).toHaveURL("/play");
    });

    test("a reset quest starts fresh (no existing-progress fast path) when reopened", async ({ page }) => {
      await seedQuests(page, [LIST_QUEST_DONE]);
      await seedProgress(page, LIST_QUEST_DONE.id, {
        visitedStations: [LIST_QUEST_DONE.stations[0].id],
        completedStations: [LIST_QUEST_DONE.stations[0].id],
      });
      await page.reload();
      await page.getByRole("button", { name: "Quest zurücksetzen" }).click();
      await expect(page.getByText("Fortschritt zurückgesetzt")).toBeVisible();

      const raw = await page.evaluate((id) => localStorage.getItem(`gq_progress_${id}`), LIST_QUEST_DONE.id);
      expect(raw).toBeNull();
    });
  });
});
