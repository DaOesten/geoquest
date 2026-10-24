import type { NextConfig } from "next";

/**
 * Security headers per .claude/rules/security.md.
 * HSTS is already added by Vercel, so it is not repeated here.
 *
 * Deliberately no Content-Security-Policy: quests embed arbitrary user-supplied
 * https media URLs (image/audio/video modules) and the map loads OSM tiles, so a
 * meaningful CSP would have to allow https: for those sources anyway.
 */
const securityHeaders = [
  // Clickjacking: nothing in the app is meant to be framed by another site.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from re-interpreting a response as a different content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the full URL only to our own origin; cross-origin gets the origin only.
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Einzige Ausnahme (PROJ-13, Refinement 13; seit PROJ-16 unter
      // /simulation statt /about/simulation): Die Quest-Simulation läuft
      // als iframe auf der Landingpage /. SAMEORIGIN statt DENY — fremde Seiten können sie
      // weiterhin nicht einbetten, nur die eigene Domain. Die Route hat keine
      // Eingaben oder Aktionen mit Wirkung (kein Speicher, kein Konto), also
      // nichts, was sich per Clickjacking auslösen ließe. Steht NACH der
      // allgemeinen Regel: Bei gleichem Schlüssel gewinnt der letzte Treffer.
      {
        source: "/simulation",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
