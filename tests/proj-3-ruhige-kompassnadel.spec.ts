import { test, expect, type Page, type BrowserContext } from "@playwright/test";

/**
 * PROJ-3 Refinement 2026-09-20 — Ruhige Kompassnadel.
 *
 * Befund aus einem Handy-Test im Gelände: Der Richtungspfeil sprang ruckartig
 * und drehte sich zeitweise ganz um sich selbst.
 *
 * **Was diese Datei kann und was nicht:** Playwright emuliert keinen
 * Magnetometer. Synthetische `deviceorientation`-Events kommen aber in der
 * Seite an, und damit ist der komplette reale Pfad prüfbar —
 * Sensor → Hook → Glättung → Rotation → CSS-Transform. Was hier *nicht*
 * geprüft werden kann, ist das Rauschverhalten echter Hardware; die reine
 * Winkelmathematik liegt deshalb zusätzlich in
 * `src/lib/geo-utils.test.ts` und `src/hooks/use-arrow-rotation.test.ts`.
 */

const TEST_QUEST = {
  version: 1,
  id: "a1111111-1111-4111-8111-111111111111",
  name: "E2E Test Quest",
  lastModified: "2026-08-24T00:00:00.000Z",
  intro: { text: "Willkommen zur Test-Quest!" },
  outro: { text: "Geschafft!" },
  stations: [
    {
      id: "b1111111-1111-4111-8111-111111111111",
      name: "Erste Station",
      lat: 53.61,
      lng: 10.04,
      radiusMeters: 50,
      modules: [{ type: "text", content: "Station 1 Text" }],
    },
    {
      id: "b2222222-2222-4222-8222-222222222222",
      name: "Zweite Station",
      lat: 53.62,
      lng: 10.05,
      radiusMeters: 30,
      modules: [{ type: "text", content: "Station 2 Text" }],
    },
  ],
};

/**
 * Startet die Navigation zur ersten Station.
 *
 * Die Position liegt bewusst weit genug entfernt, dass keine Ankunft
 * ausgelöst wird — sonst verschwindet der Pfeil hinter dem Gratulationsscreen.
 */
async function startNavigation(page: Page, context: BrowserContext) {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 53.6, longitude: 10.03 });
  await page.goto("/play");
  await page.evaluate((quest) => {
    localStorage.setItem("gq_quests", JSON.stringify([quest]));
    localStorage.removeItem(`gq_progress_${quest.id}`);
  }, TEST_QUEST);
  await page.goto(`/play/${TEST_QUEST.id}`);
  await page.getByRole("button", { name: /Los geht/ }).click();
  await page.getByRole("button", { name: /Erste Station/ }).click();
  await expect(page.locator("svg path").first()).toBeVisible();
}

/** Liest die aktuelle Rotation des Pfeils aus dem inline-Style. */
async function readRotation(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const svg = document.querySelector("svg[viewBox='0 0 100 100']") as SVGElement | null;
    if (!svg) return null;
    const transform = svg.style.transform;
    const match = /rotate\((-?[\d.]+)deg\)/.exec(transform);
    return match ? parseFloat(match[1]) : null;
  });
}

/** Feuert ein deviceorientation-Event mit iOS-artigem Kompass-Heading. */
async function fireHeading(page: Page, heading: number) {
  await page.evaluate((h) => {
    const event = new Event("deviceorientation");
    Object.defineProperty(event, "webkitCompassHeading", { value: h, configurable: true });
    Object.defineProperty(event, "absolute", { value: true, configurable: true });
    window.dispatchEvent(event);
  }, heading);
}

test.describe("PROJ-3: Ruhige Kompassnadel (Refinement 2026-09-20)", () => {
  test.describe("Fortlaufende Rotation (Edge Case 18)", () => {
    test("dreht beim Nulldurchgang den kurzen Weg statt einer vollen Runde", async ({
      page,
      context,
    }) => {
      // Der Kern des gemeldeten Befunds, am gerenderten Transform gemessen.
      await startNavigation(page, context);

      // **Entscheidend ist, dass die *Rotation* durch null läuft, nicht das
      // Heading.** Die Rotation ist `Peilung − Heading`; eine Drehung des
      // Spielers durch den Nordpunkt lässt sie irgendwo bei 30–50° stehen und
      // trifft die Grenze gar nicht. Ein erster Entwurf dieses Tests tat genau
      // das und bestand deshalb auch mit der fehlerhaften Fassung.
      //
      // Der Nulldurchgang der Rotation liegt dort, wo das Heading die Peilung
      // kreuzt — also dann, wenn das Ziel genau vor oder genau hinter dem
      // Spieler liegt. Deshalb wird hier zuerst die Peilung ermittelt und das
      // Heading dann gezielt an ihr entlanggeführt.
      const bearingToStation = await page.evaluate(() => {
        const DEG = Math.PI / 180;
        const RAD = 180 / Math.PI;
        // Spielerposition aus dem Test, Station aus der Testquest.
        const [lat1, lng1, lat2, lng2] = [53.6, 10.03, 53.61, 10.04];
        const dLng = (lng2 - lng1) * DEG;
        const y = Math.sin(dLng) * Math.cos(lat2 * DEG);
        const x =
          Math.cos(lat1 * DEG) * Math.sin(lat2 * DEG) -
          Math.sin(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.cos(dLng);
        return (Math.atan2(y, x) * RAD + 360) % 360;
      });

      // Heading läuft in kleinen Schritten über die Peilung hinweg — die
      // Rotation wandert dabei durch 0 bzw. 360.
      const rotations: number[] = [];
      for (let offset = 6; offset >= -6; offset -= 2) {
        const h = (bearingToStation + offset + 360) % 360;
        // Mehrfach feuern, damit die Glättung den Zielwert erreicht.
        for (let i = 0; i < 40; i++) await fireHeading(page, h);
        const r = await readRotation(page);
        if (r !== null) rotations.push(r);
      }

      expect(rotations.length).toBeGreaterThan(2);
      // Der Nulldurchgang muss wirklich stattgefunden haben, sonst prüft der
      // Test nichts.
      const spanned = Math.max(...rotations) - Math.min(...rotations);
      expect(spanned).toBeGreaterThan(4);

      // Kein einziger Schritt darf einen Sprung über 180° machen. Genau das
      // wäre die sichtbare Rundumdrehung: Ein normalisierter Wert springt
      // hier von ~359 auf ~1 (oder umgekehrt).
      for (let i = 1; i < rotations.length; i++) {
        const step = Math.abs(rotations[i] - rotations[i - 1]);
        expect(step).toBeLessThan(180);
      }
    });

    test("der Rotationswert darf 0..360 verlassen", async ({ page, context }) => {
      // Der Wächter über die Kernentscheidung: Ein auf 0..360 normalisierter
      // Wert ist genau die Ursache des Befunds. Läuft der Spieler mehrfach
      // im Kreis, muss der Zahlenwert mitwandern statt umzuklappen.
      await startNavigation(page, context);

      let sawOutsideRange = false;
      for (let turn = 0; turn < 2; turn++) {
        for (let h = 0; h < 360; h += 30) {
          for (let i = 0; i < 30; i++) await fireHeading(page, h);
          const r = await readRotation(page);
          if (r !== null && (r < -0.5 || r > 360.5)) sawOutsideRange = true;
        }
      }

      expect(sawOutsideRange).toBe(true);
    });
  });

  test.describe("Ruhe bei stillem Gerät (Edge Case 19)", () => {
    test("die Nadel steht bei Sensorrauschen praktisch still", async ({ page, context }) => {
      await startNavigation(page, context);

      // Einschwingen auf einen festen Wert.
      for (let i = 0; i < 60; i++) await fireHeading(page, 90);
      const settled = await readRotation(page);
      expect(settled).not.toBeNull();

      // Gerät liegt still, der Sensor schwankt um ±6° — der reale Fall.
      let maxDeviation = 0;
      for (const noisy of [96, 84, 95, 85, 94, 86, 93, 87, 92, 88]) {
        await fireHeading(page, noisy);
        const r = await readRotation(page);
        if (r !== null) maxDeviation = Math.max(maxDeviation, Math.abs(r - settled!));
      }

      // Das Rohsignal schlägt um 6° aus; sichtbar darf das nicht ankommen.
      expect(maxDeviation).toBeLessThan(3);
    });

    test("die Nadel folgt einer echten Drehung trotzdem vollständig", async ({
      page,
      context,
    }) => {
      // Gegenstück zum Test davor: Dämpfung darf nicht heißen, dass der Pfeil
      // das Ziel nie erreicht.
      await startNavigation(page, context);

      for (let i = 0; i < 60; i++) await fireHeading(page, 0);
      const before = await readRotation(page);

      for (let i = 0; i < 120; i++) await fireHeading(page, 90);
      const after = await readRotation(page);

      expect(before).not.toBeNull();
      expect(after).not.toBeNull();
      // 90° Drehung des Geräts = 90° Gegendrehung des Pfeils.
      expect(Math.abs(Math.abs(after! - before!) - 90)).toBeLessThan(10);
    });
  });

  test.describe("Kalibrierungs-Hinweis (Edge Case 22)", () => {
    test("erscheint bei nicht-absolutem Heading und ist lesbar groß", async ({
      page,
      context,
    }) => {
      await startNavigation(page, context);

      await page.evaluate(() => {
        const event = new Event("deviceorientation");
        Object.defineProperty(event, "alpha", { value: 90, configurable: true });
        Object.defineProperty(event, "absolute", { value: false, configurable: true });
        window.dispatchEvent(event);
      });

      const hint = page.getByText(/Bewege dein Handy in einer 8/);
      await expect(hint).toBeVisible();

      // Stand bis 2026-09-20 auf 9px und war damit praktisch unlesbar —
      // ausgerechnet der Hinweis, der eine springende Nadel erklärt.
      // Das PRD fordert mindestens 16px Body-Text.
      const fontSize = await hint.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).fontSize)
      );
      expect(fontSize).toBeGreaterThanOrEqual(16);
    });

    test("verschwindet wieder, sobald ein absolutes Heading kommt", async ({
      page,
      context,
    }) => {
      await startNavigation(page, context);

      await page.evaluate(() => {
        const event = new Event("deviceorientation");
        Object.defineProperty(event, "alpha", { value: 90, configurable: true });
        Object.defineProperty(event, "absolute", { value: false, configurable: true });
        window.dispatchEvent(event);
      });
      await expect(page.getByText(/Bewege dein Handy in einer 8/)).toBeVisible();

      await fireHeading(page, 90);
      await expect(page.getByText(/Bewege dein Handy in einer 8/)).not.toBeVisible();
    });
  });

  test.describe("Bestehende Zustände bleiben unberührt", () => {
    test("der richtungslose Pfeil bleibt ohne Heading-Quelle erhalten", async ({
      page,
      context,
    }) => {
      // Edge Case 11 aus dem Refinement 2026-09-06 darf durch die Dämpfung
      // nicht verwässert werden.
      await startNavigation(page, context);
      await expect(page.getByText(/Laufe ein paar Schritte|Kompass aktivieren/)).toBeVisible();
    });

    test("die Entfernung bleibt sichtbar und korrekt", async ({ page, context }) => {
      // Sie war im Befund das Einzige, was funktioniert hat — sie muss es
      // bleiben.
      await startNavigation(page, context);
      for (let i = 0; i < 40; i++) await fireHeading(page, 45);

      // Die Entfernung steht als "<Zahl>m" in einem Element — die Zahl und das
      // "m" liegen im selben Textinhalt (das "m" in einem verschachtelten
      // span). Ein Locator auf eine reine Zahl trifft deshalb nichts.
      const distance = page.locator("div.font-display.italic").first();
      await expect(distance).toBeVisible();
      const text = (await distance.innerText()).replace(/\s+/g, "");
      expect(text).toMatch(/^\d+m$/);

      // Sie war im gemeldeten Befund das Einzige, was funktioniert hat, und
      // muss plausibel bleiben: Die Teststation liegt gut 1 km entfernt.
      const meters = parseInt(text, 10);
      expect(meters).toBeGreaterThan(100);
      expect(meters).toBeLessThan(100000);
    });
  });
});
