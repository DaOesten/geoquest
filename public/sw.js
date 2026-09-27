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
// v2 (2026-09-27): Ein abgebrochener v1-`install` kann einen leeren Cache
// hinterlassen haben. `activate` loescht jeden Cache mit anderem Namen, also
// raeumt die Versionserhoehung diesen Zustand ohne zusaetzlichen Code ab.
const CACHE_NAME = "geoquest-offline-v2";
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
      } catch (fehler) {
        /**
         * NUR ECHTE NETZAUSFAELLE BEKOMMEN DIE OFFLINE-SEITE (Refinement 5,
         * 2026-09-27).
         *
         * Hier stand vorher: jeden Fehler mit der Offline-Seite beantworten.
         * Das war zu grob. `fetch()` wirft nicht nur ohne Netz, sondern bei
         * JEDEM Transportfehler — abgebrochene Verbindung bei schwachem
         * Mobilfunk, Timeout, TLS-Neuverhandlung, Wechsel WLAN -> Mobilfunk.
         * Nutzer mit einwandfreier Verbindung lasen deshalb "keine
         * Internetverbindung" und suchten nach einem Netzproblem, das es nicht
         * gab. Aufgefallen beim Umzug auf die eigene Domain: Der Worker-Scope
         * ist die Origin, jeder Nutzer war dort Erstbesucher.
         *
         * `navigator.onLine` ist grob — es meldet "mit einem Netz verbunden",
         * nicht "Internet erreichbar". Fuer diesen Zweck ist das die richtige
         * Richtung: `false` ist verlaesslich ein echter Verbindungsverlust,
         * erzeugt also keine Falschalarme. Der umgekehrte Fall (verbunden, aber
         * ohne Internet — Hotel-WLAN vor dem Login) landet bei der
         * Browser-Fehlerseite, die den Captive-Portal-Fall selbst behandelt.
         */
        if (navigator.onLine) throw fehler;

        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(OFFLINE_URL);
        if (cached) return cached;

        /**
         * Fehlt die Offline-Seite, den urspruenglichen Fehler weitergeben —
         * NICHT einen eigenen werfen.
         *
         * Dieser Zustand tritt bei jedem Erstbesuch auf: Der fetch-Handler
         * greift schon, waehrend `install` die Offline-Seite noch laedt. Eine
         * abgelehnte `respondWith`-Zusage ergibt fuer den Nutzer eine LEERE
         * SEITE — das gemeldete "es oeffnet sich gar nichts". Mit dem
         * urspruenglichen Fehler uebernimmt der Browser und nennt den Grund.
         */
        throw fehler;
      }
    })()
  );
});
