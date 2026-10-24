"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Vercel Analytics ohne die eingebettete Quest-Simulation (PROJ-13,
 * Refinement 13).
 *
 * /simulation läuft nur als iframe innerhalb der Landingpage /. Gezählt würde
 * sonst jeder Besuch der Landingpage doppelt — einmal die Seite, einmal das
 * iframe. Eigene Client-Komponente, weil `beforeSend` eine Funktion ist und
 * nicht aus dem Server-Layout heraus übergeben werden kann.
 */
export function PageAnalytics() {
  return (
    <Analytics
      beforeSend={(event) =>
        new URL(event.url).pathname.startsWith("/simulation") ? null : event
      }
    />
  );
}
