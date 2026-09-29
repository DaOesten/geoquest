import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-13, Refinement 10 — Erklärvideo als Sektion 2 auf /about.
 *
 * Kernzusicherung: Das Video kostet beim Seitenaufruf nichts (kein Byte der
 * MP4 vor dem Klick), startet nur auf Klick, bleibt im 4:5-Format, und ein
 * Ladefehler hinterlässt keine kaputte Fläche.
 */

const VIDEO = "/assets/video-geoquest-4x5-game-web.mp4";
const POSTER = "/assets/video-geoquest-4x5-game-poster.jpg";

function playButton(page: Page) {
  return page.getByRole("button", { name: /Video ansehen/ });
}

test.describe("Platzierung", () => {
  test("steht als erste Sektion nach dem Hero, vor „Jeder Ort kann ein Level sein.“", async ({
    page,
  }) => {
    await page.goto("/about");
    const firstSection = page.locator("main section").first();
    await expect(firstSection.locator("video")).toHaveCount(1);
    await expect(
      firstSection.getByRole("heading", { name: "So funktioniert Geo Quest." })
    ).toBeVisible();

    const h1 = await page.locator("h1").boundingBox();
    const video = await page.locator("main video").boundingBox();
    const next = await page
      .getByRole("heading", { name: "Jeder Ort kann ein Level sein." })
      .boundingBox();
    expect(video!.y).toBeGreaterThan(h1!.y);
    expect(next!.y).toBeGreaterThan(video!.y + video!.height);
  });
});

test.describe("Vor dem Klick", () => {
  test("lädt kein Byte der Videodatei und spielt nicht automatisch", async ({ page }) => {
    const videoRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes(".mp4")) videoRequests.push(r.url());
    });

    await page.goto("/about");
    await page.locator("main video").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    const state = await page.locator("main video").evaluate((v: HTMLVideoElement) => ({
      preload: v.getAttribute("preload"),
      autoplay: v.autoplay,
      paused: v.paused,
      controls: v.controls,
      poster: v.getAttribute("poster"),
    }));
    expect(state).toEqual({
      preload: "none",
      autoplay: false,
      paused: true,
      controls: false,
      poster: POSTER,
    });
    expect(videoRequests, "MP4 vor dem Klick angefragt").toEqual([]);
  });

  test("Poster und Startknopf sind sichtbar, Knopf ≥ 44px", async ({ page }) => {
    await page.goto("/about");
    const btn = playButton(page);
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Abspielen", () => {
  test("ein Klick startet das Video mit Bedienelementen", async ({ page }) => {
    await page.goto("/about");
    await playButton(page).click();

    await expect(playButton(page)).toHaveCount(0);
    await expect
      .poll(() => page.locator("main video").evaluate((v: HTMLVideoElement) => v.currentTime), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0);
    await expect(page.locator("main video")).toHaveAttribute("controls", "");
  });

  test("per Tastatur startbar", async ({ page }) => {
    await page.goto("/about");
    await playButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(playButton(page)).toHaveCount(0);
    await expect
      .poll(() => page.locator("main video").evaluate((v: HTMLVideoElement) => v.paused), {
        timeout: 10_000,
      })
      .toBe(false);
  });
});

test.describe("Fallback", () => {
  test("Video nicht ladbar → Poster bleibt, Hinweis statt kaputter Fläche", async ({ page }) => {
    await page.route("**/*.mp4", (route) => route.fulfill({ status: 404, body: "" }));
    await page.goto("/about");
    await playButton(page).click();

    await expect(page.getByRole("status")).toHaveText(/lässt sich gerade nicht abspielen/);
    const video = page.locator("main video");
    await expect(video).toHaveAttribute("poster", POSTER);
    await expect(video).not.toHaveAttribute("controls", "");
    const box = await video.boundingBox();
    expect(box!.height).toBeGreaterThan(200);
  });
});

test.describe("Format & Layout", () => {
  for (const [w, h] of [
    [320, 568],
    [360, 640],
    [430, 932],
    [768, 1024],
    [1440, 900],
  ] as const) {
    test(`${w}px: 4:5, kein Überlauf`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/about");
      const box = (await page.locator("main video").boundingBox())!;
      expect(box.height / box.width).toBeCloseTo(1.25, 1);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(w);

      // Einzeilig und innerhalb der Videofläche — die Tech-Schrift ist
      // breiter als sie aussieht. Gemessen wird die Zeilenzahl des Textes,
      // nicht die Knopfhöhe: `h-12` ist fest, ein Umbruch passiert INNERHALB
      // der 48px und ließ die Box unverändert.
      const lines = await playButton(page).evaluate((b) =>
        [...b.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())
          .map((n) => {
            const r = document.createRange();
            r.selectNodeContents(n);
            return r.getClientRects().length;
          })
      );
      expect(lines, "Beschriftung bricht um").toEqual([1]);
      const btn = (await playButton(page).boundingBox())!;
      expect(btn.x).toBeGreaterThanOrEqual(box.x);
      expect(btn.x + btn.width).toBeLessThanOrEqual(box.x + box.width);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  // Gezogen am 2026-09-28: Die erste Fassung (Text links, Video rechts)
  // gefiel nicht. Seitdem Kinoformat-Karte mit unscharfem Rand.
  for (const [w, h, ratio] of [
    [768, 1024, 16 / 10],
    [1440, 900, 16 / 9],
  ] as const) {
    test(`${w}px: Kinoformat — volle Breite, Video mittig, unscharfer Rand`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/about");
      const section = (await page.locator("main section").first().boundingBox())!;
      const card = (await page.locator("main figure > div").first().boundingBox())!;
      const video = (await page.locator("main video").boundingBox())!;

      expect(Math.abs(card.width - section.width)).toBeLessThanOrEqual(1);
      expect(card.width / card.height).toBeCloseTo(ratio, 1);
      expect(Math.abs(video.height - card.height)).toBeLessThanOrEqual(2);
      const offset = video.x + video.width / 2 - (card.x + card.width / 2);
      expect(Math.abs(offset), "Video nicht mittig").toBeLessThanOrEqual(1);

      const backdrop = page.locator("main figure img");
      await expect(backdrop).toBeVisible();
      await expect(backdrop).toHaveAttribute("alt", "");
      await expect(backdrop).toHaveAttribute("aria-hidden", "true");
      await expect(backdrop).toHaveAttribute("src", POSTER);
      const filter = await backdrop.evaluate((e) => getComputedStyle(e).filter);
      expect(filter).toMatch(/blur/);
    });
  }

  test("Handy: kein Rand, das Video füllt die Karte allein", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    await expect(page.locator("main figure img")).toBeHidden();
    const card = (await page.locator("main figure > div").first().boundingBox())!;
    const video = (await page.locator("main video").boundingBox())!;
    expect(Math.abs(video.width - (card.width - 2))).toBeLessThanOrEqual(1);
  });
});

test.describe("Ausgelieferte Dateien", () => {
  test("Video unter 3 MB, Poster unter 200 KB", async ({ request }) => {
    const video = await request.head(VIDEO);
    expect(video.status()).toBe(200);
    expect(Number(video.headers()["content-length"])).toBeLessThan(3 * 1024 * 1024);

    const poster = await request.get(POSTER);
    expect(poster.status()).toBe(200);
    expect((await poster.body()).length).toBeLessThan(200 * 1024);
  });
});

/**
 * QA 2026-09-28 — was die Frontend-Phase nicht abgedeckt hat.
 */
test.describe("QA: Auslieferung", () => {
  test("Range-Requests liefern 206 — ohne sie spielt iOS Safari kein Video", async ({
    request,
  }) => {
    const res = await request.get(VIDEO, { headers: { Range: "bytes=0-99" } });
    expect(res.status()).toBe(206);
    expect(res.headers()["content-range"]).toMatch(/^bytes 0-99\/\d+$/);
    expect(res.headers()["content-type"]).toBe("video/mp4");
  });
});

test.describe("QA: Kontrast", () => {
  test("die Laufzeit „0:52“ erreicht 4.5:1 auf Teal — Alpha korrekt verrechnet", async ({
    page,
  }) => {
    await page.goto("/about");
    const ratio = await playButton(page).evaluate((btn) => {
      const parse = (s: string) => s.match(/[\d.]+/g)!.map(Number);
      const bg = parse(getComputedStyle(btn).backgroundColor);
      const [r, g, b, a = 1] = parse(getComputedStyle(btn.querySelector("span")!).color);
      const fg = [r, g, b].map((c, i) => a * c + (1 - a) * bg[i]);
      const lum = (c: number[]) => {
        const [R, G, B] = c.map((x) => {
          x /= 255;
          return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      };
      const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe("QA: ohne JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("Poster und Überschrift stehen, kein Video-Byte wird geladen", async ({ page }) => {
    const mp4: string[] = [];
    page.on("request", (r) => r.url().includes(".mp4") && mp4.push(r.url()));
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "So funktioniert Geo Quest." })
    ).toBeVisible();
    await expect(page.locator("main video")).toHaveAttribute("poster", POSTER);
    expect(mp4).toEqual([]);
  });
});

test.describe("QA: offene Befunde", () => {
  // BUG-17 (Medium): `play().catch(() => setFailed(true))` wertet JEDE
  // Ablehnung als Defekt. Pausiert der Nutzer, bevor das Video angelaufen
  // ist, lehnt der Browser `play()` mit AbortError ab — das Video ist
  // gesund (`video.error === null`), die Komponente meldet trotzdem „lässt
  // sich nicht abspielen" und entfernt die Bedienelemente. Wird grün, sobald
  // behoben.
  test.fail("Pause während des Ladens ist kein Abspielfehler", async ({ page }) => {
    await page.route("**/*.mp4", async (route) => {
      await new Promise((s) => setTimeout(s, 1500));
      await route.continue();
    });
    await page.goto("/about");
    await playButton(page).click();
    await page.locator("main video").evaluate((v: HTMLVideoElement) => v.pause());
    await page.waitForTimeout(2500);

    expect(await page.locator("main video").evaluate((v: HTMLVideoElement) => v.error)).toBeNull();
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.locator("main video")).toHaveAttribute("controls", "");
  });

  // BUG-18 (Low): Der Startknopf verschwindet nach dem Drücken aus dem DOM,
  // der Fokus fällt auf <body>. Sehende Tastaturnutzer merken es kaum (der
  // nächste Tab landet auf dem Video), ein Screenreader verliert aber seine
  // Position. Wird grün, sobald der Fokus aufs Video wandert.
  test.fail("nach dem Start per Tastatur liegt der Fokus auf dem Video", async ({ page }) => {
    await page.goto("/about");
    await playButton(page).focus();
    await page.keyboard.press("Enter");
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.tagName))
      .toBe("VIDEO");
  });
});

/**
 * Refinement 11 (2026-09-29): Kante zu Kante gilt überall dasselbe Maß.
 * Vorher stapelten sich unter dem Hero drei Abstände (176px gegen 80px).
 */
test.describe("Sektionsabstand nach dem Hero", () => {
  for (const [w, h, gap] of [
    [390, 844, 48],
    [768, 1024, 80],
    [1440, 900, 80],
  ] as const) {
    test(`${w}px: Hero-Kante → Video = Video → Karte = ${gap}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/about");
      const m = await page.evaluate(() => {
        const heroCard = document.querySelector('main img[alt=""]:not(section img)')!
          .parentElement!.getBoundingClientRect();
        const [video, next] = document.querySelectorAll("main section");
        return {
          heroToVideo: video.getBoundingClientRect().top - heroCard.bottom,
          videoToNext:
            next.getBoundingClientRect().top - video.getBoundingClientRect().bottom,
        };
      });
      expect(Math.round(m.heroToVideo)).toBe(gap);
      expect(Math.round(m.videoToNext)).toBe(gap);
    });
  }
});
