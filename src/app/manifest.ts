import type { MetadataRoute } from "next";

/**
 * Web-App-Manifest (PROJ-12).
 *
 * Als `manifest.ts` und nicht als handgepflegte `public/manifest.json`: Next.js
 * kennt diese Datei als eigene Metadaten-Route, prüft die Feldnamen beim Bauen
 * und setzt das `<link rel="manifest">` selbst. Ein Tippfehler fällt damit im
 * Build auf — ein ungültiges Manifest kostet sonst still die Installierbarkeit,
 * ohne dass irgendwo ein Fehler erscheint.
 *
 * Dieses Feature macht die App **installierbar, nicht offlinefähig**. Das PRD
 * führt „PWA-fähig" als Constraint und „Kein Offline-Modus" als ausdrückliches
 * Non-Goal; beides gilt weiter. Siehe `public/sw.js`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Geo Quest",
    // Was unter dem Homescreen-Icon steht. Kurz genug, dass iOS und Android es
    // nicht abschneiden.
    short_name: "Geo Quest",
    description:
      "Erstelle und spiele GPS-basierte Schnitzeljagden. Navigiere. Entdecke. Löse.",

    /**
     * Start auf `/`, nicht auf `/play`: Die installierte App verhält sich wie
     * die Website. `/` trägt seit BUG-10 das vollständige Burger-Menu und beide
     * Mode-Cards — Play und Create sind je einen Tap entfernt. Ein Start auf
     * `/play` würde den Creator in der installierten App verstecken, obwohl die
     * Installation laut PRD auch dem Ersteller offensteht.
     */
    start_url: "/",
    scope: "/",
    id: "/",

    lang: "de",
    dir: "ltr",

    /** Vollbild ohne Adressleiste — der Player-Screen gewinnt dadurch ~100px. */
    display: "standalone",

    /**
     * Die App ist Mobile-First auf 360–430px gebaut; Kompass, Karte und Module
     * sind nie für Querformat gestaltet worden. Querformat zuzulassen hieße,
     * alle Player-Screens dafür zu prüfen.
     */
    orientation: "portrait",

    /**
     * Deep Black in beiden Feldern, damit Statusleiste und Splash nahtlos in
     * den App-Hintergrund übergehen. Deckt sich mit `viewport.themeColor` im
     * Wurzel-Layout — laufen die beiden auseinander, blitzt beim Start ein
     * andersfarbiger Rand auf.
     */
    background_color: "#0B0F12",
    theme_color: "#0B0F12",

    categories: ["games", "education", "navigation"],

    icons: [
      // purpose "any": unbeschnitten dargestellt, der Pin füllt die Fläche
      // weitgehend aus.
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // purpose "maskable": Android beschneidet zu Kreis oder Squircle. Das
      // Motiv liegt hier vollständig in den inneren 80% (gemessen: x 139..372,
      // y 103..408 von 512) — außen ringsum Deep Black als Opferzone.
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
