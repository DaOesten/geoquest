import Link from "next/link";
import { PROVIDER } from "@/lib/provider";

/**
 * Gemeinsamer Footer der Info-Seiten (PROJ-13).
 *
 * Sitzt in `InfoPageShell` und erscheint dadurch auf allen vier Seiten — auch
 * auf künftigen, ohne dass jemand daran denken muss.
 *
 * Zeigt Name und E-Mail, aber bewusst KEINE Postanschrift: für die
 * Impressumspflicht genügt die verlinkte Seite, und die Anschrift auf jeder
 * Seite zu wiederholen, streut die Privatadresse unnötig breit.
 */
export function InfoFooter() {
  return (
    /* Leicht abgesetzte Fläche, damit der Fuß nicht lose auf dem
       Seitenhintergrund liegt — sonst wirkt er wie ein weiterer Absatz. */
    <footer className="mt-8 border-t border-border/60 bg-foreground/[0.04]">
      <div className="mx-auto w-full max-w-[1100px] px-5 sm:px-8 py-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-tech text-[10px] tracking-[0.12em] text-primary">
              Kontakt
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
              {PROVIDER.name}
            </p>
            <a
              href={`mailto:${PROVIDER.email}`}
              className="inline-flex items-center min-h-11 -my-1 font-body text-sm text-primary underline underline-offset-4 transition-colors duration-base ease-gq hover:text-primary/80"
            >
              {PROVIDER.email}
            </a>
          </div>

          <nav className="flex flex-col">
            <p className="text-tech text-[10px] tracking-[0.12em] text-primary">
              Rechtliches
            </p>
            <Link
              href="/impressum"
              className="inline-flex items-center min-h-11 -my-1 font-body text-sm text-muted-foreground transition-colors duration-base ease-gq hover:text-primary"
            >
              Impressum
            </Link>
            <Link
              href="/datenschutz"
              className="inline-flex items-center min-h-11 -my-1 font-body text-sm text-muted-foreground transition-colors duration-base ease-gq hover:text-primary"
            >
              Datenschutz
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
