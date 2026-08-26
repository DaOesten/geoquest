"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, WifiOff, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectionArrow } from "./direction-arrow";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";
import { haversine, bearing, headingFromPositions, getDistanceColor } from "@/lib/geo-utils";
import type { Station } from "@/lib/quest-schema";
import type { UseGeolocationReturn } from "@/hooks/use-geolocation";

interface NavigationScreenProps {
  station: Station;
  stationIndex: number;
  totalStations: number;
  nextStationName?: string;
  alreadyVisited?: boolean;
  onArrived: () => void;
  onBack: () => void;
  geoState: UseGeolocationReturn;
}

const COLOR_MAP = {
  red: "text-destructive",
  yellow: "text-gq-lime",
  green: "text-gq-teal",
} as const;

export function NavigationScreen({
  station,
  stationIndex,
  totalStations,
  nextStationName,
  alreadyVisited,
  onArrived,
  onBack,
  geoState,
}: NavigationScreenProps) {
  const orientation = useDeviceOrientation();
  const [arrived, setArrived] = useState(false);
  const [posHistory, setPosHistory] = useState<
    [{ lat: number; lng: number } | null, { lat: number; lng: number } | null]
  >([null, null]);

  const { position, signal } = geoState;

  // Track position history — "adjust state during render" pattern
  if (position) {
    const stored = posHistory[1];
    if (!stored || stored.lat !== position.lat || stored.lng !== position.lng) {
      setPosHistory([stored, { lat: position.lat, lng: position.lng }]);
    }
  }

  const prevPos = posHistory[0];

  // Compute navigation data inline from current state
  let distance: number | null = null;
  let arrowRotation = 0;
  let isNear = false;
  let compassAvailable = false;

  if (position) {
    distance = Math.round(haversine(position.lat, position.lng, station.lat, station.lng));
    const targetBearing = bearing(position.lat, position.lng, station.lat, station.lng);

    let deviceHeading: number | null = orientation.heading;
    compassAvailable = deviceHeading !== null;

    if (!compassAvailable && prevPos) {
      deviceHeading = headingFromPositions(prevPos.lat, prevPos.lng, position.lat, position.lng);
    }

    arrowRotation = deviceHeading !== null ? (targetBearing - deviceHeading + 360) % 360 : 0;
    isNear = distance <= 50;
  }

  // Arrival detection — "adjust state during render" pattern
  if (!arrived && distance !== null && distance <= station.radiusMeters) {
    setArrived(true);
  }

  // Vibration side effect on arrival (only on first visit)
  useEffect(() => {
    if (arrived && !alreadyVisited && navigator.vibrate) {
      navigator.vibrate(200);
    }
  }, [arrived, alreadyVisited]);

  // Skip arrival overlay for already-visited stations
  if (arrived && alreadyVisited) {
    onArrived();
    return null;
  }

  const distanceColor = distance !== null ? getDistanceColor(distance) : "red";

  if (arrived) {
    return (
      <ArrivalOverlay
        stationName={station.name}
        nextStationName={nextStationName}
        onContinue={onArrived}
      />
    );
  }

  if (signal === "lost") {
    return (
      <GpsLostOverlay
        onRetry={() => geoState.retry()}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 px-5 bg-background/80 backdrop-blur-sm border-b border-border">
        <button
          onClick={onBack}
          className="flex-shrink-0 flex items-center justify-center w-11 h-11 -ml-2 rounded-full transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
          aria-label="Zurück zur Stationsliste"
        >
          <ArrowLeft className="w-5 h-5 text-gq-teal" />
        </button>
        <h1 className="text-tech text-sm flex-1 truncate">{station.name}</h1>
      </header>

      {/* Progress indicator */}
      <div className="px-5 pt-2">
        <span className="text-tech text-[9px] tracking-[0.12em] text-gq-grey">
          Ziel {stationIndex + 1} von {totalStations}
        </span>
      </div>

      {/* Compass area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5">
        <DirectionArrow rotation={arrowRotation} isNear={isNear} />

        <div className="text-center">
          <div className={`font-display italic text-[64px] leading-none ${COLOR_MAP[distanceColor]}`}>
            {distance !== null ? distance : "—"}
            <span className="text-[26px] ml-1">m</span>
          </div>
          <div className="mt-1 text-tech text-[11px] tracking-[0.16em] text-gq-grey uppercase">
            {isNear ? "Du bist fast da" : "Zur nächsten Station"}
          </div>
        </div>

        {!compassAvailable && position && (
          <p className="text-tech text-[9px] tracking-[0.12em] text-gq-grey text-center max-w-[200px]">
            Laufe ein paar Schritte, damit der Pfeil die Richtung findet.
          </p>
        )}

        {orientation.needsCalibration && (
          <p className="text-tech text-[9px] tracking-[0.12em] text-gq-lime text-center max-w-[200px]">
            Bewege dein Handy in einer 8 zur Kalibrierung.
          </p>
        )}
      </div>
    </div>
  );
}

const PARTICLE_COUNT = 40;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  return {
    left: Math.random() * 100,
    size: 4 + Math.random() * 6,
    dur: 2.5 + Math.random() * 2,
    delay: Math.random() * 3,
    drift: (Math.random() - 0.5) * 60,
    color: i % 3 === 0 ? "#C6FF00" : "#00E0D1",
  };
});

function ArrivalOverlay({
  stationName,
  nextStationName,
  onContinue,
}: {
  stationName: string;
  nextStationName?: string;
  onContinue: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-5 text-center overflow-hidden">
      <style>{`
        @keyframes gq-fall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.7; }
          100% { transform: translateY(calc(100dvh + 20px)) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
        @keyframes gq-pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gq-rise {
          0% { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Confetti — falling from top */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: i % 4 === 0 ? "1px" : "50%",
            boxShadow: `0 0 ${p.size}px ${p.color}`,
            opacity: 0,
            "--drift": `${p.drift}px`,
            animation: `gq-fall ${p.dur}s linear ${p.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}

      {/* Brand pin with checkmark badge */}
      <div
        className="relative"
        style={{
          animation: "gq-pop 0.5s cubic-bezier(.34,1.56,.64,1) 0.1s both",
        }}
      >
        <img
          src="/assets/mark-pin.jpg"
          alt=""
          className="w-36 h-36 object-contain rounded-2xl"
        />
        <div className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-gq-lime grid place-items-center shadow-glow-lime border-[3px] border-gq-black">
          <Check className="w-5 h-5 text-gq-black" strokeWidth={3} />
        </div>
      </div>

      {/* Headline + decorative line */}
      <div
        style={{
          animation: "gq-pop 0.4s cubic-bezier(.34,1.56,.64,1) 0.3s both",
        }}
      >
        <h2
          className="font-display italic text-[clamp(2.5rem,11vw,4.5rem)] leading-[0.9] uppercase mt-6 text-foreground"
          style={{
            textShadow: "0 0 30px rgba(0,224,209,.35)",
          }}
        >
          Ziel erreicht!
        </h2>
        <div className="mx-auto mt-2 w-2/5 max-w-[160px] h-[3px] rounded-full bg-gq-teal opacity-70" />
      </div>

      {/* Station name */}
      <p
        className="text-tech text-sm tracking-[0.1em] text-gq-grey mt-3"
        style={{
          animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.5s both",
        }}
      >
        {stationName}
      </p>

      {/* Next station card */}
      {nextStationName && (
        <div
          className="mt-8 w-full max-w-xs rounded-card bg-gq-dark-teal border border-border/40 p-4 shadow-card text-left"
          style={{
            animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.7s both",
          }}
        >
          <span className="text-tech text-[9px] tracking-[0.14em] text-gq-grey uppercase">
            Nächstes Ziel
          </span>
          <p className="text-tech text-sm mt-1.5 text-foreground truncate">
            {nextStationName}
          </p>
        </div>
      )}

      {/* CTA */}
      <div
        className="mt-10 w-full max-w-xs"
        style={{
          animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.9s both",
        }}
      >
        <button
          onClick={onContinue}
          className="w-full h-14 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold shadow-glow-strong hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq"
        >
          Station entdecken
        </button>
      </div>
    </div>
  );
}

function GpsLostOverlay({
  onRetry,
  onBack,
}: {
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-6 px-5 text-center">
      <div className="w-20 h-20 rounded-pill bg-destructive/10 grid place-items-center">
        <WifiOff className="w-10 h-10 text-destructive" />
      </div>
      <div className="flex flex-col gap-2 max-w-xs">
        <h2 className="text-display text-2xl">GPS-Signal verloren</h2>
        <p className="font-body text-sm text-gq-grey">
          Geh ins Freie oder warte einen Moment, bis das Signal wieder da ist.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={onRetry}
          className="w-full rounded-pill bg-gq-teal text-gq-black font-tech text-xs uppercase tracking-[0.08em] h-12 hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Erneut versuchen
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full rounded-pill font-tech text-xs uppercase tracking-[0.08em] h-12"
        >
          Zurück zur Übersicht
        </Button>
      </div>
    </div>
  );
}
