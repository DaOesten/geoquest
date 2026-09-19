"use client";

import { useEffect } from "react";

/**
 * Meldet `public/sw.js` an (PROJ-12).
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

    // Service Worker laufen nur im sicheren Kontext. In Produktion durch Vercel
    // gegeben, lokal über `localhost` (das der Browser als sicher behandelt).
    // Ohne diese Prüfung wirft die Registrierung über eine LAN-IP-Adresse eine
    // Konsolen-Fehlermeldung — genau der Weg, auf dem man am Handy testet.
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
