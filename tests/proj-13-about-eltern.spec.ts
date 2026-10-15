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
      // Im Production-Build meldet React Hydration-Fehler nur als
      // minifizierten Code (#418, #423, #425) — ohne das Wort „hydration".
      if (
        m.type() === "error" &&
        /hydrat|did not match|server rendered|React error #(418|423|425)/i.test(m.text())
      ) {
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

/**
 * QA Refinement 12 (2026-10-15) — über die Frontend-Phase hinaus: Spalten je
 * Breite, Tastaturbedienung der Demo, Markup in der Code-Aufgabe und ein
 * stabiles Layout, wenn der Screenshot nicht lädt.
 */
test.describe("QA: Layout je Breite", () => {
  for (const [w, benefits, audiences] of [
    [375, 1, 1],
    [768, 2, 1],
    [1440, 4, 3],
  ] as const) {
    test(`${w}px: Vorteile ${benefits}-spaltig, Zielgruppen ${audiences}-spaltig`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/about");
      const perRow = await page.evaluate(() => {
        const firstRow = (els: Element[]) => {
          const tops = els.map((e) => Math.round(e.getBoundingClientRect().top));
          return tops.filter((t) => t === tops[0]).length;
        };
        const benefits = [
          ...document.querySelectorAll("main section")[0].querySelectorAll(":scope ul > li"),
        ];
        return {
          benefits: firstRow(benefits),
          audiences: firstRow([...document.querySelectorAll("main dl > div")]),
        };
      });
      expect(perRow).toEqual({ benefits, audiences });
    });
  }
});

test.describe("QA: Tastatur", () => {
  test("Reiter per Pfeiltaste, Antwort per Pfeiltaste, Prüfen per Enter", async ({
    page,
    browserName,
  }) => {
    await page.goto("/about");
    const d = demo(page);
    const first = d.getByRole("tab", { name: "Multiple Choice" });

    await page.getByRole("button", { name: /Video ansehen/ }).focus();
    await page.keyboard.press("Tab");
    await expect(first).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(d.getByRole("tab", { name: "Code" })).toBeFocused();
    await expect(d.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(first).toHaveAttribute("aria-selected", "true");

    // Radio-Gruppe per Tab erreichen (Reiter → Panel → erste Antwort). Ein
    // programmatisches `.focus()` reicht hier nicht: Radix wählt per
    // Pfeiltaste nur nach echter Tastatur-Navigation aus — gemessen in Chrome.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(d.getByRole("radio").first()).toBeFocused();
    // Pfeiltaste bewegt den Fokus, Leertaste wählt aus. Radix wählt per
    // Pfeiltaste zwar auch direkt aus, aber erst ab ~100ms Abstand zur
    // vorigen Taste (gemessen: 50ms → nur Fokus). Unter paralleler Testlast
    // reichte selbst eine feste Pause von 150ms nicht — die Leertaste macht
    // den Test deterministisch und ist der übliche Tastaturweg.
    await page.keyboard.press("ArrowDown");
    await expect(d.getByRole("radio", { name: "Eule" })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(d.getByRole("radio", { name: "Eule" })).toBeChecked();

    // Safari auf dem Mac nimmt Buttons ohne Systemeinstellung nicht in die
    // Tab-Reihenfolge — das gilt app-weit und ist kein Befund dieser Seite.
    test.skip(browserName === "webkit", "WebKit/macOS: Tab überspringt Buttons");
    await page.keyboard.press("Tab");
    await expect(d.getByRole("button", { name: "Prüfen" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(d.getByText("Richtig")).toBeVisible();
  });
});

test.describe("QA: Sicherheit und Robustheit", () => {
  test("Markup in der Code-Aufgabe wird nicht ausgeführt", async ({ page }) => {
    let dialog = false;
    page.on("dialog", (d) => {
      dialog = true;
      d.dismiss();
    });
    await page.goto("/about");
    const d = demo(page);
    await d.getByRole("tab", { name: "Code" }).click();
    const input = d.getByPlaceholder("Deine Antwort...");
    await input.fill('<img src=x onerror="window.__pwn=1;alert(1)">');
    await input.press("Enter");
    await expect(d.getByText(/Leider falsch/)).toBeVisible();

    const res = await page.evaluate(() => ({
      pwn: (window as unknown as { __pwn?: number }).__pwn ?? null,
      injected: document.querySelectorAll("main img[src='x']").length,
    }));
    expect(res).toEqual({ pwn: null, injected: 0 });
    expect(dialog).toBe(false);
  });

  test("fällt der Screenshot aus, bleibt das Layout stehen", async ({ page }) => {
    await page.route(/about-hero-navigation/, (r) => r.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    // Kein Überlauf, der CTA bleibt über dem Screenshot. Die Höhe hält nur
    // Chrome; WebKit lässt das kaputte Bild auf ein Quadrat zusammenfallen
    // (gemessen 208 statt 354px) — unterhalb des CTA, ohne Folgen für den
    // Falz. Der leere Rahmen selbst ist als BUG-22 (Low) geführt.
    const box = (await page.locator("main img[src*='about-hero-navigation']").boundingBox())!;
    const cta = (await page.getByRole("link", { name: /Quest erstellen/i }).first().boundingBox())!;
    expect(cta.y + cta.height).toBeLessThan(box.y);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
