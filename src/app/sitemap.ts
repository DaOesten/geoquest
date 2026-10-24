import type { MetadataRoute } from "next";
import { ROUTES } from "@/lib/app-nav";
import { SITE_URL } from "@/lib/site-url";

/**
 * sitemap.xml (PROJ-16). Nur Seiten mit Inhalt für Suchende.
 *
 * Nicht enthalten: `/app`, `/play`, `/create` (ohne gespeicherte Quests leer —
 * die Landingpage soll das Suchergebnis sein) und `/simulation` (nur als iframe
 * eingebettet, `noindex`).
 */
const SITEMAP_PATHS = [
  ROUTES.home,
  ROUTES.mitKiErstellen,
  ROUTES.impressum,
  ROUTES.datenschutz,
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_PATHS.map((path) => ({
    url: path === ROUTES.home ? SITE_URL : `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === ROUTES.home ? 1 : path === ROUTES.mitKiErstellen ? 0.8 : 0.2,
  }));
}
