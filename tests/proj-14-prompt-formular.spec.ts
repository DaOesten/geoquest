import { test, expect, type Page } from "@playwright/test";
import { ANLEITUNG_AN } from "./helpers/anleitung-schalter";

/**
 * PROJ-14, Refinement 2026-10-23 — „Meine Angaben" als Formular.
 *
 * Ein test() pro Acceptance Criterion aus dem Block „Prompt-Formular" und
 * „Der neue Prompt". Die Prompt-Erzeugung selbst (Zeile für Zeile, Vorlage
 * Zeichen für Zeichen) prüft `src/lib/quest-ai-prompt.test.ts`; hier geht es
 * um das, was der Besucher auf der Seite erlebt.
 */

test.skip(!ANLEITUNG_AN, "Anleitung ist nur angekündigt (Schalter aus)");

const FELDER = [
  ["Thema", "z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum"],
  ["Alter der Kinder", "z. B. 8–10 Jahre"],
  ["Anzahl der Stationen (höchstens 20)", "z. B. 8"],
  ["Spielort", "z. B. Park"],
  ["Besondere Wünsche (optional)", "z. B. nicht zu gruselig"],
] as const;

const LEER = [
  "- Thema: [z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum]",
  "- Alter der Kinder: [z. B. 8–10 Jahre]",
  "- Anzahl der Stationen (höchstens 20): [z. B. 8]",
  "- Spielort: [z. B. Park]",
  "- Besondere Wünsche (optional): [z. B. nicht zu gruselig]",
];

const feld = (page: Page, label: string) => page.getByLabel(label, { exact: true });
const box = (page: Page) => page.getByRole("region", { name: "Prompt zum Kopieren" });
const erzeugen = (page: Page) => page.getByRole("button", { name: "Prompt erzeugen" }).click();

/** Der Block „Meine Angaben" aus dem angezeigten Prompt. */
async function angaben(page: Page): Promise<string[]> {
  const text = (await box(page).textContent()) ?? "";
  return text.split("## Meine Angaben\n")[1].split("\n\n")[0].split("\n");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/anleitung");
});

test.describe("Prompt-Formular", () => {
  test("die volle Anleitung erscheint, keine Ankündigung", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Deine Angaben" })).toBeVisible();
    await expect(page.getByText("Bald verfügbar")).toHaveCount(0);
  });

  test("fünf beschriftete Felder, leer, mit dem Beispiel als graue Vorlage", async ({ page }) => {
    for (const [label, beispiel] of FELDER) {
      const f = feld(page, label);
      await expect(f, label).toBeVisible();
      await expect(f, label).toHaveValue("");
      await expect(f, label).toHaveAttribute("placeholder", beispiel);
    }
  });

  test("vor dem Klick gibt es noch keine Prompt-Box", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Prompt erzeugen" })).toBeVisible();
    await expect(box(page)).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Kopieren/ })).toHaveCount(0);
  });

  test("alle Felder ausgefüllt → jede Zeile trägt den Wert", async ({ page }) => {
    await feld(page, "Thema").fill("Piraten");
    await feld(page, "Alter der Kinder").fill("10–12 Jahre");
    await feld(page, "Anzahl der Stationen (höchstens 20)").fill("6");
    await feld(page, "Spielort").fill("Schulhof");
    await feld(page, "Besondere Wünsche (optional)").fill("mit Seemannsknoten");
    await erzeugen(page);

    expect(await angaben(page)).toEqual([
      "- Thema: Piraten",
      "- Alter der Kinder: 10–12 Jahre",
      "- Anzahl der Stationen (höchstens 20): 6",
      "- Spielort: Schulhof",
      "- Besondere Wünsche (optional): mit Seemannsknoten",
    ]);
  });

  test("kein Feld ausgefüllt → die Vorlage, ohne Fehlermeldung", async ({ page }) => {
    await erzeugen(page);
    expect(await angaben(page)).toEqual(LEER);
    await expect(page.getByText(/Bitte eine Zahl/)).toHaveCount(0);
  });

  test("teilweise ausgefüllt → jede Zeile einzeln", async ({ page }) => {
    await feld(page, "Thema").fill("Weltraum");
    await feld(page, "Spielort").fill("Wald");
    await erzeugen(page);

    expect(await angaben(page)).toEqual([
      "- Thema: Weltraum",
      LEER[1],
      LEER[2],
      "- Spielort: Wald",
      LEER[4],
    ]);
  });

  test("nur Leerzeichen gelten als leer, Ränder werden entfernt", async ({ page }) => {
    await feld(page, "Thema").fill("   ");
    await feld(page, "Spielort").fill("  Stadtpark  ");
    await erzeugen(page);

    const zeilen = await angaben(page);
    expect(zeilen[0]).toBe(LEER[0]);
    expect(zeilen[3]).toBe("- Spielort: Stadtpark");
  });

  test("nach dem Erzeugen ist der Kopieren-Knopf im Bild", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await erzeugen(page);
    const knopf = page.getByRole("button", { name: /Kopieren/ });
    await expect(knopf).toBeInViewport();
  });

  test("Kopieren übernimmt genau den angezeigten Prompt", async ({ page, context, browserName }) => {
    test.skip(browserName === "webkit", "Clipboard-Berechtigung in WebKit nicht setzbar");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await feld(page, "Thema").fill("Magie");
    await erzeugen(page);

    await page.getByRole("button", { name: /Kopieren/ }).click();
    await expect(page.getByRole("button", { name: /Kopiert/ })).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe(await box(page).locator("pre").textContent());
    expect(clip).toContain("- Thema: Magie");
  });

  test("Feld danach geändert → Hinweis, Neuerzeugen übernimmt den neuen Stand", async ({ page }) => {
    await feld(page, "Thema").fill("Piraten");
    await erzeugen(page);
    await expect(page.getByText(/Angaben geändert/)).toHaveCount(0);

    await feld(page, "Thema").fill("Detektiv");
    await expect(page.getByText(/Angaben geändert/)).toBeVisible();
    // Die Box bleibt mit dem alten Stand stehen, nichts ändert sich still.
    expect((await angaben(page))[0]).toBe("- Thema: Piraten");

    await page.getByRole("button", { name: "Prompt neu erzeugen" }).click();
    await expect(page.getByText(/Angaben geändert/)).toHaveCount(0);
    expect((await angaben(page))[0]).toBe("- Thema: Detektiv");
  });

  test("auch „Prompt erzeugen“ erzeugt nach einer Änderung neu", async ({ page }) => {
    await erzeugen(page);
    await feld(page, "Spielort").fill("Schulgelände");
    await expect(page.getByText(/Angaben geändert/)).toBeVisible();
    await erzeugen(page);
    await expect(page.getByText(/Angaben geändert/)).toHaveCount(0);
    expect((await angaben(page))[3]).toBe("- Spielort: Schulgelände");
  });

  test("zurück zum erzeugten Stand → kein Hinweis", async ({ page }) => {
    await feld(page, "Thema").fill("Piraten");
    await erzeugen(page);
    await feld(page, "Thema").fill("Piraten ");
    await expect(page.getByText(/Angaben geändert/)).toHaveCount(0);
  });

  // Mehr als zwei Zeichen lässt das Feld gar nicht zu (maxlength) — aus
  // „8 Stationen" wird schon beim Tippen „8 ", also gültig.
  for (const falsch of ["25", "0", "ab", "8a"]) {
    test(`Anzahl „${falsch}“ → Hinweis am Feld, kein Prompt`, async ({ page }) => {
      const anzahl = feld(page, "Anzahl der Stationen (höchstens 20)");
      await anzahl.fill(falsch);
      await erzeugen(page);

      await expect(page.getByText("Bitte eine Zahl von 1 bis 20")).toBeVisible();
      await expect(anzahl).toHaveAttribute("aria-invalid", "true");
      await expect(anzahl).toBeFocused();
      await expect(box(page)).toHaveCount(0);
    });
  }

  test("nach Korrektur der Anzahl verschwindet der Hinweis und der Prompt kommt", async ({ page }) => {
    const anzahl = feld(page, "Anzahl der Stationen (höchstens 20)");
    await anzahl.fill("21");
    await erzeugen(page);
    await anzahl.fill("20");
    await expect(page.getByText("Bitte eine Zahl von 1 bis 20")).toHaveCount(0);
    await erzeugen(page);
    expect((await angaben(page))[2]).toBe("- Anzahl der Stationen (höchstens 20): 20");
  });

  test("Enter in einem einzeiligen Feld erzeugt den Prompt", async ({ page }) => {
    await feld(page, "Thema").fill("Piraten");
    await feld(page, "Thema").press("Enter");
    await expect(box(page)).toBeVisible();
  });

  test("mehrzeilige Wünsche landen in einer Zeile", async ({ page }) => {
    await feld(page, "Besondere Wünsche (optional)").fill("nicht gruselig\nmit Tieren");
    await erzeugen(page);
    expect((await angaben(page))[4]).toBe("- Besondere Wünsche (optional): nicht gruselig mit Tieren");
  });

  test("Erzeugen wird für Screenreader angesagt", async ({ page }) => {
    const status = page.getByRole("status").filter({ hasText: /Prompt/ });
    await erzeugen(page);
    await expect(status).toHaveText("Prompt erzeugt.");
    await feld(page, "Thema").fill("Weltraum");
    await erzeugen(page);
    await expect(status).toHaveText("Prompt neu erzeugt.");
  });
});

test.describe("Der neue Prompt auf der Seite", () => {
  test("enthält wörtlich Backslash-n, keinen echten Zeilenumbruch", async ({ page }) => {
    await erzeugen(page);
    await expect(box(page)).toContainText("Zeilenumbrüche im Text als \\n schreiben.");
  });

  test("ist der neue, nicht der alte Prompt", async ({ page }) => {
    await erzeugen(page);
    const text = (await box(page).textContent()) ?? "";
    expect(text.startsWith("Du bist Autor:in von Schnitzeljagden für Kinder.")).toBe(true);
    expect(text).not.toContain("Du hilfst mir");
    expect(text).not.toContain("BITTE-ERSETZEN");
    expect(text).not.toContain("[HIER EINTRAGEN");
  });
});

test.describe("Sicherheit und Datenschutz", () => {
  test("Markup in einem Feld bleibt Text", async ({ page }) => {
    let dialog = false;
    page.on("dialog", (d) => {
      dialog = true;
      void d.dismiss();
    });
    await feld(page, "Thema").fill('<img src=x onerror="window.__pwn=1"><script>window.__pwn=1</script>');
    await erzeugen(page);

    await expect(box(page)).toContainText('<img src=x onerror="window.__pwn=1">');
    expect(await box(page).locator("img, script").count()).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined();
    expect(dialog).toBe(false);
  });

  // Next.js lädt beim Scrollen sichtbare Links vorab (eigene Origin, ohne
  // Nutzereingabe). Geprüft wird deshalb, dass die Eingabe nirgends hingeht
  // und keine fremde Origin angefragt wird.
  test("nichts wird gespeichert, die Eingabe verlässt den Browser nicht", async ({ page, baseURL }) => {
    const requests: { url: string; body: string }[] = [];
    page.on("request", (r) => requests.push({ url: r.url(), body: r.postData() ?? "" }));
    const vorher = await page.evaluate(() => JSON.stringify(localStorage));

    await feld(page, "Thema").fill("Zauberkessel42");
    await erzeugen(page);
    await expect(box(page)).toBeVisible();
    await page.waitForTimeout(500);

    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(vorher);
    const origin = new URL(baseURL!).origin;
    expect(requests.filter((r) => new URL(r.url).origin !== origin)).toEqual([]);
    expect(requests.filter((r) => (r.url + r.body).includes("Zauberkessel42"))).toEqual([]);
  });

  test("Höchstlängen greifen", async ({ page }) => {
    for (const [label, max] of [
      ["Thema", 80],
      ["Alter der Kinder", 40],
      ["Anzahl der Stationen (höchstens 20)", 2],
      ["Spielort", 80],
      ["Besondere Wünsche (optional)", 300],
    ] as const) {
      await expect(feld(page, label), label).toHaveAttribute("maxlength", String(max));
    }
  });
});

test.describe("Darstellung", () => {
  for (const [w, h] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1440, 900],
  ] as const) {
    test(`${w}px: kein Überlauf, 16px Schrift, Tap-Ziele ≥ 44px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/anleitung");
      await feld(page, "Thema").fill("Piraten");
      await erzeugen(page);
      await feld(page, "Thema").fill("Weltraum");
      await expect(page.getByText(/Angaben geändert/)).toBeVisible();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      for (const [label] of FELDER) {
        // 16px verhindert das automatische Hineinzoomen von iOS Safari.
        const fs = await feld(page, label).evaluate((e) => getComputedStyle(e).fontSize);
        expect(fs, label).toBe("16px");
        const hoehe = await feld(page, label).evaluate((e) => e.getBoundingClientRect().height);
        expect(hoehe, label).toBeGreaterThanOrEqual(44);
      }
      for (const name of ["Prompt erzeugen", "Prompt neu erzeugen", "Kopieren"]) {
        const hoehe = await page
          .getByRole("button", { name, exact: name !== "Kopieren" })
          .evaluate((e) => e.getBoundingClientRect().height);
        expect(hoehe, name).toBeGreaterThanOrEqual(44);
      }
    });
  }
});
