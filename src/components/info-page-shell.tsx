import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { AppNavMenu } from "@/components/app-nav-menu";
import { SupportLink } from "@/components/support-link";
import { InfoFooter } from "@/components/info-footer";
import { HEADER_NAV_LINKS } from "@/lib/app-nav";

interface InfoPageShellProps {
  /** Show the brand lockup above the eyebrow (front page only — subpages go without). */
  showLogo?: boolean;
  /**
   * Small category label above the title. Optional: `/about` verzichtet
   * seit 2026-09-09 darauf, weil die Zeile dort die Seite beschrieb,
   * statt den Besucher anzusprechen.
   */
  eyebrow?: string;
  title: React.ReactNode;
  /** Meta line under the title, e.g. a one-line summary. */
  meta?: string;
  /** Intro copy next to the title on desktop, below it on mobile. */
  lead?: React.ReactNode;
  /** Rendered beside the title block from `lg` up; stacked underneath on smaller screens. */
  aside?: React.ReactNode;
  /**
   * Bild, das hinter dem gesamten Hero-Block liegt (PROJ-13, Refinement 9,
   * 2026-09-21) — hinter Logo, Headline, Lead, Preiszeile und CTA.
   *
   * Löst `asideFillsHeight` aus Refinement 8 ab: Dort stand das Bild als
   * Nachbar-Spalte und musste dafür beschnitten werden. Als Untergrund
   * entfällt die Zuschnittfrage ganz — es trägt die Fläche, statt eine Spalte
   * zu füllen.
   *
   * Die Abdunklung ist nicht verhandelbar und deshalb hier fest verdrahtet
   * statt als Prop: Gemessen fällt **Teal** auf dem unveränderten Bild auf
   * 3.75:1 und verfehlt die PRD-Vorgabe von 4.5:1 — betroffen sind „ZUM
   * SPIELFELD" in der Headline und die Kostenlos-Zeile. Weißer Text käme mit
   * 6.26:1 durch, die Akzentfarbe nicht. Bei 40% liegt Teal bei 6.49:1
   * (Desktop) und 6.33:1 (volle Breite, also der Mobile-Fall).
   *
   * Gilt auf **allen** Breiten. Der Betreiber-Wunsch „nur mobile sind die
   * Elemente untereinander" betrifft die Anordnung, nicht den Hintergrund.
   */
  heroBackground?: { src: string };
  backHref?: string;
  /**
   * "dark" (Default) trägt den Gaming-Look der öffentlichen Eingangsseiten.
   * "light" ist den Rechtstexten vorbehalten: nüchterne Fließtextseiten, die
   * gelesen und nicht inszeniert werden — und die ohnehin `robots: noindex`
   * tragen, also gar nicht erst als Marketing-Fläche gedacht sind.
   */
  theme?: "dark" | "light";
  /**
   * Zeigt den Ko-fi-Icon-Button links neben „Zur App"
   * (PROJ-13, Refinement 2026-09-09).
   *
   * Als Prop und nicht per `usePathname()`-Vergleich in der Shell: Sie weiß
   * heute nichts über konkrete Routen und soll das auch nicht lernen — ein
   * Abgleich auf zwei feste Strings würde beim nächsten Seitenzuwachs
   * stillschweigend falsch. Die Seite weiß selbst, was sie ist.
   *
   * Gesetzt auf `/about` und `/anleitung` — den beiden Seiten, die das Produkt
   * erklären. Rechtstexte liest niemand aus Sympathie.
   */
  showSupport?: boolean;
  children: React.ReactNode;
}

/** Shared max width so header, hero and body columns line up on every breakpoint. */
const CONTAINER = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";

/**
 * Shared frame for the static info pages (/about, /anleitung, /impressum,
 * /datenschutz — PROJ-13).
 *
 * Default ist Dark wie die Player-Seite: /about und /anleitung sind die
 * öffentliche Eingangstür und tragen den Gaming-Look. Die beiden Rechtstexte
 * setzen dagegen `theme="light"` (2026-09-06) — sie werden gelesen, nicht
 * inszeniert.
 *
 * The background is the same flat `bg-gq-black` as the start screen `/` — no
 * grid, glow or particles. On a text page that ambient layer competes with the
 * content, and `/` is the reference for how the brand introduces itself.
 *
 * Unlike the app screens these are NOT capped at 430px: visitors arrive here
 * from a shared link or QR code, typically on a laptop.
 */
export function InfoPageShell({
  showLogo = false,
  eyebrow,
  title,
  meta,
  lead,
  aside,
  heroBackground,
  backHref,
  theme = "dark",
  showSupport = false,
  children,
}: InfoPageShellProps) {
  return (
    // `data-theme` setzt die Farb-Variablen auf diesem Teilbaum um; die
    // Akzentfarben (Teal, Lime) bleiben laut Design-System in beiden Themes
    // gleich. Der Wrapper trägt die Fläche, damit auch der Bereich unterhalb
    // des Inhalts mitfärbt.
    <div data-theme={theme} className="min-h-dvh bg-background">
      {/* No border under the header — it would cut the page into two blocks.

          `pt-safe-top` haelt die Statusleiste der installierten App frei
          (PROJ-12, Refinement 3). Am `<header>` und nicht an der inneren Zeile,
          damit die Blur-Flaeche bis zur obersten Kante reicht; `sticky top-0`
          sorgt dafuer, dass das in jedem Scroll-Zustand gilt. Die Zeilenhoehe
          (h-14 / sm:h-16) bleibt unberuehrt. */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-sm pt-safe-top">
        <div className={`${CONTAINER} flex h-14 items-center gap-3 sm:h-16`}>
          {backHref && (
            <Link
              href={backHref}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-primary/10 active:scale-[0.96]"
              aria-label="Zurück"
            >
              <ArrowLeft className="w-5 h-5 text-primary" />
            </Link>
          )}

          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Impressum und Datenschutz stehen im Footer — hier nur die
                inhaltlichen Ziele. Im Burger-Menu bleiben alle sechs. */}
            {HEADER_NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hidden sm:flex items-center h-11 px-4 rounded-pill text-tech text-[11px] tracking-[0.08em] text-muted-foreground transition-colors duration-base ease-gq hover:text-primary"
              >
                {label}
              </Link>
            ))}

{/* Ghost (kein Rahmen, keine Füllung) und ohne Beschriftung: „Zur App"
                daneben bleibt der stärkere der beiden — zwei gleichgewichtige
                Buttons ließen den Besucher raten, welcher gemeint ist. Die
                ausgeschriebene Fassung „Support me" trägt das Burger-Menu, das
                auf jeder Breite dieselbe Zeile hat.

                Ausgelagert in `support-link.tsx`, weil der Tooltip Client-JS
                braucht — diese Shell bleibt dadurch eine Server-Komponente. */}
            {showSupport && <SupportLink />}

            <Link
              href="/"
              className="flex items-center h-11 px-5 rounded-pill border border-primary text-primary text-tech text-[11px] tracking-[0.08em] transition-all duration-base ease-gq hover:bg-primary/10 active:scale-[0.96]"
            >
              Zur App
            </Link>

            {/* Anders als das frühere InfoNavMenu auch ab `sm` sichtbar: das
                Menu enthält seit 2026-09-06 Play und Create, also Ziele, die
                die Desktop-Zeile nicht abbildet. Ausgeblendet käme ein
                Laptop-Besucher von /impressum nicht direkt in den Creator. */}
            <AppNavMenu />
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* Title block — sits beside the aside/hero from lg up */}
        {/* Der Kopfabstand wächst bis `sm` und bleibt dann stehen: ab `lg`
            ist die Bildschirmhöhe der knappe Faktor, nicht die Breite
            (BUG-7). Erst ab `xl` — wo auch flache Laptops genug Höhe
            haben — darf er wieder großzügiger werden. */}
        <div
          className={`${CONTAINER} pt-6 sm:pt-10 xl:pt-16 ${
            // `relative` traegt die beiden Hintergrund-Ebenen; `isolate` haelt
            // sie in einem eigenen Stapelkontext, damit der Scrim nicht mit
            // der sticky Kopfzeile darueber konkurriert.
            heroBackground ? "relative isolate overflow-hidden rounded-card" : ""
          }`}
        >
          {heroBackground && (
            <>
              {/* Bild und Abdunklung als ZWEI Ebenen, nicht als
                  `filter: brightness()` auf dem Bild: Ein Filter trifft im
                  selben Stapelkontext auch den Text darueber. */}
              <Image
                src={heroBackground.src}
                // Dekoration: Der Hero sagt in Schrift, was das Bild zeigt.
                // Ein Screenreader, der die Bildbeschreibung zwischen Logo und
                // Headline vorliest, stoert den Lesefluss ohne Gegenwert.
                alt=""
                aria-hidden
                fill
                priority
                sizes="(min-width: 1100px) 1100px, 100vw"
                className="-z-10 object-cover"
              />
              {/* ZWEI Ebenen statt einer gleichmaessigen Abdunklung.

                  Die erste liegt ueber dem ganzen Bild und nimmt ihm die
                  Spitzen. Die zweite ist der eigentliche Textschutz: ein
                  Verlauf von links, der genau dort am staerksten ist, wo Text
                  steht, und nach rechts auslaeuft — dort traegt das Bild
                  allein und bleibt klar sichtbar.

                  Warum nicht eine gleichmaessige Ebene: Gemessen muesste sie
                  auf ~73% hoch, damit auch die hellsten Stellen (Laternen,
                  Reflexe) bestehen. Dann ist das Bild kaum noch zu erkennen —
                  genau das, was ein Hintergrundbild nicht sein soll.

                  Auf Mobile laeuft der Text ueber die ganze Breite, deshalb
                  greift der Verlauf dort von unten statt von links: Der Text
                  sitzt im unteren Bereich, das Bild bleibt oben frei. */}
              <div className="absolute inset-0 -z-10 bg-background/30" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/80 to-background/20 lg:bg-gradient-to-r lg:from-background lg:via-background/75 lg:to-transparent" />
            </>
          )}
          {/* `items-start` statt `items-center` (2026-09-09): Seit der Hero
              von /about kürzer ist als das Bild daneben, ließ die Zentrierung
              den Text in der Spalte schweben. Oben bündig lesen sich beide
              Spalten als ein Block. */}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:items-start">
            <div>
              {showLogo && (
                <Image
                  src="/assets/logo-lockup-cutout.png"
                  alt="Geo Quest"
                  width={1039}
                  height={543}
                  priority
                  sizes="(min-width: 640px) 320px, 220px"
                  // Freigestelltes PNG mit Alpha (PROJ-1, Refinement
                  // 2026-09-20). Die Quelldatei logo-lockup.png ist 8-bit RGB
                  // ohne Alpha-Kanal und bringt eine opake Platte mit, die
                  // sich gegen den Seitenhintergrund als Rechteck abzeichnet.
                  // Dieselbe Datei wie auf dem Startscreen, damit beide
                  // Eingänge identisch aussehen.
                  //
                  // Steht seit dem 2026-09-20 wieder auf ALLEN Breiten
                  // (PROJ-13, Refinement 7). Das frühere `lg:hidden` stammte
                  // aus der BUG-7-Behebung vom 2026-09-09 und stand auf zwei
                  // Gründen: der Höhe (gültig, inzwischen entfallen — der Hero
                  // hat seitdem zwei Absätze und einen CTA verloren) und der
                  // Annahme, die Marke stehe ohnehin im Header. Letztere war
                  // nie richtig: „Zur App" ist ein Button in Tech-Schrift, die
                  // Navigation waren Textlinks — keines zeigt das Logo. Seit
                  // PROJ-14 ist HEADER_NAV_LINKS zusätzlich leer.
                  //
                  // Gemessen: Der Hero-CTA bleibt auf allen elf
                  // Referenz-Viewports über dem Falz, knappster Fall
                  // 1366×768 mit 45px. Der BUG-7-Wächter hält das fest.
                  className="mb-6 w-[220px] sm:w-[280px] h-auto"
                />
              )}
              {eyebrow && (
                <p className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-display italic text-[clamp(2rem,7vw,4rem)] leading-[0.94] uppercase text-foreground mt-2">
                {title}
              </h1>
              {meta && (
                <p className="mt-3 text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-muted-foreground">
                  {meta}
                </p>
              )}
              {lead && (
                <div className="mt-5 max-w-[52ch] font-body text-[15px] sm:text-base lg:text-lg leading-relaxed text-foreground/90">
                  {lead}
                </div>
              )}
            </div>

            {aside && <div className="min-w-0">{aside}</div>}
          </div>

          {/* Die Trennlinie entfaellt, wenn ein Hintergrundbild den Hero
              traegt — die Bildkante setzt die Grenze bereits. */}
          {!heroBackground && <div className="h-px bg-border mt-10 sm:mt-14" />}
          {heroBackground && <div className="h-10 sm:h-14" />}
        </div>

        {/* Sections set scroll-margin so anchored headings clear the sticky header. */}
        <div className={`${CONTAINER} pb-16 sm:pb-24 [&_section]:scroll-mt-20`}>
          {children}
        </div>
      </main>

      <InfoFooter />
    </div>
  );
}
