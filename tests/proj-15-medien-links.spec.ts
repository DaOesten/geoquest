import { test, expect, type Page, type Request } from "@playwright/test";

/**
 * PROJ-15: Medien-Links — YouTube, Vimeo, Dropbox, Google Drive, Wikimedia.
 *
 * Kein Test spricht mit einem echten Anbieter: Jeder fremde Host wird per
 * `page.route` beantwortet. Die Adressregeln selbst prüft die Unit-Suite
 * (`src/lib/media-link.test.ts`) gegen am 2026-10-04 gemessene Sollwerte;
 * hier geht es darum, dass Player und Creator sie wirklich benutzen — und dass
 * vor dem Tippen **keine** Anfrage an YouTube/Google/Vimeo geht.
 */

const QUEST_ID = "15151515-1515-4515-8515-151515151515";
const STATION_ID = "25252525-2525-4525-8525-252525252525";

const YT_ID = "dQw4w9WgXcQ";
const YT_URL = `https://www.youtube.com/watch?v=${YT_ID}&t=90`;
const VIMEO_URL = "https://vimeo.com/123456789/abcdef1234";
const DROPBOX_IMG = "https://www.dropbox.com/scl/fi/k3j4h5g6f7/brunnen.png?rlkey=a1b2c3d4e5&dl=0";
const DRIVE_ID = "1K81jyY-pdF0ixDOxWC1ieioR-6SMC53L";
const DRIVE_URL = `https://drive.google.com/file/d/${DRIVE_ID}/view?usp=sharing`;
const WIKI_IMG = "https://de.wikipedia.org/wiki/K%C3%B6lner_Dom#/media/Datei:K%C3%B6lner_Dom_von_Osten.jpg";
const WIKI_OGG = "https://commons.wikimedia.org/wiki/File:Toco_Toucan_call_(Ramphastos_toco).ogg";

// 1×1 PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

/** Eine halbe Sekunde Stille als WAV — spielt in Chrome und WebKit */
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

/** Alle fremden Hosts beantworten: Bilder mit PNG, Audio mit WAV, Plattform-Player mit einer leeren Seite */
async function routeExternal(page: Page) {
  await page.route(/^https:\/\/(?!localhost)[^/]+\.(com|org|example|be)\//, (route) => {
    const url = new URL(route.request().url());
    if (/youtube-nocookie\.com|player\.vimeo\.com/.test(url.hostname)) {
      return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Player</title>" });
    }
    if (url.pathname.endsWith(".wav") || url.pathname.endsWith(".mp3")) {
      return route.fulfill({ status: 200, contentType: "audio/wav", body: wav() });
    }
    if (url.pathname.includes(".htm")) {
      return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><p>Seite</p>" });
    }
    return route.fulfill({ status: 200, contentType: "image/png", body: PNG });
  });
}

function quest(modules: unknown[], intro: Record<string, unknown> = { text: "Willkommen" }) {
  return {
    version: 1,
    id: QUEST_ID,
    name: "Medien-Quest",
    lastModified: "2026-10-04T00:00:00.000Z",
    intro,
    outro: { text: "Geschafft" },
    stations: [{ id: STATION_ID, name: "Brunnen", lat: 52.5, lng: 13.4, radiusMeters: 10, modules }],
  };
}

async function seedQuest(page: Page, q: unknown, progress: false | "stations" | "intro") {
  await page.goto("/play");
  await page.evaluate(
    ({ q, progress, id, stationId }) => {
      localStorage.setItem("gq_first_visit_done", "true");
      localStorage.setItem("gq_quests", JSON.stringify([q]));
      if (progress) {
        localStorage.setItem(
          `gq_progress_${id}`,
          JSON.stringify({
            visitedStations: progress === "stations" ? [stationId] : [],
            completedStations: [],
            solvedTasks: {},
            currentScreen: progress,
            lastStationIndex: 0,
          })
        );
      }
    },
    { q, progress, id: QUEST_ID, stationId: STATION_ID }
  );
}

async function openPlayerStation(page: Page, modules: unknown[]) {
  await routeExternal(page);
  await seedQuest(page, quest(modules), "stations");
  await page.goto(`/play/${QUEST_ID}`);
  await page.getByRole("button", { name: /Brunnen.*Aufgaben fortsetzen/ }).click();
}

async function openNewModuleSheet(page: Page, type: "Bild" | "Audio" | "Video") {
  await routeExternal(page);
  await seedQuest(page, quest([]), false);
  await page.goto(`/create/${QUEST_ID}/station/${STATION_ID}`);
  await page.getByRole("button", { name: "Modul hinzufügen" }).click();
  await page.getByRole("button", { name: type, exact: true }).click();
}

const notice = (page: Page, code: string) => page.locator(`[data-notice="${code}"]`);

// ---------------------------------------------------------------------------

test.describe("PROJ-15: Player", () => {
  test("YouTube: Platzhalter ohne jede Anfrage an die Plattform, Player erst nach Tippen", async ({ page }) => {
    const requests = platformRequests(page);
    await openPlayerStation(page, [{ type: "video", url: YT_URL, caption: "Das Video" }]);

    const box = page.getByTestId("platform-video");
    await expect(box).toHaveAttribute("data-state", "placeholder");
    await expect(box).toContainText("Video von YouTube abspielen");
    await expect(box).toContainText("Daten an Google");
    await expect(page.getByText("Das Video")).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(requests.map((r) => r.url())).toEqual([]);

    await box.getByRole("button").click();
    const frame = page.locator("iframe");
    await expect(frame).toHaveAttribute("src", `https://www.youtube-nocookie.com/embed/${YT_ID}?rel=0&playsinline=1&autoplay=1&start=90`);
    const sandbox = (await frame.getAttribute("sandbox")) ?? "";
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).not.toContain("allow-top-navigation");
    await expect.poll(() => requests.some((r) => r.url().startsWith("https://www.youtube-nocookie.com/embed/"))).toBe(true);
  });

  test("Vimeo: zwei Videos — Tippen lädt nur das eine", async ({ page }) => {
    await openPlayerStation(page, [
      { type: "video", url: VIMEO_URL },
      { type: "video", url: `https://youtu.be/${YT_ID}` },
    ]);
    const boxes = page.getByTestId("platform-video");
    await expect(boxes).toHaveCount(2);
    await boxes.nth(0).getByRole("button").click();
    await expect(boxes.nth(0)).toHaveAttribute("data-state", "loaded");
    await expect(boxes.nth(0).locator("iframe")).toHaveAttribute(
      "src",
      "https://player.vimeo.com/video/123456789?dnt=1&autoplay=1&playsinline=1&h=abcdef1234"
    );
    await expect(boxes.nth(1)).toHaveAttribute("data-state", "placeholder");
  });

  test("Platzhalter: 16:9, Tap-Ziel ≥ 44 px, per Tastatur auslösbar", async ({ page }) => {
    await openPlayerStation(page, [{ type: "video", url: YT_URL }]);
    const box = page.getByTestId("platform-video");
    const rect = (await box.boundingBox())!;
    expect(Math.abs(rect.width / rect.height - 16 / 9)).toBeLessThan(0.02);
    const button = (await box.getByRole("button").boundingBox())!;
    expect(button.height).toBeGreaterThanOrEqual(44);

    await box.getByRole("button").focus();
    await page.keyboard.press("Enter");
    await expect(box).toHaveAttribute("data-state", "loaded");
    const after = (await box.boundingBox())!;
    expect(Math.abs(after.height - rect.height)).toBeLessThan(1); // kein Sprung beim Laden
  });

  test("Bild-Modul: Dropbox, Google Drive und Wikimedia werden zur Datei aufgelöst", async ({ page }) => {
    await openPlayerStation(page, [
      { type: "image", url: DROPBOX_IMG, caption: "Dropbox" },
      { type: "image", url: DRIVE_URL, caption: "Drive" },
      { type: "image", url: WIKI_IMG, caption: "Wiki" },
    ]);
    const srcs = await page.locator("img[alt]").evaluateAll((imgs) =>
      imgs.filter((i) => ["Dropbox", "Drive", "Wiki"].includes(i.getAttribute("alt") ?? "")).map((i) => (i as HTMLImageElement).src)
    );
    expect(srcs).toEqual([
      "https://www.dropbox.com/scl/fi/k3j4h5g6f7/brunnen.png?rlkey=a1b2c3d4e5&raw=1",
      `https://lh3.googleusercontent.com/d/${DRIVE_ID}=w1280`,
      "https://de.wikipedia.org/wiki/Special:FilePath/Datei:K%C3%B6lner_Dom_von_Osten.jpg?width=1280",
    ]);
    await expect(page.getByText("Bild konnte nicht geladen werden")).toHaveCount(0);
  });

  test("Audio-Modul: Wikimedia-Ogg lädt zuerst die MP3-Fassung", async ({ page }) => {
    await openPlayerStation(page, [{ type: "audio", url: WIKI_OGG }]);
    const sources = await page.locator("audio source").evaluateAll((s) => s.map((e) => e.getAttribute("src")));
    expect(sources[0]).toBe(
      "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a8/Toco_Toucan_call_(Ramphastos_toco).ogg/Toco_Toucan_call_(Ramphastos_toco).ogg.mp3"
    );
    expect(sources.at(-1)).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/File:Toco_Toucan_call_(Ramphastos_toco).ogg");
    await expect(page.getByText("Audio konnte nicht geladen werden")).toHaveCount(0);
  });

  test("Audio-Modul: Google-Drive-Audio zeigt den Fehlerzustand, ohne Drive anzufragen", async ({ page }) => {
    const drive: string[] = [];
    page.on("request", (r) => {
      if (/google/.test(new URL(r.url()).hostname)) drive.push(r.url());
    });
    await openPlayerStation(page, [{ type: "audio", url: DRIVE_URL }]);
    await expect(page.getByText("Audio konnte nicht geladen werden")).toBeVisible();
    expect(drive).toEqual([]);
  });

  test("Audio-Modul: scheitern alle Quellen, erscheint der Fehlerzustand", async ({ page }) => {
    // .test liegt außerhalb von routeExternal — sonst gewänne dessen (später registrierte) Route
    await page.route("https://ton.gq-test.test/**", (r) => r.fulfill({ status: 404, body: "" }));
    await openPlayerStation(page, [{ type: "audio", url: "https://ton.gq-test.test/weg.mp3" }]);
    await expect(page.getByText("Audio konnte nicht geladen werden")).toBeVisible();
  });

  test("Unbekannte Adresse verhält sich wie bisher", async ({ page }) => {
    await openPlayerStation(page, [{ type: "image", url: "https://bilder.gq-test.example/a.png", caption: "Direkt" }]);
    await expect(page.getByAltText("Direkt")).toHaveAttribute("src", "https://bilder.gq-test.example/a.png");
  });

  test("Intro-Bild aus Dropbox wird umgewandelt", async ({ page, context }) => {
    // Das Intro folgt auf den ersten GPS-Fix; mit erteilter Freigabe kommt er sofort
    await context.grantPermissions(["geolocation"]);
    await context.setGeolocation({ latitude: 52.4, longitude: 13.3 });
    await routeExternal(page);
    await seedQuest(page, quest([{ type: "text", content: "x" }], { text: "Hallo", mediaUrl: DROPBOX_IMG, mediaType: "image" }), false);
    await page.goto(`/play/${QUEST_ID}`);
    await expect(page.getByRole("button", { name: /Los geht/i })).toBeVisible();
    await expect(page.locator('img[src*="dropbox.com"]')).toHaveAttribute(
      "src",
      "https://www.dropbox.com/scl/fi/k3j4h5g6f7/brunnen.png?rlkey=a1b2c3d4e5&raw=1"
    );
  });

  test("Manipulierte Adresse wird weder eingebettet noch umgewandelt", async ({ page }) => {
    const requests = platformRequests(page);
    const evil: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("evil.example")) evil.push(r.url());
    });
    await openPlayerStation(page, [{ type: "video", url: "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ" }]);
    await expect(page.getByTestId("platform-video")).toHaveCount(0);
    await expect(page.locator("iframe")).toHaveCount(0);
    // wie jede unbekannte Adresse: unverändert als Videodatei versucht
    await expect.poll(() => evil).toContain("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ");
    expect(requests).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

test.describe("PROJ-15: Creator", () => {
  test("Video: YouTube erkannt, Plattform-Vorschau erst auf Knopfdruck, verschwindet bei neuer Adresse", async ({ page }) => {
    const requests = platformRequests(page);
    await openNewModuleSheet(page, "Video");
    await page.locator("#media-url").fill(YT_URL);

    await expect(notice(page, "youtube-recognized")).toContainText("YouTube-Video erkannt");
    await expect(page.getByTestId("media-probe")).toHaveCount(0);
    await page.waitForTimeout(800);
    expect(requests).toEqual([]);

    await page.getByRole("button", { name: "Vorschau laden" }).click();
    await expect(page.getByTestId("platform-preview").locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ/);

    await page.locator("#media-url").fill(VIMEO_URL);
    await expect(page.getByTestId("platform-preview")).toHaveCount(0);
    await expect(notice(page, "vimeo-recognized")).toBeVisible();
  });

  test("Video: YouTube-Kanal statt Video wird gewarnt", async ({ page }) => {
    await openNewModuleSheet(page, "Video");
    await page.locator("#media-url").fill("https://www.youtube.com/@kanalname");
    await expect(notice(page, "platform-not-single-video")).toContainText("spielt im Spiel nichts ab");
    await expect(page.getByRole("button", { name: "Vorschau laden" })).toHaveCount(0);
  });

  test("Audio: YouTube-Link im falschen Feld wird gewarnt", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    await page.locator("#media-url").fill(`https://youtu.be/${YT_ID}`);
    await expect(notice(page, "platform-wrong-field")).toContainText("nur im Video-Modul");
  });

  test("Audio: Google Drive wird sofort gewarnt, ohne Probe-Player", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    await page.locator("#media-url").fill(DRIVE_URL);
    await expect(notice(page, "gdrive-av-unsupported")).toContainText("Google Drive spielt Audio nicht");
    await expect(notice(page, "gdrive-av-unsupported")).toContainText("Dropbox");
    await expect(page.getByTestId("media-probe")).toHaveCount(0);
  });

  test("Bild: Google Drive erkannt, Vorschau lädt über den Bild-Server", async ({ page }) => {
    await openNewModuleSheet(page, "Bild");
    await page.locator("#media-url").fill(DRIVE_URL);
    await expect(notice(page, "gdrive-image-recognized")).toBeVisible();
    await expect(page.getByTestId("image-url-preview")).toHaveAttribute("data-status", "ok");
    await expect(page.getByTestId("image-url-preview").locator("img")).toHaveAttribute(
      "src",
      `https://lh3.googleusercontent.com/d/${DRIVE_ID}=w1280`
    );
  });

  test("Bild: Dropbox-Ordner wird gewarnt", async ({ page }) => {
    await openNewModuleSheet(page, "Bild");
    await page.locator("#media-url").fill("https://www.dropbox.com/scl/fo/k3j4h5g6f7/AAAbbb?rlkey=a1b2c3d4e5");
    await expect(notice(page, "cloud-not-a-file")).toContainText("kein Link auf eine einzelne Datei");
    await expect(page.getByTestId("image-url-preview")).toHaveCount(0);
  });

  test("Bild: nicht freigegebene Dropbox-Datei — Warnung nennt die Freigabe", async ({ page }) => {
    await openNewModuleSheet(page, "Bild");
    await page.route("https://www.dropbox.com/**", (r) =>
      r.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><p>Anmelden</p>" })
    );
    await page.locator("#media-url").fill(DROPBOX_IMG);
    await expect(page.getByTestId("image-url-preview")).toHaveAttribute("data-status", "error");
    await expect(page.getByRole("alert").filter({ hasText: "Unter dieser Adresse ist kein Bild." })).toContainText(
      "„Jeder mit dem Link“"
    );
  });

  test("Bild: Wikimedia erkannt mit Lizenz-Hinweis, Vorschau mit Web-Größe", async ({ page }) => {
    await openNewModuleSheet(page, "Bild");
    await page.locator("#media-url").fill(WIKI_IMG);
    await expect(notice(page, "wikimedia-recognized")).toContainText("Urheber und Lizenz");
    await expect(notice(page, "wikimedia-recognized")).toContainText("Bildunterschrift");
    await expect(page.getByTestId("image-url-preview").locator("img")).toHaveAttribute("src", /Special:FilePath\/Datei:.*\?width=1280$/);
  });

  test("Bild: Wikipedia-Artikel ohne Bild wird gewarnt", async ({ page }) => {
    await openNewModuleSheet(page, "Bild");
    await page.locator("#media-url").fill("https://de.wikipedia.org/wiki/K%C3%B6lner_Dom");
    await expect(notice(page, "wikimedia-not-a-file")).toContainText("Tippe im Artikel auf das Bild");
  });

  test("Audio: Probe-Player meldet eine abspielbare Datei", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    await page.locator("#media-url").fill("https://ton.gq-test.example/stille.wav");
    await expect(page.getByTestId("media-probe")).toHaveAttribute("data-status", "ok");
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("Audio: Probe warnt bei einer Webseite statt Datei — Speichern geht trotzdem", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    await page.locator("#media-url").fill("https://ton.gq-test.example/seite.htm");
    await expect(page.getByTestId("media-probe")).toHaveAttribute("data-status", "error");
    await expect(page.getByRole("alert").filter({ hasText: "kein abspielbares Audio" })).toBeVisible();
    await page.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByText("Audio-Modul").first()).toBeHidden();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules);
    expect(saved).toEqual([{ type: "audio", url: "https://ton.gq-test.example/seite.htm" }]);
  });

  test("Audio: ohne Rückmeldung keine falsche Warnung, sondern der Hinweis zum Abspielen", async ({ page }) => {
    await openNewModuleSheet(page, "Audio");
    // Server antwortet nie — wie iOS, das ohne Tippen nichts lädt
    await page.route("https://still.gq-test.example/**", () => {});
    await page.locator("#media-url").fill("https://still.gq-test.example/ton.mp3");
    await expect(page.getByTestId("media-probe")).toHaveAttribute("data-status", "unknown", { timeout: 10_000 });
    await expect(page.getByText("tippe zum Prüfen auf „Abspielen“")).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test("Quest-Dialog: Wikimedia-Intro-Bild — Lizenz-Hinweis verweist auf den Text", async ({ page }) => {
    await routeExternal(page);
    await seedQuest(page, quest([{ type: "text", content: "x" }]), false);
    await page.goto("/create");
    await page.getByRole("button", { name: "Quest-Aktionen" }).click();
    await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
    await page.locator("#intro-url").fill(WIKI_IMG);
    await expect(notice(page, "wikimedia-recognized")).toContainText("Intro- bzw. Outro-Text");
  });
});

test.describe("PROJ-15: Datenschutz", () => {
  test("/datenschutz erklärt YouTube und Vimeo", async ({ page }) => {
    await page.goto("/datenschutz");
    const section = page.locator("div").filter({ has: page.getByRole("heading", { name: "Videos von YouTube und Vimeo" }) }).last();
    await expect(section).toContainText("erst mit dem Tippen", { ignoreCase: true });
    await expect(section).toContainText("youtube-nocookie.com");
    await expect(section).toContainText("Google");
    await expect(section).toContainText("Vimeo");
  });
});
