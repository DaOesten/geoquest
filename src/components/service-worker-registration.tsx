"use client";

import { useEffect } from "react";

/**
 * Meldet `public/sw.js` an — aber **nur in Production** (PROJ-12).
 *
 * Rendert nichts — sie existiert nur, weil die Registrierung im Browser
 * passieren muss und das Wurzel-Layout eine Server-Komponente bleiben soll.
 *
 * Der Service Worker cacht ausschließlich die Offline-Fallback-Seite; er ist
 * die Bedingung dafür, dass Chrome auf Android überhaupt einen
 * Installationsweg anbietet. Siehe den Kopf von `public/sw.js`.
 *
 * Scheitert die Registrierung — Browser ohne Unterstützung, unsicherer
 * Kontext, vom Nutzer abgeschaltet —, funktioniert die App vollständig weiter;
 * es entfallen nur die Offline-Seite und der Android-Installationsweg
 * (Edge Case 12). Deshalb still, ohne Fehlermeldung für den Nutzer.
 */

/**
 * `true` nur im Production-Build (Refinement 2026-09-20).
 *
 * WARUM ES DIESE UNTERSCHEIDUNG GIBT: Lokal ist ein gestoppter Dev-Server der
 * Normalfall. Der Worker fing dann jede Navigation ab und beantwortete sie aus
 * dem Cache — der Entwickler sah „Keine Verbindung" statt der Browser-Meldung,
 * die den wahren Grund nennt (Edge Case 15). Dazu ist der Worker-Scope die
 * **Origin, nicht der Port**: Ein auf `localhost` registrierter Worker galt für
 * jedes Projekt auf dieser Maschine (Edge Case 16).
 *
 * WARUM `NODE_ENV` UND NICHT DER HOSTNAME: Die E2E-Suite prüft den echten
 * Production-Build auf `localhost:3100` (`playwright.prod.config.ts`). Eine
 * Prüfung auf `localhost` würde den Worker dort abschalten und die PROJ-12-
 * Tests entwerten, ohne dass der Produktcode kaputt aussieht — ein stiller
 * Testverlust. `NODE_ENV` trennt Dev-Server von Production-Build sauber und
 * unabhängig vom Port; Next.js ersetzt den Ausdruck beim Bauen durch ein
 * Literal, es bleibt also kein `process`-Zugriff im Browser übrig.
 */
const IST_PRODUCTION = process.env.NODE_ENV === "production";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    /**
     * Auf den **Wert** prüfen, nicht auf die Existenz der Eigenschaft (BUG-11).
     *
     * Vorher stand hier `!("serviceWorker" in navigator)`. Das fragt nur, ob
     * die Eigenschaft da ist — nicht, ob sie etwas enthält. Härtungs-
     * Erweiterungen und datenschutzorientierte Browser setzen solche APIs
     * gelegentlich auf `undefined`, statt sie zu löschen; dann bestand die
     * Prüfung, und `.register()` warf bei jedem Seitenaufruf einen
     * `TypeError` in die Konsole. Ein echter Browser ohne Unterstützung lässt
     * die Eigenschaft weg — beide Formen deckt die Wahrheitsprüfung ab.
     */
    if (!navigator.serviceWorker) return;

    /**
     * Außerhalb von Production: nichts registrieren — und einen aus einem
     * früheren Besuch verbliebenen Worker **aktiv abräumen** (Edge Case 17).
     *
     * Das bloße Unterlassen neuer Registrierungen würde den bereits
     * ausgelieferten Worker auf jedem Entwicklerrechner liegen lassen; er
     * überlebt den Dev-Server und müsste von Hand gelöscht werden. Hier löst
     * sich das beim nächsten Seitenaufruf von selbst.
     *
     * Die Caches werden mit abgeräumt, weil `unregister()` sie stehen lässt.
     */
    if (!IST_PRODUCTION) {
      void (async () => {
        try {
          const registrierungen = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrierungen.map((r) => r.unregister()));

          // Nur die eigenen Caches dieses Features, nichts Fremdes.
          if (typeof caches !== "undefined") {
            const namen = await caches.keys();
            await Promise.all(
              namen.filter((n) => n.startsWith("geoquest-")).map((n) => caches.delete(n))
            );
          }
        } catch {
          // Still: Ein fehlgeschlagenes Aufräumen darf die App nicht stören.
        }
      })();
      return;
    }

    // Service Worker laufen nur im sicheren Kontext. In Produktion durch Vercel
    // gegeben. Ohne diese Prüfung wirft die Registrierung über eine LAN-IP-
    // Adresse eine Konsolen-Fehlermeldung.
    if (!window.isSecureContext) return;

    // Erst nach `load`: Die Registrierung konkurriert sonst mit dem ersten
    // Rendern um Bandbreite. Das PRD gibt < 2s Ladezeit vor.
    const register = () => {
      // Erneut prüfen: Zwischen dem Effekt und `load` liegt Zeit, in der eine
      // Erweiterung die Eigenschaft noch ersetzen kann. Der `.catch()` unten
      // fängt nur abgelehnte Promises, nicht diesen synchronen Zugriff.
      if (!navigator.serviceWorker) return;

      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Siehe Edge Case 12 — kein sichtbarer Fehler.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
