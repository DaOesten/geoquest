import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-8, Refinement 2026-09-28: Bildvorschau mit Warnung.
 *
 * Anlass: Eine Seiten-URL (Detailseite einer Stockbild-Plattform) wurde als
 * Bild-URL angenommen und fehlte dann im Player. Die Vorschau im Creator zeigt
 * den Fehler, bevor die Quest weitergegeben wird.
 *
 * Bildanfragen gehen an einen erfundenen Host und werden per `page.route`
 * beantwortet — mit einem echten PNG bzw. mit einer HTML-Seite. So hängen die
 * Tests an keinem fremden Server.
 */

const QUEST_ID = "88888888-8888-4888-8888-888888888888";
const STATION_ID = "99999999-9999-4999-8999-999999999999";

const HOST = "https://bilder.gq-test.example";
const PNG_URL = `${HOST}/brunnen.png`;
const WIDE_URL = `${HOST}/panorama.svg`;
const PAGE_URL = `${HOST}/de/vektoren-kostenlos/lass-uns-gehen_24467363.htm#fromView=keyword`;

// 1×1 transparentes PNG
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

async function routeImages(page: Page) {
  await page.route(`${HOST}/**`, (route) => {
    const url = route.request().url();
    if (url.endsWith(".png")) {
      return route.fulfill({ status: 200, contentType: "image/png", body: PNG_BYTES });
    }
    if (url.endsWith(".svg")) {
      return route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="200"><rect width="3000" height="200" fill="#0af"/></svg>',
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Bildseite</title><p>Hier ist ein Bild zu sehen.</p>",
    });
  });
}

function quest(modules: unknown[] = [], intro: Record<string, unknown> = { text: "Willkommen" }) {
  return {
    version: 1,
    id: QUEST_ID,
    name: "Vorschau-Quest",
    lastModified: "2026-01-01T00:00:00.000Z",
    intro,
    outro: { text: "Geschafft" },
    stations: [{ id: STATION_ID, name: "Brunnen", lat: 52.5, lng: 13.4, radiusMeters: 10, modules }],
  };
}

async function seed(page: Page, q: unknown, path: string) {
  await routeImages(page);
  await page.goto("/create");
  await page.evaluate((q) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify([q]));
  }, q);
  await page.goto(path);
}

async function openNewImageSheet(page: Page) {
  await seed(page, quest(), `/create/${QUEST_ID}/station/${STATION_ID}`);
  await page.getByRole("button", { name: "Modul hinzufügen" }).click();
  await page.getByRole("button", { name: "Bild", exact: true }).click();
}

const preview = (page: Page) => page.getByTestId("image-url-preview");
const warning = (page: Page) => page.getByRole("alert").filter({ hasText: "Unter dieser Adresse ist kein Bild." });

test.describe("PROJ-8: Bildvorschau im Creator", () => {
  test.describe("Bild-Modul", () => {
    test("zeigt eine Vorschau, wenn die Adresse ein Bild ist", async ({ page }) => {
      await openNewImageSheet(page);
      await page.locator("#media-url").fill(PNG_URL);
      await expect(preview(page)).toHaveAttribute("data-status", "ok");
      await expect(preview(page).locator("img")).toHaveAttribute("src", PNG_URL);
      await expect(warning(page)).toHaveCount(0);
    });

    test("warnt mit Anleitung bei einer Webseiten-Adresse — und speichert trotzdem", async ({ page }) => {
      await openNewImageSheet(page);
      await page.locator("#media-url").fill(PAGE_URL);
      await expect(warning(page)).toBeVisible();
      await expect(warning(page)).toContainText("Bildadresse kopieren");

      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.locator("#media-url")).toBeHidden();
      const saved = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].modules[0]
      );
      expect(saved).toMatchObject({ type: "image", url: PAGE_URL });
    });

    test("prüft ein bestehendes Modul sofort beim Öffnen", async ({ page }) => {
      await seed(page, quest([{ type: "image", url: PAGE_URL }]), `/create/${QUEST_ID}/station/${STATION_ID}`);
      await page.locator("ul li").first().click();
      await expect(page.getByText("Bild-Modul bearbeiten")).toBeVisible();
      await expect(warning(page)).toBeVisible();
    });

    test("wechselt beim Korrigieren der Adresse von Warnung zu Vorschau", async ({ page }) => {
      await openNewImageSheet(page);
      await page.locator("#media-url").fill(PAGE_URL);
      await expect(warning(page)).toBeVisible();

      await page.locator("#media-url").fill(PNG_URL);
      await expect(warning(page)).toHaveCount(0);
      await expect(preview(page)).toHaveAttribute("data-status", "ok");
    });

    test("zeigt bei leerem Feld und ohne https:// weder Vorschau noch Warnung", async ({ page }) => {
      await openNewImageSheet(page);
      await expect(preview(page)).toHaveCount(0);
      await page.locator("#media-url").fill("http://bilder.gq-test.example/brunnen.png");
      await page.waitForTimeout(700);
      await expect(preview(page)).toHaveCount(0);
      await expect(warning(page)).toHaveCount(0);
    });

    test("Audio- und Video-Module bekommen keine Bildvorschau", async ({ page }) => {
      await seed(page, quest(), `/create/${QUEST_ID}/station/${STATION_ID}`);
      await page.getByRole("button", { name: "Modul hinzufügen" }).click();
      await page.getByRole("button", { name: "Audio", exact: true }).click();
      await page.locator("#media-url").fill(PAGE_URL);
      await page.waitForTimeout(700);
      await expect(preview(page)).toHaveCount(0);
    });

    test("die Modul-Liste trägt keinen zusätzlichen Warnhinweis für nicht ladbare Bilder", async ({ page }) => {
      await seed(page, quest([{ type: "image", url: PAGE_URL }]), `/create/${QUEST_ID}/station/${STATION_ID}`);
      const item = page.locator("ul li").first();
      await expect(item).toBeVisible();
      await expect(item).not.toContainText("kein Bild");
      await expect(page.getByTestId("image-url-preview")).toHaveCount(0);
    });

    test("die Warnung erfüllt den Kontrast von 4.5:1 im Light Theme", async ({ page }) => {
      await openNewImageSheet(page);
      await page.locator("#media-url").fill(PAGE_URL);
      await expect(warning(page)).toBeVisible();
      const ratios = await warning(page).evaluate((el) => {
        const rgb = (s: string) => s.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number);
        const lum = ([r, g, b]: number[]) =>
          [r, g, b]
            .map((v) => v / 255)
            .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        let node: HTMLElement | null = el as HTMLElement;
        let bg = getComputedStyle(node).backgroundColor;
        while (bg === "rgba(0, 0, 0, 0)" && node.parentElement) {
          node = node.parentElement;
          bg = getComputedStyle(node).backgroundColor;
        }
        const ratio = (fg: string) => {
          const [a, b] = [lum(rgb(fg)), lum(rgb(bg))].sort((x, y) => y - x);
          return (a + 0.05) / (b + 0.05);
        };
        return [...el.querySelectorAll("h5, div")].map((n) => ratio(getComputedStyle(n).color));
      });
      for (const r of ratios) expect(r).toBeGreaterThanOrEqual(4.5);
    });

    test("ein sehr breites Bild sprengt das Sheet nicht", async ({ page }) => {
      await openNewImageSheet(page);
      await page.locator("#media-url").fill(WIDE_URL);
      await expect(preview(page)).toHaveAttribute("data-status", "ok");
      const img = await preview(page).locator("img").boundingBox();
      const field = await page.locator("#media-url").boundingBox();
      expect(img!.x + img!.width).toBeLessThanOrEqual(field!.x + field!.width + 1);
    });
  });

  test.describe("Quest-Dialog: Intro- und Outro-Bild (PROJ-6)", () => {
    test("warnt beim Intro, zeigt beim Outro die Vorschau, und speichert beides", async ({ page }) => {
      await seed(page, quest([{ type: "text", content: "Hallo" }]), "/create");
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Bearbeiten" }).click();

      await page.locator("#intro-url").fill(PAGE_URL);
      await page.locator("#outro-url").fill(PNG_URL);

      const previews = preview(page);
      await expect(previews).toHaveCount(2);
      await expect(previews.nth(0)).toHaveAttribute("data-status", "error");
      await expect(previews.nth(1)).toHaveAttribute("data-status", "ok");
      await expect(warning(page)).toHaveCount(1);

      await page.getByRole("button", { name: "Speichern" }).click();
      await expect(page.getByText("Quest gespeichert")).toBeVisible();
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("gq_quests")!)[0]);
      expect(saved.intro).toMatchObject({ mediaUrl: PAGE_URL, mediaType: "image" });
      expect(saved.outro).toMatchObject({ mediaUrl: PNG_URL, mediaType: "image" });
    });

    test("prüft ein gespeichertes Intro-Bild sofort beim Öffnen des Dialogs", async ({ page }) => {
      await seed(
        page,
        quest([{ type: "text", content: "Hallo" }], { text: "Willkommen", mediaUrl: PAGE_URL, mediaType: "image" }),
        "/create"
      );
      await page.getByRole("button", { name: "Quest-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Bearbeiten" }).click();
      await expect(page.locator("#intro-url")).toHaveValue(PAGE_URL);
      await expect(warning(page)).toBeVisible();
    });
  });
});
