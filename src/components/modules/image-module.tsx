"use client";

import { useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media-link";

interface ImageModuleProps {
  url: string;
  caption?: string;
}

export function ImageModule({ url, caption }: ImageModuleProps) {
  const [error, setError] = useState(false);
  // PROJ-15: Dropbox-, Drive- und Wikimedia-Links werden zur Datei aufgelöst
  const src = useMemo(() => resolveMediaUrl(url, "image").sources[0]?.src, [url]);

  if (error || !src) {
    return (
      <div className="w-full aspect-video rounded-card bg-gq-dark-teal border border-border/40 shadow-card flex flex-col items-center justify-center gap-2">
        <ImageOff className="w-8 h-8 text-gq-grey" />
        <p className="font-body text-sm text-gq-grey">Bild konnte nicht geladen werden</p>
      </div>
    );
  }

  return (
    <div>
      <img
        src={src}
        alt={caption ?? ""}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full rounded-card border border-border/40 shadow-card object-cover"
      />
      {caption && (
        <p className="font-body text-sm text-gq-grey mt-2 px-1">{caption}</p>
      )}
    </div>
  );
}
