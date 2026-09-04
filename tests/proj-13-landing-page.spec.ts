import { test, expect } from "@playwright/test";

/**
 * PROJ-13 — Landing Page (/about) und Anleitung (/anleitung).
 * Ein test() pro Acceptance Criterion aus features/PROJ-13-landing-page.md.
 */

test.describe("Seite & Navigation", () => {
  test("/about lädt eigenständig mit Hero, Features und Anlässen", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Draußen ist");
    await expect(page.getByRole("heading", { name: "Was drin steckt" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Navigation zu echten Orten" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Für wen" })).toBeVisible();
    await expect(page.getByText("Typische Anlässe")).toBeVisible();
  });

  test("/anleitung lädt direkt mit Ablauf und vollständiger Prompt-Vorlage", async ({ page }) => {
    await page.goto("/anleitung");

    await expect(page.getByRole("heading", { name: "So geht es" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Prompt kopieren" })).toBeVisible();
    // Der Prompt steht als Text auf der Seite, nicht hinter einem Klick
    await expect(page.getByText("Du hilfst mir, eine Schnitzeljagd")).toBeVisible();
    await expect(page.getByText("## Aufbau der JSON-Datei")).toBeVisible();
  });

  test("Verweis auf /about führt zur Anleitung", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: /Quest mit KI bauen/i }).click();
    await expect(page).toHaveURL(/\/anleitung$/);
  });

  test("„Zur App\" führt zum Start-Screen", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: "Zur App" }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("Bist du bereit")).toBeVisible();
  });

  test("Creator-Empty-State verlinkt auf die Anleitung", async ({ page }) => {
    await page.goto("/create");
    const link = page.getByRole("link", { name: /Quest mit KI bauen/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/anleitung$/);
  });

  test("Root-Route bleibt der unveränderte Mode-Switch aus PROJ-1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Bist du bereit")).toBeVisible();
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
            const r = el.getBoundingClientRect();
            return r.height > 0 && r.height < 44;
          })
          .map((el) => (el.textContent || "").trim().slice(0, 40))
      );
      expect(tooSmall).toEqual([]);
    });
  }
});

test.describe("Prompt-Vorlage", () => {
  test("Prompt ist sichtbar und markierbar", async ({ page }) => {
    await page.goto("/anleitung");

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
    await page.goto("/anleitung");

    await page.getByRole("button", { name: /Kopieren/i }).click();
    await expect(page.getByRole("button", { name: /Kopiert/i })).toBeVisible();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain("Du hilfst mir, eine Schnitzeljagd");
  });

  test("blockierte Zwischenablage sperrt den Nutzer nicht aus", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: () => Promise.reject(new Error("blocked")) },
        configurable: true,
      });
    });
    await page.goto("/anleitung");

    await page.getByRole("button", { name: /Kopieren/i }).click();

    await expect(page.getByText(/Kopieren hat nicht geklappt/i)).toBeVisible();
    await expect(page.getByText("Du hilfst mir, eine Schnitzeljagd")).toBeVisible();
  });

  test("auszufüllende Stellen sind eindeutig markiert", async ({ page }) => {
    await page.goto("/anleitung");
    const prompt = (await page.locator("pre").textContent())!;

    for (const label of ["Thema / Story", "Wo wird gespielt", "Alter der Spieler", "Anzahl Stationen"]) {
      expect(prompt).toContain(label);
    }
    expect(prompt).toContain("[HIER EINTRAGEN");
  });
});

test.describe("Anleitung & Erwartungsmanagement", () => {
  test("Import-Schritt erklärt den Weg über die .json-Datei", async ({ page }) => {
    await page.goto("/anleitung");
    await expect(page.getByText(/Endung \.json/)).toBeVisible();
    await expect(page.getByText(/Im Creator die Datei hochladen/)).toBeVisible();
  });

  test("Koordinaten nachtragen ist als Pflichtschritt ausgewiesen", async ({ page }) => {
    await page.goto("/anleitung");
    await expect(page.getByRole("heading", { name: "Ziele auf die Karte setzen" })).toBeVisible();
    await expect(page.getByText(/führt die Quest draußen ins Nichts/)).toBeVisible();
  });

  test("Medien-Platzhalter müssen laut Anleitung ersetzt werden", async ({ page }) => {
    await page.goto("/anleitung");
    await expect(page.getByRole("heading", { name: "Medien-Adressen ersetzen" })).toBeVisible();
    await expect(page.getByText(/BITTE-ERSETZEN/).first()).toBeVisible();
  });

  test("Medienquellen nennen freie Quellen und die direkte Datei-Adresse", async ({ page }) => {
    await page.goto("/anleitung");
    await expect(page.getByText(/Wikimedia Commons/)).toBeVisible();
    await expect(page.getByText(/Der Link zur Webseite reicht nicht/)).toBeVisible();
  });
});

test.describe("Fehlerfälle & Troubleshooting", () => {
  test("Troubleshooting nennt die häufigsten Import-Ursachen", async ({ page }) => {
    await page.goto("/anleitung");

    await expect(page.getByRole("button", { name: /Die Datei wird nicht angenommen/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /ungültige Werte/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Adressen für Bilder/ })).toBeVisible();
  });

  test("Troubleshooting rät, die Fehlermeldung an die KI zurückzugeben", async ({ page }) => {
    await page.goto("/anleitung");

    await page.getByRole("button", { name: /Die Datei wird nicht angenommen/ }).click();
    await expect(page.getByText(/Gib der KI die Fehlermeldung zurück/)).toBeVisible();
  });
});

test.describe("Teilen & Auffindbarkeit", () => {
  for (const [path, expectedTitle] of [
    ["/about", "digitale Schnitzeljagd selbst erstellen"],
    ["/anleitung", "Quest mit KI erstellen"],
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
