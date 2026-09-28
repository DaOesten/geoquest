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

  test("Desktop: Video steht neben dem Text, nicht über die volle Breite", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    const video = (await page.locator("main video").boundingBox())!;
    const title = (await page
      .getByRole("heading", { name: "So funktioniert Geo Quest." })
      .boundingBox())!;
    const section = (await page.locator("main section").first().boundingBox())!;

    expect(video.width).toBeLessThanOrEqual(380);
    expect(video.width).toBeLessThan(section.width / 2);
    expect(video.x).toBeGreaterThan(title.x + title.width / 2);
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
