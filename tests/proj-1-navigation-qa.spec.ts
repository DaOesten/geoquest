import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-1 — QA-Nachtrag zum Navigations-Refinement (2026-09-06), geprüft 2026-09-10.
 *
 * Schließt die Regressionslücken, die `proj-1-app-shell.spec.ts` offen ließ:
 * Gruppenstruktur und Ziele des Menus, Schließverhalten (Escape / Klick
 * daneben), Fokus und `aria-expanded`, das Scroll-Verhalten beider
 * Kopfzeilen-Varianten und die Abwesenheit der Pin-Bildmarke.
 *
 * Der Trigger ist bei offenem Sheet von einem `aria-hidden`-Vorfahr verdeckt
 * (korrektes Modal-Verhalten von Radix) — deshalb greifen die Tests ihn per
 * CSS-Selektor statt per Rolle, wo sein Zustand nach dem Öffnen zählt.
 */

const QUEST = {
  id: "qa-nav-1",
  title: "QA Nav Quest",
  description: "x",
  stations: [
    { id: "st-1", name: "Station 1", lat: 52.5, lng: 13.4, radiusMeters: 30, modules: [] },
  ],
};

const BURGER = 'header button[aria-label="Menü öffnen"]';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((q) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify([q]));
  }, QUEST);
});

async function openMenu(page: Page, path: string) {
  await page.goto(path);
  await page.locator(BURGER).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test.describe("Burger-Menu — Struktur und Ziele", () => {
  test("das Menu zeigt vier Gruppen in fester Reihenfolge", async ({ page }) => {
    await openMenu(page, "/play");

    const groups = await page
      .getByRole("dialog")
      .locator("p.text-tech.uppercase")
      .allTextContents();
    expect(groups).toEqual(["App", "Info", "Rechtliches", "Unterstützen"]);
  });

  for (const [group, links] of [
    ["App", [["Play", "/play"], ["Create", "/create"]]],
    ["Info", [["Über", "/about"], ["Anleitung", "/anleitung"]]],
    ["Rechtliches", [["Impressum", "/impressum"], ["Datenschutz", "/datenschutz"]]],
  ] as const) {
    test(`Gruppe ${group} verlinkt ihre Ziele, jedes mit Icon`, async ({ page }) => {
      await openMenu(page, "/play");

      for (const [label, href] of links) {
        const link = page.getByRole("dialog").getByRole("link", { name: label, exact: true });
        await expect(link).toHaveAttribute("href", href);
        // Jeder Eintrag trägt ein Icon — für die Zielgruppe die schnellste
        // Unterscheidung der sieben Ziele.
        await expect(link.locator("svg").first()).toBeAttached();
      }
    });
  }

  test("das Burger-Menu steht auf allen App- und Info-Screens", async ({ page }) => {
    // Der Startscreen `/` ist die dokumentierte Ausnahme: er hat bewusst
    // keine Kopfzeile (siehe Open Questions und BUG-10).
    for (const path of [
      "/play",
      "/create",
      "/about",
      "/anleitung",
      "/impressum",
      "/datenschutz",
      "/create/qa-nav-1",
      "/create/qa-nav-1/station/st-1",
    ]) {
      await page.goto(path);
      await expect(page.locator(BURGER), `kein Burger auf ${path}`).toHaveCount(1);
    }
  });
});

test.describe("Burger-Menu — Verhalten", () => {
  test("ein Tap auf einen Eintrag schließt das Menu und navigiert", async ({ page }) => {
    await openMenu(page, "/play");

    await page.getByRole("dialog").getByRole("link", { name: "Create", exact: true }).click();
    await page.waitForURL("**/create");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("Escape schließt das Menu, ohne zu navigieren", async ({ page }) => {
    await openMenu(page, "/play");
    const before = page.url();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(page.url()).toBe(before);
  });

  test("ein Tap neben das Menu schließt es, ohne zu navigieren", async ({ page }) => {
    await openMenu(page, "/play");
    const before = page.url();

    await page.mouse.click(20, 400);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(page.url()).toBe(before);
  });

  test("der Auslöser meldet seinen Zustand und der Fokus wandert ins Menu", async ({
    page,
  }) => {
    await page.goto("/play");

    const state = () =>
      page.evaluate(
        (sel) => document.querySelector(sel)?.getAttribute("aria-expanded"),
        BURGER
      );

    expect(await state()).toBe("false");
    await page.locator(BURGER).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await state()).toBe("true");

    const focusInside = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return !!(d && d.contains(document.activeElement));
    });
    expect(focusInside).toBe(true);
  });
});

test.describe("Kopfzeile", () => {
  test("keine Kopfzeile trägt noch die Pin-Bildmarke", async ({ page }) => {
    for (const path of ["/play", "/create", "/create/qa-nav-1"]) {
      await page.goto(path);
      const pins = await page.evaluate(() => {
        const h = document.querySelector("header");
        return h ? h.querySelectorAll('img[src*="mark-pin"], img[alt*="Geo Quest"]').length : 0;
      });
      expect(pins, `Pin-Marke auf ${path}`).toBe(0);
    }
  });

  test("der Zurück-Pfeil führt aus jeder Ebene eine Stufe nach oben", async ({ page }) => {
    for (const [path, target] of [
      ["/play", "/"],
      ["/create", "/"],
      ["/create/qa-nav-1", "/create"],
      ["/create/qa-nav-1/station/st-1", "/create/qa-nav-1"],
    ] as const) {
      await page.goto(path);
      const back = page.locator('header a[aria-label="Zurück"]');
      await expect(back, `kein Zurück-Pfeil auf ${path}`).toHaveCount(1);
      await expect(back).toHaveAttribute("href", target);
    }
  });

  test("die Kopfzeile der App-Screens scrollt mit und bleibt danach bedienbar", async ({
    page,
  }) => {
    for (const path of ["/play", "/create"]) {
      await page.goto(path);

      const header = page.locator("header");
      expect(await header.evaluate((el) => getComputedStyle(el).position)).toBe("static");

      // Seite künstlich scrollbar machen — die Screens sind sonst zu kurz.
      await page.evaluate(() => {
        const d = document.createElement("div");
        d.style.height = "2000px";
        document.body.appendChild(d);
      });

      const top = () => header.evaluate((el) => Math.round(el.getBoundingClientRect().top));
      const before = await top();
      await page.evaluate(() => window.scrollTo(0, 600));
      expect(await top()).toBeLessThan(before);

      await page.evaluate(() => window.scrollTo(0, 0));
      expect(await top()).toBe(before);
      await expect(page.locator(BURGER)).toBeEnabled();
    }
  });

  test("die Kopfzeile der Info-Seiten bleibt sticky", async ({ page }) => {
    for (const path of ["/about", "/anleitung", "/impressum", "/datenschutz"]) {
      await page.goto(path);

      const header = page.locator("header").first();
      expect(
        await header.evaluate((el) => getComputedStyle(el).position),
        `${path} nicht sticky`
      ).toBe("sticky");

      await page.evaluate(() => window.scrollTo(0, 800));
      expect(await header.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(0);
    }
  });
});

test.describe("Sicherheit", () => {
  test("ein Markup-Payload in der Route wird nicht ausgeführt", async ({ page }) => {
    let alerts = 0;
    page.on("dialog", async (d) => {
      alerts++;
      await d.dismiss();
    });

    await page.goto("/create/%3Cimg%20src=x%20onerror=alert(1)%3E");

    expect(alerts).toBe(0);
    expect(await page.locator("img[onerror]").count()).toBe(0);
    // Die App fängt die ungültige Route mit ihrer 404-Seite ab.
    await expect(page.getByText(/nicht gefunden/i).first()).toBeVisible();
  });
});
