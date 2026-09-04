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
  backHref?: string;
  children: React.ReactNode;
}

/**
 * Shared frame for the two static info pages (/about, /anleitung, PROJ-13).
 * Dark theme like the player side — these pages are the outward-facing front
 * door, so they carry the gaming look rather than the creator's light theme.
 */
export function InfoPageShell({ eyebrow, title, meta, backHref, children }: InfoPageShellProps) {
  return (
    <>
      <QuestListBackdrop />

      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 px-5">
        {backHref ? (
          <Link
            href={backHref}
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
            aria-label="Zurück"
          >
            <ArrowLeft className="w-5 h-5 text-gq-teal" />
          </Link>
        ) : (
          <Link href="/" className="flex-shrink-0" aria-label="Zurück zum Start">
            <Image
              src="/assets/mark-pin.jpg"
              alt="Geo Quest"
              width={32}
              height={32}
              className="rounded-full"
            />
          </Link>
        )}

        <Link
          href="/"
          className="ml-auto flex items-center h-11 px-5 rounded-pill border border-gq-teal text-gq-teal text-tech text-[11px] tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
        >
          Zur App
        </Link>
      </header>

      <main className="relative px-5 pt-3 pb-16">
        <p className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
          {eyebrow}
        </p>
        <h1 className="font-display italic text-[clamp(1.8rem,8vw,2.4rem)] leading-[0.96] uppercase text-foreground mt-1">
          {title}
        </h1>
        {meta && (
          <p className="mt-2 text-tech text-[10px] tracking-[0.12em] text-gq-grey">
            {meta}
          </p>
        )}
        <div className="h-px bg-border mt-4" />

        {children}
      </main>
    </>
  );
}
