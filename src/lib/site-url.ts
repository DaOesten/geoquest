/**
 * Die öffentliche Basisadresse der Seite (PROJ-16).
 *
 * Eine Quelle für `metadataBase` (Canonicals, Open Graph), die Sitemap und
 * `robots.txt`. Laufen sie auseinander, verweist die Sitemap auf eine andere
 * Domain als die Canonicals. Vercel setzt `VERCEL_PROJECT_PRODUCTION_URL` auf
 * die Produktionsdomain, auch in Vorschau-Bereitstellungen — so zeigt keine
 * dieser Angaben je auf eine Vorschauadresse. Lokal: localhost.
 */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
