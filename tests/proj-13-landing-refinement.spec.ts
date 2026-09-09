import { test, expect } from "@playwright/test";

/**
 * PROJ-13 — Refinement 4 (2026-09-07): `/about` wird zur Marketing-Landingpage.
 * Ein test() pro Acceptance Criterion aus dem gleichnamigen Spec-Abschnitt.
 */

test.describe("Hero", () => {
  test("Headline und die Kostenlos-Zeile stehen im Hero", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Die reale Welt"
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "zum Spielfeld."
    );
    await expect(
      page.getByText("Kostenlos. Ohne Abo. Ohne Account.")
    ).toBeVisible();
  });

  test("der Hero bleibt auf Headline, Subline, Preiszeile und CTAs beschränkt", async ({
    page,
  }) => {
    await page.goto("/about");

    // Am 2026-09-09 auf das Nötigste gekürzt (BUG-7): Zielgruppen-Aufzählung
    // und Spielmechanik sind raus — beide kosteten 168px an der teuersten
    // Stelle der Seite und stehen weiter unten ohnehin ausführlicher.
    await expect(page.getByText(/^Erstelle deine eigene GPS-Rallye/)).toBeVisible();
    await expect(page.getByText("Kostenlos. Ohne Abo. Ohne Account.")).toBeVisible();
    await expect(page.getByText(/Ob mit Freunden, der Familie/)).toHaveCount(0);
    await expect(page.getByText(/Laufe zu verschiedenen Orten/)).toHaveCount(0);
  });

  test("die Spielmechanik ist weiterhin auf der Seite — in Schritten und FAQ", async ({
    page,
  }) => {
    await page.goto("/about");

    // Sie darf aus dem Hero verschwinden, aber nicht aus der Seite.
    await expect(page.getByText(/GPS führt euch von Station zu Station/)).toBeVisible();
    const html = await page.content();
    expect(html).toContain("Ein Pfeil zeigt die Richtung");
  });

  test("kein Eyebrow über der Headline", async ({ page }) => {
    await page.goto("/about");

    // Entfallen am 2026-09-09: „Über Geo Quest" beschrieb die Seite, statt
    // den Besucher anzusprechen. Die Shell darf dafür kein leeres <p> als
    // Leerraum stehen lassen — deshalb hier auch die Position der Headline.
    await expect(page.getByText("Über Geo Quest")).toHaveCount(0);
    const h1 = await page.locator("h1").boundingBox();
    const logo = await page.locator("main img[alt='Geo Quest']").boundingBox();
    if (logo) {
      // Zwischen Logo-Unterkante und Headline darf kein leerer Absatz klaffen.
      expect(h1!.y - (logo.y + logo.height)).toBeLessThan(48);
    }
  });

  test("der Hero nennt Erstellen und Spielen gleichwertig", async ({ page }) => {
    await page.goto("/about");

    const lead = page.locator("main p", {
      hasText: /^Erstelle deine eigene GPS-Rallye/,
    });
    const play = page.locator("main p", {
      hasText: /^Nimm die Herausforderung an/,
    });
    await expect(lead).toBeVisible();
    await expect(play).toBeVisible();

    // „in der gleichen Formatierung": identische Schriftgröße wie Satz 1.
    const sizes = await Promise.all(
      [lead, play].map((l) =>
        l.evaluate((e) => getComputedStyle(e).fontSize)
      )
    );
    expect(sizes[1]).toBe(sizes[0]);
  });

  test("primärer CTA führt direkt in den Creator, ohne Umweg über /", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: /Quest erstellen/i }).first().click();
    await expect(page).toHaveURL(/\/create$/);
  });

  test("sekundärer CTA führt zur KI-Anleitung", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: /Mit KI erstellen/i }).click();
    await expect(page).toHaveURL(/\/anleitung$/);
  });

  test("Abschluss-CTA trägt die neue Überschrift und führt nach /create", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: /Deine Umgebung\. Dein Abenteuer\./ })
    ).toBeVisible();

    await page.getByRole("link", { name: /Quest erstellen/i }).last().click();
    await expect(page).toHaveURL(/\/create$/);
  });
});

test.describe("Sektionsfolge", () => {
  test("genau sieben Sektionen in der festgelegten Reihenfolge", async ({ page }) => {
    await page.goto("/about");

    // Hero lebt im Shell-Titelblock (h1), die übrigen sechs sind <section>.
    // Seit 2026-09-08 ohne „Draußen spielen. Wie ein Game." — die Erklärung
    // steht jetzt im Hero, der Hook lag ohnehin schon in der Headline.
    const sections = page.locator("main section");
    await expect(sections).toHaveCount(6);

    // Nur die Sektions-Titel, nicht die FAQ-Trigger (die ebenfalls h3 sind).
    // `allInnerTexts` liefert den gerenderten Text, und der Display-Schnitt
    // ist per CSS Uppercase — daher der Vergleich in Großschreibung.
    const headings = await page
      .locator("main section > h3, main section > div > h3")
      .allInnerTexts();

    expect(headings.map((h) => h.trim())).toEqual([
      "JEDER ORT KANN EIN LEVEL SEIN.",
      "NICHT NUR SPIELEN. SELBER MACHEN.",
      "EINE QUEST ERSTELLEN? GANZ EINFACH.",
      "FÜR WEN IST GEO QUEST?",
    ]);

    // Der Abschluss-CTA trägt seine Überschrift als h2.
    await expect(
      page.getByRole("heading", { name: /Deine Umgebung\. Dein Abenteuer\./ })
    ).toBeVisible();
  });

  test("gestrichene Sektionen sind verschwunden", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "Was drin steckt" })
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Der Unterschied" })
    ).toHaveCount(0);
    // Seit 2026-09-08 ebenfalls entfallen — Inhalt im Hero aufgegangen.
    await expect(
      page.getByRole("heading", { name: "Draußen spielen. Wie ein Game." })
    ).toHaveCount(0);
  });
});

test.describe("Orte-Sektion", () => {
  test("fünf Orte als eigenständige Elemente, nicht als Fließtext", async ({
    page,
  }) => {
    await page.goto("/about");

    const places = page.locator("main section ul li", {
      hasText: /^(Ein Park|Eine Stadt|Der Schulhof|Ein Wanderweg|Dein Viertel)$/,
    });
    await expect(places).toHaveCount(5);
  });

  test("die Sektion schließt mit „Draußen ist das Game.\"", async ({ page }) => {
    await page.goto("/about");
    // Bis 2026-09-09 „Die Welt ist deine Spielkarte."
    await expect(page.getByText("Draußen ist das Game.")).toBeVisible();
  });
});

test.describe("Schritte", () => {
  test("Schritt 03 spricht von Weitergeben als Datei, nicht von einem Teilen-Link", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(page.getByText(/Gib deine Quest als Datei weiter/)).toBeVisible();
    // Kein Teilen-Versprechen, das die App nicht einlöst.
    await expect(page.getByText(/Teile deine Quest und los/)).toHaveCount(0);
  });
});

test.describe("Vokabular: Rallye außen, Quest innen", () => {
  test("„Rallye\" steht ausschließlich im Hero", async ({ page }) => {
    await page.goto("/about");

    // Hero: der Begriff, in dem die Zielgruppe sucht.
    await expect(page.getByText(/deine eigene GPS-Rallye/)).toBeVisible();

    // Ab Sektion 2 gilt die App-Sprache. Der Titelblock (Hero) ist alles
    // vor der ersten <section>, deshalb hier nur die Sektionen prüfen.
    const sectionText = (
      await page.locator("main section").allInnerTexts()
    ).join(" ");
    expect(sectionText).not.toMatch(/Rallye/);
    expect(sectionText).toMatch(/Quest/);
  });

  test("Buttons heißen „Quest erstellen\", nicht „Rallye erstellen\"", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("link", { name: /Quest erstellen/i })
    ).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: /Rallye erstellen/i })
    ).toHaveCount(0);
  });

  test("kein Erklärsatz, der Rallye und Quest gleichsetzt", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByText(/heißt (sie|das) Quest/i)).toHaveCount(0);
  });
});

test.describe("FAQ nach dem Refinement", () => {
  test("fünf Fragen — die vier bisherigen plus die neue", async ({ page }) => {
    await page.goto("/about");

    const questions = page.locator("main section h3 button, main section button");
    await expect(
      page.getByRole("button", { name: /Was kann ich in eine Quest einbauen/ })
    ).toBeVisible();
    // Vier bestehende Fragen sind wörtlich erhalten geblieben.
    for (const frage of [
      /Was kostet Geo Quest/,
      /Brauche ich ein Benutzerkonto/,
      /Für welches Alter/,
      /Wie lange dauert das Erstellen/,
    ]) {
      await expect(page.getByRole("button", { name: frage })).toBeVisible();
    }
    await expect(questions).toHaveCount(5);
  });

  test("der Inhalt der gestrichenen Feature-Karten steht in HTML und JSON-LD", async ({
    page,
  }) => {
    await page.goto("/about");

    const html = await page.content();
    for (const needle of [
      "Text, Bild, Audio, Video und Aufgaben",
      "Multiple Choice",
      "Ein Pfeil zeigt die Richtung",
    ]) {
      expect(html, `fehlt im HTML: ${needle}`).toContain(needle);
    }

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLd).toContain("Was kann ich in eine Quest einbauen?");
  });

  test("die Zeitangabe steht nur in der eingeklappten FAQ, nicht im Marketing-Text", async ({
    page,
  }) => {
    await page.goto("/about");

    // Sichtbar ist sie nicht — sie lebt in einer geschlossenen Antwort.
    await expect(page.getByText(/eine halbe Stunde/)).toBeHidden();
    // Und der frühere Marketing-Satz ist ganz weg.
    await expect(page.getByText(/Kein technisches Vorwissen nötig/)).toHaveCount(0);
  });
});

test.describe("SEO", () => {
  test("Title trägt weiterhin „Schnitzeljagd\", Keywords zusätzlich die Rallye-Begriffe", async ({
    page,
  }) => {
    await page.goto("/about");

    await expect(page).toHaveTitle(/Schnitzeljagd/);

    const keywords = await page
      .locator('meta[name="keywords"]')
      .getAttribute("content");
    for (const kw of ["GPS-Rallye", "Rallye erstellen", "Lernpfad draußen"]) {
      expect(keywords, `Keyword fehlt: ${kw}`).toContain(kw);
    }
    // Bestehende Begriffe wurden ergänzt, nicht ersetzt.
    expect(keywords).toContain("digitale Schnitzeljagd");
  });
});

test.describe("Responsive", () => {
  test("kein horizontales Scrollen auf 360px, Touch-Targets ≥ 44px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/about");

    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(overflows).toBe(false);

    const tooSmall = await page.evaluate(() =>
      [...document.querySelectorAll("main a, main button")]
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .filter((el) => el.getBoundingClientRect().height < 44)
        .map((el) => el.textContent?.trim().slice(0, 40))
    );
    expect(tooSmall).toEqual([]);
  });

  test("mehrteilige Sektionen laufen am Desktop mehrspaltig", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/about");

    // Die drei Schritte stehen nebeneinander, nicht untereinander.
    const steps = page.locator("main ol li");
    await expect(steps).toHaveCount(3);
    const tops = await steps.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top))
    );
    expect(new Set(tops).size).toBe(1);
  });
});

test.describe("Unberührte Nachbarseiten", () => {
  for (const path of ["/anleitung", "/impressum", "/datenschutz"]) {
    test(`${path} lädt unverändert`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("Header trägt weiterhin „Zur App\" und das Burger-Menu", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("link", { name: "Zur App" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Menü öffnen|Navigation/i })
    ).toBeVisible();
  });
});
