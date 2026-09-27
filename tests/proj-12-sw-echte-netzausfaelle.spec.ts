import { test, expect, type Page } from "@playwright/test";

/**
 * PROJ-12 Refinement 5 (2026-09-27) — der Worker meldet nur ECHTE Netzausfaelle.
 *
 * DER GEMELDETE FEHLER: Nach dem Umzug auf die eigene Domain liess sich die App
 * auf dem iPhone nicht oeffnen — Safari zeigte "keine Internetverbindung", oder
 * es oeffnete sich gar nichts. Die Infrastruktur war gemessen gesund (alle
 * Endpunkte HTTP 200, Zertifikat gueltig, DNS korrekt). Die Meldung kam aus der
 * App selbst.
 *
 * URSACHE: Der `fetch`-Handler in `public/sw.js` behandelte JEDEN
 * `fetch()`-Fehler als "offline". `fetch()` wirft aber bei jedem
 * Transportfehler — abgebrochene Verbindung, Timeout, Netzwechsel. Dazu warf
 * der leere Cache einen eigenen Fehler, was die `respondWith`-Zusage ablehnte
 * und dem Nutzer eine LEERE SEITE zeigte.
 *
 * WARUM DIESE WAECHTER BISHER FEHLTEN: Keine Assertion pruefte, was bei einem
 * fehlgeschlagenen Ladevorgang passiert, waehrend das Netz VORHANDEN ist. Die
 * bestehenden Offline-Tests schalten das Netz ab und pruefen damit genau den
 * einen Fall, der schon immer richtig war.
 */
test.use({ serviceWorkers: "allow" });

/** Wartet, bis der Worker die Seite kontrolliert (sonst greift sein fetch-Handler nicht). */
async function warteAufKontrolle(page: Page) {
  const kontrolliert = async () =>
    page
      .waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 8000 })
      .then(() => true)
      .catch(() => false);

  if (await kontrolliert()) return;
  // Beim Erstbesuch registriert sich der Worker, waehrend die Seite schon
  // laeuft — ein einmaliger Reload uebergibt die Kontrolle. Gleiches Muster
  // wie in den beiden bestehenden PROJ-12-Suiten.
  await page.reload();
  expect(await kontrolliert()).toBe(true);
}

test.describe("PROJ-12: Worker meldet nur echte Netzausfaelle", () => {
  test("die Offline-Seite greift bei einem ECHTEN Netzausfall weiterhin", async ({ page, context, browserName }) => {
    // Auf WebKit wirft setOffline(true) + goto() einen internen
    // Playwright-Fehler (dokumentierte Umgebungsgrenze, siehe Hauptsuite).
    test.skip(browserName === "webkit", "WebKit kann Offline-Navigation nicht nachstellen");

    await page.goto("/");
    await warteAufKontrolle(page);

    await context.setOffline(true);
    await page.goto("/");

    // Das Refinement darf die Offline-Seite NICHT abschaffen — sie ist der
    // Grund, warum es den Worker ueberhaupt gibt.
    await expect(page.getByRole("heading", { name: /keine verbindung/i })).toBeVisible();

    await context.setOffline(false);
  });

  test("setOffline setzt navigator.onLine wirklich auf false", async ({ page, context }) => {
    // Das Pruefmittel selbst absichern: Der neue Guard haengt an
    // `navigator.onLine`. Wuerde setOffline() den Wert nicht aendern, pruefte
    // der Test oben etwas anderes als er behauptet — und das waere nicht zu
    // sehen, weil er trotzdem gruen liefe.
    await page.goto("/");
    expect(await page.evaluate(() => navigator.onLine)).toBe(true);

    await context.setOffline(true);
    expect(await page.evaluate(() => navigator.onLine)).toBe(false);

    await context.setOffline(false);
    expect(await page.evaluate(() => navigator.onLine)).toBe(true);
  });

  /**
   * DER ZENTRALE FALL LIEGT NICHT HIER, SONDERN IN
   * `src/lib/sw-fetch-handler.test.ts` — und das ist eine Messung, keine
   * Bequemlichkeit.
   *
   * An dieser Stelle stand ein E2E-Test, der einen Transportfehler bei
   * vorhandenem Netz per `page.route(...).abort()` erzeugen wollte. Gemessen
   * greift Playwrights Route-Interception NICHT fuer Requests, die der Service
   * Worker stellt: Die Navigation kam mit HTTP 200 und der echten Quest-Liste
   * zurueck. Der Test prueefte damit eine erfolgreich geladene Seite und
   * bestand AUCH GEGEN DIE FEHLERHAFTE FASSUNG — ein gruener Test, der nichts
   * belegt. Aufgefallen ist das ausschliesslich durch die Gegenprobe.
   *
   * Der Unit-Test fuehrt stattdessen das echte `public/sw.js` in einem
   * nachgebauten Worker-Scope aus und trifft die Kombination, die Playwright
   * hier nicht herstellen kann (Netz vorhanden, einzelner Request scheitert).
   * Gegen die fehlerhafte Fassung fallen dort genau die 2 Tests der beiden
   * gemeldeten Symptome.
   */

  test("der Worker cacht weiterhin ausschliesslich die Offline-Seite", async ({ page }) => {
    await page.goto("/");
    await warteAufKontrolle(page);
    await page.goto("/play");
    await page.goto("/about");

    // Das PRD-Non-Goal "Kein Offline-Modus" bleibt strukturell unverletzbar.
    // Die Versionserhoehung auf v2 darf daran nichts geaendert haben.
    const inhalt = await page.waitForFunction(async () => {
      const namen = await caches.keys();
      const eigene = namen.filter((n) => n.startsWith("geoquest-"));
      if (eigene.length === 0) return false;
      const c = await caches.open(eigene[0]);
      const keys = await c.keys();
      return { name: eigene[0], urls: keys.map((r) => new URL(r.url).pathname) };
    }, null, { timeout: 8000 }).then((h) => h.jsonValue());

    expect(inhalt).toMatchObject({ urls: ["/offline.html"] });
  });

  test("der Cache-Name ist auf v2 gewechselt und v1 ist abgeraeumt", async ({ page }) => {
    await page.goto("/");
    await warteAufKontrolle(page);

    const namen = await page.waitForFunction(async () => {
      const alle = await caches.keys();
      const eigene = alle.filter((n) => n.startsWith("geoquest-"));
      return eigene.length > 0 ? eigene : false;
    }, null, { timeout: 8000 }).then((h) => h.jsonValue());

    // Genau EIN eigener Cache, und es ist v2. Ein abgebrochener v1-`install`
    // kann einen leeren Cache hinterlassen haben; `activate` raeumt jeden
    // Cache mit anderem Namen ab.
    expect(namen).toEqual(["geoquest-offline-v2"]);
  });

  test("der fetch-Handler ist weiterhin vorhanden (Android-Installierbarkeit)", async ({ page }) => {
    // Ohne registrierten fetch-Handler feuert Chrome/Android kein
    // `beforeinstallprompt` — das P0-Feature "PWA-Installation" fiele auf
    // einer der beiden Hauptplattformen weg. Deshalb wurde der Handler
    // korrigiert und nicht entfernt.
    const quelle = await page.request.get("/sw.js").then((r) => r.text());
    expect(quelle).toContain('addEventListener("fetch"');
    expect(quelle).toContain("navigator.onLine");
  });

  test("Nicht-Navigationen fasst der Worker unveraendert nicht an", async ({ page }) => {
    await page.goto("/");
    await warteAufKontrolle(page);

    // Kartenkacheln, Medien, JS und CSS verhalten sich exakt wie ohne Worker.
    const quelle = await page.request.get("/sw.js").then((r) => r.text());
    expect(quelle).toContain('request.mode !== "navigate"');
  });
});
