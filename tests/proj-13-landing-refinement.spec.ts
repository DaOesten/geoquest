import { test, expect } from "@playwright/test";

/**
 * PROJ-13 — Refinement 4 (2026-09-07): `/` wird zur Marketing-Landingpage.
 * Ein test() pro Acceptance Criterion aus dem gleichnamigen Spec-Abschnitt.
 *
 * Seit Refinement 12 (2026-10-15, „/about für Eltern und Lehrkräfte") auf den
 * neuen Aufbau gezogen: Hero mit App-Screenshot, Vorteile, Zielgruppen ohne
 * „Kinder & Jugendliche", Live-Demo, FAQ mit acht Fragen. Die Zusicherungen
 * sind umgeschrieben, nicht gelöscht.
 */

test.describe("Hero", () => {
  test("Headline und die Kostenlos-Zeile stehen im Hero", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Die reale Welt"
    );
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "zum Spielfeld."
    );
    await expect(
      page.getByText("Kostenlos. Ohne Werbung. Ohne Anmeldung.")
    ).toBeVisible();
  });

  test("der Hero bleibt auf Headline, Subline, Preiszeile und CTAs beschränkt", async ({
    page,
  }) => {
    await page.goto("/");

    // Am 2026-09-09 auf das Nötigste gekürzt (BUG-7): Zielgruppen-Aufzählung
    // und Spielmechanik sind raus — beide kosteten 168px an der teuersten
    // Stelle der Seite und stehen weiter unten ohnehin ausführlicher.
    // Seit Refinement 12 ein Absatz für Ersteller mit Anlass und Nutzen.
    await expect(page.getByText(/^Erstelle eigene GPS-Schnitzeljagden und spannende Lernpfade/)).toBeVisible();
    await expect(page.getByText("Kostenlos. Ohne Werbung. Ohne Anmeldung.")).toBeVisible();
    await expect(page.getByText(/Ob mit Freunden, der Familie/)).toHaveCount(0);
    await expect(page.getByText(/Laufe zu verschiedenen Orten/)).toHaveCount(0);
  });

  test("die Spielmechanik steht in Hero und Schritten", async ({ page }) => {
    await page.goto("/");

    // Refinement 16: Der Hero-Absatz sagt nur noch, was die Kinder erleben
    // („draußen neue Orte"); den Weg von Station zu Station trägt allein
    // Schritt 03 mit dem GPS-Pfeil. Er darf deshalb nicht verschwinden.
    await expect(page.getByText(/Die Kinder entdecken draußen neue Orte/)).toBeVisible();
    await expect(page.getByText(/Der GPS-Pfeil führt von Station zu Station/)).toBeVisible();
  });

  test("kein Eyebrow über der Headline", async ({ page }) => {
    await page.goto("/");

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

  test("der Hero spricht den Ersteller an, nicht den Spieler", async ({ page }) => {
    await page.goto("/");

    // Gezogen in Refinement 12: Bis dahin stand hier „Erstellen und Spielen
    // gleichwertig" mit einem zweiten, an den Spieler gerichteten Satz. Die
    // Seite spricht jetzt nur noch Eltern, Lehrkräfte und Jugendleitung an.
    await expect(page.getByText(/^Erstelle eigene GPS-Schnitzeljagden/)).toBeVisible();
    await expect(page.getByText(/Nimm die Herausforderung an/)).toHaveCount(0);
  });

  test("primärer CTA führt direkt in den Creator, ohne Umweg über /", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Quest erstellen/i }).first().click();
    await expect(page).toHaveURL(/\/create$/);
  });

  // PROJ-14: der zweite Hero-CTA zur KI-Anleitung.
  test("sekundärer KI-CTA im Hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main").getByRole("link", { name: /Mit KI erstellen/i })).toHaveCount(1);
  });

  test("Abschluss-CTA trägt die neue Überschrift und führt nach /create", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Deine Umgebung\. Dein Abenteuer\./ })
    ).toBeVisible();

    await page.getByRole("link", { name: /Quest erstellen/i }).last().click();
    await expect(page).toHaveURL(/\/create$/);
  });
});

test.describe("Sektionsfolge", () => {
  // Seit Refinement 14 (2026-10-17) sieben statt acht: Die Schritte stehen
  // als Kapitel unter dem Video.
  test("genau sieben Sektionen in der festgelegten Reihenfolge", async ({ page }) => {
    await page.goto("/");

    // Hero lebt im Shell-Titelblock (h1), die übrigen sieben sind <section>.
    // Seit 2026-09-08 ohne „Draußen spielen. Wie ein Game." — die Erklärung
    // steht jetzt im Hero, der Hook lag ohnehin schon in der Headline.
    // Seit 2026-09-28 (Refinement 10) mit dem Erklärvideo an Position 2.
    // Seit 2026-10-15 (Refinement 12) neu geordnet: Vorteile vorn, Video
    // an Position 3, Live-Demo vor der FAQ.
    const sections = page.locator("main section");
    await expect(sections).toHaveCount(6);

    // Nur die Sektions-Titel, nicht die FAQ-Trigger (die ebenfalls h3 sind).
    // `allInnerTexts` liefert den gerenderten Text, und der Display-Schnitt
    // ist per CSS Uppercase — daher der Vergleich in Großschreibung.
    // Titel = das h3 direkt nach dem Kicker-h2. Seit Refinement 13 sitzt der
    // Simulationstitel eine Ebene tiefer (Spalte neben dem Handy); die
    // FAQ-Trigger sind ebenfalls h3, folgen aber nie direkt auf ein h2.
    const headings = await page.locator("main section h2 + h3").allInnerTexts();

    // Kleingeschrieben verglichen und ß/SS vereinheitlicht: Die Engines
    // setzen „draußen" in Uppercase unterschiedlich um.
    const norm = (h: string) => h.trim().toLowerCase().replace(/ß/g, "ss");
    expect(headings.map(norm)).toEqual([
      "gemacht für draussen.",
      "so funktioniert geo quest.",
      "für wen ist geo quest?",
      // Seit Refinement 14 keine eigene Schritte-Sektion mehr — die drei
      // Schritte stehen als Kapitel unter dem Video.
      // Seit Refinement 13 eine ganze Quest im Handy statt einzelner Aufgaben.
      "so fühlt sich eine quest an.",
      "antworten für eltern und lehrkräfte",
    ]);

    // Der Abschluss-CTA trägt seine Überschrift als h2.
    await expect(
      page.getByRole("heading", { name: /Deine Umgebung\. Dein Abenteuer\./ })
    ).toBeVisible();
  });

  test("gestrichene Sektionen sind verschwunden", async ({ page }) => {
    await page.goto("/");

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
    // Seit Refinement 12 entfallen: Orte stecken in Zielgruppen und
    // Schritten, die Game-Designer-Idee in der Schul-Karte.
    await expect(
      page.getByRole("heading", { name: "Jeder Ort kann ein Level sein." })
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Nicht nur spielen. Selber machen." })
    ).toHaveCount(0);
    // Seit Refinement 14 entfallen: Die Schritte stehen unter dem Video.
    await expect(
      page.getByRole("heading", { name: "Eine Quest erstellen? Ganz einfach." })
    ).toHaveCount(0);
  });
});

// Gezogen in Refinement 12: Die Orte-Sektion („Jeder Ort kann ein Level
// sein.", fünf Orts-Chips, „Draußen ist das Game.") ist entfallen. An ihre
// Stelle treten Vorteile und Zielgruppen, die Eltern und Lehrkräfte zuerst
// prüfen.
test.describe("Vorteile und Zielgruppen", () => {
  test("vier Vorteile: Datenschutz, Bewegung, Baukasten, Browser", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("main section", {
      has: page.getByRole("heading", { name: "Gemacht für draußen." }),
    });
    for (const title of [
      "Datenschutz eingebaut",
      "Bewegung statt Sofa",
      "Einfacher Baukasten",
      "Läuft im Browser",
    ]) {
      await expect(section.getByRole("heading", { name: title })).toBeVisible();
    }
    await expect(section.locator("li")).toHaveCount(4);
  });

  test("drei Zielgruppen-Karten mit je drei Stichpunkten, alle sichtbar", async ({
    page,
  }) => {
    await page.goto("/");

    const section = page.locator("main section", {
      has: page.getByRole("heading", { name: "Für wen ist Geo Quest?" }),
    });
    const titles = section.locator("dt");
    await expect(titles).toHaveCount(3);
    // Karten statt Reiter: nichts ist versteckt.
    for (const title of ["Familien", "Schule & Pädagogik", "Jugendarbeit & Ferienprogramm"]) {
      await expect(section.locator("dt", { hasText: title })).toBeVisible();
    }
    await expect(section.locator("dd li")).toHaveCount(9);
    await expect(section.getByRole("tab")).toHaveCount(0);
    // Die Game-Designer-Idee lebt als Nutzen für Lehrkräfte weiter.
    await expect(section.getByText("Lass deine Klasse selbst eine Quest bauen")).toBeVisible();
  });

  test("entfallene Kinder-Ansprache ist weg", async ({ page }) => {
    await page.goto("/");

    for (const gone of [
      /Für Kinder & Jugendliche/,
      /überrasche deine Freunde/,
      /Du bist der Game-Designer/,
      /Deine Welt\. Deine Regeln/,
      /Draußen ist das Game/,
    ]) {
      await expect(page.getByText(gone)).toHaveCount(0);
    }
  });
});

test.describe("Schritte", () => {
  // Gezogen in Refinement 14: Die Weitergabe steht jetzt in Kapitel 02 unter
  // dem Video. Die Zusicherung „als Datei, nicht per Link" bleibt.
  test("Kapitel 02 spricht von Weitergeben als Datei, nicht von einem Teilen-Link", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByText(/^Als Datei auf die Handys der Spieler\.$/)).toBeVisible();
    // Kein Teilen-Versprechen, das die App nicht einlöst — auch nicht das
    // „per Link oder QR-Code" aus dem Betreiber-Entwurf (Refinement 12).
    await expect(page.getByText(/Teile deine Quest und los/)).toHaveCount(0);
    await expect(page.getByText(/QR-Code/)).toHaveCount(0);
  });
});

test.describe("Vokabular: Suchsprache außen, Quest innen", () => {
  test("das Produkt heißt Quest — „Rallye\" nur noch als Anlass", async ({ page }) => {
    await page.goto("/");

    // Seit Refinement 12 holt der Hero mit „GPS-Schnitzeljagden" ab, nicht
    // mehr mit „GPS-Rallye". „Rallye" darf als Anlass stehen
    // („Stadtrallye für Jugendgruppen"), nie als Name des Produkts.
    await expect(page.getByText(/GPS-Schnitzeljagden/)).toBeVisible();
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/GPS-Rallye|Rallye erstellen|eigene Rallye/i);
    const sectionText = (
      await page.locator("main section").allInnerTexts()
    ).join(" ");
    expect(sectionText).toMatch(/Quest/);
  });

  test("Buttons heißen „Quest erstellen\", nicht „Rallye erstellen\"", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: /Quest erstellen/i })
    ).toHaveCount(2);
    await expect(
      page.getByRole("link", { name: /Rallye erstellen/i })
    ).toHaveCount(0);
  });

  test("kein Erklärsatz, der Rallye und Quest gleichsetzt", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/heißt (sie|das) Quest/i)).toHaveCount(0);
  });
});

test.describe("FAQ nach dem Refinement", () => {
  test("acht Fragen aus Sicht von Eltern und Lehrkräften", async ({ page }) => {
    await page.goto("/");

    // Auf die Accordion-Trigger begrenzt statt „jeder Button in einer
    // Sektion" — dort stehen auch der Video-Startknopf und die Demo.
    const questions = page.locator("main section button[aria-expanded]");
    // Seit Refinement 12: „Brauche ich ein Benutzerkonto?" ist in der Frage
    // nach Konto oder App für die Kinder aufgegangen, vier sind neu.
    for (const frage of [
      /Was kostet Geo Quest/,
      /Brauchen die Kinder ein Konto oder eine App/,
      /Was passiert mit den Standortdaten/,
      /Braucht jedes Kind ein eigenes Handy/,
      /Braucht man unterwegs Internet/,
      /Für welches Alter/,
      /Wie erstelle ich eine Quest/,  // PROJ-14: keine Dauer-Frage mehr
      /Was kann ich in eine Quest einbauen/,
    ]) {
      await expect(page.getByRole("button", { name: frage })).toBeVisible();
    }
    await expect(questions).toHaveCount(8);
    await expect(
      page.getByRole("heading", { name: "Antworten für Eltern und Lehrkräfte" })
    ).toBeVisible();
  });

  test("der Inhalt der gestrichenen Feature-Karten steht in HTML und JSON-LD", async ({
    page,
  }) => {
    await page.goto("/");

    const html = await page.content();
    for (const needle of [
      // Seit Refinement 15: mehrere Aufgaben je Station, Medien per Link.
      "Texte, Bilder, Audio, Videos und Aufgaben",
      "Multiple Choice",
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
    await page.goto("/");

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
    await page.goto("/");

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
    await page.goto("/");

    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );
    expect(overflows).toBe(false);

    // Gemessen wird das wirksame Tap-Ziel: Liegt ein Element in einem
    // <label> (die Radio-Knöpfe der Demo-Aufgabe), ist die ganze Zeile
    // tippbar — genau so wie im Player.
    const tooSmall = await page.evaluate(() =>
      [...document.querySelectorAll("main a, main button")]
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .filter((el) => (el.closest("label") ?? el).getBoundingClientRect().height < 44)
        .map((el) => el.textContent?.trim().slice(0, 40))
    );
    expect(tooSmall).toEqual([]);
  });

  test("mehrteilige Sektionen laufen am Desktop mehrspaltig", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

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
  for (const path of ["/mit-ki-erstellen", "/impressum", "/datenschutz"]) {
    test(`${path} lädt unverändert`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("Header trägt weiterhin „Zur App\" und das Burger-Menu", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Zur App" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Menü öffnen|Navigation/i })
    ).toBeVisible();
  });
});
