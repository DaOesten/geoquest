import { test, expect, type Page } from "@playwright/test";
import { ANLEITUNG_AN } from "./helpers/anleitung-schalter";

/**
 * PROJ-13 — Landing Page (/about) und Anleitung (/anleitung).
 * Ein test() pro Acceptance Criterion aus features/PROJ-13-landing-page.md.
 */

test.describe("Seite & Navigation", () => {
  test("/about lädt eigenständig mit Hero, Sektionen und Zielgruppen", async ({ page }) => {
    await page.goto("/about");

    // Refinement 4 (2026-09-07): neue Marketing-Fassung, acht Sektionen.
    // Refinement 12 (2026-10-15): neu geordnet für Eltern und Lehrkräfte —
    // Vorteile statt Orte-Karte, Zielgruppen ohne „Für"-Präfix.
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Die reale Welt"
    );
    await expect(
      page.getByRole("heading", { name: "Gemacht für draußen." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Für wen ist Geo Quest?" })
    ).toBeVisible();
    await expect(
      page.getByRole("term").filter({ hasText: "Familien" })
    ).toBeVisible();
  });

  // PROJ-14: /anleitung folgt dem Schalter — volle Anleitung, wenn
  // freigeschaltet (seit 2026-10-23), sonst die Ankündigung.
  test("/anleitung lädt direkt im Zustand des Schalters", async ({ page }) => {
    await page.goto("/anleitung");

    if (ANLEITUNG_AN) {
      await expect(page.getByRole("heading", { name: "So geht es" })).toBeVisible();
      await expect(page.locator("main").getByText("Bald verfügbar")).toHaveCount(0);
    } else {
      await expect(page.locator("main").getByText("Bald verfügbar").first()).toBeVisible();
      await expect(page.getByText("Was dabei herauskommen wird")).toBeVisible();
      await expect(page.getByRole("heading", { name: "So geht es" })).toHaveCount(0);
    }
  });

  // PROJ-14: Der sekundäre Hero-CTA folgt dem Schalter — solange die
  // Anleitung nur angekündigt ist, wäre er eine Sackgasse.
  test("/about führt den KI-CTA genau dann, wenn die Anleitung freigeschaltet ist", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("link", { name: /Mit KI erstellen/i })).toHaveCount(ANLEITUNG_AN ? 1 : 0);
  });

  test("„Zur App\" führt zum Start-Screen", async ({ page }) => {
    // Der Erstbesuch-Hinweis liegt sonst als Overlay über dem Startscreen.
    await page.addInitScript(() => localStorage.setItem("gq_first_visit_done", "true"));
    await page.goto("/about");
    await page.getByRole("link", { name: "Zur App" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: "Bist du bereit" })).toBeVisible();
  });

  // PROJ-14: folgt wie der Hero-CTA dem Schalter. "Neue Quest erstellen"
  // bleibt in beiden Zuständen.
  test("Creator-Empty-State führt den KI-Link genau dann, wenn die Anleitung freigeschaltet ist", async ({ page }) => {
    await page.goto("/create");
    await expect(page.getByRole("link", { name: /Quest mit KI bauen/i })).toHaveCount(ANLEITUNG_AN ? 1 : 0);
    await expect(page.getByRole("button", { name: /Neue Quest erstellen/i })).toBeVisible();
  });

  test("Root-Route bleibt der unveränderte Mode-Switch aus PROJ-1", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("gq_first_visit_done", "true"));
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Bist du bereit" })).toBeVisible();
    // Beide Mode-Cards zeigen weiterhin in die App (nicht auf die neuen
    // Info-Seiten). Über href statt Accessible Name, da Titel und Beschreibung
    // im Markup ohne Trennzeichen aneinanderstoßen.
    await expect(page.locator('a[href="/play"]')).toHaveCount(1);
    await expect(page.locator('a[href="/create"]')).toHaveCount(1);
    await expect(page.locator('a[href="/play"]')).toContainText("Deine Quests");
    await expect(page.locator('a[href="/create"]')).toContainText("Quest Creator");
  });

  for (const path of ["/about", "/anleitung"]) {
    test(`${path} scrollt nicht horizontal und hat große Touch-Targets`, async ({ page }) => {
      await page.goto(path);

      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(overflows).toBe(false);

      const tooSmall = await page.evaluate(() =>
        [...document.querySelectorAll("a,button")]
          .filter((el) => {
            // Wirksames Tap-Ziel: Radio-Knöpfe der Demo-Aufgabe auf /about
            // liegen in einem <label>, die ganze Antwortzeile ist tippbar.
            const r = (el.closest("label") ?? el).getBoundingClientRect();
            return r.height > 0 && r.height < 44;
          })
          .map((el) => (el.textContent || "").trim().slice(0, 40))
      );
      expect(tooSmall).toEqual([]);
    });
  }
});

/**
 * Seit PROJ-14 Refinement 2026-10-23 steht der Prompt erst nach „Prompt
 * erzeugen" auf der Seite. Ohne Eingaben ist er die unveränderte Vorlage.
 */
async function promptErzeugen(page: Page) {
  await page.goto("/anleitung");
  await page.getByRole("button", { name: "Prompt erzeugen" }).click();
  await expect(page.locator("pre")).toBeVisible();
}

test.describe("Prompt-Vorlage", () => {
  // PROJ-14: Diese Prüfungen beschreiben die freigeschaltete Anleitung. Bei
  // umgelegtem Schalter (nur Ankündigung) gibt es nichts zu prüfen.
  test.skip(!ANLEITUNG_AN, "Anleitung ist angekündigt, nicht ausgeliefert (PROJ-14)");

  test("Prompt ist sichtbar und markierbar", async ({ page }) => {
    await promptErzeugen(page);

    const pre = page.locator("pre");
    await expect(pre).toBeVisible();
    // Kein user-select: none, sonst wäre manuelles Kopieren blockiert
    // (WebKit meldet die Eigenschaft nur unter -webkit-user-select).
    const selectable = await pre.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.userSelect || s.webkitUserSelect;
    });
    expect(selectable).not.toBe("none");
    expect((await pre.textContent())!.length).toBeGreaterThan(3000);
  });

  test("Kopieren zeigt eine Bestätigung", async ({ page, context, browserName }) => {
    test.skip(browserName === "webkit", "Clipboard-Berechtigung in WebKit nicht setzbar");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await promptErzeugen(page);

    await page.getByRole("button", { name: /Kopieren/i }).click();
    await expect(page.getByRole("button", { name: /Kopiert/i })).toBeVisible();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain("Du bist Autor:in von Schnitzeljagden");
  });

  test("blockierte Zwischenablage sperrt den Nutzer nicht aus", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.reject(new Error("blocked")) },
        configurable: true,
      });
    });
    await promptErzeugen(page);

    await page.getByRole("button", { name: /Kopieren/i }).click();

    await expect(page.getByText(/Kopieren hat nicht geklappt/i)).toBeVisible();
    await expect(page.locator("pre")).toContainText("Du bist Autor:in von Schnitzeljagden");
  });

  // Gezogen 2026-10-23: Statt „[HIER EINTRAGEN" trägt die leere Vorlage die
  // Beispiele in eckigen Klammern — die KI fragt dort nach.
  test("ohne Eingaben bleiben die Angaben als Beispiele in eckigen Klammern", async ({ page }) => {
    await promptErzeugen(page);
    const prompt = (await page.locator("pre").textContent())!;

    for (const line of [
      "- Thema: [z. B. Detektiv, Abenteuer, Magie, Piraten, Weltraum]",
      "- Alter der Kinder: [z. B. 8–10 Jahre]",
      "- Anzahl der Stationen (höchstens 20): [z. B. 8]",
      "- Spielort: [z. B. Park]",
      "- Besondere Wünsche (optional): [z. B. nicht zu gruselig]",
    ]) {
      expect(prompt).toContain(line);
    }
  });
});

test.describe("Anleitung & Erwartungsmanagement", () => {
  // PROJ-14: Diese Prüfungen beschreiben die freigeschaltete Anleitung. Bei
  // umgelegtem Schalter (nur Ankündigung) gibt es nichts zu prüfen.
  test.skip(!ANLEITUNG_AN, "Anleitung ist angekündigt, nicht ausgeliefert (PROJ-14)");

  test("Import-Schritt erklärt den Weg über die .json-Datei", async ({ page }) => {
    await page.goto("/anleitung");
    await expect(page.getByText(/Endung \.json/)).toBeVisible();
    await expect(page.getByText(/Im Creator die Datei hochladen/)).toBeVisible();
  });

  test("Koordinaten nachtragen ist als Pflichtschritt ausgewiesen", async ({ page }) => {
    await page.goto("/anleitung");
    // Seit 2026-10-24 „Stationen" statt „Ziele" — wie im Creator.
    await expect(page.getByRole("heading", { name: "Stationen auf die Karte setzen" })).toBeVisible();
    await expect(page.getByText(/führt die Quest draußen ins Nichts/)).toBeVisible();
  });

  // Gezogen 2026-10-23: Der neue Prompt erzeugt keine Medien mehr — es gibt
  // keine Platzhalter, die ersetzt werden müssten, nur einen freiwilligen Tipp.
  test("Medien sind ein freiwilliger Tipp, keine Platzhalter mehr", async ({ page }) => {
    await page.goto("/anleitung");
    await expect(page.getByRole("heading", { name: /Tipp: Bilder, Ton oder Video ergänzen/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Medien-Adressen ersetzen" })).toHaveCount(0);
    await expect(page.getByText(/BITTE-ERSETZEN/)).toHaveCount(0);
  });

  // Gezogen 2026-10-23: „Der Link zur Webseite reicht nicht" ist seit PROJ-15
  // überholt (YouTube, Dropbox, Wikimedia …).
  test("Medienquellen nennen freie Quellen und die unterstützten Links", async ({ page }) => {
    await page.goto("/anleitung");
    await expect(page.getByText(/Wikimedia Commons, Pixabay/)).toBeVisible();
    await expect(page.getByText(/Hochgeladen wird\s+nichts/)).toBeVisible();
    for (const quelle of ["YouTube", "Vimeo", "Dropbox", "Google Drive"]) {
      await expect(page.getByText(new RegExp(quelle)).first()).toBeVisible();
    }
    await expect(page.getByText(/Der Link zur Webseite reicht nicht/)).toHaveCount(0);
  });
});

test.describe("Fehlerfälle & Troubleshooting", () => {
  // PROJ-14: Diese Prüfungen beschreiben die freigeschaltete Anleitung. Bei
  // umgelegtem Schalter (nur Ankündigung) gibt es nichts zu prüfen.
  test.skip(!ANLEITUNG_AN, "Anleitung ist angekündigt, nicht ausgeliefert (PROJ-14)");

  test("Troubleshooting nennt die häufigsten Import-Ursachen", async ({ page }) => {
    await page.goto("/anleitung");

    await expect(page.getByRole("button", { name: /Die Datei wird nicht angenommen/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /ungültige Werte/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Die KI gibt keine Datei aus/ })).toBeVisible();
    // Entfallen 2026-10-23: Ohne Medien im Prompt gibt es keine erfundenen Adressen.
    await expect(page.getByRole("button", { name: /Adressen für Bilder/ })).toHaveCount(0);
  });

  test("Troubleshooting rät, die Fehlermeldung an die KI zurückzugeben", async ({ page }) => {
    await page.goto("/anleitung");

    await page.getByRole("button", { name: /Die Datei wird nicht angenommen/ }).click();
    await expect(page.getByText(/Gib der KI die Fehlermeldung zurück/)).toBeVisible();
  });
});

test.describe("Teilen & Auffindbarkeit", () => {
  for (const [path, expectedTitle] of [
    // Der OG-Titel von /about zieht seit Refinement 4 die neue Positionierung
    // nach; „Schnitzeljagd" bleibt im <title> für die Suche (dort geprüft).
    ["/about", "die reale Welt wird zum Spielfeld"],
    ["/anleitung", ANLEITUNG_AN ? "Quest mit KI erstellen — Geo Quest" : "Quest mit KI erstellen — bald verfügbar"],  // PROJ-14
  ] as const) {
    test(`${path} liefert eigene Open-Graph-Daten`, async ({ page }) => {
      await page.goto(path);

      const og = (prop: string) =>
        page.locator(`meta[property="og:${prop}"]`).getAttribute("content");

      expect(await og("title")).toContain(expectedTitle);
      expect((await og("description"))!.length).toBeGreaterThan(40);
      expect(await og("image")).toContain("/assets/urbanquest.png");
    });
  }

  test("/about trägt strukturierte Daten für Suchmaschinen und KI-Systeme", async ({ page }) => {
    await page.goto("/about");

    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw!);
    const types = data["@graph"].map((g: { "@type": string }) => g["@type"]);

    expect(types).toContain("WebApplication");
    expect(types).toContain("FAQPage");

    // Strukturierte Daten dürfen nichts behaupten, was nicht auf der Seite steht
    const faq = data["@graph"].find((g: { "@type": string }) => g["@type"] === "FAQPage");
    for (const entry of faq.mainEntity) {
      await expect(page.getByText(entry.name, { exact: false }).first()).toBeVisible();
    }
  });
});
