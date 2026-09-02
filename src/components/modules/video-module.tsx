"use client";

import { useState } from "react";
import { VideoOff } from "lucide-react";

interface VideoModuleProps {
  url: string;
  caption?: string;
}

export function VideoModule({ url, caption }: VideoModuleProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full aspect-video rounded-card bg-gq-dark-teal border border-border/40 shadow-card flex flex-col items-center justify-center gap-2">
        <VideoOff className="w-8 h-8 text-gq-grey" />
        <p className="font-body text-sm text-gq-grey">Video konnte nicht geladen werden</p>
      </div>
    );
  }

  return (
    <div>
      <video
        src={url}
        controls
        playsInline
        preload="metadata"
        onError={() => setError(true)}
        className="w-full rounded-card border border-border/40 shadow-card"
      />
      {caption && (
        <p className="font-body text-sm text-gq-grey mt-2 px-1">{caption}</p>
      )}
    </div>
  );
}
