import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const TEST_QUEST = {
  version: 1,
  id: "a1111111-1111-4111-8111-111111111111",
  name: "E2E Test Quest",
  lastModified: "2026-08-24T00:00:00.000Z",
  intro: { text: "Willkommen zur Test-Quest!\nViel Spass beim Spielen." },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "b1111111-1111-4111-8111-111111111111",
      name: "Erste Station",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Station 1 Text" }],
    },
    {
      id: "b2222222-2222-4222-8222-222222222222",
      name: "Zweite Station",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 30,
      modules: [{ type: "text", content: "Station 2 Text" }],
    },
    {
      id: "b3333333-3333-4333-8333-333333333333",
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

/**
 * Öffnet die Stationsliste auf dem Weg, den auch ein Nutzer geht.
 *
 * Ein per localStorage gesetztes `currentScreen: "stations"` allein genügt
 * nicht: Der Player leitet den Startscreen aus `hasExistingProgress` ab
 * (= `visitedStations.length > 0`, siehe use-quest-progress.ts). Bei leerer
 * Liste landet man deshalb auf dem Permission- bzw. Intro-Screen. Eine Station
 * künstlich als besucht einzutragen würde den Ausgangszustand verfälschen, den
 * diese Tests gerade prüfen wollen.
 */
async function openStationList(
  page: Page,
  context: BrowserContext,
  position: { latitude: number; longitude: number } = { latitude: 53.61, longitude: 10.04 }
) {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(position);
  await page.goto(`/play/${TEST_QUEST.id}`);
  await page.getByRole("button", { name: /Los geht/ }).click();
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
    test.beforeEach(async ({ context }) => {
      // Ohne Freigabe blendet der Player zuerst den Berechtigungs-Screen ein,
      // unabhängig vom gespeicherten Fortschritt.
      await context.grantPermissions(["geolocation"]);
      await context.setGeolocation({ latitude: 53.61, longitude: 10.04 });
    });

    test("all station names visible including locked ones", async ({ page, context }) => {
      await seedQuest(page);
      await openStationList(page, context);

      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.getByText("Zweite Station")).toBeVisible();
      await expect(page.getByText("Dritte Station")).toBeVisible();
    });

    test("locked stations are disabled", async ({ page, context }) => {
      await seedQuest(page);
      await openStationList(page, context);

      const lockedStation = page.getByRole("button", { name: /Zweite Station/ });
      await expect(lockedStation).toBeDisabled();
    });

    test("after visiting (but not completing) station 1, station 2 stays locked", async ({ page }) => {
      // PROJ-4: unlocking is based on completedStations, not visitedStations —
      // arriving at a station only opens its modules, it does not unlock the next one.
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: ["b1111111-1111-4111-8111-111111111111"], completedStations: [], currentScreen: "stations", lastStationIndex: 1 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      const secondStation = page.getByRole("button", { name: /Zweite Station.*gesperrt/ });
      await expect(secondStation).toBeDisabled();
    });

    test("after completing station 1, station 2 is unlocked", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: ["b1111111-1111-4111-8111-111111111111"], completedStations: ["b1111111-1111-4111-8111-111111111111"], currentScreen: "stations", lastStationIndex: 1 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      const secondStation = page.getByRole("button", { name: /Navigation zu Zweite Station starten/ });
      await expect(secondStation).toBeEnabled();
    });

    test("navigation screen shows the correct station progress counter", async ({ page }) => {
      // PROJ-4 removed the "Ziel X von Y" subtitle from the station list itself
      // (see the redesigned StationList) — it now only appears once navigating
      // to / discovering a station, so we assert it there instead.
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: ["b1111111-1111-4111-8111-111111111111"], completedStations: ["b1111111-1111-4111-8111-111111111111"], currentScreen: "stations", lastStationIndex: 1 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.context().grantPermissions(["geolocation"]);
      // Bewusst AUSSERHALB des 30-m-Radius von Station 2 (53.62/10.05): direkt
      // am Ziel zeigt der Player sofort den Ankunfts-Screen, und der trägt die
      // "Ziel X von Y"-Zeile nicht.
      await page.context().setGeolocation({ latitude: 53.60, longitude: 10.03 });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Navigation zu Zweite Station starten/ }).click();

      await expect(page.getByText("Ziel 2 von 3")).toBeVisible();
    });
  });

  test.describe("Navigation Screen", () => {
    test.beforeEach(async ({ context }) => {
      // Ohne Freigabe blendet der Player zuerst den Berechtigungs-Screen ein,
      // unabhängig vom gespeicherten Fortschritt.
      await context.grantPermissions(["geolocation"]);
      await context.setGeolocation({ latitude: 53.61, longitude: 10.04 });
    });

    test("shows direction arrow and distance when navigating", async ({ page, context }) => {
      await seedQuest(page);
      await openStationList(page, context, { latitude: 53.60, longitude: 10.03 });

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();

      await expect(page.getByText("Erste Station")).toBeVisible();
      // Gezielt der Richtungspfeil: `locator("svg")` traf auch den Zurück-Pfeil
      // im Header und das Next.js-Devtools-Icon.
      await expect(page.getByRole("img").first()).toBeVisible();
      await expect(page.getByText("Ziel 1 von 3")).toBeVisible();
    });

    test("back button returns to station list", async ({ page, context }) => {
      await seedQuest(page);
      await openStationList(page, context, { latitude: 53.60, longitude: 10.03 });

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();
      // Seit 2026-09-06 nutzt der Navigations-Screen die gemeinsame AppHeader,
      // deren Zurück-Knopf schlicht "Zurück" heißt.
      await page.getByLabel("Zurück").click();
      await expect(page.getByText("Zweite Station")).toBeVisible();
    });
  });

  test.describe("Arrival", () => {
    test.beforeEach(async ({ context }) => {
      // Ohne Freigabe blendet der Player zuerst den Berechtigungs-Screen ein,
      // unabhängig vom gespeicherten Fortschritt.
      await context.grantPermissions(["geolocation"]);
      await context.setGeolocation({ latitude: 53.61, longitude: 10.04 });
    });

    test("shows arrival overlay when within station radius", async ({ page, context }) => {
      await seedQuest(page);
      await openStationList(page, context, { latitude: 53.61, longitude: 10.04 });

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();

      await expect(page.getByText("Ziel erreicht!")).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.getByText("Station entdecken")).toBeVisible();
    });

    test("tapping 'Station entdecken' marks the station visited and opens its modules", async ({ page, context }) => {
      // PROJ-4: arrival now leads into the station's module screen, not back to the list.
      await seedQuest(page);
      await openStationList(page, context);

      await page.getByRole("button", { name: /Navigation zu Erste Station starten/ }).click();
      await page.getByText("Station entdecken").click({ timeout: 10_000 });

      await expect(page.getByText("Station 1 Text")).toBeVisible();
      await expect(page.getByRole("button", { name: "Station abschließen" })).toBeEnabled();
    });
  });

  test.describe("Progress Persistence", () => {
    test("reopening quest with progress skips intro and shows station list", async ({ page }) => {
      await seedQuest(page);
      await page.evaluate(
        ({ id }) => {
          localStorage.setItem(
            `gq_progress_${id}`,
            JSON.stringify({ visitedStations: ["b1111111-1111-4111-8111-111111111111"], completedStations: [], solvedTasks: {}, currentScreen: "stations", lastStationIndex: 1 })
          );
        },
        { id: TEST_QUEST.id }
      );
      await page.goto(`/play/${TEST_QUEST.id}`);

      await expect(page.getByText("Erste Station")).toBeVisible();
      await expect(page.getByText("Navigation aktivieren")).not.toBeVisible();
    });
  });

  /**
   * Refinement 2026-09-06: Drei stille Ausfallmodi wurden zu sichtbaren
   * Zustaenden gemacht. Diese Tests halten sie fest.
   */
  test.describe("GPS-Ausfallmodi", () => {
    /** Permission erteilt, aber watchPosition liefert nie eine Position. */
    async function stubSilentGps(page: Page) {
      await page.addInitScript(() => {
        navigator.geolocation.watchPosition = () => 1;
        Object.defineProperty(navigator, "permissions", { value: undefined });
      });
    }

    test("shows a searching state while the fix is still pending", async ({ page, context }) => {
      await seedQuest(page);
      await clearProgress(page);
      await context.grantPermissions(["geolocation"]);
      await stubSilentGps(page);
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Standort erlauben/ }).click();

      await expect(page.getByText(/Suche GPS-Signal/)).toBeVisible();
      // Der unveraenderte "Standort erlauben"-Button darf nicht stehenbleiben.
      await expect(page.getByRole("button", { name: /Standort erlauben/ })).toHaveCount(0);
    });

    test("after 15s without a fix, tells the player to go outside and offers a retry", async ({ page, context }) => {
      await seedQuest(page);
      await clearProgress(page);
      await context.grantPermissions(["geolocation"]);
      await stubSilentGps(page);
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Standort erlauben/ }).click();

      await expect(page.getByText(/Wir finden dein GPS-Signal nicht/)).toBeVisible({ timeout: 20_000 });
      await expect(page.getByRole("button", { name: /Erneut versuchen/ })).toBeVisible();
    });

    test("POSITION_UNAVAILABLE lands in the no-fix state, not in 'device has no GPS'", async ({ page, context }) => {
      await seedQuest(page);
      await clearProgress(page);
      await context.grantPermissions(["geolocation"]);
      await page.addInitScript(() => {
        navigator.geolocation.watchPosition = (_success, error) => {
          setTimeout(
            () =>
              error?.({
                code: 2,
                message: "",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
              } as GeolocationPositionError),
            50
          );
          return 1;
        };
        Object.defineProperty(navigator, "permissions", { value: undefined });
      });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Standort erlauben/ }).click();

      // Muss ueber den Fehlerpfad kommen, also deutlich vor dem 15s-Timeout.
      await expect(page.getByText(/Wir finden dein GPS-Signal nicht/)).toBeVisible({ timeout: 5_000 });
      await expect(page.getByText(/unterstützt kein GPS/)).toHaveCount(0);
    });

    test("a denied permission still shows the settings hint, not the no-fix text", async ({ page }) => {
      await seedQuest(page);
      await clearProgress(page);
      await page.addInitScript(() => {
        navigator.geolocation.watchPosition = (_success, error) => {
          setTimeout(
            () =>
              error?.({
                code: 1,
                message: "",
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
              } as GeolocationPositionError),
            50
          );
          return 1;
        };
        Object.defineProperty(navigator, "permissions", { value: undefined });
      });
      await page.goto(`/play/${TEST_QUEST.id}`);

      await page.getByRole("button", { name: /Standort erlauben/ }).click();

      await expect(page.getByText(/GPS wurde blockiert/)).toBeVisible({ timeout: 5_000 });
      await expect(page.getByText(/Wir finden dein GPS-Signal nicht/)).toHaveCount(0);
    });
  });

  test.describe("Richtungsanzeige ohne Heading", () => {
    test("keeps the distance readable while the direction is unknown", async ({ page, context }) => {
      await seedQuest(page);
      await clearProgress(page);
      // Weit entfernt und ohne Bewegung: keine Heading-Quelle, aber gueltige Distanz.
      await openStationList(page, context, { latitude: 53.5, longitude: 10.0 });
      await page.getByText("Erste Station").first().click();

      const distance = page.locator("div.font-display").first();
      await expect(distance).toBeVisible();
      await expect(distance).toContainText(/\d/);
    });

    test("explains why the arrow has no direction instead of leaving it silent", async ({ page, context }) => {
      await seedQuest(page);
      await clearProgress(page);
      await openStationList(page, context, { latitude: 53.5, longitude: 10.0 });
      await page.getByText("Erste Station").first().click();

      // Auf Nicht-iOS ist der Hinweis der richtige Rat; er muss lesbar sein
      // (vorher 9px) und darf nicht fehlen.
      const hint = page.getByText(/Laufe ein paar Schritte/);
      await expect(hint).toBeVisible();
      const fontSize = await hint.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(12);
    });
  });

  /**
   * BUG-6 (2026-09-07): Die iOS-Erkennung schloss allein aus der Existenz von
   * `DeviceOrientationEvent.requestPermission` auf iOS. Desktop-Chrome erfuellt
   * das ebenfalls und bekam dadurch den "Kompass aktivieren"-Button, dessen
   * Aufruf dort `denied` liefert — eine Sackgasse vor dem hilfreichen Hinweis.
   *
   * Der erste Test faengt den Regress auf jeder Engine: er stellt die API
   * bereit, ohne die Plattform zu aendern. Vor der Korrektur erschien hier der
   * Button, jetzt der Hinweis.
   */
  test.describe("BUG-6: Kompass-Freigabe nur auf echtem iOS", () => {
    test("shows the hint, not the compass button, when only the API looks like iOS", async ({
      page,
      context,
    }) => {
      await seedQuest(page);
      await clearProgress(page);
      await context.grantPermissions(["geolocation"]);
      await context.setGeolocation({ latitude: 53.5, longitude: 10.0 });

      // requestPermission vortaeuschen, ohne die Plattform zu aendern.
      await page.addInitScript(() => {
        const DOE = (window as unknown as Record<string, unknown>)
          .DeviceOrientationEvent as Record<string, unknown> | undefined;
        if (DOE) DOE.requestPermission = async () => "denied";
      });

      await page.goto(`/play/${TEST_QUEST.id}`);
      await page.getByRole("button", { name: /Los geht/ }).click();
      await page.getByText("Erste Station").first().click();

      // Die erwartete Anzeige haengt an der echten Plattform, nicht an der API:
      // Das Projekt "Mobile Safari" faehrt eine iPhone-UA — dort ist der Button
      // korrekt. Auf Desktop-Chrome darf er gerade nicht erscheinen (BUG-6).
      const isRealIOS = await page.evaluate(() =>
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
      );

      if (isRealIOS) {
        await expect(page.getByRole("button", { name: /Kompass aktivieren/ })).toBeVisible();
      } else {
        await expect(page.getByText(/Laufe ein paar Schritte/)).toBeVisible();
        await expect(page.getByRole("button", { name: /Kompass aktivieren/ })).toHaveCount(0);
      }
    });

    test("never leaves the screen without advice after a denied sensor request", async ({
      page,
      context,
    }) => {
      await seedQuest(page);
      await clearProgress(page);
      await context.grantPermissions(["geolocation"]);
      await context.setGeolocation({ latitude: 53.5, longitude: 10.0 });
      await page.goto(`/play/${TEST_QUEST.id}`);
      await page.getByRole("button", { name: /Los geht/ }).click();
      await page.getByText("Erste Station").first().click();

      // Auf echtem iOS (WebKit) steht hier der Button; auf Chrome der Hinweis.
      // Beide Wege muessen in einer verwertbaren Anweisung enden (Edge Case 14).
      const button = page.getByRole("button", { name: /Kompass aktivieren/ });
      if (await button.count()) {
        await button.click();
      }

      await expect(page.getByText(/Laufe ein paar Schritte/)).toBeVisible({ timeout: 5_000 });
    });

    test("keeps the distance usable in every compass state", async ({ page, context }) => {
      await seedQuest(page);
      await clearProgress(page);
      await context.grantPermissions(["geolocation"]);
      await context.setGeolocation({ latitude: 53.5, longitude: 10.0 });
      await page.goto(`/play/${TEST_QUEST.id}`);
      await page.getByRole("button", { name: /Los geht/ }).click();
      await page.getByText("Erste Station").first().click();

      const distance = page.locator("div.font-display").first();
      await expect(distance).toContainText(/\d/);
      await expect(distance).not.toContainText("—");
    });
  });
});
