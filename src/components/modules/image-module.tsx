"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ImageModuleProps {
  url: string;
  caption?: string;
}

export function ImageModule({ url, caption }: ImageModuleProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full aspect-video rounded-card bg-gq-dark-teal border border-border/40 flex flex-col items-center justify-center gap-2">
        <ImageOff className="w-8 h-8 text-gq-grey" />
        <p className="font-body text-sm text-gq-grey">Bild konnte nicht geladen werden</p>
      </div>
    );
  }

  return (
    <div>
      <img
        src={url}
        alt={caption ?? ""}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full rounded-card object-cover"
      />
      {caption && (
        <p className="font-body text-sm text-gq-grey mt-2 px-1">{caption}</p>
      )}
    </div>
  );
}
