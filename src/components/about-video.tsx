"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

interface AboutVideoProps {
  src: string;
  poster: string;
  /** Sprechender Name für den Start-Button, z.B. inkl. Laufzeit. */
  playLabel: string;
  durationLabel: string;
}

/**
 * Erklärvideo mit Poster und Klick-zum-Abspielen (PROJ-13, Refinement 10).
 *
 * `preload="none"`: Vor dem Klick wird nur das Poster geladen, nicht die
 * Videodatei — die Seite bleibt so schnell wie ohne Video. Native Controls
 * erst nach dem Start, sonst stünde ein zweiter, kleinerer Play-Button neben
 * unserem.
 */
export function AboutVideo({ src, poster, playLabel, durationLabel }: AboutVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  function start() {
    setStarted(true);
    videoRef.current?.play().catch(() => setFailed(true));
  }

  return (
    <figure className="w-full max-w-[380px]">
      <div className="relative overflow-hidden rounded-card border border-gq-teal/40 bg-gq-black shadow-card">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          preload="none"
          playsInline
          controls={started && !failed}
          onError={() => setFailed(true)}
          className="block aspect-[4/5] w-full object-cover"
        />
        {!started && !failed && (
          /* Unten statt mittig: Die Mitte des Posters trägt den GPS-Pfeil,
             also genau das Motiv, das neugierig machen soll. */
          <button
            type="button"
            onClick={start}
            aria-label={playLabel}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap h-12 px-6 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] glow-teal transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-gq-teal/45"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden />
            Video ansehen
            <span className="text-gq-black/70">{durationLabel}</span>
          </button>
        )}
      </div>
      {failed && (
        <figcaption role="status" className="mt-3 font-body text-sm text-gq-grey">
          Das Video lässt sich gerade nicht abspielen.
        </figcaption>
      )}
    </figure>
  );
}
