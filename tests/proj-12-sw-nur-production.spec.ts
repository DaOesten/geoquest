import { test, expect } from "@playwright/test";

/**
 * PROJ-12 — Service Worker nur in Production (Refinement 2026-09-20, QA).
 *
 * WAS HIER GEPRUEFT WIRD UND WAS NICHT:
 * Diese Suite laeuft gegen den **Production-Build** (playwright.prod.config.ts).
 * Der Dev-Zweig ist hier strukturell nicht erreichbar — er haengt an
 * `NODE_ENV`, das im gebauten Bundle fest `production` ist. Deshalb decken
 * die Unit-Tests in `src/components/service-worker-registration.test.tsx`
 * das Abschalten und das Aufraeumen ab.
 *
 * Diese Datei sichert die **Gegenrichtung**: dass das Refinement den
 * Produktionsbetrieb nicht beschaedigt hat. Genau das waere der teure Fehler —
 * ein Worker, der sich in Production nicht mehr registriert, kostet den
 * Android-Installationsweg und die Offline-Fallback-Seite.
 */
test.use({ serviceWorkers: "allow" });

/**
 * Wartet, bis ein Worker registriert UND sein Cache gefuellt ist.
 *
 * Warum nicht `navigator.serviceWorker.ready`: Das Promise loest nie auf, wenn
 * sich kein Worker registriert — eine Gegenprobe haengt dann bis zum Timeout,
 * statt klar fehlzuschlagen.
 *
 * Warum der Reload: Beim allerersten Besuch registriert sich der Worker,
 * waehrend die Seite schon laeuft. Unter Parallellast (gemessen: 1-2 von 8
 * Tests rot, isoliert dagegen 4/4 gruen in 0ms) kann das laenger dauern als
 * das Warte-Fenster. Das ist eine bekannte Eigenheit dieser Suite — die
 * Hauptdatei `proj-12-pwa-installation.spec.ts` loest sie mit demselben
 * einmaligen Reload. Kein Verstecken eines Produktfehlers: Ohne Parallellast
 * registriert WebKit sofort.
 */
async function warteAufWorkerMitCache(page: import("@playwright/test").Page) {
  const daIst = async () =>
    page
      .waitForFunction(
        async () => {
          const rs = await navigator.serviceWorker.getRegistrations();
          if (rs.length === 0) return false;
          for (const name of await caches.keys()) {
            const eintraege = await (await caches.open(name)).keys();
            if (eintraege.length > 0) return true;
          }
          return false;
        },
        null,
        { timeout: 8000 }
      )
      .then(() => true)
      .catch(() => false);

  if (await daIst()) return true;
  await page.reload();
  return daIst();
}

test.describe("PROJ-12: Service Worker nur in Production", () => {
  test("registriert sich im Production-Build weiterhin und kontrolliert die Seite", async ({
    page,
  }) => {
    await page.goto("/");
    const da = await warteAufWorkerMitCache(page);
    expect(da, "Worker muss sich in Production registrieren").toBe(true);

    const registrierungen = await page.evaluate(
      async () => (await navigator.serviceWorker.getRegistrations()).length
    );
    expect(registrierungen).toBeGreaterThan(0);
  });

  /**
   * KEIN eigener Cache-Inhalts-Test hier — bewusst.
   *
   * `proj-12-pwa-installation.spec.ts:183` prueft bereits stabil, dass
   * ausschliesslich `/offline.html` im Cache liegt, auch nach Navigation.
   * Eine zweite Fassung davon war an dieser Stelle auf WebKit unzuverlaessig
   * (gemessen: 1 von 5 Laeufen rot, bei korrektem Produkt — der Cache enthielt
   * unabhaengig geprueft vor und nach der Navigation exakt `/offline.html`).
   * Ein Test, der ohne Produktfehler rot wird, kostet mehr Vertrauen als er
   * Deckung bringt; die Zusicherung bleibt ueber die Hauptsuite abgedeckt.
   */

  test("Offline-Seite, Manifest und sw.js werden unveraendert ausgeliefert", async ({
    request,
  }) => {
    for (const pfad of ["/offline.html", "/manifest.webmanifest", "/sw.js"]) {
      const antwort = await request.get(pfad);
      expect(antwort.status(), `${pfad} muss erreichbar bleiben`).toBe(200);
    }
  });

  /**
   * Bewusst NICHT "null Konsolenfehler": Lokal schlaegt Vercel Analytics fehl
   * (`_vercel/insights/script.js` existiert nur auf Vercel und liefert hier
   * 404). Diese Fehler treten mit **blockiertem** Service Worker genauso auf —
   * gemessen: 3 Stueck. Eine Null-Erwartung wuerde also die Umgebung testen,
   * nicht das Feature, und beim kleinsten Infrastrukturrauschen rot werden.
   *
   * Geprueft wird stattdessen, was dieses Refinement wirklich zusichert: dass
   * weder der Worker noch der Aufraeum-Code einen **JavaScript-Fehler** wirft.
   */
  test("weder Worker noch Aufraeum-Code werfen einen JavaScript-Fehler", async ({ page }) => {
    const jsFehler: string[] = [];
    page.on("pageerror", (e) => jsFehler.push(`${e.name}: ${e.message}`));
    const swFehler: string[] = [];
    page.on("console", (m) => {
      const t = m.text();
      if (m.type() === "error" && /serviceworker|service worker|cache|register/i.test(t)) {
        swFehler.push(t);
      }
    });

    await page.goto("/");
    await warteAufWorkerMitCache(page);
    await page.goto("/play");
    await page.goto("/create");

    expect(jsFehler).toEqual([]);
    expect(swFehler).toEqual([]);
  });
});
