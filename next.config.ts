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
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
