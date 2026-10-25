import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-16 — Auffindbarkeit: Landingpage auf `/`, App auf `/app`,
 * „Mit KI erstellen" statt „Anleitung", robots.txt, sitemap.xml, llms.txt.
 *
 * Die bestehenden Suiten sind auf die neuen Adressen gezogen; diese Datei hält
 * fest, was es vorher nicht gab: dass `/` auch in der installierten App
 * erreichbar bleibt, die Dateien für Suchmaschinen und KI, und dass kein
 * interner Link ins Leere führt.
 */

/** Täuscht den Anzeigemodus einer installierten App vor (wie in PROJ-12). */
async function alsInstallierteApp(page: Page) {
  await page.addInitScript(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = ((q: string) =>
      q === "(display-mode: standalone)"
        ? ({
            matches: true,
            media: q,
            onchange: null,
            addEventListener() {},
            removeEventListener() {},
            addListener() {},
            removeListener() {},
            dispatchEvent: () => false,
          } as MediaQueryList)
        : orig(q)) as typeof window.matchMedia;
  });
}

async function ohneErststartDialog(page: Page) {
  await page.addInitScript(() => localStorage.setItem("gq_first_visit_done", "true"));
}

const LANDING_HEADING = /Die reale Welt/i;
const START_HEADING = "Bist du bereit";

test.describe("PROJ-16: Neue Adressen", () => {
  test("`/` zeigt die Landingpage mit Canonical auf die Startseite", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: LANDING_HEADING })).toBeVisible();
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/");
  });

  test("`/app` zeigt den Startscreen mit eigenem Titel und Canonical", async ({ page }) => {
    await ohneErststartDialog(page);
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: START_HEADING })).toBeVisible();
    await expect(page).toHaveTitle("Geo Quest — App");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(new URL(canonical!).pathname).toBe("/app");
  });

  test("`/mit-ki-erstellen` trägt Eyebrow und suchnahen Titel", async ({ page }) => {
    await page.goto("/mit-ki-erstellen");
    await expect(page).toHaveTitle(/Schnitzeljagd mit KI erstellen/);
    // Im Hauptbereich: Der gleichnamige Kopfzeilen-Link ist unter `sm` ausgeblendet.
    await expect(page.getByRole("main").getByText("Mit KI erstellen", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Prompt erzeugen/i })).toBeVisible();
  });

  for (const alt of ["/about", "/anleitung", "/about/simulation"]) {
    test(`die alte Adresse ${alt} liefert 404 (keine Weiterleitung, Betreiber-Entscheidung)`, async ({
      request,
    }) => {
      const res = await request.get(alt, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
    });
  }
});

test.describe("PROJ-16: Navigation", () => {
  test("„Zur App“ auf der Landingpage führt nach `/app`", async ({ page }) => {
    await ohneErststartDialog(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Zur App" }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: START_HEADING })).toBeVisible();
  });

  test("das Logo auf `/app` führt zur Landingpage", async ({ page }) => {
    await ohneErststartDialog(page);
    await page.goto("/app");
    await page.getByRole("link", { name: /Geo Quest — Was ist das/ }).click();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
    await expect(page.getByRole("heading", { level: 1, name: LANDING_HEADING })).toBeVisible();
  });

  for (const route of ["/play", "/create"]) {
    test(`der Zurück-Pfeil auf ${route} führt nach /app`, async ({ page }) => {
      await ohneErststartDialog(page);
      await page.goto(route);
      await page.getByRole("link", { name: "Zurück" }).first().click();
      await expect(page).toHaveURL(/\/app$/);
    });
  }

  test("„Mit KI erstellen“ steht im Menü unter „App“ direkt nach „Create“, „Anleitung“ gibt es nicht mehr", async ({
    page,
  }) => {
    await ohneErststartDialog(page);
    await page.goto("/app");
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    const dialog = page.getByRole("dialog");
    const labels = await dialog.locator("nav a").allInnerTexts();
    const clean = labels.map((l) => l.replace(/\(öffnet neuen Tab\)/, "").trim().toUpperCase());
    const create = clean.indexOf("CREATE");
    expect(create).toBeGreaterThanOrEqual(0);
    expect(clean[create + 1]).toBe("MIT KI ERSTELLEN");
    expect(clean.some((l) => l.includes("ANLEITUNG"))).toBe(false);
    await expect(dialog.getByRole("link", { name: "Mit KI erstellen" })).toHaveAttribute(
      "href",
      "/mit-ki-erstellen"
    );
    await expect(dialog.getByRole("link", { name: "Über" })).toHaveAttribute("href", "/");
  });

  test("das Aktionsmenü auf `/create` bietet „Mit KI erstellen“, auch wenn schon Quests da sind", async ({
    page,
  }) => {
    await page.goto("/create");
    await page.evaluate(() => {
      localStorage.setItem("gq_first_visit_done", "true");
      localStorage.setItem(
        "gq_quests",
        JSON.stringify([
          {
            version: 1,
            id: "16161616-1111-4aaa-8aaa-aaaaaaaaaaaa",
            name: "Vorhandene Quest",
            lastModified: "2026-10-24T10:00:00.000Z",
            intro: { text: "Hallo" },
            outro: { text: "Tschüss" },
            stations: [],
            published: false,
          },
        ])
      );
    });
    await page.reload();
    await page.getByRole("button", { name: "Quest hinzufügen" }).click();
    const link = page.getByRole("link", { name: "Mit KI erstellen" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/mit-ki-erstellen$/);
  });

  test("die Leeransicht von `/create` verlinkt auf `/mit-ki-erstellen`", async ({ page }) => {
    await ohneErststartDialog(page);
    await page.goto("/create");
    await expect(page.getByRole("link", { name: "Mit KI erstellen" })).toHaveAttribute(
      "href",
      "/mit-ki-erstellen"
    );
  });

  test("der Hero-Button „Mit KI erstellen“ auf `/` führt zur KI-Seite", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Mit KI erstellen" }).first().click();
    await expect(page).toHaveURL(/\/mit-ki-erstellen$/);
  });

  test("Erststart-Dialog erscheint auf `/app`, nicht auf der Landingpage", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    await expect(page.getByRole("heading", { name: "Willkommen bei Geo Quest" })).toHaveCount(0);
    await page.goto("/app");
    await expect(page.getByRole("heading", { name: "Willkommen bei Geo Quest" })).toBeVisible();
  });

  test("kein interner Link führt auf eine 404-Seite", async ({ page, request }) => {
    await ohneErststartDialog(page);
    const ziele = new Set<string>();
    for (const route of ["/", "/app", "/mit-ki-erstellen", "/impressum", "/datenschutz", "/play", "/create"]) {
      await page.goto(route);
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
      // Menü-Ziele stehen erst im geöffneten Sheet im DOM.
      await page.getByRole("button", { name: "Menü öffnen" }).first().click();
      const menu = await page
        .getByRole("dialog")
        .locator('a[href^="/"]')
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
      for (const h of [...hrefs, ...menu]) ziele.add(h.split("#")[0]);
    }
    expect(ziele.size).toBeGreaterThan(5);
    for (const ziel of ziele) {
      const res = await request.get(ziel);
      expect(res.status(), `${ziel} antwortet mit ${res.status()}`).toBeLessThan(400);
    }
  });
});

/**
 * Refinement 2026-10-25: Die Startweiche ist entfernt. Sie schickte die
 * installierte App von `/` nach `/app` und machte `/` damit unerreichbar,
 * sobald die App auf `/` gestartet war (Befund des Betreibers am Handy). Die
 * früheren Weichen-Tests sind gezogen: Sie prüfen jetzt, dass `/` in der
 * installierten App stehen bleibt.
 */
test.describe("PROJ-16: `/` bleibt in der installierten App erreichbar", () => {
  /** Landingpage steht und springt auch nach einer Wartezeit nicht weg. */
  async function bleibtAufLanding(page: Page) {
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
    await expect(page.getByRole("heading", { level: 1, name: LANDING_HEADING })).toBeVisible();
  }

  test("startet die installierte App auf `/`, bleibt sie auf der Landingpage", async ({ page }) => {
    await alsInstallierteApp(page);
    await ohneErststartDialog(page);
    await page.goto("/");
    await bleibtAufLanding(page);
  });

  test("Befund: Start auf `/`, „Zur App“, dann „Über“ → Landingpage bleibt", async ({ page }) => {
    await alsInstallierteApp(page);
    await ohneErststartDialog(page);
    await page.goto("/");
    await bleibtAufLanding(page);
    await page.getByRole("link", { name: "Zur App" }).click();
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: START_HEADING })).toBeVisible();
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Über" }).click();
    await bleibtAufLanding(page);
  });

  test("Start auf `/`, „Zur App“, dann Logo → Landingpage bleibt, beliebig oft", async ({ page }) => {
    await alsInstallierteApp(page);
    await ohneErststartDialog(page);
    await page.goto("/");
    for (let runde = 0; runde < 3; runde++) {
      await bleibtAufLanding(page);
      await page.getByRole("link", { name: "Zur App" }).click();
      await expect(page).toHaveURL(/\/app$/);
      await page.getByRole("link", { name: "Geo Quest — Was ist das?" }).click();
    }
    await bleibtAufLanding(page);
  });

  test("„Über“ im Menü der auf `/app` gestarteten App zeigt die Landingpage", async ({ page }) => {
    await alsInstallierteApp(page);
    await ohneErststartDialog(page);
    await page.goto("/app");
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Über" }).click();
    await bleibtAufLanding(page);
  });

  test("Neuladen der Landingpage in der installierten App bleibt auf `/`", async ({ page }) => {
    await alsInstallierteApp(page);
    await ohneErststartDialog(page);
    await page.goto("/");
    await bleibtAufLanding(page);
    await page.reload();
    await bleibtAufLanding(page);
  });

  test("im normalen Browser bleibt `/` die Landingpage", async ({ page }) => {
    await page.goto("/");
    await bleibtAufLanding(page);
  });
});

test.describe("PROJ-16: Manifest und Einbettung", () => {
  test("das Manifest startet auf `/app`, Kennung und Geltungsbereich bleiben `/`", async ({
    request,
  }) => {
    const m = await (await request.get("/manifest.webmanifest")).json();
    expect(m.start_url).toBe("/app");
    expect(m.id).toBe("/");
    expect(m.scope).toBe("/");
  });

  test("nur `/simulation` darf eingebettet werden, `/` bleibt bei DENY", async ({ request }) => {
    const sim = await request.get("/simulation");
    expect(sim.headers()["x-frame-options"]).toBe("SAMEORIGIN");
    const home = await request.get("/");
    expect(home.headers()["x-frame-options"]).toBe("DENY");
  });

  test("`/simulation` trägt weiterhin noindex", async ({ page }) => {
    await page.goto("/simulation");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });

  test("die Simulation auf `/` lädt im iframe von `/simulation`", async ({ page }) => {
    await page.goto("/");
    const frame = page.locator('iframe[src="/simulation"]');
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toBeVisible();
  });
});

test.describe("PROJ-16: Für Suchmaschinen und KI", () => {
  test("robots.txt erlaubt alles und nennt die Sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toMatch(/User-Agent: \*/i);
    expect(text).toMatch(/Allow: \//);
    expect(text).not.toMatch(/Disallow: \/\S/);
    expect(text).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/);
  });

  test("sitemap.xml listet genau die vier Inhaltsseiten mit absoluten Adressen", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(locs.sort()).toEqual(["/", "/datenschutz", "/impressum", "/mit-ki-erstellen"].sort());
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) expect(m[1]).toMatch(/^https?:\/\//);
  });

  test("llms.txt beschreibt Geo Quest und verlinkt die Seiten", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text.startsWith("# Geo Quest")).toBe(true);
    for (const stichwort of ["kostenlos", "ohne Anmeldung", "Mit KI erstellen", "Schnitzeljagd"]) {
      expect(text.toLowerCase()).toContain(stichwort.toLowerCase());
    }
    for (const pfad of ["/mit-ki-erstellen", "/app", "/impressum", "/datenschutz"]) {
      expect(text).toContain(`https://geoquest.technolomagie.de${pfad}`);
    }
    // Keine alten Adressen, keine erfundenen Nutzerzahlen.
    expect(text).not.toMatch(/\/about|\/anleitung/);
    expect(text).not.toMatch(/\d[\d.]*\+?\s*(Nutzer|Quests gespielt|Downloads)/i);
  });
});
