"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { PlatformEmbed } from "@/lib/media-link";

/**
 * YouTube-/Vimeo-Video mit Zwei-Klick (PROJ-15).
 *
 * Bis zum Tippen steht ein Platzhalter da, der **nichts** von der Plattform
 * lädt — kein iframe, kein Skript, kein Vorschaubild. Erst das Tippen erzeugt
 * den Player. Die Embed-Adresse baut `resolveMediaUrl` aus der geprüften
 * Video-ID; die gespeicherte Adresse landet nie im iframe.
 */

export const PLATFORM_LABEL: Record<PlatformEmbed["platform"], { name: string; company: string }> = {
  youtube: { name: "YouTube", company: "Google" },
  vimeo: { name: "Vimeo", company: "Vimeo" },
};

/**
 * Der eingebettete Player. Sandbox: Skripte der Plattform, Vollbild, ein Link
 * nach Tippen — aber keine Navigation der App. Kein `referrerPolicy`: YouTube
 * verweigert die Wiedergabe ohne Referer; die App sendet nur ihre Herkunft.
 */
export function PlatformFrame({ embed, className = "" }: { embed: PlatformEmbed; className?: string }) {
  return (
    <iframe
      src={embed.src}
      title={`${PLATFORM_LABEL[embed.platform].name}-Video`}
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
      className={`absolute inset-0 w-full h-full border-0 ${className}`}
    />
  );
}

export function PlatformVideo({ embed, caption }: { embed: PlatformEmbed; caption?: string }) {
  const [loaded, setLoaded] = useState(false);
  const { name, company } = PLATFORM_LABEL[embed.platform];

  return (
    <div>
      <div
        className="relative w-full aspect-video rounded-card overflow-hidden border border-border/40 shadow-card bg-gq-dark-teal"
        data-testid="platform-video"
        data-state={loaded ? "loaded" : "placeholder"}
      >
        {loaded ? (
          <PlatformFrame embed={embed} />
        ) : (
          <button
            type="button"
            onClick={() => setLoaded(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gq-teal focus-visible:ring-inset"
          >
            <span className="w-14 h-14 rounded-full bg-gq-teal grid place-items-center shadow-glow" aria-hidden="true">
              <Play className="w-6 h-6 text-gq-black ml-0.5" fill="currentColor" />
            </span>
            <span className="font-body text-base font-semibold text-foreground">Video von {name} abspielen</span>
            <span className="font-body text-sm text-gq-grey max-w-[32ch]">
              Beim Laden werden Daten an {company} übertragen.
            </span>
          </button>
        )}
      </div>
      {caption && <p className="font-body text-sm text-gq-grey mt-2 px-1">{caption}</p>}
    </div>
  );
}
