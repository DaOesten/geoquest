import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { AppNavMenu } from "@/components/app-nav-menu";
import { InfoFooter } from "@/components/info-footer";
import { HEADER_NAV_LINKS } from "@/lib/app-nav";

interface InfoPageShellProps {
  /** Show the brand lockup above the eyebrow (front page only — subpages go without). */
  showLogo?: boolean;
  /** Small category label above the title. */
  eyebrow: string;
  title: React.ReactNode;
  /** Meta line under the title, e.g. a one-line summary. */
  meta?: string;
  /** Intro copy next to the title on desktop, below it on mobile. */
  lead?: React.ReactNode;
  /** Rendered beside the title block from `lg` up; stacked underneath on smaller screens. */
  aside?: React.ReactNode;
  backHref?: string;
  children: React.ReactNode;
}

/** Shared max width so header, hero and body columns line up on every breakpoint. */
const CONTAINER = "mx-auto w-full max-w-[1100px] px-5 sm:px-8";

/**
 * Shared frame for the static info pages (/about, /anleitung, /impressum,
 * /datenschutz — PROJ-13). Dark theme like the player side: these pages are the
 * outward-facing front door, so they carry the gaming look rather than the
 * creator's light theme.
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
  backHref,
  children,
}: InfoPageShellProps) {
  return (
    <>
      {/* No border under the header — it would cut the page into two blocks. */}
      <header className="sticky top-0 z-50 bg-gq-black/70 backdrop-blur-sm">
        <div className={`${CONTAINER} flex h-14 items-center gap-3 sm:h-16`}>
          {backHref && (
            <Link
              href={backHref}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
              aria-label="Zurück"
            >
              <ArrowLeft className="w-5 h-5 text-gq-teal" />
            </Link>
          )}

          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Impressum und Datenschutz stehen im Footer — hier nur die
                inhaltlichen Ziele. Im Burger-Menu bleiben alle sechs. */}
            {HEADER_NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hidden sm:flex items-center h-11 px-4 rounded-pill text-tech text-[11px] tracking-[0.08em] text-gq-grey transition-colors duration-base ease-gq hover:text-gq-teal"
              >
                {label}
              </Link>
            ))}

            {/* Reserved for a Ko-fi support link later — the slot stays, the target changes. */}
            <Link
              href="/"
              className="flex items-center h-11 px-5 rounded-pill border border-gq-teal text-gq-teal text-tech text-[11px] tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
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
        <div className={`${CONTAINER} pt-6 sm:pt-12 lg:pt-16`}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <div>
              {showLogo && (
                <Image
                  src="/assets/logo-lockup.png"
                  alt="Geo Quest"
                  width={1039}
                  height={543}
                  priority
                  sizes="(min-width: 640px) 320px, 220px"
                  // The lockup has no alpha channel — it ships on an opaque
                  // near-black plate. Rendered plain, exactly as the start
                  // screen does it, so both entry points look identical.
                  className="mb-6 w-[220px] sm:w-[280px] lg:w-[320px] h-auto"
                />
              )}
              <p className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
                {eyebrow}
              </p>
              <h1 className="font-display italic text-[clamp(2rem,7vw,4rem)] leading-[0.94] uppercase text-foreground mt-2">
                {title}
              </h1>
              {meta && (
                <p className="mt-3 text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-grey">
                  {meta}
                </p>
              )}
              {lead && (
                <div className="mt-5 max-w-[52ch] font-body text-[15px] sm:text-base lg:text-lg leading-relaxed text-[#E7EAEC]">
                  {lead}
                </div>
              )}
            </div>

            {aside && <div className="min-w-0">{aside}</div>}
          </div>

          <div className="h-px bg-border mt-10 sm:mt-14" />
        </div>

        {/* Sections set scroll-margin so anchored headings clear the sticky header. */}
        <div className={`${CONTAINER} pb-16 sm:pb-24 [&_section]:scroll-mt-20`}>
          {children}
        </div>
      </main>

      <InfoFooter />
    </>
  );
}
