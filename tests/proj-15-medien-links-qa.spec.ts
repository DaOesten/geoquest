import { test, expect, type Page, type Request } from "@playwright/test";

/**
 * PROJ-15 QA (2026-10-04): Was die Frontend-Suite nicht abdeckt.
 *
 * Kontrast, Adresswechsel während der Probe, gespeicherte Eingabe, Outro,
 * fehlende Wikimedia-Datei, iPhone-Format-Hinweis, Dropbox-Freigabe beim Audio,
 * Responsive, Tastatur, XSS, ein vollständiger Durchlauf ohne Plattform-Anfrage
 * und das Verlassen der Station. Alle fremden Hosts werden per `page.route`
 * beantwortet.
 */

const QUEST_ID = "15151515-1515-4515-8515-151515151515";
const STATION_ID = "25252525-2525-4525-8525-252525252525";
const YT = "https://youtu.be/dQw4w9WgXcQ";
const DROPBOX_IMG = "https://www.dropbox.com/scl/fi/k3j4h5g6f7/brunnen.png?rlkey=a1b2c3d4e5&dl=0";
const WIKI_IMG = "https://de.wikipedia.org/wiki/K%C3%B6lner_Dom#/media/Datei:K%C3%B6lner_Dom_von_Osten.jpg";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

function wav(): Buffer {
  const samples = 4000;
  const b = Buffer.alloc(44 + samples * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + samples * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24);
  b.writeUInt32LE(16000, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(samples * 2, 40);
  return b;
}

const PLATFORM_HOSTS = /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|ytimg\.com|googlevideo\.com|google\.com|gstatic\.com|vimeo\.com|vimeocdn\.com)$/;

function platformRequests(page: Page): Request[] {
  const seen: Request[] = [];
  page.on("request", (r) => {
    if (PLATFORM_HOSTS.test(new URL(r.url()).hostname)) seen.push(r);
  });
  return seen;
}

async function routeExternal(page: Page) {
  await page.route(/^https:\/\/(?!localhost)[^/]+\.(com|org|example|be)\//, (route) => {
    const url = new URL(route.request().url());
    if (/youtube-nocookie\.com|player\.vimeo\.com/.test(url.hostname)) {
      return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Player</title>" });
    }
    if (url.pathname.includes("Gibt_es_nicht")) {
      return route.fulfill({ status: 404, contentType: "text/html", body: "<!doctype html><p>Datei nicht gefunden</p>" });
    }
    // Nicht freigegebene Dropbox-Datei: Dropbox liefert eine Anmeldeseite statt der Datei
    if (url.pathname.includes(".htm") || (url.hostname === "www.dropbox.com" && url.pathname.endsWith(".mp3"))) {
      return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><p>Seite</p>" });
    }
    if (/\.(wav|mp3)$/.test(url.pathname)) return route.fulfill({ status: 200, contentType: "audio/wav", body: wav() });
    return route.fulfill({ status: 200, contentType: "image/png", body: PNG });
  });
}

function quest(modules: unknown[], extra: Record<string, unknown> = {}) {
  return {
    version: 1,
    id: QUEST_ID,
    name: "Medien-Quest",
    lastModified: "2026-10-04T00:00:00.000Z",
    intro: { text: "Willkommen" },
    outro: { text: "Geschafft" },
    stations: [{ id: STATION_ID, name: "Brunnen", lat: 52.5, lng: 13.4, radiusMeters: 10, modules }],
    ...extra,
  };
}

async function seed(page: Page, q: unknown, progress: null | Record<string, unknown>) {
  await page.goto("/play");
  await page.evaluate(
    ({ q, progress, id }) => {
      localStorage.setItem("gq_first_visit_done", "true");
      localStorage.setItem("gq_install_hint_dismissed_at", String(Date.now()));
      localStorage.setItem("gq_quests", JSON.stringify([q]));
      if (progress) localStorage.setItem(`gq_progress_${id}`, JSON.stringify(progress));
    },
    { q, progress, id: QUEST_ID }
  );
}

const atStation = {
  visitedStations: [STATION_ID],
  completedStations: [],
  solvedTasks: {},
  currentScreen: "stations",
  lastStationIndex: 0,
};

async function openPlayerStation(page: Page, modules: unknown[]) {
  await routeExternal(page);
  await seed(page, quest(modules), atStation);
  await page.goto(`/play/${QUEST_ID}`);
  await page.getByRole("button", { name: /Brunnen.*Aufgaben fortsetzen/ }).click();
}

async function openNewModuleSheet(page: Page, type: "Bild" | "Audio" | "Video") {
  await routeExternal(page);
  await seed(page, quest([]), null);
  await page.goto(`/create/${QUEST_ID}/station/${STATION_ID}`);
  await page.getByRole("button", { name: "Modul hinzufügen" }).click();
  await page.getByRole("button", { name: type, exact: true }).click();
}

/** Kontrast eines Textelements gegen den ersten nicht transparenten Hintergrund darüber */
async function contrast(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => {
    const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    let node: Element | null = el;
    let bg = [255, 255, 255];
    while (node) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c.length >= 3 && (c.length < 4 || c[3] > 0.95)) {
        bg = c.slice(0, 3);
        break;
      }
      node = node.parentElement;
    }
    const fg = parse(getComputedStyle(el).color).slice(0, 3);
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    return (a + 0.05) / (b + 0.05);
  });
}

// ---------------------------------------------------------------------------

test.describe("PROJ-15 QA: Player", () => {
  test("Platzhalter-Texte erreichen mindestens 4.5:1", async ({ page }) => {
    await openPlayerStation(page, [{ type: "video", url: YT }]);
    const box = '[data-testid="platform-video"]';
    await expect(page.locator(box)).toBeVisible();
    expect(await contrast(page, `${box} button > span:nth-child(2)`)).toBeGreaterThanOrEqual(4.5);
    expect(await contrast(page, `${box} button > span:nth-child(3)`)).toBeGreaterThanOrEqual(4.5);
  });

  test("Edge Case 7: Station verlassen beendet das Video, zurück steht wieder der Platzhalter", async ({ page }) => {
    await openPlayerStation(page, [{ type: "video", url: YT }]);
    await page.getByTestId("platform-video").getByRole("button").click();
    await expect(page.locator("iframe")).toHaveCount(1);
    await page.getByRole("button", { name: /zurück/i }).first().click();
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("button", { name: /Brunnen.*Aufgaben fortsetzen/ }).click();
    await expect(page.getByTestId("platform-video")).toHaveAttribute("data-state", "placeholder");
  });

  test("Datenschutz: vollständiger Durchlauf ohne Tippen — keine Anfrage und kein Cookie der Plattformen", async ({ page, context }) => {
    const requests = platformRequests(page);
    await openPlayerStation(page, [
      { type: "video", url: YT },
      { type: "video", url: "https://vimeo.com/76979871" },
    ]);
    await expect(page.getByTestId("platform-video")).toHaveCount(2);
    await page.getByRole("button", { name: /Station abschlie/i }).click();
    await expect(page.getByText("Geschafft")).toBeVisible({ timeout: 10_000 });
    expect(requests.map((r) => r.url())).toEqual([]);
    const cookies = await context.cookies();
    expect(cookies.filter((c) => /youtube|google|vimeo/.test(c.domain))).toEqual([]);
  });

  test("Outro-Bild aus Wikimedia wird umgewandelt", async ({ page }) => {
    await routeExternal(page);
    await seed(
      page,
      quest([{ type: "text", content: "x" }], { outro: { text: "Geschafft", mediaUrl: WIKI_IMG, mediaType: "image" } }),
      atStation
    );
    await page.goto(`/play/${QUEST_ID}`);
    // Das Outro folgt auf das Abschließen der letzten Station
    await page.getByRole("button", { name: /Brunnen.*Aufgaben fortsetzen/ }).click();
    await page.getByRole("button", { name: /Station abschlie/i }).click();
    await expect(page.locator('img[src*="Special:FilePath"]')).toHaveAttribute(
      "src",
      "https://de.wikipedia.org/wiki/Special:FilePath/Datei:K%C3%B6lner_Dom_von_Osten.jpg?width=1280"
    );
  });

  test("XSS: Markup in Bildunterschrift und Adresse wird nicht ausgeführt", async ({ page }) => {
    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      d.dismiss();
    });
    await openPlayerStation(page, [
      { type: "video", url: `${YT}"><img src=x onerror=alert(1)>`, caption: '<img src=x onerror="window.__pwn=1">' },
      { type: "video", url: "javascript:alert(2)" },
    ]);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn ?? null)).toBeNull();
    expect(await page.locator('img[src="x"]').count()).toBe(0);
    expect(dialogs).toEqual([]);
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  /**
   * BUG-21 (Medium, Rückschritt): `Special:FilePath`-Links sind Direktlinks auf
   * eine Datei und luden vor PROJ-15 problemlos (gemessen mit echtem Netz:
   * 480×640). Jetzt verwirft die Auflösung den Titel wegen des `/` und meldet
   * „keine einzelne Datei". Wird grün, sobald behoben.
   */
  test.fail("BUG-21: Special:FilePath-Link lädt im Player weiterhin das Bild", async ({ page }) => {
    await openPlayerStation(page, [
      { type: "image", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Cologne_Cathedral.jpg", caption: "FP" },
    ]);
    await expect(page.getByAltText("FP")).toBeVisible({ timeout: 3000 });
    await expect(page.getByText("Bild konnte nicht geladen werden")).toHaveCount(0);
  });

  test.describe("Responsive", () => {
    for (const width of [320, 375, 768, 1440]) {
      test(`${width}px: Platzhalter ohne Überlauf, 16:9`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await openPlayerStation(page, [{ type: "video", url: YT, caption: "Ein sehr langer Untertitel ".repeat(4) }]);
        const box = (await page.getByTestId("platform-video").boundingBox())!;
        expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(0.02);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      });
    }
  });
});

// ---------------------------------------------------------------------------

test.describe("PROJ-15 QA: Creator", () => {
  test("Hinweis- und Warntexte erreichen mindestens 4.5:1 (Light-Theme der Sheets)", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    await page.locator("#media-url").fill("https://drive.google.com/file/d/1K81jyY-pdF0ixDOxWC1ieioR-6SMC53L/view");
    const warn = '[data-notice="gdrive-av-unsupported"]';
    await expect(page.locator(warn)).toBeVisible();
    expect(await contrast(page, `${warn} h5`)).toBeGreaterThanOrEqual(4.5);
    expect(await contrast(page, `${warn} > div`)).toBeGreaterThanOrEqual(4.5);

    await page.locator("#media-url").fill(YT.replace("youtu.be/", "www.youtube.com/watch?v="));
    await page.getByRole("button", { name: "Abbrechen" }).click();
    await page.getByRole("button", { name: "Modul hinzufügen" }).click();
    await page.getByRole("button", { name: "Video", exact: true }).click();
    await page.locator("#media-url").fill(YT);
    const info = '[data-notice="youtube-recognized"]';
    expect(await contrast(page, `${info} h5`)).toBeGreaterThanOrEqual(4.5);
    expect(await contrast(page, `${info} > div`)).toBeGreaterThanOrEqual(4.5);
  });

  test("Probe: Adresswechsel ersetzt den laufenden Probe-Player", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    await page.locator("#media-url").fill("https://ton.gq-test.example/eins.wav");
    await expect(page.getByTestId("media-probe")).toHaveAttribute("data-status", "ok");
    await expect(page.locator('[data-testid="media-probe"] source')).toHaveAttribute("src", "https://ton.gq-test.example/eins.wav");

    await page.locator("#media-url").fill("https://ton.gq-test.example/seite.htm");
    await expect(page.getByTestId("media-probe")).toHaveAttribute("data-status", "error");
    await expect(page.locator('source[src="https://ton.gq-test.example/eins.wav"]')).toHaveCount(0);
  });

  test("Probe: nicht freigegebene Dropbox-Audiodatei — Warnung nennt die Freigabe", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    await page.locator("#media-url").fill("https://www.dropbox.com/s/abc123xyz/hoerspiel.mp3?dl=0");
    await expect(page.locator('[data-notice="dropbox-recognized"]')).toBeVisible();
    await expect(page.getByTestId("media-probe")).toHaveAttribute("data-status", "error");
    await expect(page.getByRole("alert").filter({ hasText: "kein abspielbares Audio" })).toContainText("„Jeder mit dem Link“");
  });

  test("Gespeichert wird die Eingabe unverändert, nicht die umgewandelte Adresse", async ({ page }) => {
    await openNewModuleSheet(page, "Bild");
    await page.locator("#media-url").fill(DROPBOX_IMG);
    await expect(page.getByTestId("image-url-preview")).toHaveAttribute("data-status", "ok");
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect.poll(async () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules)
    ).toEqual([{ type: "image", url: DROPBOX_IMG }]);
  });

  test("Wikimedia: nicht vorhandene Datei bekommt die normale Lade-Warnung", async ({ page }) => {
    await openNewModuleSheet(page, "Bild");
    await page.locator("#media-url").fill("https://commons.wikimedia.org/wiki/File:Gibt_es_nicht.jpg");
    await expect(page.locator('[data-notice="wikimedia-recognized"]')).toBeVisible();
    await expect(page.getByTestId("image-url-preview")).toHaveAttribute("data-status", "error");
    await expect(page.getByRole("alert").filter({ hasText: "Unter dieser Adresse ist kein Bild." })).toBeVisible();
  });

  test("Wikimedia: iPhone-Format-Hinweis steht, auch wenn die Probe gelingt", async ({ page }) => {
    await openNewModuleSheet(page, "Video");
    // Ein Bild im Video-Feld: kein bekanntes Videoformat → keine iPhone-taugliche Fassung
    await page.locator("#media-url").fill("https://commons.wikimedia.org/wiki/File:Beispiel.png");
    await expect(page.locator('[data-notice="wikimedia-iphone-format"]')).toContainText("iPhones");
    await expect(page.locator('[data-notice="wikimedia-recognized"]')).toBeVisible();
  });

  test("Tastatur: „Vorschau laden“ ist erreichbar und per Enter auslösbar", async ({ page, browserName }) => {
    await openNewModuleSheet(page, "Video");
    await page.locator("#media-url").fill(YT);
    await page.locator("#media-url").focus();
    // Safari springt mit Tab nur zu Feldern; Knöpfe erreicht man dort mit Alt+Tab (Plattformverhalten)
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    await expect(page.getByRole("button", { name: "Vorschau laden" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("platform-preview").locator("iframe")).toHaveCount(1);
  });

  test("XSS: Markup in der Adresse wird nicht als HTML gerendert", async ({ page }) => {
    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      d.dismiss();
    });
    await openNewModuleSheet(page, "Video");
    await page.locator("#media-url").fill('https://www.youtube.com/watch?v="><img src=x onerror=alert(1)>');
    await expect(page.locator('[data-notice="platform-not-single-video"]')).toBeVisible();
    await page.locator("#media-url").fill("javascript:alert(3)");
    await page.waitForTimeout(600);
    expect(await page.locator('img[src="x"]').count()).toBe(0);
    expect(dialogs).toEqual([]);
    await expect(page.getByTestId("media-url-feedback")).toHaveCount(0);
  });

  test.describe("Responsive", () => {
    for (const width of [320, 375, 768, 1440]) {
      test(`${width}px: Sheet mit Warnung und Vorschau-Knopf ohne Überlauf, Tap-Ziel ≥ 44 px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await openNewModuleSheet(page, "Video");
        await page.locator("#media-url").fill("https://www.youtube.com/@ein-sehr-langer-kanalname-ohne-umbruch");
        await expect(page.locator('[data-notice="platform-not-single-video"]')).toBeVisible();
        const overflowing = await page.locator('[data-notice]').evaluateAll((els) =>
          els.filter((e) => e.scrollWidth > e.clientWidth + 1).length
        );
        expect(overflowing).toBe(0);
        await page.locator("#media-url").fill(YT);
        const button = (await page.getByRole("button", { name: "Vorschau laden" }).boundingBox())!;
        expect(button.height).toBeGreaterThanOrEqual(44);
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      });
    }
  });
});
