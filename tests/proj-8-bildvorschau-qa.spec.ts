import { test, expect, type Page, type Request } from "@playwright/test";

/**
 * PROJ-8, QA der Bildvorschau (Refinement 2026-09-28).
 *
 * Ergänzt `proj-8-bildvorschau.spec.ts` um das, was die Frontend-Phase nicht
 * geprüft hat: den Ladezustand (AC-7), die Behauptung „gleiche Ladebedingungen
 * wie im Player" (Referer), echte Wettläufe mit langsamen Servern, Entprellung
 * gemessen an Anfragen, Angriffe über die URL, Layout auf drei Breiten und die
 * Tastatur-Reihenfolge.
 */

const QUEST_ID = "77777777-7777-4777-8777-777777777777";
const STATION_ID = "66666666-6666-4666-8666-666666666666";

const HOST = "https://qa-bilder.gq-test.example";
const PNG = `${HOST}/ok.png`;
const SLOW_PNG = `${HOST}/langsam.png`;
const SLOW_HTML = `${HOST}/langsam-seite.htm`;
const FORBIDDEN = `${HOST}/hotlink-gesperrt.jpg`;
const TALL = `${HOST}/hochkant.svg`;
const PAGE = `${HOST}/seite.htm`;

const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

async function routeImages(page: Page, seen: Request[] = []) {
  await page.route(`${HOST}/**`, async (route) => {
    const req = route.request();
    seen.push(req);
    const url = req.url();
    if (url.includes("langsam")) await new Promise((r) => setTimeout(r, 2500));
    // Eine verzögerte Anfrage kann der Browser inzwischen verworfen haben (neue
    // Adresse, Sheet geschlossen). `fulfill` wirft dann — unbehandelt legt das
    // den Worker lahm und der Lauf hängt bis zum globalen Timeout.
    const reply = (options: Parameters<typeof route.fulfill>[0]) => route.fulfill(options).catch(() => {});
    if (url.includes("hotlink")) return reply({ status: 403, contentType: "text/plain", body: "Forbidden" });
    if (url.endsWith(".png")) return reply({ status: 200, contentType: "image/png", body: PNG_BYTES });
    if (url.endsWith(".svg")) {
      return reply({
        status: 200,
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="3000"><rect width="200" height="3000" fill="#fa0"/></svg>',
      });
    }
    return reply({ status: 200, contentType: "text/html", body: "<!doctype html><p>Seite</p>" });
  });
}

function quest(modules: unknown[] = []) {
  return {
    version: 1,
    id: QUEST_ID,
    name: "QA-Quest",
    lastModified: "2026-01-01T00:00:00.000Z",
    intro: { text: "Willkommen" },
    outro: { text: "Geschafft" },
    stations: [{ id: STATION_ID, name: "Brunnen", lat: 52.5, lng: 13.4, radiusMeters: 10, modules }],
  };
}

async function seed(page: Page, q: unknown, path: string, seen: Request[] = []) {
  await routeImages(page, seen);
  await page.goto("/create");
  await page.evaluate((q) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify([q]));
  }, q);
  await page.goto(path);
}

async function openNewImageSheet(page: Page, seen: Request[] = []) {
  await seed(page, quest(), `/create/${QUEST_ID}/station/${STATION_ID}`, seen);
  await page.getByRole("button", { name: "Modul hinzufügen" }).click();
  await page.getByRole("button", { name: "Bild", exact: true }).click();
}

const preview = (page: Page) => page.getByTestId("image-url-preview");
const warning = (page: Page) => page.getByRole("alert").filter({ hasText: "Unter dieser Adresse ist kein Bild." });

test.describe("PROJ-8 QA: Bildvorschau", () => {
  test("AC-7: während der Prüfung ist ein Ladezustand sichtbar — keine leere Fläche, keine vorschnelle Warnung", async ({ page }) => {
    await openNewImageSheet(page);
    await page.locator("#media-url").fill(SLOW_PNG);
    await expect(preview(page)).toHaveAttribute("data-status", "loading");
    await expect(preview(page)).toContainText("Bild wird geprüft");
    await expect(warning(page)).toHaveCount(0);
    await expect(preview(page)).toHaveAttribute("data-status", "ok", { timeout: 8000 });
  });

  test("Edge Case 12: ein Server, der das Bild verweigert (403), erzeugt die Warnung", async ({ page }) => {
    await openNewImageSheet(page);
    await page.locator("#media-url").fill(FORBIDDEN);
    await expect(warning(page)).toBeVisible();
  });

  test("Wettlauf im echten Browser: eine langsame alte Prüfung überschreibt die neue nicht", async ({ page }) => {
    await openNewImageSheet(page);
    await page.locator("#media-url").fill(SLOW_HTML);
    // Warten, bis die langsame Prüfung wirklich unterwegs ist
    await expect(preview(page)).toHaveAttribute("data-status", "loading");
    await page.waitForTimeout(600);
    await page.locator("#media-url").fill(PNG);
    await expect(preview(page)).toHaveAttribute("data-status", "ok");
    // Die alte Antwort (HTML → Fehler) trifft erst jetzt ein
    await page.waitForTimeout(2500);
    await expect(preview(page)).toHaveAttribute("data-status", "ok");
    await expect(warning(page)).toHaveCount(0);
  });

  test("Entprellung: Zeichenweises Tippen löst höchstens zwei Anfragen an den fremden Server aus", async ({ page }) => {
    const seen: Request[] = [];
    await openNewImageSheet(page, seen);
    await page.locator("#media-url").pressSequentially(PNG, { delay: 40 });
    await expect(preview(page)).toHaveAttribute("data-status", "ok");
    await page.waitForTimeout(800);
    const toHost = seen.filter((r) => r.url().startsWith(HOST));
    expect(toHost.length).toBeGreaterThanOrEqual(1);
    expect(toHost.length).toBeLessThanOrEqual(2);
  });

  test("gleiche Ladebedingungen: Vorschau und Player senden denselben Referer", async ({ page }) => {
    const seen: Request[] = [];
    await openNewImageSheet(page, seen);
    await page.locator("#media-url").fill(PNG);
    await expect(preview(page)).toHaveAttribute("data-status", "ok");
    const creatorReferer = await seen.find((r) => r.url() === PNG)!.headerValue("referer");

    // Dieselbe Bildquelle im Player. Eigene Adresse, weil Chrome die Datei
    // sonst aus dem Speicher der Creator-Vorschau nimmt und gar nicht anfragt.
    const PLAYER_PNG = `${HOST}/im-player.png`;
    const playerSeen: Request[] = [];
    await page.unroute(`${HOST}/**`);
    await routeImages(page, playerSeen);
    await page.evaluate(
      ({ q, stationId }) => {
        localStorage.setItem("gq_quests", JSON.stringify([{ ...q, published: true }]));
        localStorage.setItem(`gq_progress_${q.id}`, JSON.stringify({ visitedStations: [stationId], completedStations: [], solvedTasks: {} }));
      },
      { q: quest([{ type: "image", url: PLAYER_PNG }]), stationId: STATION_ID }
    );
    await page.goto(`/play/${QUEST_ID}`);
    // Das Bild-Modul lädt mit loading="lazy": sichtbar heißt noch nicht angefragt.
    const playerRequest = page.waitForRequest(PLAYER_PNG);
    await page.getByRole("button", { name: /Brunnen/ }).first().click();
    await page.locator(`img[src="${PLAYER_PNG}"]`).scrollIntoViewIfNeeded();
    const playerReferer = await (await playerRequest).headerValue("referer");
    expect(playerSeen.length).toBeGreaterThan(0);

    expect(creatorReferer).toBeTruthy();
    expect(creatorReferer).toBe(playerReferer);
    // origin-when-cross-origin: nur die Origin, nie der Pfad der Quest
    expect(creatorReferer).not.toContain("/create/");
  });

  test("Sicherheit: Markup in der URL wird nicht ausgeführt und erzeugt keine Elemente", async ({ page }) => {
    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });
    await openNewImageSheet(page);
    const before = await page.locator("img").count();
    await page
      .locator("#media-url")
      .fill(`${HOST}/a.png"><img src=x onerror="window.__pwn=1;alert(1)"><script>window.__pwn=2</script>`);
    await expect(preview(page)).not.toHaveAttribute("data-status", "loading", { timeout: 8000 });
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn ?? null)).toBeNull();
    expect(dialogs).toEqual([]);
    expect(await page.locator("img[src='x']").count()).toBe(0);
    expect(await page.locator("img").count()).toBeLessThanOrEqual(before + 1);
  });

  test("Sicherheit: javascript:- und data:-Adressen werden gar nicht erst geprüft", async ({ page }) => {
    await openNewImageSheet(page);
    for (const url of ["javascript:alert(1)//https://x", "data:image/png;base64,AAAA", "HTTPS://gross.example/a.png"]) {
      await page.locator("#media-url").fill(url);
      await page.waitForTimeout(600);
      await expect(preview(page)).toHaveCount(0);
    }
  });

  test("ein sehr hohes, schmales Bild bleibt in der Höhe begrenzt", async ({ page }) => {
    await openNewImageSheet(page);
    await page.locator("#media-url").fill(TALL);
    await expect(preview(page)).toHaveAttribute("data-status", "ok");
    const box = await preview(page).locator("img").boundingBox();
    expect(box!.height).toBeLessThanOrEqual(194); // max-h-48 = 192px + 2px Rahmen
  });

  for (const width of [375, 768, 1440]) {
    test(`Responsive ${width}px: Warnung im Modul-Sheet und im Quest-Dialog ohne horizontalen Überlauf`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await openNewImageSheet(page);
      await page.locator("#media-url").fill(PAGE);
      await expect(warning(page)).toBeVisible();
      const sheetOverflow = await warning(page).evaluate((el) => {
        let n: HTMLElement | null = el as HTMLElement;
        let max = 0;
        while (n) {
          max = Math.max(max, n.scrollWidth - n.clientWidth);
          n = n.parentElement;
        }
        return { max, right: el.getBoundingClientRect().right, vw: window.innerWidth };
      });
      expect(sheetOverflow.max).toBeLessThanOrEqual(1);
      expect(sheetOverflow.right).toBeLessThanOrEqual(sheetOverflow.vw);

      await page.goto("/create");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
      await page.locator("#intro-url").fill(PAGE);
      await expect(warning(page)).toBeVisible();
      const dialogBox = await warning(page).boundingBox();
      expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
      expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(width);
    });
  }

  test("Tastatur: Vorschau und Warnung fügen keine Tab-Stopps ein", async ({ page }) => {
    await openNewImageSheet(page);
    await page.locator("#media-url").fill(PAGE);
    await expect(warning(page)).toBeVisible();
    await page.locator("#media-url").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#media-caption")).toBeFocused();

    await page.locator("#media-url").fill(PNG);
    await expect(preview(page)).toHaveAttribute("data-status", "ok");
    await page.locator("#media-url").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#media-caption")).toBeFocused();
  });

  test("Kontrast der Warnung im Quest-Dialog (PROJ-6) ≥ 4.5:1", async ({ page }) => {
    await seed(page, quest([{ type: "text", content: "Hallo" }]), "/create");
    await page.getByRole("button", { name: "Quest-Aktionen" }).click();
    await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
    await page.locator("#outro-url").fill(PAGE);
    await expect(warning(page)).toBeVisible();
    const ratios = await warning(page).evaluate((el) => {
      const rgb = (s: string) => s.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
      const lum = (c: number[]) =>
        c
          .map((v) => v / 255)
          .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
          .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      let node: HTMLElement | null = el as HTMLElement;
      let bg = getComputedStyle(node).backgroundColor;
      while (bg === "rgba(0, 0, 0, 0)" && node.parentElement) {
        node = node.parentElement;
        bg = getComputedStyle(node).backgroundColor;
      }
      return [...el.querySelectorAll("h5, div")].map((n) => {
        const [a, b] = [lum(rgb(getComputedStyle(n).color)), lum(rgb(bg))].sort((x, y) => y - x);
        return (a + 0.05) / (b + 0.05);
      });
    });
    expect(ratios.length).toBeGreaterThan(0);
    for (const r of ratios) expect(r).toBeGreaterThanOrEqual(4.5);
  });

  test("Sheet während laufender Prüfung schließen: kein Seitenfehler", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await openNewImageSheet(page);
    await page.locator("#media-url").fill(SLOW_PNG);
    await expect(preview(page)).toHaveAttribute("data-status", "loading");
    await page.getByRole("button", { name: "Abbrechen" }).click();
    await page.waitForTimeout(3000);
    expect(errors).toEqual([]);
    await expect(page.getByRole("button", { name: "Modul hinzufügen" })).toBeVisible();
  });

  test("Regression PROJ-4: im Player zeigt eine Seiten-URL weiterhin den bestehenden Fehlerzustand", async ({ page }) => {
    await routeImages(page);
    await page.goto("/play");
    await page.evaluate(
      ({ q, stationId }) => {
        localStorage.setItem("gq_first_visit_done", "true");
        localStorage.setItem("gq_quests", JSON.stringify([{ ...q, published: true }]));
        localStorage.setItem(`gq_progress_${q.id}`, JSON.stringify({ visitedStations: [stationId], completedStations: [], solvedTasks: {} }));
      },
      { q: quest([{ type: "image", url: PAGE }]), stationId: STATION_ID }
    );
    await page.goto(`/play/${QUEST_ID}`);
    await page.getByRole("button", { name: /Brunnen/ }).first().click();
    await expect(page.getByText("Bild konnte nicht geladen werden")).toBeVisible();
    await expect(page.getByTestId("image-url-preview")).toHaveCount(0);
  });
});
