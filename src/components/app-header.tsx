"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface AppHeaderProps {
  title?: string;
  backHref?: string;
  rightAction?: React.ReactNode;
  variant?: "dark" | "light";
}

export function AppHeader({ title, backHref, rightAction, variant = "dark" }: AppHeaderProps) {
  const isTopLevel = !backHref;
  const logoSrc = variant === "light" ? "/assets/mark-pin-whitebg.png" : "/assets/mark-pin.jpg";

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-3 px-5 bg-background/80 backdrop-blur-sm border-b border-border">
      {isTopLevel ? (
        <Link href="/" className="flex-shrink-0" aria-label="Zurück zum Start">
          <Image
            src={logoSrc}
            alt="Geo Quest"
            width={32}
            height={32}
            className="rounded-full"
          />
        </Link>
      ) : (
        <Link
          href={backHref}
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
          aria-label="Zurück"
        >
          <ArrowLeft className="w-5 h-5 text-gq-teal" />
        </Link>
      )}

      {title && (
        <h1 className="text-tech text-lg flex-1 truncate">{title}</h1>
      )}

      {rightAction && (
        <div className="flex-shrink-0 ml-auto">{rightAction}</div>
      )}
    </header>
  );
}
