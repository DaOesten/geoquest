/**
 * Service Worker (PROJ-12) — die Eintrittskarte zur Installierbarkeit.
 *
 * ER CACHT GENAU EINE DATEI: die Offline-Fallback-Seite. Kein HTML der App,
 * kein CSS, kein JavaScript, keine Schriften, keine Kartenkacheln, keine
 * Medien. Damit ist das PRD-Non-Goal "Kein Offline-Modus" nicht nur absichtlich
 * eingehalten, sondern strukturell unverletzbar — es liegt nichts im Cache,
 * woraus sich die App offline zusammensetzen liesse.
 *
 * WARUM ES IHN TROTZDEM GIBT: Chrome auf Android bietet den Installationsweg
 * nur an, wenn ein Service Worker mit fetch-Handler registriert ist. Ohne ihn
 * waere eine der beiden PRD-Hauptplattformen gar nicht installierbar.
 *
 * WARUM DIE FALLBACK-SEITE: Eine installierte App sieht aus wie eine echte App.
 * Tippt ein Spieler draussen ohne Empfang auf das Icon und bekommt Chromes
 * Dinosaurier, wirkt das Produkt kaputt — nicht das Netz.
 *
 * Bewusst handgeschrieben statt serwist/next-pwa: Das waeren ~15 neue Pakete
 * plus Build-Plugin, um EINE Datei zu cachen — und beide cachen standardmaessig
 * die App-Shell, also genau das, was das PRD ausschliesst.
 *
 * Liegt als statische Datei in `public/`, damit die URL stabil im Wurzel-Scope
 * bleibt; ein gebuendeltes Modul bekaeme bei jedem Build einen neuen Namen.
 */

// Version im Namen: Ein neuer Wert erzwingt einen frischen Cache und raeumt den
// alten in `activate` ab.
const CACHE_NAME = "geoquest-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // `reload` umgeht den HTTP-Cache des Browsers: Sonst koennte hier eine
      // veraltete Fassung der Fehlerseite landen, die dann bis zum naechsten
      // Versionswechsel bliebe.
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    })()
  );
  // Sofort uebernehmen, statt auf geschlossene Tabs zu warten: Die installierte
  // App hat keine Adressleiste — ein Nutzer koennte ein haengendes Update gar
  // nicht selbst erzwingen. Risikofrei, weil nichts gecacht wird, was veralten
  // koennte.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  /**
   * ALLES ausser Seitennavigationen geht ungefiltert ins Netz — der Worker
   * fasst es nicht an. Kartenkacheln, externe Medien, JS, CSS und Schriften
   * verhalten sich damit exakt wie ohne Service Worker.
   *
   * `request.mode === "navigate"` trifft genau den Fall, der die Fehlerseite
   * braucht: der Nutzer oeffnet die App oder waehlt eine Seite an.
   */
  if (request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        // Immer aus dem Netz. Kein Cache-First, kein Stale-While-Revalidate —
        // niemand soll auf einer alten Version festhaengen.
        return await fetch(request);
      } catch {
        // Nur hier greift der Cache, und nur fuer diese eine Datei.
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(OFFLINE_URL);
        if (cached) return cached;

        // Sollte die Fehlerseite wider Erwarten fehlen, ist die Browser-
        // Fehlerseite immer noch besser als eine leere Antwort.
        throw new Error("Offline-Seite nicht im Cache");
      }
    })()
  );
});
