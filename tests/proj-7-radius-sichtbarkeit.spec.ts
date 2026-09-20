import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-7 Refinement 3 (2026-09-20): Der Ankunftsradius lag auf kleinen Geräten hinter
 * der Karte und war auch durch Scrollen nicht erreichbar.
 *
 * Gemessen vor dem Fix (Production-Build, Chrome 152, Pfad "Station bearbeiten"):
 * 320x568 um 111px verdeckt, 360x640 um 45px. Ursache: der Karten-Wrapper trug
 * `flex-1 min-h-[220px]` und wuchs über die Unterkante des Scroll-Containers hinaus
 * (Scroller endete bei y470, Karten-Wrapper bei y524), während der Radius-Block
 * dahinter lag. Scrollen half nicht, weil der Scroller weniger Überlauf hatte, als
 * die Karte ihn überragte.
 *
 * Behoben durch eine geänderte Feldreihenfolge: alle Bedienelemente stehen jetzt
 * über der Karte, die Karte ist das letzte Element und das einzige, das angeschnitten
 * sein darf.
 */

const QUEST_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const STATION_A_ID = "ffffffff-ffff-4fff-8fff-ffffffffffff";

// 320x568 ist kein PRD-Format (das nennt 360-430px), aber der Viewport, auf dem beide
// Befunde dieses Refinements am deutlichsten auftraten. Wer hier besteht, besteht auch
// auf den PRD-Breiten.
const ENG = { width: 320, height: 568 };
const REFERENZ = { width: 360, height: 640 };

function draftQuest(stations: unknown[] = []) {
  return {
    version: 1,
    id: QUEST_ID,
    name: "Radius-Quest",
    lastModified: "2026-01-01T00:00:00.000Z",
    intro: { text: "" },
    outro: { text: "" },
    stations,
  };
}

function station(overrides: Record<string, unknown> = {}) {
  return {
    id: STATION_A_ID,
    name: "Der alte Brunnen",
    lat: 52.5,
    lng: 13.4,
    radiusMeters: 25,
    modules: [],
    ...overrides,
  };
}

async function seedQuest(page: Page, quest: unknown) {
  await page.goto("/create");
  await page.evaluate((q) => {
    localStorage.setItem("gq_first_visit_done", "true");
    localStorage.setItem("gq_quests", JSON.stringify([q]));
  }, quest);
  await page.goto(`/create/${QUEST_ID}`);
}

/** Öffnet das Sheet über den Bearbeiten-Pfad — der Fall aus dem Betreiber-Befund. */
async function oeffneBearbeiten(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await seedQuest(page, draftQuest([station()]));
  await page.getByRole("button", { name: "Stations-Aktionen" }).click();
  await page.getByRole("menuitem", { name: "Station bearbeiten" }).click();
  await page.locator(".leaflet-container").waitFor();
}

async function oeffneHinzufuegen(page: Page, viewport: { width: number; height: number }) {
  await page.setViewportSize(viewport);
  await seedQuest(page, draftQuest());
  await page.getByRole("button", { name: "Station hinzufügen" }).click();
  await page.locator(".leaflet-container").waitFor();
}

/**
 * Prüft, ob die gesamte Radius-Einheit im sichtbaren Fenster des Scroll-Containers
 * liegt — nicht nur, ob sie im DOM ist. Genau das war der Unterschied: Der Slider war
 * durchgehend im DOM und laut `toBeVisible()` sichtbar, lag aber hinter der Karte.
 */
async function radiusSichtbarkeit(page: Page) {
  return page.evaluate(() => {
    const sheet = document.querySelector('[role="dialog"]') as HTMLElement;
    const alle = Array.from(sheet.querySelectorAll("*")) as HTMLElement[];
    const label = alle.find(
      (el) => el.textContent?.trim() === "Ankunftsradius" && el.children.length === 0
    );
    const slider = sheet.querySelector('[role="slider"]') as HTMLElement | null;
    const scroller = alle.find((el) => getComputedStyle(el).overflowY === "auto");
    if (!label || !slider || !scroller) return null;

    const sc = scroller.getBoundingClientRect();
    const lb = label.getBoundingClientRect();
    const sl = slider.getBoundingClientRect();

    // Hit-Test auf das LABEL, nicht auf den Slider-Thumb. Gemessen an der alten Fassung:
    // Der Thumb ragte zufällig über die Kartenkante hinaus und war dort anklickbar,
    // während "Ankunftsradius" und die Meter-Anzeige vollständig hinter dem
    // Leaflet-Container lagen (elementFromPoint auf der Label-Mitte lieferte
    // `leaflet-container`, das Label stand im Stapel erst an dritter Stelle).
    // Ein Test auf den Thumb allein hätte den gemeldeten Fehler durchgelassen.
    const obenAufLabel = document.elementFromPoint(lb.left + lb.width / 2, lb.top + lb.height / 2);
    const obenAufSlider = document.elementFromPoint(sl.left + sl.width / 2, sl.top + sl.height / 2);

    return {
      labelImFenster: lb.top >= sc.top - 1 && lb.bottom <= sc.bottom + 1,
      sliderImFenster: sl.top >= sc.top - 1 && sl.bottom <= sc.bottom + 1,
      labelIstObenAuf: label.contains(obenAufLabel) || obenAufLabel === label,
      sliderIstObenAuf: slider.contains(obenAufSlider) || obenAufSlider === slider,
      scrollTop: scroller.scrollTop,
    };
  });
}

test.describe("PROJ-7 Refinement 3: Ankunftsradius auf kleinen Geräten", () => {
  test.describe("Radius ohne Scrollen sichtbar", () => {
    for (const vp of [ENG, REFERENZ]) {
      test(`zeigt Label, Wert und Slider vollständig beim Bearbeiten auf ${vp.width}x${vp.height}`, async ({
        page,
      }) => {
        await oeffneBearbeiten(page, vp);

        const sicht = await radiusSichtbarkeit(page);
        expect(sicht).not.toBeNull();
        // Ohne jede Scroll-Bewegung — der Auslöser des Befunds war "ich sehe ihn nicht",
        // nicht "ich komme nicht hin".
        expect(sicht!.scrollTop).toBe(0);
        expect(sicht!.labelImFenster).toBe(true);
        expect(sicht!.sliderImFenster).toBe(true);
        // Das eigentliche Fehlerbild: Die Radius-Einheit war im DOM und laut
        // `toBeVisible()` sichtbar, lag aber hinter der Kartenfläche.
        expect(sicht!.labelIstObenAuf).toBe(true);
        expect(sicht!.sliderIstObenAuf).toBe(true);

        // Der gespeicherte Wert muss lesbar sein, nicht nur der Slider bedienbar.
        await expect(page.getByText("25 m", { exact: true }).first()).toBeVisible();
      });

      test(`zeigt den Radius auch beim Hinzufügen auf ${vp.width}x${vp.height}`, async ({ page }) => {
        await oeffneHinzufuegen(page, vp);

        const sicht = await radiusSichtbarkeit(page);
        expect(sicht!.scrollTop).toBe(0);
        expect(sicht!.labelImFenster).toBe(true);
        expect(sicht!.sliderImFenster).toBe(true);
        expect(sicht!.labelIstObenAuf).toBe(true);
        expect(sicht!.sliderIstObenAuf).toBe(true);
      });
    }

    test("der Radius bleibt bedienbar, nicht nur sichtbar", async ({ page }) => {
      await oeffneBearbeiten(page, ENG);

      // `aria-label="Ankunftsradius"` sitzt am Radix-Root, der Thumb darunter trägt
      // `role="slider"` ohne eigenen Namen — deshalb über den Thumb selbst gehen.
      const slider = page.locator('[role="slider"]');
      await slider.focus();
      await slider.press("ArrowRight");
      await expect(page.getByText("50 m", { exact: true }).first()).toBeVisible();

      await page.getByRole("button", { name: "Speichern" }).click();
      const gespeichert = await page.evaluate(
        () => JSON.parse(localStorage.getItem("gq_quests")!)[0].stations[0].radiusMeters
      );
      expect(gespeichert).toBe(50);
    });
  });

  test.describe("Feldreihenfolge", () => {
    test("stellt jedes Bedienelement über die Karte", async ({ page }) => {
      await oeffneBearbeiten(page, REFERENZ);

      const reihenfolge = await page.evaluate(() => {
        const sheet = document.querySelector('[role="dialog"]') as HTMLElement;
        const y = (el: Element | null) => (el ? el.getBoundingClientRect().top : NaN);
        const alle = Array.from(sheet.querySelectorAll("*")) as HTMLElement[];
        const radiusLabel = alle.find(
          (el) => el.textContent?.trim() === "Ankunftsradius" && el.children.length === 0
        );
        return {
          name: y(sheet.querySelector("#station-name")),
          position: y(
            alle.find((el) => el.textContent?.trim() === "Position" && el.children.length === 0) ?? null
          ),
          adresse: y(sheet.querySelector('input[type="search"], [cmdk-input]')),
          radius: y(radiusLabel ?? null),
          karte: y(sheet.querySelector(".leaflet-container")),
        };
      });

      expect(reihenfolge.name).toBeLessThan(reihenfolge.position);
      expect(reihenfolge.position).toBeLessThan(reihenfolge.adresse);
      expect(reihenfolge.adresse).toBeLessThan(reihenfolge.radius);
      // Der Kern des Fixes: Die Karte ist das letzte Element.
      expect(reihenfolge.radius).toBeLessThan(reihenfolge.karte);
    });

    test("hält die DOM-Reihenfolge mit der sichtbaren gleich (Tab-Reihenfolge)", async ({ page }) => {
      await oeffneBearbeiten(page, REFERENZ);

      // Umsortierung passiert im Markup, nicht per CSS `order` — sonst laufen
      // Tastatur-Reihenfolge und Screenreader-Ausgabe gegen die sichtbare Ordnung.
      const stimmtUeberein = await page.evaluate(() => {
        const sheet = document.querySelector('[role="dialog"]') as HTMLElement;
        const alle = Array.from(sheet.querySelectorAll("*")) as HTMLElement[];
        const radiusLabel = alle.find(
          (el) => el.textContent?.trim() === "Ankunftsradius" && el.children.length === 0
        )!;
        const karte = sheet.querySelector(".leaflet-container")!;
        // compareDocumentPosition: FOLLOWING (4) heißt, die Karte steht im DOM danach.
        return (radiusLabel.compareDocumentPosition(karte) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      });
      expect(stimmtUeberein).toBe(true);
    });
  });

  test.describe("Karte als einziges angeschnittenes Element", () => {
    test("überlagert kein Bedienelement über ihr", async ({ page }) => {
      await oeffneBearbeiten(page, ENG);

      const ueberlagerung = await page.evaluate(() => {
        const sheet = document.querySelector('[role="dialog"]') as HTMLElement;
        const alle = Array.from(sheet.querySelectorAll("*")) as HTMLElement[];
        const scroller = alle.find((el) => getComputedStyle(el).overflowY === "auto")!;
        const karte = sheet.querySelector(".leaflet-container")!.parentElement!;
        const kb = karte.getBoundingClientRect();
        const sc = scroller.getBoundingClientRect();

        // Der Karten-Wrapper ragt über die Unterkante des Scrollers hinaus — das ist
        // nach dem Fix erlaubt, weil `overflow-y-auto` ihn dort abschneidet und im
        // Scroll-Fluss nichts mehr hinter ihm liegt. Maßgeblich ist deshalb der
        // SICHTBARE Kartenrand, nicht der Layout-Rand.
        const sichtbarerKartenBoden = Math.min(kb.bottom, sc.bottom);

        // Bedienelemente INNERHALB des Scrollers dürfen von der sichtbaren Kartenfläche
        // nicht überlappt werden. Abbrechen/Speichern liegen im fixierten Footer
        // außerhalb des Scrollers und sind hier zu Recht nicht gemeint — dafür gibt es
        // seit 2026-09-06 einen eigenen Test.
        const bedienelemente = Array.from(
          scroller.querySelectorAll('input, button, [role="slider"]')
        ) as HTMLElement[];
        const ueberlappt = bedienelemente
          .filter((el) => {
            const b = el.getBoundingClientRect();
            if (b.height === 0) return false;
            if (karte.contains(el)) return false;
            return b.top < sichtbarerKartenBoden && b.bottom > kb.top;
          })
          .map((el) => (el.textContent || el.tagName).trim().slice(0, 40));

        return { ueberlappt, anzahlGeprueft: bedienelemente.length };
      });

      // Vor dem Fix lag der Radius-Slider genau hier — innerhalb des Scrollers und
      // unter der sichtbaren Kartenfläche.
      expect(ueberlagerung.anzahlGeprueft).toBeGreaterThan(0);
      expect(ueberlagerung.ueberlappt).toEqual([]);
    });

    test("gibt die Karte durch Scrollen vollständig frei und behält 220px", async ({ page }) => {
      await oeffneBearbeiten(page, ENG);

      const nachScroll = await page.evaluate(() => {
        const sheet = document.querySelector('[role="dialog"]') as HTMLElement;
        const alle = Array.from(sheet.querySelectorAll("*")) as HTMLElement[];
        const scroller = alle.find((el) => getComputedStyle(el).overflowY === "auto")!;
        const karte = sheet.querySelector(".leaflet-container")!.parentElement!;
        scroller.scrollTop = scroller.scrollHeight;
        const kb = karte.getBoundingClientRect();
        const sc = scroller.getBoundingClientRect();
        return {
          vollStaendigSichtbar: kb.bottom <= sc.bottom + 1 && kb.top >= sc.top - 1,
          hoehe: Math.round(kb.height),
        };
      });

      expect(nachScroll.vollStaendigSichtbar).toBe(true);
      // Die Mindesthöhe-Entscheidung von 2026-09-06 bleibt unangetastet.
      expect(nachScroll.hoehe).toBeGreaterThanOrEqual(220);
    });

    test("lässt die Karte auf großen Bildschirmen weiterhin wachsen", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await seedQuest(page, draftQuest([station()]));
      await page.getByRole("button", { name: "Stations-Aktionen" }).click();
      await page.getByRole("menuitem", { name: "Station bearbeiten" }).click();
      await page.locator(".leaflet-container").waitFor();

      // Der Fix darf die Karte nicht überall auf ihre Mindesthöhe festnageln — auf
      // 1440x900 war sie vorher ~395px und soll den freien Platz weiter nutzen.
      const hoehe = await page
        .locator(".leaflet-container")
        .evaluate((el) => Math.round(el.parentElement!.getBoundingClientRect().height));
      expect(hoehe).toBeGreaterThan(220);
    });
  });

  test.describe("Breite auf schmalen Geräten", () => {
    for (const vp of [ENG, REFERENZ]) {
      test(`zeigt "Aktuelle Position verwenden" vollständig auf ${vp.width}px`, async ({ page }) => {
        await oeffneBearbeiten(page, vp);

        const btn = page.getByRole("button", { name: /Aktuelle Position verwenden/ });
        const box = (await btn.boundingBox())!;

        // Lief vor dem Fix rechts aus dem Bild: Der Button steckte mit einem langen
        // Label in einer `justify-between`-Zeile neben dem "Position"-Label.
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
        expect(box.height).toBeGreaterThanOrEqual(44);

        // Die Beschriftung darf auch innerhalb des Buttons nicht abgeschnitten sein.
        const textUeberlauf = await btn.evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(textUeberlauf).toBeLessThanOrEqual(0);
      });
    }

    for (const breite of [320, 360, 390, 430, 1440]) {
      test(`erzeugt keinen horizontalen Überlauf auf ${breite}px`, async ({ page }) => {
        await oeffneBearbeiten(page, { width: breite, height: 800 });

        const ueberlauf = await page.evaluate(() => {
          const sheet = document.querySelector('[role="dialog"]') as HTMLElement;
          return {
            seite: document.documentElement.scrollWidth > window.innerWidth,
            sheet: sheet.scrollWidth > sheet.clientWidth,
          };
        });
        expect(ueberlauf.seite).toBe(false);
        expect(ueberlauf.sheet).toBe(false);
      });
    }
  });
});
