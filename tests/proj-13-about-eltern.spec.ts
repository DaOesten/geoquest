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
