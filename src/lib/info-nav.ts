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
