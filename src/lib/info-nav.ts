/**
 * The four destinations of the info pages (PROJ-13).
 *
 * Lives in its own plain module rather than in `info-nav-menu.tsx`: that file is
 * a client component, and a value imported from across the client boundary
 * arrives at the server as a reference proxy, not as the array itself.
 *
 * Shared between the desktop link row in `InfoPageShell` (which skips "/" —
 * the "Zur App" button already covers it) and the mobile burger menu, so the
 * two navigations cannot drift apart.
 */
export const INFO_NAV_LINKS = [
  { href: "/", label: "App" },
  { href: "/anleitung", label: "Anleitung" },
  { href: "/impressum", label: "Impressum" },
  { href: "/datenschutz", label: "Datenschutz" },
] as const;

/**
 * Die Teilmenge, die als Textlinks in der Desktop-Header-Zeile steht.
 *
 * „App" deckt bereits der Aktions-Button rechts außen ab; Impressum und
 * Datenschutz stehen im Footer, wo Besucher Rechtstexte zuerst suchen. Im
 * Burger-Menu bleiben dagegen alle vier Ziele — auf dem Handy müsste man sonst
 * für das Impressum durch die ganze Seite scrollen.
 */
export const HEADER_NAV_LINKS = INFO_NAV_LINKS.filter(
  ({ href }) => href === "/anleitung"
);
