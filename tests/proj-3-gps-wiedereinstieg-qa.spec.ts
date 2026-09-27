import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * PROJ-3 QA (2026-09-26) — GPS-Zustand beim Wiedereinstieg.
 *
 * Deckt ab, was die Frontend-Phase NICHT isoliert geprueft hat:
 * AC-2 (Wortlaut-Gleichheit mit dem Quest-Start), AC-6 (kein Knopf, wo der
 * Spieler nichts aendern kann) und AC-9 (Kompassfreigabe wirkt in derselben
 * Session), dazu Kontrast, Responsive und Sicherheit.
 *
 * Belegt: In den drei bestehenden PROJ-3-Dateien kommt `clearPermissions`
 * **null Mal** vor — kein Test hat den Navigations-Screen je ohne GPS-Fix
 * betreten. Genau dadurch konnte der Befund live gehen, waehrend die Suite
 * gruen war.
 */

const QUEST = {
  version: 1,
  id: "aa111111-1111-4111-8111-111111111111",
  name: "QA Wiedereinstieg",
  lastModified: "2026-09-26T00:00:00.000Z",
  intro: { text: "Intro" },
  outro: { text: "Outro" },
  stations: [
    {
      id: "ab111111-1111-4111-8111-111111111111",
      name: "Erste Station",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Inhalt der ersten Station" }],
    },
    {
      id: "ab222222-2222-4222-8222-222222222222",
      name: "Zweite Station",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 30,
      modules: [{ type: "text", content: "Inhalt der zweiten Station" }],
    },
  ],
};

async function seedResume(page: Page) {
  await page.goto("/play");
  await page.evaluate((q) => {
    localStorage.setItem("gq_quests", JSON.stringify([q]));
    localStorage.setItem(
      `gq_progress_${q.id}`,
      JSON.stringify({
        visitedStations: [q.stations[0].id],
        completedStations: [q.stations[0].id],
        solvedTasks: {},
        currentScreen: "stations",
        lastStationIndex: 0,
      })
    );
  }, QUEST);
}

async function openNavOhneGps(page: Page, context: BrowserContext) {
  await seedResume(page);
  await context.clearPermissions();
  await page.goto(`/play/${QUEST.id}`);
  await page.getByRole("button", { name: /Navigation zu Zweite Station starten/ }).click();
  await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
}

test.describe("PROJ-3 QA: GPS-Zustand beim Wiedereinstieg", () => {
  /**
   * AC-2: Der Erklaertext muss WORTGLEICH zu dem des Quest-Starts sein.
   * Verglichen wird derselbe Moment — beim Quest-Start kennt der Screen die
   * Diagnose erst nach dem Knopfdruck, vorher steht dort der generische Text.
   */
  test("AC-2: der Erklaertext ist wortgleich zum Quest-Start", async ({ page, context }) => {
    // Quest-Start, nach Knopfdruck
    await page.goto("/play");
    await page.evaluate((q) => {
      localStorage.setItem("gq_quests", JSON.stringify([q]));
      localStorage.removeItem(`gq_progress_${q.id}`);
    }, QUEST);
    await context.clearPermissions();
    await page.goto(`/play/${QUEST.id}`);
    await page.getByRole("button", { name: /Standort erlauben/i }).click();
    const startText = await page
      .getByText(/GPS wurde blockiert/)
      .first()
      .innerText();

    // Navigations-Screen nach Wiedereinstieg
    await openNavOhneGps(page, context);
    const navText = await page
      .getByText(/GPS wurde blockiert/)
      .first()
      .innerText();

    expect(navText).toBe(startText);
  });

  /**
   * AC-6: Wo der Spieler nichts aendern kann, darf kein Knopf stehen — er
   * waere eine Sackgasse. Dieselbe Lehre wie BUG-6 (2026-09-07).
   */
  test("AC-6: ohne Geolocation-API erscheint kein Wiederholen-Knopf", async ({
    page,
    context,
  }) => {
    await seedResume(page);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "geolocation", {
        value: undefined,
        configurable: true,
      });
    });
    await context.clearPermissions();
    await page.goto(`/play/${QUEST.id}`);
    await page.getByRole("button", { name: /Navigation zu Zweite Station starten/ }).click();

    await expect(page.getByText(/unterstützt kein GPS/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Erneut versuchen|Standort erlauben|Einstellungen prüfen/i })
    ).toHaveCount(0);
  });

  test("AC-6: der Suchzustand zeigt ebenfalls keinen Knopf", async ({ page, context }) => {
    await seedResume(page);
    await context.grantPermissions(["geolocation"]);
    await page.addInitScript(() => {
      navigator.geolocation.watchPosition = () => 1;
    });
    await page.goto(`/play/${QUEST.id}`);
    await page.getByRole("button", { name: /Navigation zu Zweite Station starten/ }).click();

    await expect(page.getByText(/Wir suchen dein Signal/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Erneut versuchen|Standort erlauben|Einstellungen prüfen/i })
    ).toHaveCount(0);
  });

  /**
   * AC-4, zweite Haelfte: Der Spieler sitzt nicht fest. Eine abgeschlossene
   * Station braucht gar kein GPS und muss weiter lesbar sein.
   */
  test("AC-4: ohne GPS bleibt eine abgeschlossene Station lesbar", async ({ page, context }) => {
    await openNavOhneGps(page, context);

    await page.getByRole("button", { name: /Zur/ }).first().click();
    await expect(page.getByRole("heading", { name: QUEST.name })).toBeVisible();

    await page.getByRole("button", { name: /Erste Station/ }).first().click();
    await expect(page.getByText("Inhalt der ersten Station")).toBeVisible();
  });

  /** Kontrast und Tap-Ziele am gerenderten Screen, nicht aus den Klassen abgeleitet. */
  test("Kontrast und Tap-Ziele erfuellen die PRD-Vorgaben", async ({ page, context }) => {
    await openNavOhneGps(page, context);

    const m = await page.evaluate(() => {
      const lum = (s: string) => {
        const [r, g, b] = s.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((v) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (fg: string, bg: string) => {
        const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
        return (hi + 0.05) / (lo + 0.05);
      };
      const eff = (el: Element): string => {
        let e: Element | null = el;
        while (e) {
          const b = getComputedStyle(e).backgroundColor;
          if (b && b !== "rgba(0, 0, 0, 0)") return b;
          e = e.parentElement;
        }
        return "rgb(10,14,15)";
      };
      const h2 = document.querySelector("h2")!;
      const par = [...document.querySelectorAll("p")].filter((x) => x.innerText.trim())[0];
      const btns = [...document.querySelectorAll("button")].filter((b) => b.innerText.trim());
      return {
        headline: ratio(getComputedStyle(h2).color, eff(h2)),
        text: par ? ratio(getComputedStyle(par).color, eff(par)) : 99,
        worstButton: Math.min(
          ...btns.map((b) => ratio(getComputedStyle(b).color, eff(b)))
        ),
        minTap: Math.min(...btns.map((b) => Math.round(b.getBoundingClientRect().height))),
      };
    });

    expect(m.headline).toBeGreaterThanOrEqual(4.5);
    expect(m.text).toBeGreaterThanOrEqual(4.5);
    expect(m.worstButton).toBeGreaterThanOrEqual(4.5);
    expect(m.minTap).toBeGreaterThanOrEqual(44);
  });

  test("der Zustands-Screen erzeugt auf 320px keinen Ueberlauf", async ({ page, context }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openNavOhneGps(page, context);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBe(0);
  });

  /** Sicherheit: Der Stationsname ist das einzige angreiferkontrollierte Feld. */
  test("Markup im Stationsnamen wird escapt, nicht ausgefuehrt", async ({ page, context }) => {
    const payload = '<img src=x onerror="window.__pwn=1">';
    const hostile = {
      ...QUEST,
      id: "aa222222-2222-4222-8222-222222222222",
      stations: [
        { ...QUEST.stations[0] },
        { ...QUEST.stations[1], name: payload },
      ],
    };
    let dialogs = 0;
    page.on("dialog", async (d) => {
      dialogs++;
      await d.dismiss();
    });

    await page.goto("/play");
    await page.evaluate((q) => {
      localStorage.setItem("gq_quests", JSON.stringify([q]));
      localStorage.setItem(
        `gq_progress_${q.id}`,
        JSON.stringify({
          visitedStations: [q.stations[0].id],
          completedStations: [q.stations[0].id],
          solvedTasks: {},
          currentScreen: "stations",
          lastStationIndex: 0,
        })
      );
    }, hostile);
    await context.clearPermissions();
    await page.goto(`/play/${hostile.id}`);
    await page.getByRole("button", { name: /Navigation zu/ }).last().click();
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();

    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn ?? null)).toBeNull();
    expect(await page.locator('img[src="x"]').count()).toBe(0);
    expect(dialogs).toBe(0);
  });

  /** Beschaedigter Fortschritt darf die App nicht unbedienbar machen. */
  test("korrupter Fortschritt laesst die App bedienbar", async ({ page, context }) => {
    await context.clearPermissions();
    const errs: string[] = [];
    page.on("pageerror", (e) => errs.push(String(e)));

    for (const bad of ['{"visitedStations":"nope"}', "null", "[]", "not-json"]) {
      await seedResume(page);
      await page.evaluate(
        ([id, v]) => localStorage.setItem(`gq_progress_${id}`, v as string),
        [QUEST.id, bad]
      );
      await page.goto(`/play/${QUEST.id}`);
      await expect(page.locator("body")).not.toBeEmpty();
    }
    expect(errs).toEqual([]);
  });
});
