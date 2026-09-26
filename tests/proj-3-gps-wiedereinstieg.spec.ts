import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * PROJ-3 Refinement 2026-09-26 — GPS-Zustand beim Wiedereinstieg.
 *
 * Gemeldeter Befund: Wer eine Quest mittendrin abbricht und spaeter
 * weiterspielt, landet direkt auf der Stationsliste (Permission-Screen
 * uebersprungen). Ein Tap auf den Pfeil einer offenen Station fuehrte dann in
 * einen Navigations-Screen mit "—" statt Entfernung und einem Pfeil ohne
 * Rotation — ohne Hinweis, ohne Knopf, ohne Ausweg ausser Zurueck.
 *
 * Die Luecke, die das durchgelassen hat: KEIN bestehender Test prueft den
 * Navigations-Screen OHNE GPS-Fix. Genau das tun die Tests hier.
 */

const QUEST = {
  version: 1,
  id: "c1111111-1111-4111-8111-111111111111",
  name: "Wiedereinstieg Quest",
  lastModified: "2026-09-26T00:00:00.000Z",
  intro: { text: "Los geht es." },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "d1111111-1111-4111-8111-111111111111",
      name: "Erste Station",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Station 1" }],
    },
    {
      id: "d2222222-2222-4222-8222-222222222222",
      name: "Zweite Station",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 30,
      modules: [{ type: "text", content: "Station 2" }],
    },
  ],
};

/**
 * Stellt den gemeldeten Ausgangszustand her: Quest im Speicher, erste Station
 * besucht und abgeschlossen. `visitedStations.length > 0` ist die Bedingung, aus
 * der `quest-player.tsx` auf "direkt zur Stationsliste" schliesst — also genau
 * der uebersprungene Permission-Screen.
 */
async function seedUnterbrocheneQuest(page: Page) {
  await page.goto("/play");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
    localStorage.setItem(
      `gq_progress_${quest.id}`,
      JSON.stringify({
        visitedStations: [quest.stations[0].id],
        completedStations: [quest.stations[0].id],
        solvedTasks: {},
        currentScreen: "stations",
        lastStationIndex: 0,
      })
    );
  }, QUEST);
}

/** Wiedereinstieg OHNE GPS — der gemeldete Fall. */
async function wiedereinstiegOhneGps(page: Page, context: BrowserContext) {
  await seedUnterbrocheneQuest(page);
  await context.clearPermissions();
  await page.goto(`/play/${QUEST.id}`);
  // Direkt auf der Stationsliste, nicht auf dem Permission-Screen.
  await expect(page.getByRole("heading", { name: QUEST.name })).toBeVisible();
}

/** Tippt auf die noch offene zweite Station. */
async function tippeOffeneStation(page: Page) {
  await page.getByRole("button", { name: /Navigation zu Zweite Station starten/ }).click();
}

test.describe("PROJ-3: GPS-Zustand beim Wiedereinstieg", () => {
  test("Wiedereinstieg ueberspringt den Permission-Screen (Ausgangslage des Befunds)", async ({
    page,
    context,
  }) => {
    await wiedereinstiegOhneGps(page, context);

    // Kein "Los geht's" — der Intro-/Permission-Weg ist uebersprungen.
    await expect(page.getByRole("button", { name: /Los geht/ })).toHaveCount(0);
  });

  /**
   * DER Kernwaechter dieses Refinements. Ohne den Fix zeigt der Screen "—" als
   * Entfernung und sonst nichts.
   */
  test("Tap auf den Pfeil ohne GPS zeigt eine lesbare Erklaerung statt eines Strichs", async ({
    page,
    context,
  }) => {
    await wiedereinstiegOhneGps(page, context);
    await tippeOffeneStation(page);

    // Eine Erklaerung ist da ...
    const erklaerung = page.getByText(
      /Wir suchen dein Signal|Wir finden dein GPS-Signal nicht|GPS wurde blockiert|sichere Verbindung|unterstuetzt kein GPS|unterstützt kein GPS/
    );
    await expect(erklaerung.first()).toBeVisible();

    // ... und der stumme Strich ist weg.
    await expect(page.getByText(/^—$/)).toHaveCount(0);
  });

  /**
   * Die Ueberschrift ist die einzige Zeile, die kontextabhaengig ist: Beim
   * Quest-Start passt "Navigation aktivieren", im laufenden Spiel wuerde sie den
   * Spieler auffordern, etwas zu aktivieren, das er gerade benutzt.
   */
  test("die Ueberschrift passt zum laufenden Spiel, nicht zum Quest-Start", async ({
    page,
    context,
  }) => {
    await wiedereinstiegOhneGps(page, context);
    await tippeOffeneStation(page);

    await expect(page.getByText(/GPS wird gebraucht/)).toBeVisible();
    await expect(page.getByText(/Navigation aktivieren/i)).toHaveCount(0);
  });

  test("der Quest-Start behaelt seine eigene Ueberschrift", async ({ page, context }) => {
    await page.goto("/play");
    await page.evaluate((quest) => {
      localStorage.setItem("gq_quests", JSON.stringify([quest]));
      localStorage.removeItem(`gq_progress_${quest.id}`);
    }, QUEST);
    await context.clearPermissions();
    await page.goto(`/play/${QUEST.id}`);

    await expect(page.getByText(/Navigation aktivieren/i)).toBeVisible();
    await expect(page.getByText(/GPS wird gebraucht/)).toHaveCount(0);
  });

  test("die Kopfzeile bleibt mit Stationsname und Zurueck-Pfeil erreichbar", async ({
    page,
    context,
  }) => {
    await wiedereinstiegOhneGps(page, context);
    await tippeOffeneStation(page);

    /**
     * Beide Teile gemeinsam pruefen, nicht nur die Kopfzeile: Die alte Fassung
     * hatte ebenfalls eine Kopfzeile mit Stationsnamen — sie zeigte bloss keine
     * Erklaerung darunter. Eine Assertion nur auf den Namen bestand deshalb auch
     * mit dem gemeldeten Fehler (in der Gegenprobe gemessen).
     */
    await expect(page.getByText("Zweite Station").first()).toBeVisible();
    await expect(
      page
        .getByText(
          /Wir suchen dein Signal|Wir finden dein GPS-Signal nicht|GPS wurde blockiert|sichere Verbindung|unterstützt kein GPS/
        )
        .first()
    ).toBeVisible();

    // Zurueck fuehrt wieder auf die Liste — er sitzt nicht fest.
    await page.getByRole("button", { name: /Zur/ }).first().click();
    await expect(page.getByRole("heading", { name: QUEST.name })).toBeVisible();
  });

  /**
   * Edge Case 26: `searching` ist kein Fehlerzustand. Ein Knopf in diesem
   * Fenster erzieht den Spieler dazu, etwas wegzutippen, was sich von selbst
   * erledigt.
   *
   * Der Suchzustand muss kuenstlich hergestellt werden: `grantPermissions`
   * allein liefert in Playwright bereits eine Position (gemessen: 1227m ohne
   * jedes `setGeolocation`). Deshalb wird `watchPosition` hier stillgelegt —
   * es ruft keinen der beiden Callbacks, also laeuft ein Watch ohne Fix.
   */
  test("der Suchzustand zeigt keinen Wiederholen-Knopf", async ({ page, context }) => {
    await seedUnterbrocheneQuest(page);
    await context.grantPermissions(["geolocation"]);
    await page.addInitScript(() => {
      navigator.geolocation.watchPosition = () => 1;
    });
    await page.goto(`/play/${QUEST.id}`);
    await tippeOffeneStation(page);

    await expect(page.getByText(/Wir suchen dein Signal/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Erneut versuchen|Standort erlauben|Einstellungen/ })
    ).toHaveCount(0);
  });

  /**
   * Edge Case 28: Kommt der Fix, waehrend der Zustand steht, muss der Screen
   * ohne zweiten Tap in die Navigation wechseln.
   *
   * Der Fix wird aus der Seite heraus nachgeschoben, weil `setGeolocation`
   * einen bereits stillgelegten `watchPosition` nicht erreicht.
   */
  test("ein eintreffender Fix wechselt ohne zweiten Tap in die Navigation", async ({
    page,
    context,
  }) => {
    await seedUnterbrocheneQuest(page);
    await context.grantPermissions(["geolocation"]);
    await page.addInitScript(() => {
      // Callback festhalten, statt ihn zu verwerfen: So laeuft der Watch, ohne
      // dass ein Fix kommt — und der Test kann ihn spaeter gezielt ausloesen.
      (window as unknown as { __fire?: () => void }).__fire = undefined;
      navigator.geolocation.watchPosition = (success) => {
        (window as unknown as { __fire?: () => void }).__fire = () =>
          (success as PositionCallback)({
            coords: { latitude: 53.6, longitude: 10.03, accuracy: 10 },
            timestamp: Date.now(),
          } as GeolocationPosition);
        return 1;
      };
    });
    await page.goto(`/play/${QUEST.id}`);
    await tippeOffeneStation(page);

    await expect(page.getByText(/Wir suchen dein Signal/)).toBeVisible();

    // Fix trifft ein — ohne weitere Nutzeraktion auf dem Screen.
    await page.evaluate(() => (window as unknown as { __fire: () => void }).__fire());

    await expect(page.getByText(/Zur nächsten Station|Du bist fast da/)).toBeVisible({
      timeout: 15_000,
    });
    // Und es steht eine echte Entfernung da, kein Strich.
    await expect(page.getByText(/^—$/)).toHaveCount(0);
  });

  test("mit GPS-Fix verhaelt sich der Screen unveraendert (keine Regression)", async ({
    page,
    context,
  }) => {
    await seedUnterbrocheneQuest(page);
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 53.60, longitude: 10.03 });
    await page.goto(`/play/${QUEST.id}`);
    await tippeOffeneStation(page);

    // Pfeil, Entfernung und Zielzaehler wie vor dem Refinement.
    await expect(page.getByText(/Zur nächsten Station|Du bist fast da/)).toBeVisible();
    await expect(page.getByText(/Ziel 2 von 2/)).toBeVisible();
    await expect(
      page.getByText(/Wir suchen dein Signal|Wir finden dein GPS-Signal nicht/)
    ).toHaveCount(0);
  });

  /**
   * Der Zustand muss den Watch selbst nachstarten (Edge Case 24). Ohne das
   * bliebe `position` die ganze Session `null`, auch nachdem eine Position
   * verfuegbar ist — genau der gemeldete Fehler auf iOS Safari.
   */
  test("der Screen startet den Watch nach, auch wenn der Permission-Screen uebersprungen wurde", async ({
    page,
    context,
  }) => {
    await seedUnterbrocheneQuest(page);
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 53.60, longitude: 10.03 });

    /**
     * iOS Safari nachbilden UND messen, wer den Watch startet.
     *
     * `permissions.query` rejected (dort fuehrt Safari Geolocation nicht), also
     * kann der Auto-Start im Hook nicht greifen. Zusaetzlich werden die
     * `watchPosition`-Aufrufe gezaehlt: Ohne den Nachstart im Screen bleibt der
     * Zaehler bei 0 — eine reine Entfernungs-Assertion wuerde dagegen auch
     * bestehen, wenn die Position aus einem anderen Pfad kommt (in der
     * Gegenprobe gemessen).
     */
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "permissions", {
        value: { query: () => Promise.reject(new TypeError("unsupported")) },
        configurable: true,
      });
      const orig = navigator.geolocation.watchPosition.bind(navigator.geolocation);
      (window as unknown as { __watchCalls: number }).__watchCalls = 0;
      navigator.geolocation.watchPosition = (...args: Parameters<typeof orig>) => {
        (window as unknown as { __watchCalls: number }).__watchCalls++;
        return orig(...args);
      };
    });

    await page.goto(`/play/${QUEST.id}`);

    // Auf der Stationsliste hat noch niemand einen Watch gestartet.
    await expect(page.getByRole("heading", { name: QUEST.name })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __watchCalls: number }).__watchCalls)).toBe(0);

    await tippeOffeneStation(page);

    // Der Navigations-Screen hat selbst gestartet — und eine Entfernung kommt zustande.
    await expect(page.getByText(/Zur nächsten Station|Du bist fast da/)).toBeVisible({
      timeout: 15_000,
    });
    expect(
      await page.evaluate(() => (window as unknown as { __watchCalls: number }).__watchCalls)
    ).toBeGreaterThan(0);
  });
});
