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

// Gezogen in Refinement 13 (2026-10-16): Der Block „Live-Demo" (drei
// Aufgaben-Reiter) ist durch die Quest-Simulation im Handy ersetzt. Seine
// Zusicherungen — echte Aufgaben, falsch/richtig wie beim Spielen, kein
// Speicher, kein Standort, keine Punkte, kein Hydration-Fehler — gelten jetzt
// für die Simulation und stehen hier.
const SIM = "iframe[title^='Simulation']";

/** Das iframe der Quest-Simulation (Refinement 13). */
function sim(page: Page) {
  return page.frameLocator(SIM);
}

async function openSimulation(page: Page) {
  await page.goto("/about");
  await page.locator(SIM).scrollIntoViewIfNeeded();
  const start = sim(page).getByRole("button", { name: /Los geht/ });
  await expect(start).toBeVisible();
  // Der Knopf steht schon im ausgelieferten HTML, bedienbar wird er erst, wenn
  // React ihn übernommen hat. Über das echte Netz (Production-Lauf vom
  // 2026-10-17) ging ein Klick in diesem Fenster verloren. Warten, bis React
  // seine internen Eigenschaften am Element gesetzt hat.
  await expect
    .poll(() =>
      start.evaluate((el) => Object.keys(el).some((k) => k.startsWith("__reactFiber")))
    )
    .toBe(true);
}

/** Läuft per „Hinlaufen" zur Station und öffnet ihre Inhalte. */
async function walkTo(page: Page, station: string) {
  const f = sim(page);
  await f.getByRole("button", { name: new RegExp(station) }).first().click();
  await f.getByRole("button", { name: "Hinlaufen" }).click();
  await expect(f.getByText("Ziel erreicht!")).toBeVisible({ timeout: 8000 });
  await f.getByRole("button", { name: /Station entdecken/i }).click();
}

/**
 * Sortiert die Frosch-Aufgabe per Maus in die richtige Reihenfolge. Gegriffen
 * wird am Handle, in kleinen Schritten — `dragTo` sendet für dnd-kit zu wenige
 * Zwischenschritte (siehe `tests/proj-4-player-modul-rendering.spec.ts`).
 */
async function solveSorting(page: Page) {
  const f = sim(page);
  const target = ["Laich", "Kaulquappe", "Kaulquappe mit Beinen", "Frosch"];
  const rows = f.locator('div:has(> button[aria-label$="verschieben"])');
  for (let pass = 0; pass < 8; pass++) {
    const order = (await rows.allInnerTexts()).map((t) => t.trim());
    const wrong = order.findIndex((t, i) => t !== target[i]);
    if (wrong === -1) break;
    const from = order.indexOf(target[wrong]);
    await rows.nth(from).scrollIntoViewIfNeeded();
    const handle = (await rows.nth(from).getByRole("button").boundingBox())!;
    const dest = (await rows.nth(wrong).boundingBox())!;
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    const dy = dest.y + dest.height / 2 - y;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(x, y + (dy * i) / 10, { steps: 2 });
      await page.waitForTimeout(15);
    }
    await page.mouse.up();
    await page.waitForTimeout(250);
  }
}

test.describe("Quest-Simulation (Refinement 13)", () => {
  test("eine komplette Quest ist im Handy spielbar — Start bis Konfetti", async ({ page }) => {
    // Dreimal „Hinlaufen" (je 3 s), drei Ankunfts-Screens und eine Sortierung —
    // der Durchlauf braucht ehrlich länger als die üblichen 30 s.
    test.setTimeout(90_000);
    await openSimulation(page);
    const f = sim(page);

    // Start
    await expect(f.getByText(/Findet die drei Geheimnisse des Waldes/)).toBeVisible();
    await f.getByRole("button", { name: /Los geht/ }).click();

    // Station 1: Text + Multiple Choice
    await walkTo(page, "Die alte Eiche");
    await expect(f.getByText(/lautloser Jäger/)).toBeVisible();
    await f.getByText("Eule").click();
    await f.getByRole("button", { name: "Prüfen" }).click();
    await f.getByRole("button", { name: /Station abschließen/i }).click();

    // Station 2: Foto + Code
    await walkTo(page, "Am Ententeich");
    await expect(f.locator("img[src*='demo-ententeich']")).toBeVisible();
    await expect(f.getByText(/Jack1956, Wikimedia Commons, CC0/)).toBeVisible();
    await f.getByPlaceholder("Deine Antwort...").fill("8");
    await f.getByRole("button", { name: "Prüfen" }).click();
    await f.getByRole("button", { name: /Station abschließen/i }).click();

    // Station 3: Text + Sortieren
    await walkTo(page, "Der Fuchsbau");
    await expect(f.getByText(/Fuchs seinen Bau/)).toBeVisible();
    await solveSorting(page);
    await f.getByRole("button", { name: "Prüfen" }).click();
    await expect(f.getByText("Richtig", { exact: true })).toBeVisible();
    await f.getByRole("button", { name: /abschließen/i }).click();

    // Ende — „Fertig" beginnt die Simulation von vorn.
    await expect(f.getByText(/alle drei Geheimnisse des Waldes gelüftet/)).toBeVisible();
    await f.getByRole("button", { name: "Fertig" }).click();
    await expect(f.getByRole("button", { name: /Los geht/ })).toBeVisible();
    await f.getByRole("button", { name: /Los geht/ }).click();
    // Fortschritt zurückgesetzt: Station 1 ist wieder die aktive.
    await expect(f.getByText(/Aktiv/i).first()).toBeVisible();
  });

  test("„Hinlaufen“ zählt in rund 3 Sekunden Meter für Meter herunter", async ({ page }) => {
    // Betreiber-Befund 2026-10-16: Bei 120 m sprang die Anzeige in großen
    // Schritten und wirkte zäh. Jetzt 60 m in ~3 s, also etwa ein Meter je
    // 50 ms — gezählt per Timer mit echter Zeit, nicht per Animations-Frame.
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await f.getByRole("button", { name: /Die alte Eiche/ }).first().click();
    // Zahl und Einheit stehen im selben Element („60m").
    await expect(f.getByText(/^60\s*m$/)).toBeVisible();

    const frame = page.frames().find((fr) => fr.url().includes("/about/simulation"))!;
    await frame.evaluate(() => {
      const w = window as unknown as { __seen: Set<string>; __near: boolean; __done: number; __t0: number };
      w.__seen = new Set();
      w.__near = false;
      w.__done = 0;
      new MutationObserver(() => {
        const el = [...document.querySelectorAll("div")].find(
          (d) => /^\d+\s*m$/.test((d.textContent ?? "").trim()) && d.children.length === 1
        );
        if (el) w.__seen.add((el.textContent ?? "").trim());
        // textContent statt innerText: innerText liefert die per CSS
        // großgeschriebene Darstellung („ZIEL ERREICHT!").
        const text = document.body.textContent ?? "";
        if (text.includes("fast da")) w.__near = true;
        if (!w.__done && text.includes("Ziel erreicht")) w.__done = Date.now();
      }).observe(document.body, { subtree: true, childList: true, characterData: true });
      w.__t0 = Date.now();
    });
    await f.getByRole("button", { name: "Hinlaufen" }).click();
    await expect(f.getByText("Ziel erreicht!")).toBeVisible({ timeout: 8000 });

    const r = await frame.evaluate(() => {
      const w = window as unknown as { __seen: Set<string>; __near: boolean; __done: number; __t0: number };
      return { ms: w.__done - w.__t0, steps: w.__seen.size, near: w.__near };
    });
    expect(r.ms, `${r.ms} ms`).toBeGreaterThan(2500);
    expect(r.ms, `${r.ms} ms`).toBeLessThan(4500);
    // Die meisten Meter erscheinen einzeln — kein Springen in großen Schritten.
    expect(r.steps, `${r.steps} von 61 Werten`).toBeGreaterThanOrEqual(40);
    expect(r.near, "„Du bist fast da“ erscheint vor der Ankunft").toBe(true);
  });

  test("Zurück in der Stationsliste führt zum Start der Simulation, nicht nach /play", async ({
    page,
  }) => {
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await expect(f.getByRole("button", { name: /Die alte Eiche/ }).first()).toBeVisible();
    await f.getByRole("button", { name: "Zurück" }).click();
    await expect(f.getByRole("button", { name: /Los geht/ })).toBeVisible();
  });

  test("nichts führt aus der Simulation heraus: kein Menü, kein Link in die App", async ({
    page,
  }) => {
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await expect(f.getByRole("button", { name: "Menü öffnen" })).toHaveCount(0);
    await expect(f.locator("a[href]")).toHaveCount(0);

    await f.getByRole("button", { name: /Die alte Eiche/ }).first().click();
    await expect(f.getByRole("button", { name: "Menü öffnen" })).toHaveCount(0);
    await expect(f.locator("a[href]")).toHaveCount(0);

    // Das iframe steht nach allen Klicks weiter auf der Simulations-Route.
    const url = await page.locator(SIM).evaluate(
      (el) => (el as HTMLIFrameElement).contentWindow!.location.pathname
    );
    expect(url).toBe("/about/simulation");
  });

  test("kein Schreibzugriff auf localStorage, keine Standortabfrage", async ({ page }) => {
    await instrument(page);
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await walkTo(page, "Die alte Eiche");
    await f.getByText("Eule").click();
    await f.getByRole("button", { name: "Prüfen" }).click();
    await f.getByRole("button", { name: /Station abschließen/i }).click();
    await expect(f.getByRole("button", { name: /Am Ententeich/ }).first()).toBeVisible();

    // Instrumentierung gilt für Seite UND iframe (`addInitScript` läuft in jedem Frame).
    const counts = await Promise.all(
      [page.mainFrame(), page.frames().find((fr) => fr.url().includes("/about/simulation"))!].map(
        (fr) =>
          fr.evaluate(() => {
            const w = window as unknown as { __writes: string[]; __geo: number };
            return { writes: w.__writes, geo: w.__geo };
          })
      )
    );
    for (const c of counts) {
      expect(c.writes, "Simulation schreibt in localStorage").toEqual([]);
      expect(c.geo, "Simulation fragt den Standort ab").toBe(0);
    }
  });

  test("keine Punkte in der Simulation", async ({ page }) => {
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await expect(f.getByText(/Punkte|Pkt\b/)).toHaveCount(0);
  });

  test("das Foto liegt auf der eigenen Domain", async ({ page }) => {
    const hosts = new Set<string>();
    page.on("request", (r) => hosts.add(new URL(r.url()).host));
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await walkTo(page, "Die alte Eiche");
    await f.getByText("Eule").click();
    await f.getByRole("button", { name: "Prüfen" }).click();
    await f.getByRole("button", { name: /Station abschließen/i }).click();
    await walkTo(page, "Am Ententeich");
    await expect(f.locator("img[src*='demo-ententeich']")).toBeVisible();
    expect([...hosts]).toEqual([new URL(page.url()).host]);
  });

  test("das Handy wird nicht verkleinert: iframe höchstens 320px, ab 375px genau 320px", async ({
    page,
  }) => {
    for (const [w, expected] of [
      [375, 320],
      [1440, 320],
    ] as const) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/about");
      const box = (await page.locator(SIM).boundingBox())!;
      expect(Math.round(box.width), `${w}px`).toBe(expected);
      const transform = await page.locator(SIM).evaluate((el) => getComputedStyle(el).transform);
      expect(transform).toBe("none");
    }
  });

  test("die Simulations-Route lässt sich nur von der eigenen Domain einbetten", async ({
    request,
  }) => {
    const res = await request.get("/about/simulation");
    expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
    const html = await res.text();
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
    // Alle anderen Seiten bleiben bei DENY.
    for (const path of ["/about", "/play", "/create"]) {
      expect((await request.get(path)).headers()["x-frame-options"], path).toBe("DENY");
    }
  });
});

test.describe("Hero: Handy mit drei Screens (Refinement 13)", () => {
  const opacity = (page: Page) =>
    page.evaluate(() =>
      ["list", "navigation", "arrival"].map((n) =>
        Number(getComputedStyle(document.querySelector(`img[src*='about-hero-${n}']`)!).opacity)
      )
    );

  test("läuft einmal durch — Liste, Kompass, Ziel erreicht — und bleibt auf dem Kompass", async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto("/about");
    await expect.poll(() => opacity(page)).toEqual([1, 0, 0]);
    await page.clock.runFor(3000);
    await expect.poll(() => opacity(page)).toEqual([0, 1, 0]);
    await page.clock.runFor(3000);
    await expect.poll(() => opacity(page)).toEqual([0, 0, 1]);
    await page.clock.runFor(3000);
    await expect.poll(() => opacity(page)).toEqual([0, 1, 0]);
    // Danach kein weiterer Wechsel.
    await page.clock.runFor(30000);
    await expect.poll(() => opacity(page)).toEqual([0, 1, 0]);
  });

  test("die drei Punkte blättern von Hand und beenden den Ablauf", async ({ page }) => {
    await page.clock.install();
    await page.goto("/about");
    const dots = page.getByRole("group", { name: "Screens der App" }).getByRole("button");
    await expect(dots).toHaveCount(3);
    for (const box of await dots.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))) {
      expect(box).toBeGreaterThanOrEqual(44);
    }
    await dots.nth(2).click();
    await expect.poll(() => opacity(page)).toEqual([0, 0, 1]);
    await expect(dots.nth(2)).toHaveAttribute("aria-pressed", "true");
    // Der automatische Ablauf greift nicht mehr ein.
    await page.clock.runFor(12000);
    await expect.poll(() => opacity(page)).toEqual([0, 0, 1]);
  });

  test("bei „Bewegung reduzieren“ steht sofort der Kompass, ohne Wechsel", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
      true
    );
    await page.clock.install();
    await page.goto("/about");
    await expect.poll(() => opacity(page)).toEqual([0, 1, 0]);
    await page.clock.runFor(12000);
    await expect.poll(() => opacity(page)).toEqual([0, 1, 0]);
  });

  test("das Handy ist als Smartphone gezeichnet: Statusleiste, kein Mockup-Bild", async ({
    page,
  }) => {
    await page.goto("/about");
    const frames = page.locator("main div.rounded-\\[44px\\]");
    // Hero und Simulation teilen sich denselben Rahmen.
    await expect(frames).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      await expect(frames.nth(i).getByText("9:41")).toBeVisible();
    }
    // Kein Gerätebild: Die einzigen Bilder im Hero-Handy sind die App-Screens.
    const srcs = await frames
      .first()
      .locator("img")
      .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
    expect(srcs.every((s) => s.includes("about-hero-"))).toBe(true);
  });
});

test.describe("Statisch und ohne Hydration-Fehler", () => {
  test("/about und /about/simulation sind statisch ausgeliefert", async ({ request }) => {
    const about = await (await request.get("/about")).text();
    // Der Hero-Kompass und das iframe stehen schon im ausgelieferten HTML.
    expect(about).toContain("about-hero-navigation");
    expect(about).toContain('src="/about/simulation"');
    const simHtml = await (await request.get("/about/simulation")).text();
    expect(simHtml).toContain("Das Waldgeheimnis");
  });

  test("weder auf der Seite noch in der Simulation ein Hydration-Fehler", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => {
      // Im Production-Build meldet React Hydration-Fehler nur als
      // minifizierten Code (#418, #423, #425) — ohne das Wort „hydration".
      // WebKit meldet sie gar nicht an Playwright (QA 2026-10-15).
      if (
        m.type() === "error" &&
        /hydrat|did not match|server rendered|React error #(418|423|425)/i.test(m.text())
      ) {
        problems.push(m.text());
      }
    });
    page.on("pageerror", (e) => problems.push(e.message));

    await openSimulation(page);
    await sim(page).getByRole("button", { name: /Los geht/ }).click();
    await expect(sim(page).getByRole("button", { name: /Die alte Eiche/ }).first()).toBeVisible();
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
      // „per Link ein(binden)" meint Medien in der Station (Refinement 15),
      // nicht die Weitergabe der Quest — nur das ist ausgeschlossen.
      [/QR-Code|per Link(?! ein)/, "Weitergabe läuft als Datei"],
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

    // Im Inhalt kein Ko-fi-Button — nur der Textlink in der Kosten-Antwort
    // der FAQ (Refinement 15). Gezogen statt gelöscht: Ein zweiter Ko-fi-Link
    // an anderer Stelle lässt diesen Test weiterhin fallen.
    // Eingeklappte Antworten stehen nicht im DOM: erst aufklappen, dann zählen.
    await page.getByRole("button", { name: /Was kostet Geo Quest/ }).click();
    const kofiInMain = page.locator("main a[href*='ko-fi']");
    await expect(kofiInMain).toHaveCount(1);
    const costRegion = page.getByRole("region", { name: /Was kostet Geo Quest/ });
    await expect(costRegion.locator("a[href*='ko-fi']")).toHaveCount(1);

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
  // Gezogen in Refinement 13: Statt durch die Reiter führt der Tastaturweg
  // jetzt durch die Simulation — Start, Station wählen, Hinlaufen, Antwort.
  test("die Simulation ist per Tastatur bedienbar", async ({ page, browserName }) => {
    // Safari auf dem Mac nimmt Buttons ohne Systemeinstellung nicht in die
    // Tab-Reihenfolge — das gilt app-weit und ist kein Befund dieser Seite.
    test.skip(browserName === "webkit", "WebKit/macOS: Tab überspringt Buttons");
    await openSimulation(page);
    const f = sim(page);

    await f.getByRole("button", { name: /Los geht/ }).focus();
    await page.keyboard.press("Enter");
    await f.getByRole("button", { name: /Die alte Eiche/ }).first().focus();
    await page.keyboard.press("Enter");
    await f.getByRole("button", { name: "Hinlaufen" }).focus();
    await page.keyboard.press("Enter");
    await expect(f.getByText("Ziel erreicht!")).toBeVisible({ timeout: 8000 });
    await f.getByRole("button", { name: /Station entdecken/i }).focus();
    await page.keyboard.press("Enter");

    // Radio-Gruppe: Pfeiltaste bewegt den Fokus, Leertaste wählt aus (siehe
    // QA 2026-10-15 — Radix wählt per Pfeiltaste erst ab ~100ms Tastenabstand).
    await f.getByRole("radio").first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(f.getByRole("radio", { name: "Eule" })).toBeFocused();
    await page.keyboard.press("Space");
    await expect(f.getByRole("radio", { name: "Eule" })).toBeChecked();
    await f.getByRole("button", { name: "Prüfen" }).focus();
    await page.keyboard.press("Enter");
    await expect(f.getByText("Richtig", { exact: true })).toBeVisible();
  });
});

test.describe("QA: Sicherheit und Robustheit", () => {
  test("Markup in der Code-Aufgabe wird nicht ausgeführt", async ({ page }) => {
    let dialog = false;
    page.on("dialog", (d) => {
      dialog = true;
      d.dismiss();
    });
    // Seit Refinement 13 in der Simulation: Station 2 trägt die Code-Aufgabe.
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await walkTo(page, "Die alte Eiche");
    await f.getByText("Eule").click();
    await f.getByRole("button", { name: "Prüfen" }).click();
    await f.getByRole("button", { name: /Station abschließen/i }).click();
    await walkTo(page, "Am Ententeich");
    const input = f.getByPlaceholder("Deine Antwort...");
    await input.fill('<img src=x onerror="window.__pwn=1;alert(1)">');
    await input.press("Enter");
    await expect(f.getByText(/Leider falsch/)).toBeVisible();

    const frame = page.frames().find((fr) => fr.url().includes("/about/simulation"))!;
    const res = await frame.evaluate(() => ({
      pwn: (window as unknown as { __pwn?: number }).__pwn ?? null,
      injected: document.querySelectorAll("img[src='x']").length,
    }));
    expect(res).toEqual({ pwn: null, injected: 0 });
    expect(dialog).toBe(false);
  });

  test("fällt der Screenshot aus, bleibt das Layout stehen", async ({ page }) => {
    await page.route(/about-hero-/, (r) => r.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    // Seit Refinement 13 hält ein Container mit festem Seitenverhältnis die
    // Höhe — auch in WebKit, wo das kaputte Bild vorher auf ein Quadrat
    // zusammenfiel (BUG-22). Kein Überlauf, der CTA bleibt über dem Handy.
    const box = (await page.locator("main img[src*='about-hero-navigation']").boundingBox())!;
    expect(box.height).toBeGreaterThan(300);
    const cta = (await page.getByRole("link", { name: /Quest erstellen/i }).first().boundingBox())!;
    expect(cta.y + cta.height).toBeLessThan(box.y);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

/**
 * QA Refinement 13 (2026-10-16) — über die Frontend-Phase hinaus: Einbettung
 * von fremder Origin, Scrollen über dem iframe, „Bewegung reduzieren" in der
 * Simulation, Tastatur für die Punkte, Kontrast der Punkte.
 */
test.describe("QA Refinement 13", () => {
  test("eine fremde Origin kann die Simulation nicht einbetten", async ({ page, baseURL }) => {
    // 127.0.0.1 und localhost sind verschiedene Origins auf demselben Server.
    test.skip(!baseURL?.includes("localhost"), "nur lokal: braucht eine zweite Origin");
    const foreign = baseURL!.replace("localhost", "127.0.0.1");
    await page.goto(`${foreign}/offline.html`);
    await page.evaluate((src) => {
      const f = document.createElement("iframe");
      f.src = src;
      document.body.appendChild(f);
    }, `${baseURL}/about/simulation`);
    await page.waitForTimeout(2000);
    // Der Browser verweigert die Darstellung — kein Start-Knopf im fremden Rahmen.
    await expect(
      page.frameLocator("iframe").getByRole("button", { name: /Los geht/ })
    ).toHaveCount(0);
  });

  test("Wischen über der Simulation scrollt die Seite weiter (Touch, Chrome)", async ({
    browser,
    browserName,
    baseURL,
  }) => {
    test.skip(browserName !== "chromium", "CDP-Touch nur in Chromium");
    const context = await browser.newContext({ viewport: { width: 412, height: 839 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto(`${baseURL}/about`);
    const iframe = page.locator(SIM);
    await iframe.scrollIntoViewIfNeeded();
    await expect(page.frameLocator(SIM).getByRole("button", { name: /Los geht/ })).toBeVisible();
    const box = (await iframe.boundingBox())!;
    const before = await page.evaluate(() => scrollY);

    const cdp = await context.newCDPSession(page);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y + 150 }] });
    for (let i = 1; i <= 12; i++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y + 150 - (300 * i) / 12 }],
      });
      await page.waitForTimeout(16);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.waitForTimeout(600);

    // Der Start-Screen hat nichts zu scrollen — der Wisch muss die Seite bewegen.
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
    await context.close();
  });

  test("bei „Bewegung reduzieren“ springt die Simulation sofort zur Ankunft, ohne sichtbares Konfetti", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openSimulation(page);
    const f = sim(page);
    await f.getByRole("button", { name: /Los geht/ }).click();
    await f.getByRole("button", { name: /Die alte Eiche/ }).first().click();
    const t0 = Date.now();
    await f.getByRole("button", { name: "Hinlaufen" }).click();
    await expect(f.getByText("Ziel erreicht!")).toBeVisible();
    expect(Date.now() - t0).toBeLessThan(1500);

    const frame = page.frames().find((fr) => fr.url().includes("/about/simulation"))!;
    expect(await frame.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    const visible = await frame.evaluate(
      () =>
        [...document.querySelectorAll(".gq-confetti-particle")].filter(
          (e) => getComputedStyle(e).display !== "none"
        ).length
    );
    expect(visible).toBe(0);
  });

  test("die drei Punkte sind per Tab erreichbar und blättern per Enter", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit/macOS: Tab überspringt Buttons");
    await page.clock.install();
    await page.goto("/about");
    await page.getByRole("link", { name: /Quest erstellen/i }).first().focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const second = page.getByRole("button", { name: "Screen 2: Kompass" });
    await expect(second).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Screen 3: Ziel erreicht" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  // BUG-24, behoben am 2026-10-17: Inaktive Punkte erreichten nur 2.8:1 gegen
  // den Seitengrund — WCAG 1.4.11 verlangt für Bedienelemente 3:1. Jetzt
  // `bg-gq-grey/70`, gemessen 4.39:1. Vom `test.fail`-Wächter zum normalen Test.
  test("inaktive Punkte erreichen mindestens 3:1 Kontrast (BUG-24)", async ({ page }) => {
    await page.goto("/about");
    const ratio = await page.evaluate(() => {
      const parse = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number);
      const lum = ([r, g, b]: number[]) => {
        const f = (c: number) => {
          c /= 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const bg = [11, 15, 18];
      const dot = document.querySelector("[aria-label='Screen 2: Kompass'] span")!;
      const c = parse(getComputedStyle(dot).backgroundColor);
      const a = c.length === 4 ? c[3] : 1;
      const mix = c.slice(0, 3).map((v, i) => v * a + bg[i] * (1 - a));
      const [x, y] = [lum(mix), lum(bg)].sort((p, q) => q - p);
      return (x + 0.05) / (y + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });
});

/**
 * Refinement 14 (2026-10-17): Die drei Schritte stehen als Kapitel unter dem
 * Video statt als eigene Sektion; zwei Vorteil-Texte im Wortlaut des Betreibers.
 */
test.describe("Refinement 14: Kapitel unter dem Video, Vorteil-Texte", () => {
  test("drei Kapitel stehen immer sichtbar direkt unter dem Video", async ({ page }) => {
    await page.goto("/about");
    const section = page.locator("main section", { has: page.locator("video") });
    const chapters = section.locator("ol > li");
    await expect(chapters).toHaveCount(3);
    for (const [i, title, body] of [
      [0, /01\s*Erstellen/, "Stationen auf der Karte setzen, Aufgaben dazu."],
      [1, /02\s*Weitergeben/, "Als Datei auf die Handys der Spieler."],
      [2, /03\s*Spielen/, "Der GPS-Pfeil führt von Station zu Station."],
    ] as const) {
      await expect(chapters.nth(i).getByRole("heading", { level: 4 })).toHaveText(title);
      await expect(chapters.nth(i).getByText(body)).toBeVisible();
    }
    // Unter dem Video, nicht darüber; ohne Bedienelemente.
    const video = (await section.locator("video").boundingBox())!;
    const first = (await chapters.first().boundingBox())!;
    expect(first.y).toBeGreaterThan(video.y + video.height);
    await expect(section.locator("ol a, ol button")).toHaveCount(0);
    // Kein Einleitungssatz über dem Video, der die Kapitel vorwegnimmt.
    await expect(page.getByText(/der ganze Weg einmal durchgespielt/)).toHaveCount(0);
    const title = (await section.getByRole("heading", { name: "So funktioniert Geo Quest." }).boundingBox())!;
    expect(video.y - (title.y + title.height), "Abstand Titel → Video").toBeGreaterThan(16);
  });

  test("ab sm stehen die Kapitel nebeneinander, auf dem Handy untereinander", async ({ page }) => {
    for (const [w, perRow] of [
      [390, 1],
      [768, 3],
      [1440, 3],
    ] as const) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/about");
      const tops = await page
        .locator("main section", { has: page.locator("video") })
        .locator("ol > li")
        .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      expect(tops.filter((t) => t === tops[0]).length, `${w}px`).toBe(perRow);
    }
  });

  test("die Vorteil-Texte stehen im Wortlaut des Betreibers", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByText(
        "Bildschirmzeit, die nach draußen führt: Eine Quest führt von Station zu Station in der echten Welt."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Jede Station kann flexibel mit Texten, Bildern, Videos und Aufgaben aufgebaut werden. Kein Programmierwissen nötig."
      )
    ).toBeVisible();
  });
});

/**
 * PROJ-13 — Refinement 15 (2026-10-17): FAQ mit Ko-fi-Link und Medien per
 * Link. Wortlaut vom Betreiber; die Quellen folgen PROJ-15 (Google Drive nur
 * mit Bildern).
 */
test.describe("FAQ: Ko-fi-Link und Medien per Link (Refinement 15)", () => {
  async function openAnswer(page: Page, question: RegExp) {
    await page.goto("/about");
    await page.getByRole("button", { name: question }).click();
    return page.getByRole("region", { name: question });
  }

  test("die Kosten-Antwort endet mit dem Kaffeekassen-Satz, Ko-fi nur einmal", async ({
    page,
  }) => {
    const region = await openAnswer(page, /Was kostet Geo Quest/);
    const text = ((await region.textContent()) ?? "").trim();
    expect(text).toBe(
      "Geo Quest ist vollständig kostenlos und werbefrei. Es gibt kein Abo, keine Testphase und keine Begrenzung der Quests. Wenn dir die App gefällt und du meine Arbeit unterstützen möchtest, freue ich mich über eine freiwillige Spende in meine digitale Kaffeekasse unter Ko-fi."
    );
    expect(text.match(/Ko-fi/g)).toHaveLength(1);
  });

  test("„Ko-fi“ ist ein Textlink in einen neuen Tab, kein Button", async ({ page }) => {
    const region = await openAnswer(page, /Was kostet Geo Quest/);
    const link = region.getByRole("link", { name: /Ko-fi.*neuen Tab/ });
    await expect(link).toHaveText("Ko-fi");
    await expect(link).toHaveAttribute("href", "https://ko-fi.com/technolomagie");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");

    // Textlink: unterstrichen, ohne Fläche, keine Bildmarke.
    const style = await link.evaluate((a) => {
      const cs = getComputedStyle(a);
      return {
        deco: cs.textDecorationLine,
        bg: cs.backgroundColor,
        display: cs.display,
        svg: a.querySelectorAll("svg, img").length,
      };
    });
    expect(style.deco).toContain("underline");
    expect(style.bg).toBe("rgba(0, 0, 0, 0)");
    expect(style.display).toBe("inline");
    expect(style.svg).toBe(0);
    await expect(region.getByRole("button")).toHaveCount(0);
  });

  test("die Medien-Antwort nennt mehrere Aufgaben, den Link-Weg und die Quellen", async ({
    page,
  }) => {
    const region = await openAnswer(page, /Was kann ich in eine Quest einbauen/);
    const text = ((await region.textContent()) ?? "").trim();
    expect(text).toBe(
      "Jede Station kann Texte, Bilder, Audio, Videos und Aufgaben (einen Code eintippen, Multiple Choice oder Elemente sortieren) beliebig kombinieren. Weiter zur nächsten Station geht es erst, wenn alle Aufgaben der Station gelöst sind. Bilder, Audio und Videos bindest du per Link ein, hochgeladen wird nichts. Das klappt mit YouTube und Vimeo, mit Teilen-Links aus Dropbox, mit Bildern aus Google Drive, mit Dateien von Wikimedia Commons und Wikipedia. Ebenso geht jeder Link, der im Browser nur das Bild, den Ton oder das Video selbst öffnet, zum Beispiel eine Adresse, die auf .jpg oder .mp3 endet."
    );
    // Google Drive ausdrücklich nur mit Bildern (PROJ-15, gemessen 2026-10-04).
    expect(text).not.toMatch(/(Audio|Videos?) (aus|von) Google Drive/);
    await expect(region.getByRole("link")).toHaveCount(0);
  });

  test("das JSON-LD trägt beide Antworten als reinen Text", async ({ page }) => {
    await page.goto("/about");
    const raw = (await page.locator('script[type="application/ld+json"]').textContent())!;
    const faq = JSON.parse(raw)["@graph"].find(
      (g: { "@type": string }) => g["@type"] === "FAQPage"
    );
    const byQ = Object.fromEntries(
      faq.mainEntity.map((e: { name: string; acceptedAnswer: { text: string } }) => [
        e.name,
        e.acceptedAnswer.text,
      ])
    );
    expect(byQ["Was kostet Geo Quest?"]).toMatch(/digitale Kaffeekasse unter Ko-fi\.$/);
    expect(byQ["Was kostet Geo Quest?"]).not.toContain("<");
    expect(byQ["Was kann ich in eine Quest einbauen?"]).toContain("mit Bildern aus Google Drive");
  });
});

/**
 * QA Refinement 15 (2026-10-17) — über die Frontend-Phase hinaus: echter
 * Klick, Tastatur, drei Breiten mit Kontrast, und dass die übrigen sieben
 * Antworten unverlinkt bleiben.
 */
test.describe("QA Refinement 15: Ko-fi-Link in der FAQ", () => {
  const lum = (rgb: number[]) => {
    const [r, g, b] = rgb.map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a: number[], b: number[]) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  for (const width of [375, 768, 1440]) {
    test(`${width}px: Link lesbar (≥ 4.5:1), kein Überlauf`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/about");
      await page.getByRole("button", { name: /Was kostet Geo Quest/ }).click();
      const link = page
        .getByRole("region", { name: /Was kostet Geo Quest/ })
        .getByRole("link");
      await expect(link).toBeVisible();
      const { fg, bg } = await link.evaluate((el) => {
        let n: Element | null = el;
        let bg = "rgba(0, 0, 0, 0)";
        while (n && bg === "rgba(0, 0, 0, 0)") {
          bg = getComputedStyle(n).backgroundColor;
          n = n.parentElement;
        }
        return { fg: getComputedStyle(el).color, bg };
      });
      const nums = (s: string) => s.match(/\d+/g)!.slice(0, 3).map(Number);
      expect(ratio(nums(fg), nums(bg))).toBeGreaterThanOrEqual(4.5);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBe(0);
    });
  }

  test("ein echter Klick öffnet Ko-fi im neuen Tab ohne Zugriff auf die App", async ({
    page,
    context,
  }) => {
    await page.goto("/about");
    const trigger = page.getByRole("button", { name: /Was kostet Geo Quest/ });
    await trigger.click();
    const link = page
      .getByRole("region", { name: /Was kostet Geo Quest/ })
      .getByRole("link");
    const [popup] = await Promise.all([context.waitForEvent("page"), link.click()]);
    // Keine URL-Prüfung des Tabs: Chrome meldet sie beim Öffnen noch nicht,
    // und Ko-fi ist aus der Testumgebung gesperrt (Fehlerseite). Das Ziel
    // prüft der Textlink-Test über `href`.
    // noopener wirkt tatsächlich, nicht nur als Attribut.
    // Der Tab wechselt von about:blank zur Zielseite — eine einzelne Abfrage
    // kann mitten in diesen Wechsel fallen (gemessen: 5 von 6 Läufen auf Chrome).
    await expect
      .poll(() => popup.evaluate(() => window.opener === null).catch(() => null))
      .toBe(true);
    // Ursprungsseite bleibt stehen, die Antwort bleibt aufgeklappt.
    expect(new URL(page.url()).pathname).toBe("/about");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    // Kein `popup.close()`: Ko-fi ist aus der Testumgebung gesperrt, und
    // WebKit hängt beim Schließen einer solchen Seite ~5 s. Der Kontext räumt auf.
  });

  test("per Tastatur erreichbar, mit Hinweis auf den neuen Tab", async ({
    page,
    browserName,
  }) => {
    await page.goto("/about");
    const trigger = page.getByRole("button", { name: /Was kostet Geo Quest/ });
    await trigger.click();
    await trigger.focus();
    // Safari springt mit Tab nicht zu Links (auch nicht zu „Zur App") —
    // Systemstandard; mit Alt+Tab schon. Gemessen 2026-10-17.
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      label: document.activeElement?.getAttribute("aria-label"),
    }));
    expect(focused).toEqual({ tag: "A", label: "Ko-fi (öffnet neuen Tab)" });
  });

  test("nur die Kosten-Antwort trägt einen Link", async ({ page }) => {
    await page.goto("/about");
    const triggers = page.locator("main section button[aria-expanded]");
    const count = await triggers.count();
    const linksPerAnswer: number[] = [];
    for (let i = 0; i < count; i++) {
      const t = triggers.nth(i);
      await t.click();
      await expect(t).toHaveAttribute("aria-expanded", "true");
      const id = await t.getAttribute("aria-controls");
      linksPerAnswer.push(await page.locator(`[id="${id}"] a`).count());
    }
    expect(linksPerAnswer).toEqual([1, 0, 0, 0, 0, 0, 0, 0]);
  });
});
