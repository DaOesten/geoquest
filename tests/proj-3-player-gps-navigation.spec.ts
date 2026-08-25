import { test, expect, type Page } from "@playwright/test";

const TEST_QUEST = {
  version: 1,
  id: "test-quest-e2e",
  name: "E2E Test Quest",
  lastModified: "2026-08-24T00:00:00.000Z",
  intro: { text: "Willkommen zur Test-Quest!\nViel Spass beim Spielen." },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "station-1",
      name: "Erste Station",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Station 1 Text" }],
    },
    {
      id: "station-2",
      name: "Zweite Station",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 30,
      modules: [{ type: "text", content: "Station 2 Text" }],
    },
    {
      id: "station-3",
      name: "Dritte Station",
      lat: 53.63,
      lng: 10.06,
      radiusMeters: 20,
      modules: [{ type: "text", content: "Station 3 Text" }],
    },
  ],
};

async function seedQuest(page: Page) {
  await page.goto("/play");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
  }, TEST_QUEST);
}

async function clearProgress(page: Page) {
  await page.evaluate((id) => {
    localStorage.removeItem(`gq_progress_${id}`);
  }, TEST_QUEST.id);
}

test.describe("PROJ-3: Player — GPS-Navigation", () => {
  test.describe("Permission Screen", () => {
    test("shows permission screen when starting quest for first time", async ({ page }) => {
      await seedQuest(page);
      await clearProgress(page);
      await page.goto(`/play/${TEST_QUEST.id}`);

      await expect(page.getByText("Navigation aktivieren")).toBeVisible();
      await expect(page.getByText("Standort erlauben")).toBeVisible();
    });
  });

  test.describe("Intro Screen", () => {
    test("shows intro with quest name and text after GPS permission", async ({ page }) => {
      await seedQuest(page);
      await clearProgress(page);

      await page.context().grantPermissions(["geolocation"]);
      await page.context().setGeolocation({ latitude: 53.61, longitude: 10.04 });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await expect(page.getByText("E2E Test Quest")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("Willkommen zur Test-Quest!")).toBeVisible();
      await expect(page.getByText("3 Ziele")).toBeVisible();
      await expect(page.getByText("Los geht's")).toBeVisible();
    });

    test("tapping 'Los geht's' opens station list", async ({ page }) => {
      await seedQuest(page);
      await clearProgress(page);

      await page.context().grantPermissions(["geolocation"]);
      await page.context().setGeolocation({ latitude: 53.61, longitude: 10.04 });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByText("Los geht's").click({ timeout: 10_000 });
      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.getByText("Zweite Station")).toBeVisible();
      await expect(page.getByText("Dritte Station")).toBeVisible();
    });
  });

  test.describe("Station List", () => {
    test("all station names visible including locked ones", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: [], currentScreen: "stations", lastStationIndex: 0 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.getByText("Zweite Station")).toBeVisible();
      await expect(page.getByText("Dritte Station")).toBeVisible();
    });

    test("locked stations are disabled", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: [], currentScreen: "stations", lastStationIndex: 0 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      const lockedStation = page.getByRole("button", { name: /Zweite Station/ });
      await expect(lockedStation).toBeDisabled();
    });

    test("after visiting station 1, station 2 is unlocked", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: ["station-1"], currentScreen: "stations", lastStationIndex: 1 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      const secondStation = page.getByRole("button", { name: /Navigation zu Zweite Station starten/ });
      await expect(secondStation).toBeEnabled();
    });

    test("progress bar reflects visited stations", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: ["station-1"], currentScreen: "stations", lastStationIndex: 1 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      await expect(page.getByText("Ziel 2 von 3")).toBeVisible();
    });
  });

  test.describe("Navigation Screen", () => {
    test("shows direction arrow and distance when navigating", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: [], currentScreen: "stations", lastStationIndex: 0 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.context().grantPermissions(["geolocation"]);
      await page.context().setGeolocation({ latitude: 53.60, longitude: 10.03 });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();

      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.locator("svg")).toBeVisible();
      await expect(page.getByText("Ziel 1 von 3")).toBeVisible();
    });

    test("back button returns to station list", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: [], currentScreen: "stations", lastStationIndex: 0 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.context().grantPermissions(["geolocation"]);
      await page.context().setGeolocation({ latitude: 53.60, longitude: 10.03 });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();
      await page.getByLabel("Zurück zur Stationsliste").click();
      await expect(page.getByText("Zweite Station")).toBeVisible();
    });
  });

  test.describe("Arrival", () => {
    test("shows arrival overlay when within station radius", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: [], currentScreen: "stations", lastStationIndex: 0 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.context().grantPermissions(["geolocation"]);
      await page.context().setGeolocation({ latitude: 53.61, longitude: 10.04 });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();

      await expect(page.getByText("Ziel erreicht!")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.getByText("Weiter geht's!")).toBeVisible();
    });

    test("tapping 'Weiter geht's' marks station visited and returns to list", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: [], currentScreen: "stations", lastStationIndex: 0 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.context().grantPermissions(["geolocation"]);
      await page.context().setGeolocation({ latitude: 53.61, longitude: 10.04 });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();
      await page.getByText("Weiter geht's!").click({ timeout: 10_000 });

      await expect(page.getByRole("button", { name: /Navigation zu Zweite Station starten/ })).toBeVisible();
    });
  });

  test.describe("Progress Persistence", () => {
    test("reopening quest with progress skips intro and shows station list", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: ["station-1"], currentScreen: "stations", lastStationIndex: 1 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.getByText("Navigation aktivieren")).not.toBeVisible();
    });
  });
});
