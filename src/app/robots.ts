import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

/**
 * robots.txt (PROJ-16). Erlaubt allen Crawlern alles, auch KI-Crawlern: Das
 * Ziel ist, dass Suchmaschinen und KI-Systeme Geo Quest finden.
 *
 * `/simulation` ist bewusst NICHT gesperrt: Ein ausgesperrter Crawler sähe das
 * `noindex` der Seite nie und könnte die Adresse trotzdem ohne Inhalt listen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
