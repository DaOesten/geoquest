import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const IMAGE_URL = "https://cdn.gq-test.example/photo.jpg";
const AUDIO_URL = "https://cdn.gq-test.example/clip.mp3";
const VIDEO_URL = "https://cdn.gq-test.example/clip.mp4";

const TEST_QUEST = {
  version: 1,
  id: "test-quest-proj4",
  name: "PROJ-4 Test Quest",
  lastModified: "2026-08-24T00:00:00.000Z",
  intro: { text: "Willkommen!" },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "station-content",
      name: "Content Station",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [
        { type: "text", content: "Zeile eins\nZeile zwei\n- Punkt A\n- Punkt B" },
        { type: "image", url: IMAGE_URL, caption: "Ein Testbild" },
        { type: "audio", url: AUDIO_URL, caption: "Ein Testclip" },
        { type: "video", url: VIDEO_URL, caption: "Ein Testvideo" },
      ],
    },
    {
      id: "station-code",
      name: "Code Station",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 30,
      modules: [{ type: "task", taskType: "code", question: "Was ist 2 + 2?", answer: "4" }],
    },
    {
      id: "station-mc-single",
      name: "MC Single Station",
      lat: 53.63,
      lng: 10.06,
      radiusMeters: 20,
      modules: [
        {
          type: "task",
          taskType: "multiple-choice",
          question: "Hauptstadt von Deutschland?",
          options: ["Paris", "Berlin", "Rom"],
          correctIndices: [1],
        },
      ],
    },
    {
      id: "station-mc-multi",
      name: "MC Multi Station",
      lat: 53.64,
      lng: 10.07,
      radiusMeters: 20,
      modules: [
        {
          type: "task",
          taskType: "multiple-choice",
          question: "Welche Optionen sind Farben?",
          options: ["Rot", "Hund", "Blau", "Katze"],
          correctIndices: [0, 2],
        },
      ],
    },
    {
      id: "station-sorting",
      name: "Sorting Station",
      lat: 53.65,
      lng: 10.08,
      radiusMeters: 20,
      modules: [
        {
          type: "task",
          taskType: "sorting",
          question: "Sortiere aufsteigend",
          items: ["Eins", "Zwei", "Drei"],
        },
      ],
    },
  ],
};

async function seedQuest(page: Page) {
  await page.goto("/play");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
  }, TEST_QUEST);
}

async function seedProgress(
  page: Page,
  overrides: Partial<{
    visitedStations: string[];
    completedStations: string[];
    solvedTasks: Record<string, number[]>;
  }> = {}
) {
  await page.evaluate(
    ({ id, overrides }) => {
      localStorage.setItem(
        `gq_progress_${id}`,
        JSON.stringify({
          visitedStations: overrides.visitedStations ?? [],
          completedStations: overrides.completedStations ?? [],
          solvedTasks: overrides.solvedTasks ?? {},
          currentScreen: "stations",
          lastStationIndex: 0,
        })
      );
    },
    { id: TEST_QUEST.id, overrides }
  );
}

const ALL_STATION_IDS = TEST_QUEST.stations.map((s) => s.id);

async function openStation(page: Page, stationName: string) {
  await page.goto(`/play/${TEST_QUEST.id}`);
  await page.getByRole("button", { name: new RegExp(`${stationName}.*Aufgaben fortsetzen`) }).click();
}

test.describe("PROJ-4: Player — Modul-Rendering", () => {
  test.describe("Stations-Screen (nach Ankunft)", () => {
    test("shows all modules of a station as a scrollable list in quest order", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, () => {});
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      const textIndex = await page.getByText("Zeile eins").boundingBox();
      const captionIndex = await page.getByText("Ein Testbild").boundingBox();
      expect(textIndex!.y).toBeLessThan(captionIndex!.y);
      await expect(page.getByText("Punkt A")).toBeVisible();
      await expect(page.getByText("Ein Testclip")).toBeVisible();
      await expect(page.getByText("Ein Testvideo")).toBeVisible();
    });

    test("shows disabled 'Station abschließen' button while tasks are open", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[1]] });
      await openStation(page, "Code Station");

      const completeButton = page.getByRole("button", { name: "Noch 1 Aufgabe offen" });
      await expect(completeButton).toBeVisible();
      await expect(completeButton).toBeDisabled();
    });

    test("activates the teal 'Station abschließen' button once all tasks are solved", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[1]] });
      await openStation(page, "Code Station");

      await page.getByPlaceholder("Deine Antwort...").fill("4");
      await page.getByRole("button", { name: "Prüfen" }).click();

      const completeButton = page.getByRole("button", { name: "Station abschließen" });
      await expect(completeButton).toBeEnabled();
    });

    test("completing a station marks it completed and unlocks the next station", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, {
        visitedStations: [ALL_STATION_IDS[0], ALL_STATION_IDS[1]],
        completedStations: [ALL_STATION_IDS[0]],
      });
      await openStation(page, "Code Station");

      await page.getByPlaceholder("Deine Antwort...").fill("4");
      await page.getByRole("button", { name: "Prüfen" }).click();
      await page.getByRole("button", { name: "Station abschließen" }).click();

      await expect(page.getByRole("button", { name: /Code Station.*abgeschlossen/ })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Navigation zu MC Single Station starten/ })
      ).toBeEnabled();
    });

    test("a station without tasks has the complete button active immediately", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, () => {});
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      await expect(page.getByRole("button", { name: "Station abschließen" })).toBeEnabled();
    });
  });

  test.describe("Text-Modul", () => {
    test("renders line breaks and list items correctly", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, () => {});
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      await expect(page.getByText("Zeile eins")).toBeVisible();
      await expect(page.getByText("Zeile zwei")).toBeVisible();
      await expect(page.getByText("Punkt A")).toBeVisible();
      await expect(page.getByText("Punkt B")).toBeVisible();
    });
  });

  test.describe("Bild-Modul", () => {
    test("renders the image full width with its caption", async ({ page }) => {
      const imgBytes = fs.readFileSync(
        path.join(__dirname, "../public/assets/mark-pin.jpg")
      );
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, (route) =>
        route.fulfill({ status: 200, contentType: "image/jpeg", body: imgBytes })
      );
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      const img = page.locator(`img[src="${IMAGE_URL}"]`);
      await expect(img).toBeVisible();
      await expect(page.getByText("Ein Testbild")).toBeVisible();
      await expect(page.getByText("Bild konnte nicht geladen werden")).not.toBeVisible();
    });

    test("shows a placeholder when the image URL fails to load", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, (route) => route.abort());
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      await expect(page.getByText("Bild konnte nicht geladen werden")).toBeVisible();
    });
  });

  test.describe("Audio-Modul", () => {
    test("renders a compact player with play/pause, progress bar and caption", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, (route) => route.abort());
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      await expect(page.getByLabel("Abspielen")).toBeVisible();
      await expect(page.getByText("Ein Testclip")).toBeVisible();
      await expect(page.getByText("Audio konnte nicht geladen werden")).not.toBeVisible();
    });

    test("shows a placeholder when the audio URL fails to load", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, (route) => route.abort());
      await page.route(AUDIO_URL, (route) => route.abort());
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      await expect(page.getByText("Audio konnte nicht geladen werden")).toBeVisible();
    });
  });

  test.describe("Video-Modul", () => {
    test("renders an inline video player with native controls, no autoplay, and caption", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, (route) => route.abort());
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, () => {});
      await openStation(page, "Content Station");

      const video = page.locator("video");
      await expect(video).toBeVisible();
      expect(await video.evaluate((v: HTMLVideoElement) => v.hasAttribute("controls"))).toBe(true);
      expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(false);
      expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
      await expect(page.getByText("Ein Testvideo")).toBeVisible();
    });

    test("shows a placeholder when the video URL fails to load", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[0]] });
      await page.route(IMAGE_URL, (route) => route.abort());
      await page.route(AUDIO_URL, () => {});
      await page.route(VIDEO_URL, (route) => route.abort());
      await openStation(page, "Content Station");

      await expect(page.getByText("Video konnte nicht geladen werden")).toBeVisible();
    });
  });

  test.describe("Task: Code-Eingabe", () => {
    test("shows question, input and a Prüfen button disabled while empty", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[1]] });
      await openStation(page, "Code Station");

      await expect(page.getByText("Was ist 2 + 2?")).toBeVisible();
      await expect(page.getByPlaceholder("Deine Antwort...")).toBeVisible();
      await expect(page.getByRole("button", { name: "Prüfen" })).toBeDisabled();
    });

    test("marks the task solved on a correct, case-insensitive/trimmed answer", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[1]] });
      await openStation(page, "Code Station");

      await page.getByPlaceholder("Deine Antwort...").fill("  4  ");
      await page.getByRole("button", { name: "Prüfen" }).click();

      await expect(page.getByText("Richtig")).toBeVisible();
      const input = page.getByPlaceholder("Deine Antwort...");
      await expect(input).toBeVisible();
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue("4");
    });

    test("shows red shake feedback on a wrong answer without marking it solved", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[1]] });
      await openStation(page, "Code Station");

      await page.getByPlaceholder("Deine Antwort...").fill("5");
      await page.getByRole("button", { name: "Prüfen" }).click();

      await expect(page.getByText("Leider falsch, versuch's nochmal!")).toBeVisible();
      await expect(page.getByText("Richtig")).not.toBeVisible();
    });
  });

  test.describe("Task: Multiple Choice (Single)", () => {
    test("renders radio-style options for a single correct answer", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[2]] });
      await openStation(page, "MC Single Station");

      await expect(page.getByRole("radio", { name: "Paris" })).toBeVisible();
      await expect(page.getByRole("radio", { name: "Berlin" })).toBeVisible();
      await expect(page.getByRole("radio", { name: "Rom" })).toBeVisible();
    });

    test("shows solved feedback when the correct option is chosen", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[2]] });
      await openStation(page, "MC Single Station");

      await page.getByRole("radio", { name: "Berlin" }).click();
      await page.getByRole("button", { name: "Prüfen" }).click();

      await expect(page.getByText("Richtig")).toBeVisible();
    });

    test("keeps the chosen option visible and checked but disables all options once solved", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[2]] });
      await openStation(page, "MC Single Station");

      await page.getByRole("radio", { name: "Berlin" }).click();
      await page.getByRole("button", { name: "Prüfen" }).click();
      await expect(page.getByText("Richtig")).toBeVisible();

      const berlin = page.getByRole("radio", { name: "Berlin" });
      await expect(berlin).toBeVisible();
      await expect(berlin).toBeChecked();
      await expect(berlin).toBeDisabled();
      await expect(page.getByRole("radio", { name: "Paris" })).toBeDisabled();
    });

    test("shows red feedback on a wrong option without revealing the correct one", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[2]] });
      await openStation(page, "MC Single Station");

      await page.getByRole("radio", { name: "Paris" }).click();
      await page.getByRole("button", { name: "Prüfen" }).click();

      await expect(page.getByText("Leider falsch, versuch's nochmal!")).toBeVisible();
      await expect(page.getByText("Richtig")).not.toBeVisible();
    });
  });

  test.describe("Task: Multiple Choice (Multi)", () => {
    test("renders checkbox-style options for multiple correct answers", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[3]] });
      await openStation(page, "MC Multi Station");

      await expect(page.getByRole("checkbox", { name: "Rot" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "Hund" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "Blau" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "Katze" })).toBeVisible();
    });

    test("shows solved feedback when exactly the correct options are chosen", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[3]] });
      await openStation(page, "MC Multi Station");

      await page.getByRole("checkbox", { name: "Rot" }).click();
      await page.getByRole("checkbox", { name: "Blau" }).click();
      await page.getByRole("button", { name: "Prüfen" }).click();

      await expect(page.getByText("Richtig")).toBeVisible();
    });

    test("keeps the chosen options visible and checked but disables all options once solved", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[3]] });
      await openStation(page, "MC Multi Station");

      await page.getByRole("checkbox", { name: "Rot" }).click();
      await page.getByRole("checkbox", { name: "Blau" }).click();
      await page.getByRole("button", { name: "Prüfen" }).click();
      await expect(page.getByText("Richtig")).toBeVisible();

      await expect(page.getByRole("checkbox", { name: "Rot" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Blau" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "Rot" })).toBeDisabled();
      await expect(page.getByRole("checkbox", { name: "Hund" })).toBeDisabled();
    });

    test("shows red feedback on an incomplete/wrong selection without revealing answers", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[3]] });
      await openStation(page, "MC Multi Station");

      await page.getByRole("checkbox", { name: "Rot" }).click();
      await page.getByRole("button", { name: "Prüfen" }).click();

      await expect(page.getByText("Leider falsch, versuch's nochmal!")).toBeVisible();
      await expect(page.getByText("Richtig")).not.toBeVisible();
    });
  });

  test.describe("Task: Sortierung", () => {
    test("renders items with drag handles, never already in the correct order", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[4]] });
      await openStation(page, "Sorting Station");

      const rows = page.locator('div[draggable="true"]');
      await expect(rows).toHaveCount(3);
      const order = await rows.allTextContents();
      expect(order).not.toEqual(["Eins", "Zwei", "Drei"]);
      expect(new Set(order)).toEqual(new Set(["Eins", "Zwei", "Drei"]));
    });

    test("shows red shake feedback when checked in the (guaranteed non-correct) shuffled order", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[4]] });
      await openStation(page, "Sorting Station");

      await page.getByRole("button", { name: "Prüfen" }).click();

      await expect(page.getByText("Leider falsch, versuch's nochmal!")).toBeVisible();
      await expect(page.getByText("Richtig")).not.toBeVisible();
    });

    test("shows solved feedback once the items are dragged into the correct order", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[4]] });
      await openStation(page, "Sorting Station");

      const target = ["Eins", "Zwei", "Drei"];
      for (let i = 0; i < target.length; i++) {
        const rows = page.locator('div[draggable="true"]');
        const current = await rows.allTextContents();
        const from = current.indexOf(target[i]);
        if (from !== i) {
          await rows.nth(from).dragTo(rows.nth(i));
        }
      }

      const finalOrder = await page.locator('div[draggable="true"]').allTextContents();
      expect(finalOrder).toEqual(target);

      await page.getByRole("button", { name: "Prüfen" }).click();
      await expect(page.getByText("Richtig")).toBeVisible();
    });

    test("keeps the correct order visible but disables dragging once solved", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, {
        visitedStations: [ALL_STATION_IDS[4]],
        solvedTasks: { [ALL_STATION_IDS[4]]: [0] },
      });
      await openStation(page, "Sorting Station");

      await expect(page.getByText("Richtig")).toBeVisible();
      await expect(page.getByText("Eins")).toBeVisible();
      await expect(page.getByText("Zwei")).toBeVisible();
      await expect(page.getByText("Drei")).toBeVisible();
      await expect(page.locator('div[draggable="true"]')).toHaveCount(0);
    });
  });

  test.describe("Fortschritt & Wiedereinstieg", () => {
    test("solved tasks remain solved after leaving and returning to the station", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, {
        visitedStations: [ALL_STATION_IDS[1]],
        solvedTasks: { [ALL_STATION_IDS[1]]: [0] },
      });
      await openStation(page, "Code Station");

      await expect(page.getByText("Richtig")).toBeVisible();
      const input = page.getByPlaceholder("Deine Antwort...");
      await expect(input).toBeVisible();
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue("4");
    });

    test("tapping an already-visited station opens the module screen directly (no GPS)", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, { visitedStations: [ALL_STATION_IDS[1]] });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page
        .getByRole("button", { name: /Code Station.*Aufgaben fortsetzen/ })
        .click();

      await expect(page.getByText("Was ist 2 + 2?")).toBeVisible();
    });

    test("a completed station shows a checkmark and unlocks the next one in the list", async ({ page }) => {
      await seedQuest(page);
      await seedProgress(page, {
        visitedStations: [ALL_STATION_IDS[0], ALL_STATION_IDS[1]],
        completedStations: [ALL_STATION_IDS[0], ALL_STATION_IDS[1]],
      });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await expect(page.getByRole("button", { name: /Code Station.*abgeschlossen/ })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Navigation zu MC Single Station starten/ })
      ).toBeEnabled();
    });
  });

  test.describe("Ansichtsmodus für abgeschlossene Stationen", () => {
    async function seedCompletedCodeStation(page: Page) {
      await seedQuest(page);
      await seedProgress(page, {
        visitedStations: [ALL_STATION_IDS[1]],
        completedStations: [ALL_STATION_IDS[1]],
        solvedTasks: { [ALL_STATION_IDS[1]]: [0] },
      });
      await page.goto(`/play/${TEST_QUEST.id}`);
    }

    test("tapping a completed station in the list opens its module screen", async ({ page }) => {
      await seedCompletedCodeStation(page);

      await page
        .getByRole("button", { name: /Code Station.*abgeschlossen/ })
        .click();

      await expect(page.getByText("Was ist 2 + 2?")).toBeVisible();
    });

    test("shows the task in its read-only solved state, with the canonical answer visible but disabled", async ({ page }) => {
      await seedCompletedCodeStation(page);
      await page.getByRole("button", { name: /Code Station.*abgeschlossen/ }).click();

      await expect(page.getByText("Richtig")).toBeVisible();
      const input = page.getByPlaceholder("Deine Antwort...");
      await expect(input).toBeVisible();
      await expect(input).toBeDisabled();
      await expect(input).toHaveValue("4");
    });

    test("shows a disabled 'Bereits abgeschlossen' indicator instead of the complete button", async ({ page }) => {
      await seedCompletedCodeStation(page);
      await page.getByRole("button", { name: /Code Station.*abgeschlossen/ }).click();

      await expect(page.getByText("Bereits abgeschlossen")).toBeVisible();
      await expect(page.getByRole("button", { name: "Station abschließen" })).not.toBeVisible();
    });

    test("tapping the disabled indicator does not re-trigger completion or change screen", async ({ page }) => {
      await seedCompletedCodeStation(page);
      await page.getByRole("button", { name: /Code Station.*abgeschlossen/ }).click();

      const indicator = page.getByText("Bereits abgeschlossen");
      await indicator.click({ force: true });

      // Still on the module screen for this station — no navigation happened.
      await expect(page.getByText("Was ist 2 + 2?")).toBeVisible();
      await expect(page.getByText("Bereits abgeschlossen")).toBeVisible();
    });

    test("the back button returns to the station list", async ({ page }) => {
      await seedCompletedCodeStation(page);
      await page.getByRole("button", { name: /Code Station.*abgeschlossen/ }).click();
      await expect(page.getByText("Was ist 2 + 2?")).toBeVisible();

      await page.getByRole("button", { name: "Zurück" }).click();

      await expect(page.getByRole("button", { name: /Code Station.*abgeschlossen/ })).toBeVisible();
    });
  });
});
