import { test, expect } from "@playwright/test";

/**
 * PROJ-13 — QA-Regressionstests zur Marketing-Landingpage (Refinement 4).
 *
 * Ergänzen die Tests aus der Frontend-Phase um das, was dort nicht abgedeckt
 * war: Kontrast, Tastaturbedienung, Überschriften-Semantik, Sichtbarkeit
 * des CTA ohne Scrollen und die Unversehrtheit der Nachbarseiten.
 */

/** WCAG-Kontrast zweier gerenderter Farben, Alpha auf den Grund komponiert. */
const CONTRAST_HELPER = `
  (fg, bg) => {
    const parse = (s) => {
      const m = s.match(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?\\)/);
      return { c: [+m[1], +m[2], +m[3]], a: m[4] === undefined ? 1 : parseFloat(m[4]) };
    };
    const lum = ([r, g, b]) => {
      const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const B = parse(bg).c;
    const F = parse(fg);
    const composed = F.c.map((c, i) => c * F.a + B[i] * (1 - F.a));
    const [l1, l2] = [lum(composed), lum(B)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  }
`;

test.describe("Kontrast (PRD: WCAG AA, 4.5:1)", () => {
  test("die neuen Textelemente erfüllen die Kontrastvorgabe", async ({ page }) => {
    await page.goto("/about");

    const results = await page.evaluate((helperSrc) => {
      const contrast = eval(helperSrc) as (fg: string, bg: string) => number;
      const effectiveBg = (el: Element) => {
        let n: Element | null = el;
        while (n) {
          const c = getComputedStyle(n).backgroundColor;
          if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
          n = n.parentElement;
        }
        return "rgb(11, 15, 18)";
      };
      const byText = (re: RegExp, sel = "p, h2, h3, span, li, dd") =>
        [...document.querySelectorAll(sel)].find((e) => re.test(e.textContent || ""));

      const targets: [string, Element | undefined][] = [
        ["Hero Kostenlos-Zeile", byText(/^Kostenlos\. Ohne Abo/)],
        ["Hero Subline", byText(/^Erstelle deine eigene GPS-Rallye/)],
        ["Orts-Chip", document.querySelector("main section ul li") || undefined],
        ["Orte Fließtext", byText(/^Lege Stationen fest/)],
        ["Merkzeile Karte 1", byText(/^Draußen ist das Game/)],
        ["Lime Merkzeile", byText(/^Deine Welt\. Deine Regeln/)],
        ["Schritt-Text", document.querySelector("main ol li p") || undefined],
        ["Zielgruppen-Text", document.querySelector("main dl dd") || undefined],
      ];

      return targets.map(([label, el]) => {
        if (!el) return { label, ratio: 0, size: 0, weight: 400, found: false };
        const cs = getComputedStyle(el);
        return {
          label,
          ratio: contrast(cs.color, effectiveBg(el)),
          size: parseFloat(cs.fontSize),
          weight: Number(cs.fontWeight),
          found: true,
        };
      });
    }, CONTRAST_HELPER);

    for (const r of results) {
      expect(r.found, `Element nicht gefunden: ${r.label}`).toBe(true);
      // WCAG: 3:1 ab 24px bzw. 18.66px+bold, sonst 4.5:1
      const large = r.size >= 24 || (r.size >= 18.66 && r.weight >= 700);
      const min = large ? 3 : 4.5;
      expect(
        r.ratio,
        `${r.label}: ${r.ratio.toFixed(2)}:1 unter dem Minimum ${min}:1`
      ).toBeGreaterThanOrEqual(min);
    }
  });
});

test.describe("Tastatur & Semantik", () => {
  test("die Überschriften-Hierarchie hat keine Sprünge", async ({ page }) => {
    await page.goto("/about");

    const levels = await page
      .locator("main h1, main h2, main h3, main h4")
      .evaluateAll((els) => els.map((e) => Number(e.tagName[1])));

    expect(levels[0], "die Seite beginnt mit h1").toBe(1);
    for (let i = 1; i < levels.length; i++) {
      expect(
        levels[i] - levels[i - 1],
        `Sprung von h${levels[i - 1]} auf h${levels[i]} an Position ${i}`
      ).toBeLessThanOrEqual(1);
    }
  });

  test("die FAQ lässt sich vollständig per Tastatur bedienen", async ({ page }) => {
    await page.goto("/about");

    const first = page.locator("main section button").first();
    await expect(first).toHaveAttribute("aria-expanded", "false");

    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/Geo Quest ist vollständig kostenlos/)).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });

  test("inhaltstragende Bilder haben einen Alternativtext, dekorative nicht", async ({
    page,
  }) => {
    await page.goto("/about");
    // Gezogen am 2026-09-21 (Refinement 9): Das Hero-Bild ist seitdem
    // Hintergrund und damit Dekoration — ein leeres `alt` plus `aria-hidden`
    // ist dort die RICHTIGE Auszeichnung, kein fehlender Alternativtext.
    // Ein Screenreader, der die Bildbeschreibung zwischen Logo und Headline
    // vorliest, stoert den Lesefluss ohne Gegenwert.
    const bad = await page.locator("img").evaluateAll((els) =>
      els
        .filter((e) => {
          const img = e as HTMLImageElement;
          const decorative = img.getAttribute("aria-hidden") === "true";
          return decorative ? img.alt !== "" : !img.alt;
        })
        .map((e) => (e as HTMLImageElement).src.slice(-40))
    );
    expect(bad, "Bilder mit falscher alt-Auszeichnung").toEqual([]);
  });
});

test.describe("Darstellungs-Rhythmus", () => {
  test("nie zweimal dieselbe Form hintereinander", async ({ page }) => {
    await page.goto("/about");

    const forms = await page.locator("main section").evaluateAll((secs) =>
      secs.map((s) => {
        if (s.querySelector("[data-state]")) return "Accordion";
        if (s.querySelector("dl")) return "Karten";
        if (s.querySelector("ol li")) return "Schritte";
        if (s.querySelector("ul li")) return "Chips";
        if (s.classList.contains("text-center")) return "Box";
        return "Text";
      })
    );

    for (let i = 1; i < forms.length; i++) {
      expect(
        forms[i],
        `Sektion ${i} und ${i + 1} nutzen beide "${forms[i]}"`
      ).not.toBe(forms[i - 1]);
    }
  });

  test("genau ein Lime-Element auf der Seite (Design-System-Regel)", async ({
    page,
  }) => {
    await page.goto("/about");

    // Lime = rgb(198, 255, 0) in Rahmen oder Text.
    const limeCount = await page.evaluate(() => {
      const isLime = (c: string) => /198,\s*255,\s*0/.test(c);
      return [...document.querySelectorAll("main section")].filter((s) => {
        const card = s.querySelector(":scope > div");
        return card && isLime(getComputedStyle(card).borderColor);
      }).length;
    });
    expect(limeCount).toBe(1);
  });
});

test.describe("Responsive (PRD: 360–430px mobil, Desktop nutzbar)", () => {
  for (const [w, h] of [
    [320, 568],
    [360, 640],
    [430, 932],
    [768, 1024],
    [1440, 900],
  ] as const) {
    test(`${w}px: kein Überlauf, alle Touch-Targets ≥ 44px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/about");

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(overflow, `${overflow}px horizontaler Überlauf`).toBeLessThanOrEqual(0);

      const small = await page.evaluate(() =>
        [...document.querySelectorAll("main a, main button, header a, header button")]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.height > 0 && r.height < 44;
          })
          .map((e) => `${(e.textContent || "").trim().slice(0, 25)}`)
      );
      expect(small).toEqual([]);
    });
  }
});

test.describe("BUG-7: Hero-CTA über dem Falz", () => {
  // Behoben am 2026-09-09. Der primäre CTA lag auf verbreiteten Laptop-
  // Auflösungen unter der Bildschirmkante — auf einer Landingpage, deren
  // Zweck die Conversion ist, der teuerste Platz überhaupt.
  for (const [w, h, label] of [
    [1366, 768, "1366x768 (verbreitet Windows)"],
    [1280, 800, "1280x800"],
    [1440, 900, "1440x900 (MacBook 13\")"],
    [1024, 768, "1024x768"],
    [1920, 1080, "1920x1080"],
  ] as const) {
    test(`${label}: „Quest erstellen" ist ohne Scrollen vollständig sichtbar`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/about");

      const cta = page.getByRole("link", { name: /Quest erstellen/i }).first();
      const box = await cta.boundingBox();
      expect(box, "CTA nicht gefunden").not.toBeNull();
      expect(
        Math.round(box!.y + box!.height),
        `CTA-Unterkante liegt ${Math.round(box!.y + box!.height - h)}px unter dem Falz`
      ).toBeLessThanOrEqual(h);
    });
  }

  // Gezogen am 2026-09-20 (PROJ-13, Refinement 7). Die Fassung davor prüfte
  // auf 1366×768 `toBeHidden()` — das war die BUG-7-Behebung vom 2026-09-09,
  // deren zweite Begründung („Marke steht im Header") seit PROJ-14 auch
  // sichtbar falsch ist: Die Kopfzeile trägt nur Ko-fi-Icon, „Zur App" und
  // Burger. Die beiden Zusicherungen für Handy und Tablet bleiben unverändert
  // gültig und stehen weiterhin hier.
  test("das Logo-Lockup steht auf jeder Breite — Handy, Tablet und Desktop", async ({
    page,
  }) => {
    const logo = page.locator("main img[alt='Geo Quest']");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");
    await expect(logo, "auf dem Handy ist das Lockup der Markenanker").toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(logo, "auf dem Tablet reicht die Höhe").toBeVisible();

    await page.setViewportSize({ width: 1366, height: 768 });
    await expect(
      logo,
      "am Desktop trägt die Kopfzeile keine Bildmarke — das Lockup ist dort der einzige"
    ).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(logo, "auch auf großen Bildschirmen").toBeVisible();
  });

  // Gezogen am 2026-09-21 (Refinement 9). Die drei Tests davor prüften das
  // Bild als Nachbar-Spalte: bündiger Abschluss, Zuschnitt nach rechts und
  // unbeschnitten unter `lg`. Als Hintergrund gibt es keine Spalte und keinen
  // Zuschnitt mehr — an ihre Stelle tritt der Kontrast-Wächter unten. Die
  // Zusicherung über das freigestellte Lockup (PROJ-1) bleibt erhalten.
  test("das Lockup ist freigestellt und erzeugt keinen Überlauf", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/about");

    const logo = page.locator("main img[alt='Geo Quest']");
    await expect(logo).toHaveAttribute("src", /logo-lockup-cutout/);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    );
    expect(overflow, "horizontaler Scrollbalken").toBeLessThanOrEqual(0);
  });

  test("der Hero trägt ein Hintergrundbild hinter dem Text", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    const bg = page.locator('main img[alt=""]');
    await expect(bg, "Hintergrundbild fehlt").toHaveCount(1);
    // Dekoration: Ein Screenreader soll es nicht vorlesen.
    await expect(bg).toHaveAttribute("aria-hidden", "true");
    await expect(bg).toHaveAttribute("src", /hero_new/);

    // Randlos ueber die volle Fensterbreite (2026-09-21): Im 1100px-Container
    // wurde der Schriftzug auf der Hauswand rechts angeschnitten.
    const box = (await bg.boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(Math.round(box.x), "Bild beginnt nicht am linken Rand").toBe(0);
    expect(Math.round(box.width), "Bild nutzt nicht die volle Breite").toBe(vw);

    // Es liegt HINTER dem Text, nicht daneben: Die Headline überlappt es.
    const b = (await bg.boundingBox())!;
    const h1 = (await page.locator("h1").boundingBox())!;
    const overlaps =
      h1.x < b.x + b.width &&
      b.x < h1.x + h1.width &&
      h1.y < b.y + b.height &&
      b.y < h1.y + h1.height;
    expect(overlaps, "Headline liegt nicht auf dem Bild").toBe(true);
  });

  test("auch auf dem Handy liegt der Text auf dem Bild", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    const bg = page.locator('main img[alt=""]');
    await expect(bg).toHaveCount(1);

    const b = (await bg.boundingBox())!;
    const h1 = (await page.locator("h1").boundingBox())!;
    expect(h1.y, "Headline müsste auf dem Bild liegen").toBeGreaterThanOrEqual(b.y);
    expect(h1.y + h1.height).toBeLessThanOrEqual(b.y + b.height);
  });

  test("die Textschutz-Ebene liegt über dem Bild", async ({ page }) => {
    // Ohne sie fällt der Kontrast auf hellen Bildstellen (Laternen, Reflexe)
    // unter die PRD-Vorgabe — gemessen bis auf 1.95:1. Der Verlauf ist der
    // Grund, warum der Text auf dem Foto überhaupt lesbar ist.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    // Vom Bild aus suchen statt von der Headline: Die Verschachtelung darf
    // sich aendern, der Verlauf bleibt ein Geschwister des Bildes.
    const found = await page.evaluate(() => {
      const img = document.querySelector<HTMLImageElement>('main img[alt=""]')!;
      const wrapper = img.parentElement!;
      return [...wrapper.children].some((el) =>
        /gradient/.test(getComputedStyle(el).backgroundImage)
      );
    });
    expect(found, "kein Verlauf über dem Hintergrundbild gefunden").toBe(true);
  });

  test("der Verlauf gibt die rechte Bildhälfte frei", async ({ page }) => {
    // Der Betreiber wollte Route und X auf der Strasse erkennen koennen.
    // Gemessen lagen sie vorher unter 76-88% Abdunklung. Der Verlauf endet
    // deshalb bei 68% statt erst am rechten Rand — rechts davon traegt das
    // Bild unveraendert.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    const endsEarly = await page.evaluate(() => {
      const img = document.querySelector<HTMLImageElement>('main img[alt=""]')!;
      const layer = [...img.parentElement!.children].find((el) =>
        /gradient/.test(getComputedStyle(el).backgroundImage)
      )!;
      // Der letzte Stop muss VOR dem rechten Rand liegen, sonst verdeckt der
      // Verlauf Route und X. Erst als arbitrary value greifen die Prozent-
      // Angaben: Zwei `via-*`-Utilities kollidieren, Tailwind erzeugt daraus
      // nur einen Stop ohne Position.
      // `transparent` kommt als `rgba(0, 0, 0, 0)` zurueck — die letzte
      // Prozentangabe im Wert ist der gesuchte Stop.
      const bg = getComputedStyle(layer).backgroundImage;
      const all = [...bg.matchAll(/(\d+)%/g)].map((m) => Number(m[1]));
      return all.length > 0 && all[all.length - 1] <= 75;
    });
    expect(
      endsEarly,
      "der Verlauf läuft bis zum rechten Rand und verdeckt Route und X"
    ).toBe(true);
  });

  test("die Nachbarseiten bekommen kein Hintergrundbild", async ({ page }) => {
    for (const path of ["/anleitung", "/impressum", "/datenschutz"]) {
      await page.goto(path);
      await expect(
        page.locator('main img[alt=""]'),
        `${path} trägt ein Hintergrundbild`
      ).toHaveCount(0);
    }
  });
});

test.describe("Sicherheit", () => {
  test("das JSON-LD escaped < und kann kein Script schließen", async ({ page }) => {
    await page.goto("/about");
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(raw).not.toContain("</");
    expect(raw).toContain("FAQPage");
  });

  test("die Seite lädt keine fremden Hosts nach", async ({ page }) => {
    // Gilt für den Production-Build (dort gemessen: 0 externe Requests).
    // Gegen `npm run dev` schlägt dieser Test fehl, weil Vercel Analytics
    // dann `va.vercel-scripts.com/v1/script.debug.js` nachlädt — ein reines
    // Entwicklungs-Artefakt, das im Production-Bundle nicht vorkommt.
    // Der Ko-fi-Link (2026-09-09) erzeugt keinen Request: ein `href` mit
    // `target="_blank"` lädt erst beim Klick, und dann in einem neuen Tab.
    const external: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.hostname !== "localhost" && u.protocol !== "data:") external.push(u.hostname);
    });
    await page.goto("/about", { waitUntil: "networkidle" });
    expect([...new Set(external)]).toEqual([]);
  });
});

test.describe("Regression: Nachbarseiten", () => {
  for (const [path, heading] of [
    ["/anleitung", /Quest bauen|mit KI/i],
    ["/impressum", /Impressum/i],
    ["/datenschutz", /Datenschutz/i],
  ] as const) {
    test(`${path} ist unverändert erreichbar`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    });
  }

  // PROJ-14: Der KI-Link entfällt, solange die Anleitung nur angekündigt ist.
  test("der Creator-Empty-State führt keinen KI-Link mehr", async ({ page }) => {
    await page.goto("/create");
    await expect(page.getByRole("link", { name: /Quest mit KI bauen/i })).toHaveCount(0);
  });
});

test.describe("Refinement 5: Copy-Feinschliff (2026-09-09)", () => {
  test("kein Eyebrow und kein Leerraum an seiner Stelle", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByText("Über Geo Quest")).toHaveCount(0);
    // Ein leerer String in der Shell hätte ein leeres <p> mit voller
    // Zeilenhöhe hinterlassen — genau über der Headline.
    const emptyEyebrow = await page.evaluate(
      () =>
        [...document.querySelectorAll("main p.text-tech")].filter(
          (e) => !(e.textContent || "").trim()
        ).length
    );
    expect(emptyEyebrow).toBe(0);
  });

  test("die beiden Hero-Sätze sind identisch formatiert", async ({ page }) => {
    await page.goto("/about");

    const style = (re: RegExp) =>
      page
        .locator("main p", { hasText: re })
        .first()
        .evaluate((e) => {
          const cs = getComputedStyle(e);
          return `${cs.fontSize}|${cs.fontWeight}|${cs.lineHeight}|${cs.fontFamily}`;
        });

    const a = await style(/^Erstelle deine eigene GPS-Rallye/);
    const b = await style(/^Nimm die Herausforderung an/);
    expect(b, "Satz 2 muss wie Satz 1 gesetzt sein").toBe(a);
  });

  // PROJ-14: Es gibt keinen sekundären CTA mehr, solange die Anleitung nur
  // angekündigt ist. Die Breitenregel greift wieder, wenn er zurückkommt —
  // festgehalten in tests/proj-14-anleitung-freigeschaltet.spec.ts.
  test("der Hero führt genau einen CTA", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("link", { name: /Mit KI erstellen/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Quest erstellen/ }).first()).toBeVisible();
  });

  test("die neue Copy steht, die alte ist weg", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByText(/^Nimm die Herausforderung an/)).toBeVisible();
    await expect(page.getByText("Draußen ist das Game.")).toBeVisible();
    await expect(
      page.getByText(/Verbessere das Lernen durch Bewegung/)
    ).toBeVisible();

    await expect(page.getByText("Die Welt ist deine Spielkarte.")).toHaveCount(0);
    await expect(page.getByText(/Mit KI bauen/)).toHaveCount(0);
    await expect(page.getByText(/Geschichte, Natur oder Geografie/)).toHaveCount(0);
  });

  test("die Nachbarseiten behalten ihren Eyebrow", async ({ page }) => {
    // `eyebrow` wurde optional gemacht — die drei anderen Info-Seiten
    // setzen die Prop weiterhin und dürfen sie nicht verlieren.
    for (const [path, expected] of [
      ["/anleitung", "Bald verfügbar"],  // PROJ-14: Eyebrow der Ankündigung
      ["/impressum", "Rechtliches"],
      ["/datenschutz", "Rechtliches"],
    ] as const) {
      await page.goto(path);
      await expect(
        page.locator("main p.text-tech").first(),
        `${path} hat keinen Eyebrow mehr`
      ).toHaveText(expected);
    }
  });
});
