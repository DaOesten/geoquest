import { test, expect, type Page } from "@playwright/test";
import { ANLEITUNG_AN } from "./helpers/anleitung-schalter";

/**
 * PROJ-14 — QA zum Refinement „Prompt-Formular und Freischaltung"
 * (2026-10-24).
 *
 * Ergänzt die Frontend-Suite um das, was dort nicht abgedeckt war: die
 * Kopfzeile nach der Freischaltung (die Tests dafür lagen in der
 * Ankündigungs-Suite, die sich jetzt selbst überspringt), Tastaturweg,
 * reduzierte Bewegung, Doppelklick, Einfügen über die Höchstlänge — und je
 * einen `test.fail`-Wächter für BUG-25 bis BUG-28. Ein Wächter wird grün,
 * sobald sein Bug behoben ist, und schlägt an, falls er unbemerkt
 * wiederkehrt.
 */

test.skip(!ANLEITUNG_AN, "Anleitung ist nur angekündigt (Schalter aus)");

const erzeugen = (page: Page) => page.locator('form button[type="submit"]').click();
const box = (page: Page) => page.getByRole("region", { name: "Prompt zum Kopieren" });

test.describe("Freischaltung — Kopfzeile ohne Überlauf", () => {
  for (const w of [375, 768, 1440]) {
    test(`${w}px: Info-Kopfzeile ohne Überlauf, Link „Anleitung" ab sm sichtbar`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      for (const path of ["/about", "/anleitung", "/impressum"]) {
        await page.goto(path);
        const r = await page.evaluate(() => {
          const h = document.querySelector("header")!;
          const els = [...h.querySelectorAll("a,button")].filter(
            (e) => e.getBoundingClientRect().width > 0
          );
          const rs = els.map((e) => e.getBoundingClientRect());
          let overlap = 0;
          for (let i = 0; i < rs.length; i++)
            for (let j = i + 1; j < rs.length; j++) {
              const a = rs[i], c = rs[j];
              if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1)
                overlap++;
            }
          return {
            overflow: document.documentElement.scrollWidth - innerWidth,
            link: [...h.querySelectorAll('a[href="/anleitung"]')].some((e) => e.getBoundingClientRect().width > 0),
            minH: Math.min(...rs.map((r) => r.height)),
            overlap,
          };
        });
        expect(r.overflow, path).toBeLessThanOrEqual(0);
        expect(r.overlap, path).toBe(0);
        expect(r.minH, path).toBeGreaterThanOrEqual(44);
        expect(r.link, path).toBe(w >= 640);
      }
    });
  }

  test("320×568: der primäre CTA auf /about bleibt über dem Falz, der KI-CTA darf darunter liegen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/about");
    const primaer = await page.getByRole("link", { name: /^Quest erstellen/ }).first().boundingBox();
    expect(primaer!.y + primaer!.height).toBeLessThanOrEqual(568);
    await expect(page.getByRole("link", { name: /Mit KI erstellen/ })).toHaveAttribute("href", "/anleitung");
  });
});

test.describe("Formular — über die Spec hinaus", () => {
  test("Tab-Reihenfolge: fünf Felder, dann der Button", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit/macOS: Tab überspringt Buttons");
    await page.goto("/anleitung");
    await page.locator("#angabe-thema").focus();
    const ids: string[] = [];
    for (let i = 0; i < 6; i++) {
      ids.push(await page.evaluate(() => document.activeElement!.id || document.activeElement!.textContent!.trim()));
      await page.keyboard.press("Tab");
    }
    expect(ids).toEqual([
      "angabe-thema",
      "angabe-alter",
      "angabe-anzahl",
      "angabe-spielort",
      "angabe-wuensche",
      "Prompt erzeugen",
    ]);
  });

  test("Bewegung reduziert: die Box kommt trotzdem ins Bild", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/anleitung");
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await erzeugen(page);
    await expect(page.getByRole("button", { name: /Kopieren/ })).toBeInViewport();
  });

  test("Doppelklick erzeugt genau eine Box", async ({ page }) => {
    await page.goto("/anleitung");
    await page.locator('form button[type="submit"]').dblclick();
    await expect(box(page)).toHaveCount(1);
  });

  test("Einfügen über die Höchstlänge wird abgeschnitten", async ({ page }) => {
    await page.goto("/anleitung");
    await page.locator("#angabe-wuensche").focus();
    await page.keyboard.insertText("x".repeat(500));
    expect((await page.inputValue("#angabe-wuensche")).length).toBe(300);
  });

  test("die Startseite /anleitung liefert den Prompt nicht im HTML aus (erst nach dem Klick)", async ({ request }) => {
    const html = await (await request.get("/anleitung")).text();
    expect(html).toContain("Prompt erzeugen");
    expect(html).not.toContain("Du bist Autor:in von Schnitzeljagden");
  });
});

test.describe("Bekannte Bugs (test.fail-Wächter)", () => {
  // BUG-25 (Low): Der Hinweis „Angaben geändert" erscheint ohne Ansage —
  // er steht in keiner Live-Region, ein Screenreader erfährt nichts davon.
  test("BUG-25: der Hinweis „Angaben geändert“ wird Screenreadern angesagt", async ({ page }) => {
    test.fail();
    await page.goto("/anleitung");
    await page.fill("#angabe-thema", "Piraten");
    await erzeugen(page);
    await page.fill("#angabe-thema", "Detektiv");
    const live = await page.evaluate(() => {
      const h = [...document.querySelectorAll("form p")].find((e) => /Angaben geändert/.test(e.textContent || ""));
      for (let e: Element | null = h ?? null; e; e = e.parentElement) {
        if (e.getAttribute("aria-live") || ["status", "alert"].includes(e.getAttribute("role") || "")) return true;
      }
      return false;
    });
    expect(live).toBe(true);
  });

  // BUG-26 (Low): Zweimal hintereinander neu erzeugen setzt zweimal denselben
  // Statustext — die meisten Screenreader lesen den zweiten nicht vor.
  test("BUG-26: jedes Erzeugen ändert den Statustext", async ({ page }) => {
    test.fail();
    await page.goto("/anleitung");
    const status = page.getByRole("status").filter({ hasText: /Prompt/ });
    await erzeugen(page);
    await erzeugen(page);
    const a = await status.textContent();
    await erzeugen(page);
    const b = await status.textContent();
    expect(a).not.toBe(b);
  });

  // BUG-27 (Low): Der Kopier-Zustand der Box bezieht sich auf den alten Prompt,
  // bleibt nach dem Neuerzeugen aber stehen („Kopieren hat nicht geklappt",
  // kurz nach dem Kopieren sogar „Kopiert" für einen nicht kopierten Prompt).
  test("BUG-27: nach dem Neuerzeugen ist der Kopier-Zustand zurückgesetzt", async ({ page }) => {
    test.fail();
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.reject(new Error("blocked")) },
        configurable: true,
      });
    });
    await page.goto("/anleitung");
    await erzeugen(page);
    await page.getByRole("button", { name: /Kopieren/ }).click();
    await expect(page.getByText(/Kopieren hat nicht geklappt/)).toBeVisible();
    await page.fill("#angabe-thema", "Magie");
    await erzeugen(page);
    await expect(page.getByText(/Kopieren hat nicht geklappt/)).toHaveCount(0, { timeout: 2000 });
  });

  // BUG-28 (Low): Der Lime-Fehlerhinweis an „Anzahl" steht zusammen mit dem
  // Lime-Abschnitt „Danach — nicht vergessen" im Bild (ohne Box folgt er
  // direkt unter dem Formular). Design System: ein Lime-Element pro Screen.
  test("BUG-28: der Fehlerhinweis steht nicht mit anderem Lime im Bild", async ({ page }) => {
    test.fail();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/anleitung");
    await page.fill("#angabe-anzahl", "99");
    await erzeugen(page);
    await expect(page.getByText("Bitte eine Zahl von 1 bis 20")).toBeVisible();
    await expect(page.getByText("Danach — nicht vergessen")).not.toBeInViewport();
  });
});
