import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-12, Refinement 3 — Safe Area der installierten App.
 *
 * Betreiber-Befund am Geraet: In der auf iOS installierten App verdecken
 * Uhrzeit, Batterie und WLAN-Anzeige das Burger-Menu und den Zurueck-Pfeil.
 * Im Browser nicht. Ursache: `statusBarStyle: "black-translucent"` und
 * `viewportFit: "cover"` lassen die Seite bei y=0 beginnen, aber kein Screen
 * las `env(safe-area-inset-top)`.
 *
 * WAS HIER NICHT GEHT: Playwright emuliert `env(safe-area-inset-*)` nicht —
 * weder Chrome noch WebKit. Der echte Inset ist in dieser Umgebung immer 0px.
 * Diese Datei prueft deshalb drei Dinge, die sie belegen KANN:
 *
 *  1. Der Browser-Zustand ist unveraendert (der Inset ist dort 0px — jede
 *     Verschiebung waere ein Fehler). Das ist die ausdrueckliche Zusicherung
 *     an den Betreiber.
 *  2. Die Mechanik stimmt: Ein simulierter Inset verschiebt die Bedienelemente
 *     um exakt seinen Betrag nach unten, ohne die Kopfzeile zu stauchen.
 *  3. Der CSS-Vertrag: die Utilities bauen auf `env()` auf, nicht auf festen
 *     Werten, und die Kopfzeilen tragen `box-content`.
 *
 * Das Erscheinungsbild auf einem echten iPhone bleibt Augenschein.
 */

const QUEST = {
  id: "safe-area-1",
  title: "Safe Area Quest",
  description: "x",
  stations: [
    { id: "st-1", name: "Station 1", lat: 52.5, lng: 13.4, radiusMeters: 30, modules: [] },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((q) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify([q]));
  }, QUEST);
});

/**
 * Simuliert den iOS-Inset. `env()` selbst laesst sich nicht setzen, aber die
 * Utilities bauen darauf auf — ersetzt man die Regeln durch dieselben mit
 * festem Wert, misst man exakt den Weg, den der echte Inset nehmen wuerde.
 */
async function simulateInset(page: Page, top: number, bottom: number) {
  await page.addStyleTag({
    content: `
      .pt-safe-top { padding-top: ${top}px !important; }
      .bottom-safe-6 { bottom: calc(${bottom}px + 1.5rem) !important; }
      .bottom-safe-fab-stack { bottom: calc(${bottom}px + 84px) !important; }`,
  });
}

test.describe("Der Browser-Zustand bleibt unveraendert", () => {
  // Die Zusicherung an den Betreiber: "im Browser sieht alles gut aus, das
  // will ich nicht verlieren". `env()` ist im Browser 0px, weil Safari den
  // Platz unter seiner Adressleiste selbst freihaelt.
  for (const path of ["/play", "/create"]) {
    test(`${path}: die Kopfzeile hat im Browser keinen zusaetzlichen Abstand`, async ({ page }) => {
      await page.goto(path);
      const header = page.locator("header").first();
      const box = await header.boundingBox();
      expect(box?.y).toBe(0);
      expect(box?.height).toBe(56);
      expect(await header.evaluate((e) => getComputedStyle(e).paddingTop)).toBe("0px");
    });
  }

  test("/about: die Sticky-Kopfzeile hat im Browser keinen zusaetzlichen Abstand", async ({ page }) => {
    await page.goto("/about");
    const header = page.locator("header").first();
    expect((await header.boundingBox())?.y).toBe(0);
    expect(await header.evaluate((e) => getComputedStyle(e).paddingTop)).toBe("0px");
  });

  test("/: der schwebende Burger sitzt unveraendert bei y=12 mit 44x44", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const btn = page.locator("main > div.absolute button").first();
    const box = await btn.boundingBox();
    expect(box?.y).toBe(12);
    expect(box?.width).toBe(44);
    expect(box?.height).toBe(44);
  });

  test("/: der Startscreen scrollt auf 360x640 weiterhin nicht", async ({ page }) => {
    // PROJ-1-Kriterium. Ein oberer Inset, der im Browser faelschlich Platz
    // kostet, wuerde genau hier zuerst auffallen.
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/");
    const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(scrollH).toBeLessThanOrEqual(640);
  });

  test("/create: der FAB steht im Browser unveraendert 24px ueber der Unterkante", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/create");
    const fab = page.locator("button.fixed").first();
    await expect(fab).toBeVisible();
    // Gemessen wird der berechnete `bottom`-Wert, nicht `innerHeight` minus
    // Rechteck: der FAB ist `fixed`, und `innerHeight` weicht je nach Engine
    // vom Layout-Viewport ab (gemessen: Chrome 844, WebKit 664 bei gleichem
    // Geraeteprofil). Die Differenz waere ein Messartefakt, kein Produktwert.
    expect(await fab.evaluate((e) => getComputedStyle(e).bottom)).toBe("24px");
  });
});

test.describe("Die Mechanik — ein Inset schiebt nach unten, statt zu stauchen", () => {
  // Der gemeldete Fehler: Bedienelemente liegen UNTER der Statusleiste.
  // Behoben heisst: sie liegen vollstaendig darunter, bei voller Tap-Groesse.
  for (const [label, inset] of [["Notch", 47], ["Dynamic Island", 59]] as const) {
    test(`${label} (${inset}px): das erste Bedienelement in der App-Kopfzeile liegt darunter`, async ({ page }) => {
      await page.goto("/play");
      await simulateInset(page, inset, 34);
      const ctrl = page.locator("header a, header button").first();
      const box = await ctrl.boundingBox();
      // Der eigentliche Fehler waere box.y < inset.
      expect(box!.y).toBeGreaterThanOrEqual(inset);
      // Und das Tap-Ziel darf dabei nicht gestaucht werden — ohne
      // `box-content` wuerde `h-14` den Inset von den 56px abziehen.
      expect(box!.height).toBe(44);
    });

    test(`${label} (${inset}px): die Info-Kopfzeile liegt darunter`, async ({ page }) => {
      await page.goto("/about");
      await simulateInset(page, inset, 34);
      const ctrl = page.locator("header a, header button").first();
      expect((await ctrl.boundingBox())!.y).toBeGreaterThanOrEqual(inset);
    });

    test(`${label} (${inset}px): der schwebende Burger auf / liegt darunter`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");
      await simulateInset(page, inset, 34);
      const btn = page.locator("main > div.absolute button").first();
      const box = await btn.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(inset);
      expect(box!.height).toBe(44);
    });
  }

  test("die Kopfzeile beginnt trotz Inset bei y=0 — kein durchsichtiger Spalt", async ({ page }) => {
    // Der Fallstrick: Liegt der Inset VOR der Kopfzeile statt darin, begaenne
    // die Blur-Flaeche erst unterhalb der Statusleiste, und darueber stuende
    // blanker Inhalt. Die Flaeche muss bis zur obersten Kante reichen.
    await page.goto("/play");
    await simulateInset(page, 47, 34);
    const header = page.locator("header").first();
    const box = await header.boundingBox();
    expect(box!.y).toBe(0);
    // Die Flaeche waechst nach oben mit, statt Inhalt zu verdraengen.
    expect(box!.height).toBe(56 + 47);
  });

  test("der FAB weicht dem Home-Indikator aus, und sein Aktionsmenue folgt ihm", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/create");
    await simulateInset(page, 47, 34);

    // Ueber den Accessible Name statt ueber `button.fixed`: der FAB traegt
    // `transition-all`, und `addStyleTag` loest einen Restyle aus — eine
    // Messung im falschen Moment liest einen Zwischenwert der Animation
    // (gemessen: 44.2548px statt 58px).
    const fab = page.getByRole("button", { name: "Quest hinzufügen" });
    await expect(fab).toBeVisible();
    // 24px Gutter + 34px Home-Indikator. Gemessen wird der berechnete
    // `bottom`-Wert, nicht `innerHeight` minus Rechteck: `innerHeight` weicht
    // je nach Engine vom Layout-Viewport ab (Chrome 844, WebKit 664 bei
    // gleichem Geraeteprofil) und waere ein Messartefakt.
    await expect
      .poll(() => fab.evaluate((e) => getComputedStyle(e).bottom))
      .toBe("58px");

    // Das ausgeklappte Aktionsmenue muss denselben Inset tragen, sonst rueckt
    // der FAB nach oben und das Menue nicht — der Abstand zwischen beiden
    // verschwaende. Gemessen wird der Abstand, nicht die absolute Position.
    await fab.click();
    const stack = page.locator("div.fixed.right-5.z-40").first();
    await expect(stack).toBeVisible();
    // Geprueft wird der berechnete `bottom`-Wert beider Elemente, nicht ihr
    // Abstand im Rechteck: Beide sind `fixed`, ihr Abstand ergibt sich allein
    // aus diesen beiden Werten und der FAB-Hoehe (48px). Ueber die Rechtecke
    // zu gehen hiesse, die Einblend-Animation des Menues (`translate-y-3`)
    // mitzumessen — ein Messartefakt, kein Produktwert.
    // 118px = 34px Home-Indikator + 84px; 84px = 24px Gutter + 48px FAB + 12px.
    await expect
      .poll(() => stack.evaluate((e) => getComputedStyle(e).bottom))
      .toBe("118px");
  });
});

test.describe("Der CSS-Vertrag", () => {
  // Diese Tests halten fest, WIE die Loesung gebaut ist — nicht aus Selbstzweck,
  // sondern weil eine feste Ersatzhoehe oder eine Plattform-Abfrage im Browser
  // und auf Geraeten ohne Notch stillschweigend falschen Leerraum erzeugen
  // wuerde. Das ist die Fehlerklasse von BUG-6 (PROJ-3).
  test("die Utilities bauen auf env() auf, nicht auf festen Werten", async ({ page }) => {
    await page.goto("/play");
    const rules = await page.evaluate(() => {
      const found: Record<string, string> = {};
      for (const sheet of [...document.styleSheets]) {
        let list: CSSRuleList;
        try { list = sheet.cssRules; } catch { continue; }
        for (const rule of [...list] as CSSStyleRule[]) {
          if (!rule.selectorText) continue;
          for (const name of [".pt-safe-top", ".bottom-safe-6", ".bottom-safe-fab-stack"]) {
            if (rule.selectorText === name) found[name] = rule.style.cssText;
          }
        }
      }
      return found;
    });
    expect(rules[".pt-safe-top"]).toContain("safe-area-inset-top");
    expect(rules[".bottom-safe-6"]).toContain("safe-area-inset-bottom");
    expect(rules[".bottom-safe-fab-stack"]).toContain("safe-area-inset-bottom");
  });

  test("die App-Kopfzeile traegt box-content, damit der Inset die Zeile nicht staucht", async ({ page }) => {
    await page.goto("/play");
    const header = page.locator("header").first();
    expect(await header.evaluate((e) => getComputedStyle(e).boxSizing)).toBe("content-box");
  });

  test("die Backdrops bleiben randlos — sie tragen die Flaeche unter der Statusleiste", async ({ page }) => {
    // Bewusst KEIN Inset: Ohne Flaeche unter der durchscheinenden Statusleiste
    // stuenden Uhrzeit und Batterie auf blankem Grund.
    await page.goto("/play");
    const backdrop = page.locator("div.fixed.inset-0").first();
    const box = await backdrop.boundingBox();
    expect(box?.y).toBe(0);
  });
});
