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

  test("beide Bilder tragen einen Alternativtext", async ({ page }) => {
    await page.goto("/about");
    const missing = await page
      .locator("img")
      .evaluateAll((els) => els.filter((e) => !(e as HTMLImageElement).alt).length);
    expect(missing).toBe(0);
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

  test("das Logo-Lockup weicht ab lg, bleibt auf Handy und Tablet", async ({
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
      "am Laptop kostet es den CTA den Platz — Marke steht im Header und in der Headline"
    ).toBeHidden();
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

  test("der Creator-Empty-State verlinkt weiterhin auf die Anleitung", async ({
    page,
  }) => {
    await page.goto("/create");
    const link = page.getByRole("link", { name: /Quest mit KI bauen/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/anleitung$/);
  });
});
