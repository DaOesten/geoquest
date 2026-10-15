import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-13 — Refinement 12 (2026-10-15): `/about` für Eltern und Lehrkräfte.
 *
 * Deckt die Kriterien ab, die es vorher nicht gab: die Live-Demo mit den
 * echten Aufgaben-Komponenten, dass sie weder Speicher noch Standort anfasst,
 * dass die statisch vorgerenderte Seite ohne Hydration-Fehler auskommt, und
 * dass nichts aus dem Betreiber-Entwurf auf die Seite gelangt ist, was die App
 * nicht einlöst.
 */

/** Zählt Schreibzugriffe auf localStorage und jeden Aufruf der Geolocation-API. */
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __writes: string[]; __geo: number };
    w.__writes = [];
    w.__geo = 0;
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k: string, v: string) {
      w.__writes.push(k);
      return orig.call(this, k, v);
    };
    if (navigator.geolocation) {
      for (const m of ["getCurrentPosition", "watchPosition"] as const) {
        const fn = navigator.geolocation[m].bind(navigator.geolocation);
        // @ts-expect-error — Testinstrumentierung
        navigator.geolocation[m] = (...args: unknown[]) => {
          w.__geo++;
          // @ts-expect-error — Testinstrumentierung
          return fn(...args);
        };
      }
    }
  });
}

function demo(page: Page) {
  return page.locator("main section", {
    has: page.getByRole("heading", { name: "So fühlt sich eine Station an." }),
  });
}

test.describe("Live-Demo", () => {
  test("startet mit Multiple Choice und bietet drei Aufgabentypen", async ({ page }) => {
    await page.goto("/about");
    const d = demo(page);

    await expect(d.getByRole("tab")).toHaveCount(3);
    await expect(d.getByRole("tab", { name: "Multiple Choice" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(d.getByText("Welches Tier kann seinen Kopf fast ganz nach hinten drehen?")).toBeVisible();
    await expect(d.getByRole("radio")).toHaveCount(3);
  });

  test("Multiple Choice: falsch gibt dieselbe Rückmeldung wie beim Spielen, richtig löst", async ({
    page,
  }) => {
    await page.goto("/about");
    const d = demo(page);

    await d.getByText("Igel").click();
    await d.getByRole("button", { name: "Prüfen" }).click();
    await expect(d.getByText(/Leider falsch/)).toBeVisible();

    await d.getByText("Eule").click();
    await d.getByRole("button", { name: "Prüfen" }).click();
    await expect(d.getByText("Richtig")).toBeVisible();
  });

  test("Code: die richtige Zahl löst die Aufgabe", async ({ page }) => {
    await page.goto("/about");
    const d = demo(page);

    await d.getByRole("tab", { name: "Code" }).click();
    await expect(d.getByText(/Zähle die Beine einer Spinne/)).toBeVisible();
    await d.getByPlaceholder("Deine Antwort...").fill("8");
    await d.getByRole("button", { name: "Prüfen" }).click();
    await expect(d.getByText("Richtig")).toBeVisible();
  });

  test("Sortieren: die echte Sortier-Aufgabe erscheint mit vier Elementen", async ({ page }) => {
    await page.goto("/about");
    const d = demo(page);

    await d.getByRole("tab", { name: "Sortieren" }).click();
    await expect(d.getByText(/Entwicklung des Frosches/)).toBeVisible();
    for (const item of ["Laich", "Kaulquappe", "Kaulquappe mit Beinen", "Frosch"]) {
      await expect(d.getByText(item, { exact: true })).toBeVisible();
    }
  });

  test("ein gelöster Typ bleibt beim Zurückschalten gelöst", async ({ page }) => {
    await page.goto("/about");
    const d = demo(page);

    await d.getByRole("tab", { name: "Code" }).click();
    await d.getByPlaceholder("Deine Antwort...").fill("8");
    await d.getByRole("button", { name: "Prüfen" }).click();
    await d.getByRole("tab", { name: "Multiple Choice" }).click();
    await d.getByRole("tab", { name: "Code" }).click();
    await expect(d.getByText("Richtig")).toBeVisible();
  });

  test("kein Schreibzugriff auf localStorage, keine Standortabfrage", async ({ page }) => {
    await instrument(page);
    await page.goto("/about");
    const d = demo(page);

    // Alle drei Typen anfassen und zwei lösen.
    await d.getByText("Eule").click();
    await d.getByRole("button", { name: "Prüfen" }).click();
    await d.getByRole("tab", { name: "Code" }).click();
    await d.getByPlaceholder("Deine Antwort...").fill("8");
    await d.getByRole("button", { name: "Prüfen" }).click();
    await d.getByRole("tab", { name: "Sortieren" }).click();
    await expect(d.getByText("Frosch", { exact: true })).toBeVisible();

    const { writes, geo } = await page.evaluate(() => {
      const w = window as unknown as { __writes: string[]; __geo: number };
      return { writes: w.__writes, geo: w.__geo };
    });
    expect(writes, "Demo schreibt in localStorage").toEqual([]);
    expect(geo, "Demo fragt den Standort ab").toBe(0);
  });

  test("keine Punkte in der Demo", async ({ page }) => {
    await page.goto("/about");
    await expect(demo(page).getByText(/Punkte|Pkt\b/)).toHaveCount(0);
  });
});

test.describe("Statisch und ohne Hydration-Fehler", () => {
  test("die erste Demo-Aufgabe steht schon im ausgelieferten HTML", async ({ request }) => {
    // Beleg, dass /about statisch vorgerendert bleibt und Crawler die
    // Demo-Frage lesen — der Start-Reiter ist deterministisch.
    const html = await (await request.get("/about")).text();
    expect(html).toContain("Welches Tier kann seinen Kopf fast ganz nach hinten drehen?");
    // Die Sortier-Aufgabe mischt im Initialisierer und darf deshalb NICHT
    // auf dem Server entstehen.
    expect(html).not.toContain("Entwicklung des Frosches");
  });

  test("weder beim Laden noch beim Umschalten ein Hydration-Fehler", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && /hydrat|did not match|server rendered/i.test(m.text())) {
        problems.push(m.text());
      }
    });
    page.on("pageerror", (e) => problems.push(e.message));

    await page.goto("/about", { waitUntil: "networkidle" });
    const d = demo(page);
    await d.getByRole("tab", { name: "Sortieren" }).click();
    await d.getByRole("tab", { name: "Code" }).click();
    await d.getByRole("tab", { name: "Multiple Choice" }).click();
    await expect(d.getByRole("radio")).toHaveCount(3);

    expect(problems).toEqual([]);
  });
});

test.describe("Ansprache und Wahrheit", () => {
  test("nichts aus dem Entwurf, was die App nicht einlöst oder was erfunden ist", async ({
    page,
  }) => {
    await page.goto("/about");
    // Inklusive eingeklappter FAQ-Antworten: textContent statt innerText.
    const text = await page.locator("main").evaluate((m) => m.textContent ?? "");

    for (const [re, warum] of [
      [/Punkte|Pkt\b/, "kein Punktesystem (PRD-Non-Goal)"],
      [/Tipp-Funktion|Tipps?\b/, "es gibt keine Tipp-Funktion"],
      [/QR-Code|per Link/, "Weitergabe läuft als Datei"],
      [/schlechte[mn]? (Mobilfunk)?netz|offline spielbar|ohne Internet/i, "kein Offline-Modus"],
      [/1\.000|gespielte Quests/, "keine erfundenen Nutzerzahlen"],
      [/\d+\s*(bis|–|-)\s*\d+\s*Minuten|halbe Stunde/, "keine Zeitangabe fürs Erstellen"],
      [/kein(e)? (Daten-)?Tracking/i, "die Seite zählt Besuche (cookiefrei)"],
      [/DSGVO/, "keine Rechtsaussage"],
      [/Junggesellen|JGA|Teambuilding/, "Betreiber-Wunsch: weglassen"],
    ] as const) {
      expect(text, warum).not.toMatch(re);
    }
  });

  test("durchgehend „du“ — kein „Sie“", async ({ page }) => {
    await page.goto("/about");
    const text = await page.locator("main").evaluate((m) => m.textContent ?? "");
    expect(text).not.toMatch(/\b(Ihre[nmrs]?|Ihnen)\b/);
    expect(text).not.toMatch(/\bSie (können|möchten|haben|wählen|tippen)\b/);
  });

  test("die sichtbare FAQ und das FAQPage-JSON-LD stimmen wörtlich überein", async ({
    page,
  }) => {
    await page.goto("/about");

    // Jede Frage aufklappen und die tatsächlich angezeigte Antwort lesen.
    // Eingeklappt hängt die Antwort nicht im DOM der Sektion — ein Vergleich
    // gegen das Seiten-HTML fände sie nur im JSON-LD selbst und bewiese nichts.
    const triggers = page.locator("main section button[aria-expanded]");
    const questions = (await triggers.allTextContents()).map((q) => q.trim());
    const answers: string[] = [];
    for (let i = 0; i < questions.length; i++) {
      const trigger = triggers.nth(i);
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const regionId = await trigger.getAttribute("aria-controls");
      answers.push(((await page.locator(`[id="${regionId}"]`).textContent()) ?? "").trim());
    }
    const jsonLd = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!
    );
    const faq = jsonLd["@graph"].find((g: { "@type": string }) => g["@type"] === "FAQPage");
    const structured = faq.mainEntity.map(
      (e: { name: string; acceptedAnswer: { text: string } }) => ({
        q: e.name,
        a: e.acceptedAnswer.text,
      })
    );

    expect(structured).toHaveLength(8);
    expect(questions).toEqual(structured.map((s: { q: string }) => s.q));
    expect(answers).toEqual(structured.map((s: { a: string }) => s.a));
  });
});

test.describe("Unverändert", () => {
  test("Kopfzeile ohne Sprungmarken, Ko-fi nur als Icon, Abschluss nur „Quest erstellen“", async ({
    page,
  }) => {
    await page.goto("/about");

    // Kopfzeile: Ko-fi-Icon und „Zur App" — keine Anker-Links.
    const headerLinks = await page
      .locator("header a")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(headerLinks.some((h) => h?.startsWith("#"))).toBe(false);
    expect(headerLinks.filter((h) => h?.includes("ko-fi"))).toHaveLength(1);

    // Im Inhalt kein weiterer Ko-fi-Button.
    await expect(page.locator("main a[href*='ko-fi']")).toHaveCount(0);

    const closing = page.locator("main section", {
      has: page.getByRole("heading", { name: /Deine Umgebung/ }),
    });
    await expect(closing.getByRole("link")).toHaveCount(1);
    await expect(closing.getByRole("link")).toHaveAttribute("href", "/create");
  });
});
