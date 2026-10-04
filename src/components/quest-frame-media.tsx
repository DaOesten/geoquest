"use client";

import type { CSSProperties } from "react";
import { resolveMediaUrl } from "@/lib/media-link";
import { PlatformVideo } from "@/components/platform-video";

/**
 * Medium von Intro bzw. Outro (PROJ-5), aufgelöst wie in den Modulen (PROJ-15).
 *
 * Der Creator bietet hier nur Bilder an; importierte Quests können aber auch
 * Audio und Video enthalten — beides läuft durch dieselbe Auflösung.
 * Ein Bild, das nicht lädt, blendet seine Fläche aus (bestehendes Verhalten).
 */
export function QuestFrameMedia({
  mediaUrl,
  mediaType,
  className,
  style,
}: {
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "video";
  className: string;
  style?: CSSProperties;
}) {
  if (!mediaUrl || !mediaType) return null;
  const media = resolveMediaUrl(mediaUrl, mediaType);

  if (media.embed) {
    return (
      <div className={`w-full ${className}`} style={style}>
        <PlatformVideo embed={media.embed} />
      </div>
    );
  }
  if (media.sources.length === 0) return null;

  if (mediaType === "image") {
    return (
      <div className={`relative w-full rounded-card overflow-hidden border border-border/50 shadow-card ${className}`} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element -- beliebige fremde Hosts */}
        <img
          src={media.sources[0].src}
          alt=""
          className="w-full h-52 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).parentElement!.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gq-black/60 via-transparent to-transparent" />
      </div>
    );
  }

  const sources = media.sources.map((source) => <source key={source.src} src={source.src} type={source.type} />);

  if (mediaType === "audio") {
    return (
      <audio controls className={`w-full ${className}`} preload="none" style={style}>
        {sources}
      </audio>
    );
  }

  return (
    <div className={`w-full rounded-card overflow-hidden border border-border/50 shadow-card ${className}`} style={style}>
      <video controls className="w-full" preload="none" playsInline>
        {sources}
      </video>
    </div>
  );
}
