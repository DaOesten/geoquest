"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

// Randomized particle positions must never be part of the SSR/hydration diff.
const QuestListBackdrop = dynamic(
  () => import("@/components/quest-list-backdrop").then((m) => m.QuestListBackdrop),
  { ssr: false }
);

interface InfoPageShellProps {
  /** Small category label above the title. */
  eyebrow: string;
  title: React.ReactNode;
  /** Meta line under the title, e.g. reading time or a one-line summary. */
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
 * Shared frame for the two static info pages (/about, /anleitung, PROJ-13).
 * Dark theme like the player side — these pages are the outward-facing front
 * door, so they carry the gaming look rather than the creator's light theme.
 *
 * Unlike the app screens these are NOT capped at 430px: visitors arrive here
 * from a shared link or QR code, typically on a laptop.
 */
export function InfoPageShell({
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
      <QuestListBackdrop />

      <header className="sticky top-0 z-50 border-b border-border/40 bg-gq-black/70 backdrop-blur-sm">
        <div className={`${CONTAINER} flex h-14 items-center gap-3 sm:h-16`}>
          {backHref ? (
            <Link
              href={backHref}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
              aria-label="Zurück"
            >
              <ArrowLeft className="w-5 h-5 text-gq-teal" />
            </Link>
          ) : (
            <Link
              href="/"
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-gq-teal/10"
              aria-label="Zurück zum Start"
            >
              <Image
                src="/assets/mark-pin.jpg"
                alt="Geo Quest"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Link>
          )}

          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/about"
              className="hidden sm:flex items-center h-11 px-4 rounded-pill text-tech text-[11px] tracking-[0.08em] text-gq-grey transition-colors duration-base ease-gq hover:text-gq-teal"
            >
              Über
            </Link>
            <Link
              href="/anleitung"
              className="hidden sm:flex items-center h-11 px-4 rounded-pill text-tech text-[11px] tracking-[0.08em] text-gq-grey transition-colors duration-base ease-gq hover:text-gq-teal"
            >
              Anleitung
            </Link>
            <Link
              href="/"
              className="flex items-center h-11 px-5 rounded-pill border border-gq-teal text-gq-teal text-tech text-[11px] tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
            >
              Zur App
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* Title block — sits beside the aside/hero from lg up */}
        <div className={`${CONTAINER} pt-6 sm:pt-12 lg:pt-16`}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <div>
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
        <div className={`${CONTAINER} pb-20 sm:pb-28 [&_section]:scroll-mt-20`}>
          {children}
        </div>
      </main>
    </>
  );
}
