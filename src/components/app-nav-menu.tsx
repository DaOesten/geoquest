"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_NAV_GROUPS } from "@/lib/app-nav";

/**
 * Das Burger-Menu der gesamten App (PROJ-1, Refinement 2026-09-06).
 *
 * Ersetzt `info-nav-menu.tsx`, das nur auf den vier Info-Seiten lief und nur
 * vier Ziele kannte. Sechs Links in drei Gruppen, auf jedem Screen dasselbe
 * Menu — inklusive der Info-Seiten, die es über `InfoPageShell` einbinden.
 *
 * Radix (via shadcn Sheet) liefert Fokus-Falle, Escape, Scroll-Lock und
 * `aria-expanded` auf dem Trigger; der einzige eigene Zustand ist offen/zu,
 * nötig um das Menu beim Antippen eines Links zu schließen.
 *
 * Erbt Theme-Farben über die CSS-Variablen (`bg-background`, `text-foreground`,
 * `border-border`) statt fester Hex-Werte: derselbe Code trägt im Player das
 * Dark- und im Creator das Light-Theme, ohne aus dem Screen auszubrechen.
 *
 * Das gilt seit BUG-1 (QA 2026-09-06) auch für Akzent und Metadaten: `gq-teal`
 * und `gq-grey` sind feste Marken-Hex-Werte und reagieren nicht aufs Theme —
 * auf dem hellen Panel fielen sie auf 1.57:1 bzw. 2.29:1 und verfehlten damit
 * die WCAG-AA-Vorgabe des PRD (4.5:1). `text-primary` und
 * `text-muted-foreground` tragen dieselbe Gestaltungsabsicht, wechseln aber mit
 * dem Theme mit und erfüllen AA in beiden:
 *
 *   primary          dark 11.60:1 · light 4.54:1
 *   muted-foreground dark  8.02:1 · light 5.30:1
 */
export function AppNavMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [theme, setTheme] = useState<string | null>(null);

  /**
   * Radix rendert den Sheet-Inhalt per Portal an `document.body` — damit liegt
   * er AUSSERHALB des `[data-theme="light"]`-Wrappers aus `create/layout.tsx`,
   * und `--background` & Co. fallen auf die Dark-Werte von `<html>` zurück.
   * Das Menu erschien im Creator deshalb schwarz statt hell.
   *
   * Also das Theme dort ablesen, wo der Trigger tatsächlich steht, und es dem
   * portalierten Inhalt selbst aufstempeln: `[data-theme="light"]` setzt die
   * Variablen auf dem Element, greift also auch ohne den umgebenden Wrapper.
   *
   * Per Ref-Callback statt per Effect: Der Wert steht fest, sobald der Trigger
   * im DOM hängt, und `setState` synchron in einem Effect löst Kaskaden-Renders
   * aus (ESLint `react-hooks/set-state-in-effect`).
   */
  const readTheme = useCallback((node: HTMLButtonElement | null) => {
    if (!node) return;
    setTheme(node.closest("[data-theme]")?.getAttribute("data-theme") ?? null);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        ref={readTheme}
        className="flex items-center justify-center w-11 h-11 rounded-full text-primary transition-colors duration-base ease-gq hover:bg-primary/10 active:scale-[0.96]"
        aria-label="Menü öffnen"
      >
        <Menu className="w-6 h-6" />
      </SheetTrigger>

      {/* z-index über Leaflets Pane-Stapel — im Stationen-Editor tatsächlich bis
          1000 gemessen, der shadcn-Default z-50 würde das Menu dort begraben.
          Gilt für Overlay und Content gleichermaßen. */}
      <SheetContent
        side="right"
        data-theme={theme ?? undefined}
        className="z-[1100] w-[280px] border-l border-border bg-background p-6 overflow-y-auto"
        overlayClassName="z-[1100]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-tech text-[11px] tracking-[0.12em] text-primary">
            Navigation
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-7 flex flex-col gap-7">
          {APP_NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-tech text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                {group.title}
              </p>

              <div className="mt-2 flex flex-col">
                {group.links.map(({ href, label, icon: Icon }) => {
                  // Auch Unteransichten zählen zum Eintrag: wer in
                  // /create/[id]/station/[x] steckt, ist immer noch im Creator.
                  const isActive = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={
                        "flex items-center gap-3 h-12 border-b border-border/60 font-display italic text-xl uppercase transition-colors duration-base ease-gq hover:text-primary active:text-primary " +
                        (isActive ? "text-primary" : "text-foreground")
                      }
                    >
                      <Icon
                        className={
                          "w-[18px] h-[18px] flex-shrink-0 " +
                          (isActive ? "text-primary" : "text-muted-foreground")
                        }
                      />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
