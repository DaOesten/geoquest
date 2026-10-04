"use client";

import { useMemo, useState } from "react";
import { VideoOff } from "lucide-react";
import { resolveMediaUrl } from "@/lib/media-link";
import { PlatformVideo } from "@/components/platform-video";

interface VideoModuleProps {
  url: string;
  caption?: string;
}

export function VideoModule({ url, caption }: VideoModuleProps) {
  const [error, setError] = useState(false);
  const resolved = useMemo(() => resolveMediaUrl(url, "video"), [url]);

  // PROJ-15: YouTube/Vimeo hinter Zwei-Klick-Platzhalter
  if (resolved.embed) return <PlatformVideo embed={resolved.embed} caption={caption} />;

  if (error || resolved.sources.length === 0) {
    return (
      <div className="w-full aspect-video rounded-card bg-gq-dark-teal border border-border/40 shadow-card flex flex-col items-center justify-center gap-2">
        <VideoOff className="w-8 h-8 text-gq-grey" />
        <p className="font-body text-sm text-gq-grey">Video konnte nicht geladen werden</p>
      </div>
    );
  }

  return (
    <div>
      {/* Mehrere Quellen (z.B. Wikimedia-Fassungen): Der Browser nimmt die erste,
          die er abspielen kann. Scheitert die letzte, scheiterten alle. */}
      <video controls playsInline preload="metadata" className="w-full rounded-card border border-border/40 shadow-card">
        {resolved.sources.map((source, i) => (
          <source
            key={source.src}
            src={source.src}
            type={source.type}
            onError={i === resolved.sources.length - 1 ? () => setError(true) : undefined}
          />
        ))}
      </video>
      {caption && (
        <p className="font-body text-sm text-gq-grey mt-2 px-1">{caption}</p>
      )}
    </div>
  );
}
