import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-14 — QA zum Refinement „Prompt-Formular und Freischaltung"
 * (2026-10-24).
 *
 * Ergänzt die Frontend-Suite um das, was dort nicht abgedeckt war: die
 * Kopfzeile nach der Freischaltung (die Tests dafür lagen in der
 * Ankündigungs-Suite, die sich jetzt selbst überspringt), Tastaturweg,
 * reduzierte Bewegung, Doppelklick, Einfügen über die Höchstlänge — und die
 * Bugs aus der QA: BUG-25 bis BUG-28 sind am 2026-10-24 behoben und hier
 * normale Tests.
 */


const erzeugen = (page: Page) => page.locator('form button[type="submit"]').click();
const box = (page: Page) => page.getByRole("region", { name: "Prompt zum Kopieren" });

test.describe("Freischaltung — Kopfzeile ohne Überlauf", () => {
  for (const w of [375, 768, 1440]) {
    test(`${w}px: Info-Kopfzeile ohne Überlauf, Link „Mit KI erstellen" ab sm sichtbar`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      for (const path of ["/", "/mit-ki-erstellen", "/impressum"]) {
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
            link: [...h.querySelectorAll('a[href="/mit-ki-erstellen"]')].some((e) => e.getBoundingClientRect().width > 0),
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

  test("320×568: der primäre CTA auf / bleibt über dem Falz, der KI-CTA darf darunter liegen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    const primaer = await page.getByRole("link", { name: /^Quest erstellen/ }).first().boundingBox();
    expect(primaer!.y + primaer!.height).toBeLessThanOrEqual(568);
    await expect(page.getByRole("link", { name: /Mit KI erstellen/ })).toHaveAttribute("href", "/mit-ki-erstellen");
  });
});

test.describe("Formular — über die Spec hinaus", () => {
  test("Tab-Reihenfolge: fünf Felder, dann der Button", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "WebKit/macOS: Tab überspringt Buttons");
    await page.goto("/mit-ki-erstellen");
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
    await page.goto("/mit-ki-erstellen");
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await erzeugen(page);
    await expect(page.getByRole("button", { name: /Kopieren/ })).toBeInViewport();
  });

  test("Doppelklick erzeugt genau eine Box", async ({ page }) => {
    await page.goto("/mit-ki-erstellen");
    await page.locator('form button[type="submit"]').dblclick();
    await expect(box(page)).toHaveCount(1);
  });

  test("Einfügen über die Höchstlänge wird abgeschnitten", async ({ page }) => {
    await page.goto("/mit-ki-erstellen");
    await page.locator("#angabe-wuensche").focus();
    await page.keyboard.insertText("x".repeat(500));
    expect((await page.inputValue("#angabe-wuensche")).length).toBe(300);
  });

  test("die Startseite /mit-ki-erstellen liefert den Prompt nicht im HTML aus (erst nach dem Klick)", async ({ request }) => {
    const html = await (await request.get("/mit-ki-erstellen")).text();
    expect(html).toContain("Prompt erzeugen");
    expect(html).not.toContain("Du bist Autor:in von Schnitzeljagden");
  });
});

test.describe("Bugs aus der QA vom 2026-10-24", () => {
  // BUG-25 (Low, behoben 2026-10-24): Der Hinweis „Angaben geändert" erschien
  // ohne Ansage — er stand in keiner Live-Region.
  test("BUG-25: der Hinweis „Angaben geändert“ wird Screenreadern angesagt", async ({ page }) => {
    await page.goto("/mit-ki-erstellen");
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

  test("BUG-25: die Live-Region steht schon vor dem Hinweis im DOM", async ({ page }) => {
    await page.goto("/mit-ki-erstellen");
    await page.fill("#angabe-thema", "Piraten");
    await erzeugen(page);
    // Vor der Änderung: Region da, aber leer.
    const region = page.locator('form [aria-live="polite"]');
    await expect(region).toHaveCount(1);
    await expect(region).toHaveText("");
    await page.fill("#angabe-thema", "Detektiv");
    await expect(region).toContainText("Angaben geändert");
  });

  // BUG-26 (Low, behoben 2026-10-24): Zweimal hintereinander neu erzeugen
  // setzte zweimal denselben Statustext — Screenreader lasen den zweiten
  // nicht vor.
  test("BUG-26: jedes Erzeugen ändert den Statustext", async ({ page }) => {
    await page.goto("/mit-ki-erstellen");
    const status = page.getByRole("status").filter({ hasText: /Prompt/ });
    await erzeugen(page);
    await erzeugen(page);
    const a = await status.textContent();
    await erzeugen(page);
    const b = await status.textContent();
    expect(a).not.toBe(b);
  });

  // BUG-27 (Low, behoben 2026-10-24): Der Kopier-Zustand der Box bezog sich
  // auf den alten Prompt, blieb nach dem Neuerzeugen aber stehen.
  test("BUG-27: nach dem Neuerzeugen ist ein fehlgeschlagenes Kopieren zurückgesetzt", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.reject(new Error("blocked")) },
        configurable: true,
      });
    });
    await page.goto("/mit-ki-erstellen");
    await erzeugen(page);
    await page.getByRole("button", { name: /Kopieren/ }).click();
    await expect(page.getByText(/Kopieren hat nicht geklappt/)).toBeVisible();
    await page.fill("#angabe-thema", "Magie");
    await erzeugen(page);
    await expect(page.getByText(/Kopieren hat nicht geklappt/)).toHaveCount(0, { timeout: 2000 });
  });

  test("BUG-27: ein neu erzeugter Prompt zeigt nicht „Kopiert“", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.resolve() },
        configurable: true,
      });
    });
    await page.goto("/mit-ki-erstellen");
    await erzeugen(page);
    await page.getByRole("button", { name: /Kopieren/ }).click();
    await expect(page.getByRole("button", { name: /Kopiert/ })).toBeVisible();
    // Innerhalb der 2,5 s, in denen „Kopiert" sonst stehen bliebe.
    await page.fill("#angabe-thema", "Magie");
    await erzeugen(page);
    // Kurzes Timeout: Der alte Zustand verschwindet nach 2,5 s von selbst —
    // ein langes Warten liesse den Test auch ohne Behebung bestehen.
    await expect(page.getByRole("button", { name: /Kopiert/ })).toHaveCount(0, { timeout: 500 });
    await expect(page.getByRole("button", { name: /Kopieren/ })).toBeVisible();
  });

  // BUG-28 (Low, behoben 2026-10-24): Der Fehlerhinweis an „Anzahl" war Lime
  // und stand zusammen mit dem Lime-Abschnitt „Danach — nicht vergessen" im
  // Bild. Jetzt Fehler-Rot (`destructive`) wie im Creator — lesbar und
  // deutlich von Lime verschieden.
  test("BUG-28: der Fehlerhinweis ist nicht Lime und gut lesbar", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/mit-ki-erstellen");
    await page.fill("#angabe-anzahl", "99");
    await erzeugen(page);
    const fehler = page.getByText("Bitte eine Zahl von 1 bis 20");
    await expect(fehler).toBeVisible();
    const farbe = await fehler.evaluate((e) => getComputedStyle(e).color);
    expect(farbe).not.toBe("rgb(198, 255, 0)");
    const rand = await page.locator("#angabe-anzahl").evaluate((e) => getComputedStyle(e).borderColor);
    expect(rand).not.toBe("rgb(198, 255, 0)");
    // Kontrast gegen die Formular-Karte (gemessen an den Pixeln dahinter).
    const kontrast = await page.evaluate((c) => {
      const p = (s: string) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const l = (v: number[]) => {
        const f = (x: number) => ((x /= 255) <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
        return 0.2126 * f(v[0]) + 0.7152 * f(v[1]) + 0.0722 * f(v[2]);
      };
      const karte = [12, 22, 24]; // gemessener Grund der Formular-Karte
      const a = l(p(c)), b = l(karte);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }, farbe);
    expect(kontrast).toBeGreaterThanOrEqual(4.5);
  });
});
