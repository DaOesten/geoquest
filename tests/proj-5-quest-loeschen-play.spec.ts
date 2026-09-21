import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * PROJ-5, Refinement 2026-09-21: Quests im Play-Modus loeschen.
 *
 * Bis hierher war Loeschen nur im Creator moeglich. Der Umbau, der es auf /play
 * ermoeglicht, betrifft alle drei Kartenzustaende: "Neu" und "Live" waren ein
 * einziger, die ganze Karte umschliessender <Link>, in den kein Bedienelement
 * hineinkonnte.
 */

function listQuest(id: string, name: string, stationCount = 1) {
  return {
    version: 1,
    id,
    name,
    lastModified: "2026-09-21T00:00:00.000Z",
    intro: { text: "Los geht's!" },
    outro: { text: "Geschafft!" },
    stations: Array.from({ length: stationCount }, (_, i) => ({
      id: `${id}-s${i}`,
      name: `Ziel ${i + 1}`,
      lat: 53.6 + i * 0.001,
      lng: 10.0 + i * 0.001,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Hinweis" }],
    })),
  };
}

const Q_NEW = listQuest("proj5-del-new", "Ungespielte Quest");
const Q_LIVE = listQuest("proj5-del-live", "Laufende Quest", 2);
const Q_DONE = listQuest("proj5-del-done", "Beendete Quest");

async function seedQuests(page: Page, quests: unknown[]) {
  await page.goto("/play");
  await page.evaluate((quests) => {
    localStorage.setItem("gq_quests", JSON.stringify(quests));
  }, quests);
}

async function seedProgress(
  page: Page,
  questId: string,
  overrides: { visitedStations?: string[]; completedStations?: string[] } = {}
) {
  await page.evaluate(
    ({ questId, overrides }) => {
      localStorage.setItem(
        `gq_progress_${questId}`,
        JSON.stringify({
          visitedStations: overrides.visitedStations ?? [],
          completedStations: overrides.completedStations ?? [],
          solvedTasks: {},
          currentScreen: "stations",
          lastStationIndex: 0,
        })
      );
    },
    { questId, overrides }
  );
}

function questCard(page: Page, name: string): Locator {
  return page.getByRole("listitem").filter({ hasText: name });
}

async function openQuestMenu(page: Page, name: string): Promise<void> {
  await questCard(page, name).getByRole("button", { name: "Quest-Aktionen" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
}

/** Seedet alle drei Kartenzustaende in ihren jeweiligen Fortschritt. */
async function seedAllThreeStates(page: Page) {
  await seedQuests(page, [Q_NEW, Q_LIVE, Q_DONE]);
  await seedProgress(page, Q_LIVE.id, { visitedStations: [Q_LIVE.stations[0].id] });
  await seedProgress(page, Q_DONE.id, {
    visitedStations: [Q_DONE.stations[0].id],
    completedStations: [Q_DONE.stations[0].id],
  });
  await page.reload();
}

test.describe("PROJ-5: Quests im Play-Modus loeschen", () => {
  test.describe("Aktionsmenue auf allen drei Kartenzustaenden", () => {
    test("jeder Kartenzustand traegt einen Menue-Trigger", async ({ page }) => {
      await seedAllThreeStates(page);

      // Der Kern des Umbaus: Vorher hatte nur "Fertig" ein Bedienelement.
      for (const name of [Q_NEW.name, Q_LIVE.name, Q_DONE.name]) {
        const trigger = questCard(page, name).getByRole("button", { name: "Quest-Aktionen" });
        await expect(trigger).toBeVisible();
      }
    });

    test("der Menue-Trigger misst mindestens 44x44px", async ({ page }) => {
      await seedAllThreeStates(page);

      for (const name of [Q_NEW.name, Q_LIVE.name, Q_DONE.name]) {
        const box = await questCard(page, name)
          .getByRole("button", { name: "Quest-Aktionen" })
          .boundingBox();
        expect(box, `${name}: Trigger ohne Bounding Box`).not.toBeNull();
        expect(box!.width, `${name}: Trigger-Breite`).toBeGreaterThanOrEqual(44);
        expect(box!.height, `${name}: Trigger-Hoehe`).toBeGreaterThanOrEqual(44);
      }
    });

    test("nur die abgeschlossene Quest bietet 'Zuruecksetzen' an", async ({ page }) => {
      await seedAllThreeStates(page);

      await openQuestMenu(page, Q_DONE.name);
      await expect(page.getByRole("menuitem", { name: "Zurücksetzen" })).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "Löschen" })).toBeVisible();
      await page.keyboard.press("Escape");

      for (const name of [Q_NEW.name, Q_LIVE.name]) {
        await openQuestMenu(page, name);
        await expect(page.getByRole("menuitem", { name: "Löschen" })).toBeVisible();
        await expect(page.getByRole("menuitem", { name: "Zurücksetzen" })).toHaveCount(0);
        await page.keyboard.press("Escape");
      }
    });

    /**
     * Dieser Waechter fehlte bisher ganz. Das Kriterium existierte nur fuer den
     * Reset-Button auf der "Fertig"-Karte — bei "Neu" und "Live" gab es nie ein
     * Bedienelement, also auch nie einen Test. Genau diese beiden Zustaende sind
     * umgebaut worden.
     */
    test("ein Tap auf den Menue-Trigger navigiert nicht in die Quest", async ({ page }) => {
      await seedAllThreeStates(page);

      for (const name of [Q_NEW.name, Q_LIVE.name, Q_DONE.name]) {
        await questCard(page, name).getByRole("button", { name: "Quest-Aktionen" }).click();
        await expect(page.getByRole("menu")).toBeVisible();
        await expect(page, `${name}: Trigger hat navigiert`).toHaveURL(/\/play$/);
        await page.keyboard.press("Escape");
      }
    });

    test("der Kartentitel fuehrt weiterhin in die Quest", async ({ page }) => {
      await seedAllThreeStates(page);

      await questCard(page, Q_NEW.name).getByRole("link", { name: new RegExp(Q_NEW.name) }).click();
      await expect(page).toHaveURL(new RegExp(`/play/${Q_NEW.id}$`));
    });
  });

  test.describe("QA-Ergaenzungen 2026-09-21", () => {
    /**
     * BUG-15: Der Import-FAB (`fixed bottom-6 right-5`) liegt exakt ueber dem
     * Menue-Trigger der untersten Karte, sobald die Liste so lang ist, dass
     * diese Karte am unteren Bildschirmrand steht. Gemessen auf 360x640 mit
     * 4 Quests: Trigger x287..331/y567..611, FAB x292..340/y568..616.
     *
     * Dieser Test haelt den GEWUENSCHTEN Zustand fest und faellt, solange der
     * Fehler besteht. Er ist bewusst kein Wunschdenken: Der Trigger ist das
     * einzige Bedienelement der Karte, und ohne ihn ist Loeschen fuer genau
     * diese Quest nicht erreichbar, ohne vorher zu scrollen.
     */
    test.fail("BUG-15: der FAB verdeckt den Menue-Trigger der untersten Karte nicht", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      const many = Array.from({ length: 4 }, (_, i) => listQuest(`bug15-${i}`, `Quest ${i + 1}`));
      await seedQuests(page, many);
      await page.reload();

      const trigger = questCard(page, "Quest 4").getByRole("button", { name: "Quest-Aktionen" });
      const box = await trigger.boundingBox();
      expect(box).not.toBeNull();

      const topmost = await page.evaluate(({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        return el?.closest("button")?.getAttribute("aria-label") ?? el?.tagName ?? null;
      }, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });

      expect(topmost).toBe("Quest-Aktionen");
    });

    test("nach Scrollen ans Listenende ist der Trigger der untersten Karte erreichbar", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      const many = Array.from({ length: 4 }, (_, i) => listQuest(`scroll-${i}`, `Quest ${i + 1}`));
      await seedQuests(page, many);
      await page.reload();

      // Der Umweg, der den Fehler heute umgeht — belegt zugleich, dass es ein
      // Verdeckungs- und kein Funktionsproblem ist.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);

      await questCard(page, "Quest 4").getByRole("button", { name: "Quest-Aktionen" }).click();
      await expect(page.getByRole("menu")).toBeVisible();
      await expect(page.getByRole("menuitem", { name: "Löschen" })).toBeVisible();
    });

    test("korrupte gq_quests-Daten legen die Seite nicht lahm", async ({ page }) => {
      await seedQuests(page, [Q_NEW]);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));

      for (const bad of ["null", '{"a":1}', '[{"id":"z"}]', "nicht-json"]) {
        await page.evaluate((v) => localStorage.setItem("gq_quests", v), bad);
        await page.reload();
        await expect(page.getByRole("heading", { name: /Meine Quests/i })).toBeVisible();
      }
      expect(errors).toHaveLength(0);
    });

    test("ein Doppelklick auf Loeschen entfernt genau eine Quest", async ({ page }) => {
      await seedQuests(page, [Q_NEW, Q_LIVE]);
      await page.reload();

      await openQuestMenu(page, Q_NEW.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).dblclick({ delay: 20 });
      await page.waitForTimeout(400);

      const names = await page.evaluate(
        () => (JSON.parse(localStorage.getItem("gq_quests") || "[]") as { name: string }[]).map((q) => q.name)
      );
      expect(names).toEqual([Q_LIVE.name]);
    });
  });

  test.describe("Loeschen", () => {
    test("'Loeschen' oeffnet einen Bestaetigungsdialog mit dem Quest-Namen", async ({ page }) => {
      await seedAllThreeStates(page);

      await openQuestMenu(page, Q_NEW.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();

      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText("Quest wirklich löschen?");
      await expect(dialog).toContainText(Q_NEW.name);
      // Die Endgueltigkeit muss im Dialog stehen — sie ist die einzige Sicherung.
      await expect(dialog).toContainText("rückgängig");
    });

    test("Bestaetigen entfernt Quest und Fortschritt gemeinsam", async ({ page }) => {
      await seedAllThreeStates(page);

      await openQuestMenu(page, Q_DONE.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();

      await expect(page.getByText("Quest gelöscht")).toBeVisible();
      await expect(questCard(page, Q_DONE.name)).toHaveCount(0);

      const state = await page.evaluate((id) => {
        const raw = localStorage.getItem("gq_quests");
        const quests = raw ? (JSON.parse(raw) as { id: string }[]) : [];
        return {
          questPresent: quests.some((q) => q.id === id),
          remaining: quests.length,
          progress: localStorage.getItem(`gq_progress_${id}`),
        };
      }, Q_DONE.id);

      expect(state.questPresent).toBe(false);
      // Der Fortschritt darf nicht als verwaister Eintrag zurueckbleiben.
      expect(state.progress).toBeNull();
      // Die anderen beiden Quests bleiben unangetastet.
      expect(state.remaining).toBe(2);
    });

    test("Abbrechen laesst die Quest unveraendert stehen", async ({ page }) => {
      await seedAllThreeStates(page);

      await openQuestMenu(page, Q_LIVE.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Abbrechen" }).click();

      await expect(page.getByRole("alertdialog")).toHaveCount(0);
      await expect(questCard(page, Q_LIVE.name)).toBeVisible();

      const stillThere = await page.evaluate((id) => {
        const raw = localStorage.getItem("gq_quests");
        const quests = raw ? (JSON.parse(raw) as { id: string }[]) : [];
        return {
          quest: quests.some((q) => q.id === id),
          progress: localStorage.getItem(`gq_progress_${id}`) !== null,
        };
      }, Q_LIVE.id);
      expect(stillThere.quest).toBe(true);
      expect(stillThere.progress).toBe(true);
    });

    test("eine laufende Quest laesst sich ohne Sonderbehandlung loeschen", async ({ page }) => {
      await seedAllThreeStates(page);

      await openQuestMenu(page, Q_LIVE.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();

      await expect(questCard(page, Q_LIVE.name)).toHaveCount(0);
      const progress = await page.evaluate(
        (id) => localStorage.getItem(`gq_progress_${id}`),
        Q_LIVE.id
      );
      expect(progress).toBeNull();
    });

    test("das Loeschen der letzten Quest fuehrt zum Empty State", async ({ page }) => {
      await seedQuests(page, [Q_NEW]);
      await page.reload();

      await openQuestMenu(page, Q_NEW.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();

      await expect(page.getByText("Keine Quests geladen")).toBeVisible();
      await expect(page.getByText("Importiere deine erste Quest, um loszulegen.")).toBeVisible();
    });

    /**
     * Die Quest verschwindet auch im Creator — /play und /create lesen denselben
     * gq_quests-Speicher, es gibt keine getrennte Play-Kopie. Das ist die
     * Entscheidung, die dem "uniform loeschen" zugrunde liegt, und sie gehoert
     * belegt, nicht bloss behauptet.
     */
    test("eine im Play-Modus geloeschte Quest ist auch im Creator weg", async ({ page }) => {
      await seedQuests(page, [Q_NEW, Q_LIVE]);
      await page.reload();

      await openQuestMenu(page, Q_NEW.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();
      await expect(questCard(page, Q_NEW.name)).toHaveCount(0);

      await page.goto("/create");
      await expect(page.getByText(Q_LIVE.name)).toBeVisible();
      await expect(page.getByText(Q_NEW.name)).toHaveCount(0);
    });

    test("bei aktivem Filter bleibt der Filter stehen und zeigt seinen eigenen Empty State", async ({
      page,
    }) => {
      await seedQuests(page, [Q_NEW, Q_LIVE]);
      await seedProgress(page, Q_LIVE.id, { visitedStations: [Q_LIVE.stations[0].id] });
      await page.reload();

      await page.getByRole("tab", { name: "Live" }).click();
      await expect(questCard(page, Q_LIVE.name)).toBeVisible();

      await openQuestMenu(page, Q_LIVE.name);
      await page.getByRole("menuitem", { name: "Löschen" }).click();
      await page.getByRole("button", { name: "Löschen" }).click();

      // Es sind noch Quests da — also der Filter-Empty-State, nicht der Gesamt-.
      await expect(page.getByText("Keine aktiven Quests")).toBeVisible();
      await expect(page.getByText("Keine Quests geladen")).toHaveCount(0);
      await expect(page.getByRole("tab", { name: "Live" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    /**
     * In der Spec nicht gefordert, aber bei einem neuen Menue plus destruktivem
     * Dialog die naheliegende Frage. Der wichtige Teil ist der Startfokus des
     * Dialogs: Er liegt auf "Abbrechen", ein versehentliches Enter loescht also
     * nichts.
     */
    test("Menue und Dialog sind per Tastatur bedienbar, Startfokus liegt auf Abbrechen", async ({
      page,
    }) => {
      await seedQuests(page, [Q_NEW]);
      await page.reload();

      await questCard(page, Q_NEW.name).getByRole("button", { name: "Quest-Aktionen" }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("menu")).toBeVisible();

      await page.getByRole("menuitem", { name: "Löschen" }).press("Enter");
      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toBeVisible();

      await expect(dialog.getByRole("button", { name: "Abbrechen" })).toBeFocused();

      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      const stillThere = await page.evaluate(
        () => (JSON.parse(localStorage.getItem("gq_quests") || "[]") as unknown[]).length
      );
      expect(stillThere).toBe(1);
    });

    test("Markup im Quest-Namen wird im Dialog als Text gerendert", async ({ page }) => {
      const evil = listQuest("proj5-del-xss", "<img src=x onerror=window.__pwned=1>Böse");
      await seedQuests(page, [evil]);
      await page.reload();

      const dialogs: string[] = [];
      page.on("dialog", (d) => {
        dialogs.push(d.message());
        void d.dismiss();
      });

      await openQuestMenu(page, "Böse");
      await page.getByRole("menuitem", { name: "Löschen" }).click();

      const alertDialog = page.getByRole("alertdialog");
      await expect(alertDialog).toBeVisible();
      await expect(alertDialog).toContainText("<img");

      const injected = await page.evaluate(() => ({
        pwned: (window as unknown as { __pwned?: number }).__pwned ?? null,
        imgs: document.querySelectorAll('img[src="x"]').length,
      }));
      expect(injected.pwned).toBeNull();
      expect(injected.imgs).toBe(0);
      expect(dialogs).toHaveLength(0);
    });
  });
});
