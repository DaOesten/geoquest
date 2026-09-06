"use client";

interface DirectionArrowProps {
  rotation: number;
  isNear: boolean;
  /**
   * Keine Heading-Quelle verfügbar (kein Kompass, keine Bewegung). Rotation 0
   * sieht dann aus wie "geradeaus" — der Spieler würde einem Pfeil vertrauen,
   * der nichts weiß. Deshalb ein sichtbar eigener Zustand (Edge Case 11).
   */
  directionUnknown?: boolean;
}

export function DirectionArrow({ rotation, isNear, directionUnknown = false }: DirectionArrowProps) {
  const color = directionUnknown
    ? "var(--gq-grey, #A0A7AD)"
    : isNear
      ? "var(--gq-lime, #C6FF00)"
      : "var(--gq-teal, #00E0D1)";
  const glowColor = directionUnknown
    ? "rgba(160,167,173,.35)"
    : isNear
      ? "rgba(198,255,0,.75)"
      : "rgba(0,224,209,.7)";

  return (
    <div className="relative w-[min(80vw,360px)] aspect-square grid place-items-center">
      {/* Outer ring */}
      <div
        className={`absolute inset-0 rounded-pill border-2 ${
          isNear ? "animate-[gq-pulse_1.2s_ease-out_infinite]" : ""
        }`}
        style={{
          borderColor: directionUnknown
            ? "rgba(160,167,173,.18)"
            : isNear
              ? "rgba(198,255,0,.28)"
              : "rgba(0,224,209,.28)",
          boxShadow: directionUnknown
            ? "inset 0 0 24px rgba(160,167,173,.05)"
            : isNear
              ? "0 0 60px rgba(198,255,0,.4), inset 0 0 30px rgba(198,255,0,.08)"
              : "0 0 44px rgba(0,224,209,.3), inset 0 0 24px rgba(0,224,209,.06)",
        }}
      />
      {/* Inner ring */}
      <div className="absolute inset-[28px] rounded-pill border border-border/30" />

      {/* Cardinal directions */}
      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-tech text-xs tracking-[0.14em] text-muted-foreground font-bold">
        N
      </span>
      <span className="absolute top-1/2 right-4 -translate-y-1/2 text-tech text-xs tracking-[0.14em] text-muted-foreground font-bold">
        O
      </span>
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-tech text-xs tracking-[0.14em] text-muted-foreground font-bold">
        S
      </span>
      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-tech text-xs tracking-[0.14em] text-muted-foreground font-bold">
        W
      </span>

      {/* Arrow SVG — fills ~70% of container */}
      <svg
        className={`w-[70%] h-[70%] ${
          directionUnknown
            ? "opacity-40 animate-[gq-seek_4s_linear_infinite]"
            : "transition-transform duration-slow ease-gq"
        }`}
        viewBox="0 0 100 100"
        style={{
          transform: directionUnknown ? undefined : `rotate(${rotation}deg)`,
          filter: `drop-shadow(0 0 20px ${glowColor})${
            directionUnknown ? "" : ` drop-shadow(0 0 40px ${glowColor})`
          }`,
        }}
      >
        <path d="M50 8 L76 86 L50 70 L24 86 Z" fill={color} />
        <path d="M50 8 L50 70 L24 86 Z" fill="rgba(255,255,255,.22)" />
      </svg>
    </div>
  );
}
