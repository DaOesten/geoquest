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

      // Seit Refinement 12 auf die neuen Elemente gezogen: Orte-Karte,
      // Merkzeilen und Lime-Karte sind entfallen, Vorteile, Stichpunkte und
      // Demo-Text neu. Die Abschluss-Sektion liegt auf einem Bild und hat
      // einen eigenen, pixelgenauen Wächter weiter unten.
      const targets: [string, Element | undefined][] = [
        ["Hero Kostenlos-Zeile", byText(/^Kostenlos\. Ohne Werbung/)],
        ["Hero Subline", byText(/^Erstelle GPS-Schnitzeljagden/)],
        ["Vorteil-Text", byText(/^Keine Anmeldung, keine Werbung/)],
        ["Schritt-Text", document.querySelector("main ol li p") || undefined],
        ["Zielgruppen-Text", document.querySelector("main dl dd p") || undefined],
        ["Zielgruppen-Stichpunkt", document.querySelector("main dl dd li span") || undefined],
        ["Demo-Text", byText(/^Das sind echte Aufgaben/)],
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

    // Nur Accordion-Trigger — seit Refinement 10 ist der erste Button in
    // einer Sektion der Video-Startknopf.
    const first = page.locator("main section button[aria-expanded]").first();
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
        if (s.querySelector("video")) return "Video";
        // Vor dem Accordion-Fall: Die Reiter der Live-Demo tragen ebenfalls
        // `data-state` (Refinement 12).
        if (s.querySelector("[role=tablist]")) return "Demo";
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

    // Gezogen in Refinement 12: Bis dahin trug die Game-Designer-Karte den
    // Lime-Rahmen. Sie ist entfallen; das eine Lime-Element ist jetzt die
    // Entfernungsanzeige im App-Screenshot des Hero. Im gerenderten
    // Seiten-CSS darf deshalb beim Laden KEIN weiteres Lime stehen.
    // (Eine gelöste Demo-Aufgabe färbt sich Lime wie beim Spielen — das ist
    // die Belohnung, kein Seitenelement.)
    await expect(page.locator("main img[src*='about-hero-navigation']")).toHaveCount(1);
    const limeCount = await page.evaluate(() => {
      const isLime = (c: string) => /198,\s*255,\s*0/.test(c);
      return [...document.querySelectorAll("main *")].filter((el) => {
        const cs = getComputedStyle(el);
        return isLime(cs.color) || isLime(cs.borderTopColor) || isLime(cs.backgroundColor);
      }).length;
    });
    expect(limeCount).toBe(0);
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

      // Wirksames Tap-Ziel: Die Radio-Knöpfe der Demo-Aufgabe liegen in
      // einem <label>, die ganze Antwortzeile ist tippbar (wie im Player).
      const small = await page.evaluate(() =>
        [...document.querySelectorAll("main a, main button, header a, header button")]
          .filter((e) => {
            const r = (e.closest("label") ?? e).getBoundingClientRect();
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

  // Gezogen in Refinement 12 (2026-10-15). Die fünf Tests davor prüften das
  // Hintergrundbild hinter dem Hero-Text (Karte symmetrisch, Text auf dem
  // Bild, Textschutz-Verlauf, Verlauf endet bei 68%, rechts verankert). Der
  // Hero trägt jetzt einen App-Screenshot; die Illustration ist in die
  // Abschluss-Sektion gewandert, und die Wächter für Bild, Abdunklung und
  // Kontrast gelten dort.
  test("der Hero zeigt einen App-Screenshot statt eines Hintergrundbilds", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    // Kein dekoratives Bild mehr außerhalb der Sektionen.
    await expect(page.locator('main img[alt=""]:not(section img)')).toHaveCount(0);

    const shot = page.locator("main img[src*='about-hero-navigation']");
    await expect(shot).toBeVisible();
    // Der Screenshot trägt Information — anders als das frühere Bild.
    await expect(shot).toHaveAttribute("alt", /Pfeil/);

    // Ab `lg` rechts neben dem Text.
    const s = (await shot.boundingBox())!;
    const h1 = (await page.locator("h1").boundingBox())!;
    expect(s.x, "Screenshot steht nicht rechts der Headline").toBeGreaterThan(h1.x + h1.width);
  });

  test("auf dem Handy steht der Screenshot unter dem CTA", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about");

    const shot = (await page.locator("main img[src*='about-hero-navigation']").boundingBox())!;
    const cta = (await page.getByRole("link", { name: /Quest erstellen/i }).first().boundingBox())!;
    expect(shot.y, "Screenshot muss unter dem CTA stehen").toBeGreaterThan(cta.y + cta.height);
  });

  test("die Abschluss-Sektion trägt die Illustration mit Abdunklung", async ({ page }) => {
    await page.goto("/about");

    const closing = page.locator("main section", {
      has: page.getByRole("heading", { name: /Deine Umgebung/ }),
    });
    const img = closing.locator("img");
    await expect(img).toHaveCount(1);
    await expect(img).toHaveAttribute("src", /hero_new/);
    await expect(img).toHaveAttribute("aria-hidden", "true");
    await expect(img).toHaveAttribute("alt", "");

    // Eine eigene Abdunklungs-Ebene zwischen Bild und Text — ohne sie fällt
    // der Kontrast auf hellen Bildstellen unter die Vorgabe.
    const alpha = await closing.evaluate((s) => {
      const layer = [...s.children].find(
        (el) => el.tagName === "DIV" && getComputedStyle(el).position === "absolute"
      );
      if (!layer) return 0;
      const m = getComputedStyle(layer).backgroundColor.match(/rgba?\([^)]*?,\s*([\d.]+)\)$/);
      return m ? Number(m[1]) : 1;
    });
    expect(alpha, "Abdunklung fehlt oder ist zu schwach").toBeGreaterThanOrEqual(0.6);
  });

  test("jeder Text der Abschluss-Sektion besteht 4.5:1 — pro Pixel gemessen", async ({
    page,
  }) => {
    // Strengster Maßstab: jedes Hintergrundpixel hinter dem Text einzeln.
    // Gemessen bei der Umsetzung: schlechtester Wert 4.86:1 (Teal auf
    // Desktop), weiß ≥ 5.93:1.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    const closing = page.locator("main section", {
      has: page.getByRole("heading", { name: /Deine Umgebung/ }),
    });
    await closing.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const i = document.querySelector<HTMLImageElement>("main section img[src*='hero_new']");
      return !!i && i.complete && i.naturalWidth > 0;
    });
    const handle = (await closing.elementHandle())!;

    // Textboxen und Farben erfassen, dann den Text ausblenden und nur den
    // Hintergrund aufnehmen.
    const boxes = await handle.evaluate((s) => {
      const r0 = s.getBoundingClientRect();
      return [...s.querySelectorAll("h2, h2 span, p")].map((e) => {
        const range = document.createRange();
        range.selectNodeContents(e);
        const r = range.getBoundingClientRect();
        return {
          x: r.x - r0.x, y: r.y - r0.y, w: r.width, h: r.height,
          color: getComputedStyle(e).color,
        };
      });
    });
    await handle.evaluate((s) =>
      s.querySelectorAll("h2, p, a").forEach((e) => ((e as HTMLElement).style.visibility = "hidden"))
    );
    const sectionWidth = await handle.evaluate((s) => s.getBoundingClientRect().width);
    const png = (await handle.screenshot()).toString("base64");

    const worst = await page.evaluate(
      async ({ png, boxes, sectionWidth }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${png}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const scale = img.width / sectionWidth;
        const ch = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const lum = (r: number, g: number, b: number) => 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
        let min = 99;
        for (const b of boxes) {
          const m = b.color.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/)!;
          const fg = [+m[1], +m[2], +m[3]];
          const a = m[4] === undefined ? 1 : +m[4];
          const d = ctx.getImageData(b.x * scale, b.y * scale, Math.max(1, b.w * scale), Math.max(1, b.h * scale)).data;
          for (let i = 0; i < d.length; i += 4) {
            const bg = [d[i], d[i + 1], d[i + 2]];
            const f = fg.map((v, k) => v * a + bg[k] * (1 - a));
            const l1 = lum(f[0], f[1], f[2]), l2 = lum(bg[0], bg[1], bg[2]);
            min = Math.min(min, (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
          }
        }
        return min;
      },
      { png, boxes, sectionWidth }
    );
    expect(worst, `schlechtester Einzelpixel ${worst.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  test("die Nachbarseiten bekommen kein Hintergrundbild", async ({ page }) => {
    for (const path of ["/anleitung", "/impressum", "/datenschutz"]) {
      await page.goto(path);
      await expect(
        page.locator('main img[alt=""]:not(section img)'),
        `${path} trägt ein Hintergrundbild`
      ).toHaveCount(0);
      // Auch keinen App-Screenshot — der gehört nur zu /about.
      await expect(page.locator("main img[src*='about-hero-navigation']")).toHaveCount(0);
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

  // Gezogen in Refinement 12: Bis dahin prüfte dieser Test, dass zwei
  // Hero-Sätze (Ersteller, Spieler) gleich gesetzt sind. Der Spieler-Satz ist
  // entfallen; der Hero trägt genau einen Absatz in der Body-Schrift.
  test("der Hero trägt genau einen Absatz in der Body-Schrift", async ({ page }) => {
    await page.goto("/about");

    const heroBody = await page.evaluate(() => {
      const h1 = document.querySelector("h1")!;
      const block = h1.parentElement!;
      return [...block.querySelectorAll("p")]
        // Die Preiszeile steht in der Tech-Schrift (Orbitron); ihr Font-Stack
        // nennt Rubik als Ausweichschrift, deshalb über die Klasse filtern.
        .filter((p) => !p.classList.contains("text-tech"))
        .map((p) => (p.textContent || "").trim().slice(0, 30));
    });
    expect(heroBody).toEqual(["Erstelle GPS-Schnitzeljagden u"]);
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

    // Seit Refinement 12 auf die Copy für Eltern und Lehrkräfte gezogen.
    await expect(page.getByText(/^Erstelle GPS-Schnitzeljagden/)).toBeVisible();
    await expect(page.getByText("Lass deine Klasse selbst eine Quest bauen")).toBeVisible();
    await expect(page.getByText(/^Bring den Unterricht nach draußen/)).toBeVisible();

    await expect(page.getByText(/Nimm die Herausforderung an/)).toHaveCount(0);
    await expect(page.getByText("Draußen ist das Game.")).toHaveCount(0);
    await expect(page.getByText(/Verbessere das Lernen durch Bewegung/)).toHaveCount(0);

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
