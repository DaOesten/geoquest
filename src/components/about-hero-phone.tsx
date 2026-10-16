"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PhoneFrame } from "@/components/phone-frame";

/**
 * Echte Zustände der App, erzeugt von `scripts/make-about-screenshot.mjs`.
 * Dieselbe Quest wie in der Simulation weiter unten.
 */
const SCREENS = [
  {
    src: "/assets/about-hero-list.png",
    label: "Stationsübersicht",
    alt: "Geo Quest auf dem Handy: die Stationsübersicht der Quest „Das Waldgeheimnis“ mit drei Stationen.",
  },
  {
    src: "/assets/about-hero-navigation.png",
    label: "Kompass",
    alt: "Geo Quest auf dem Handy: Ein Pfeil zeigt zur Station „Die alte Eiche“, noch 108 Meter entfernt.",
  },
  {
    src: "/assets/about-hero-arrival.png",
    label: "Ziel erreicht",
    alt: "Geo Quest auf dem Handy: „Ziel erreicht!“ an der Station „Die alte Eiche“.",
  },
];

/** Der Kompass ist das stärkste Einzelbild — dort bleibt der Ablauf stehen. */
const REST = 1;
/** Ablauf einmal durch, dann Ruhe: Liste → Kompass → Ziel erreicht → Kompass. */
const SEQUENCE = [0, 1, 2, REST];
const STEP_MS = 3000;

/**
 * Handy im Hero von /about (PROJ-13, Refinement 13).
 *
 * Läuft EINMAL durch und bleibt auf dem Kompass stehen — das Design System
 * schließt Ambient-Loops aus, und ein Dauer-Wechsel konkurrierte direkt neben
 * Text und CTA. Danach blättern drei Punkte von Hand.
 *
 * Kein Aufblitzen bei „Bewegung reduzieren": Solange der Ablauf nicht
 * gestartet ist (`active === null`), entscheidet CSS per `motion-reduce:`,
 * ob die Liste oder der Kompass zu sehen ist. Der Effekt übernimmt danach
 * denselben Zustand, statt umzuspringen.
 */
export function AboutHeroPhone() {
  const [active, setActive] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  const stopSequence = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- übernimmt den Zustand, den CSS schon zeigt
      setActive(REST);
      return;
    }
    setActive(SEQUENCE[0]);
    timers.current = SEQUENCE.slice(1).map((screen, i) =>
      window.setTimeout(() => setActive(screen), STEP_MS * (i + 1))
    );
    return stopSequence;
  }, []);

  const visibility = (i: number) => {
    if (active === null) {
      if (i === 0) return "opacity-100 motion-reduce:opacity-0";
      if (i === REST) return "opacity-0 motion-reduce:opacity-100";
      return "opacity-0";
    }
    return active === i ? "opacity-100" : "opacity-0";
  };
  const shown = active ?? 0;

  return (
    <div className="flex flex-col items-center">
      <PhoneFrame className="w-[230px] sm:w-[260px] lg:w-[290px]">
        <div className="relative aspect-[1170/1992]">
          {SCREENS.map((s, i) => (
            <Image
              key={s.src}
              src={s.src}
              // Ausgeblendete Screens sind Dekoration: leeres `alt` plus
              // `aria-hidden`, damit ein Screenreader nur den sichtbaren liest.
              alt={active !== null && active !== i ? "" : s.alt}
              aria-hidden={active !== null && active !== i ? true : undefined}
              fill
              priority={i < 2}
              sizes="(min-width: 1024px) 276px, (min-width: 640px) 246px, 216px"
              // 300ms — Design System „Screen/Reveal" (höchstens 320ms), kein langer Fade.
              className={`object-cover transition-opacity duration-300 ease-gq ${visibility(i)}`}
            />
          ))}
        </div>
      </PhoneFrame>

      {/* Drei Punkte: zeigen, dass es mehr gibt, und blättern von Hand. Jedes
          Tap-Ziel 44px, der sichtbare Punkt bleibt klein. */}
      <div className="mt-3 flex" role="group" aria-label="Screens der App">
        {SCREENS.map((s, i) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Screen ${i + 1}: ${s.label}`}
            aria-pressed={shown === i}
            onClick={() => {
              stopSequence();
              setActive(i);
            }}
            className="group grid h-11 w-11 place-items-center rounded-full"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ease-gq ${
                // /70 statt /50 (BUG-24): 4.39:1 gegen den Seitengrund statt
                // 2.8:1 — WCAG 1.4.11 verlangt für Bedienelemente 3:1.
                shown === i ? "w-6 bg-gq-teal" : "w-2 bg-gq-grey/70 group-hover:bg-gq-grey"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
