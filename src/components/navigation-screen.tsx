"use client";

import { useState, useEffect } from "react";
import { WifiOff, RotateCcw, Check, Compass } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { DirectionArrow } from "./direction-arrow";
import { ConfettiEffect } from "./confetti-effect";
import { PermissionScreen } from "./permission-screen";
import { haversine, bearing, headingFromPositions, getDistanceColor } from "@/lib/geo-utils";
import { useArrowRotation } from "@/hooks/use-arrow-rotation";
import type { Station } from "@/lib/quest-schema";
import type { UseGeolocationReturn } from "@/hooks/use-geolocation";
import type { UseDeviceOrientationReturn } from "@/hooks/use-device-orientation";

interface NavigationScreenProps {
  station: Station;
  stationIndex: number;
  totalStations: number;
  alreadyVisited?: boolean;
  onArrived: () => void;
  onBack: () => void;
  geoState: UseGeolocationReturn;
  /**
   * Kompass-Zustand von oben, nicht per eigenem Hook-Aufruf (Edge Case 27).
   *
   * Bis 2026-09-26 rief dieser Screen `useDeviceOrientation()` selbst auf,
   * während `quest-player.tsx` es ebenfalls tat — zwei React-States für einen
   * browserweiten Sensor. Nach einem erfolgreichen `requestPermission()` wusste
   * nur die aufrufende Instanz davon und hängte nur sie ihren Listener an: Der
   * Knopf reagierte sichtbar, der Pfeil drehte sich nicht.
   */
  orientationState: UseDeviceOrientationReturn;
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
  alreadyVisited,
  onArrived,
  onBack,
  geoState,
  orientationState: orientation,
}: NavigationScreenProps) {
  const [arrived, setArrived] = useState(false);
  const [posHistory, setPosHistory] = useState<
    [{ lat: number; lng: number } | null, { lat: number; lng: number } | null]
  >([null, null]);


  const { position, signal, permission, watchActive } = geoState;

  /**
   * Watch nachstarten, wenn in dieser Session keiner läuft (Edge Case 24).
   *
   * Beim Wiedereinstieg über gespeicherten Fortschritt startet `quest-player`
   * direkt auf der Stationsliste und ruft `requestPermission()` nie auf. Der
   * einzige Rückfall im Hook hängt an `navigator.permissions.query()` — und
   * **iOS Safari führt Geolocation dort nicht**, der Aufruf rejected und wird
   * verschluckt. Ohne dieses Nachstarten bleibt `position` die ganze Session
   * `null`, und der Spieler steht vor einem Pfeil, der sich nie bewegt.
   *
   * `requestPermission()` beginnt mit `clearWatch()`, ist also idempotent.
   * Trotzdem nur einmal pro Screen-Aufruf und nur bei `watchActive === false`:
   * Ein wiederholter Aufruf würde auf iOS einen erneuten Berechtigungsdialog
   * ohne Nutzergeste auslösen.
   */
  useEffect(() => {
    if (!watchActive) {
      geoState.requestPermission();
    }
    // Absichtlich nur beim Mount: `watchActive` als Dependency würde nach dem
    // Start erneut feuern, sobald der Watch endet (z. B. bei Signalverlust),
    // und damit den Retry-Pfad des Spielers überfahren.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  let targetBearing: number | null = null;
  let isNear = false;
  let compassAvailable = false;
  let headingSource: "compass" | "movement" | "none" = "none";
  let deviceHeading: number | null = null;

  if (position) {
    distance = Math.round(haversine(position.lat, position.lng, station.lat, station.lng));
    targetBearing = bearing(position.lat, position.lng, station.lat, station.lng);

    // Kompass hat Vorrang und behält ihn, solange der Hook ihn als frisch
    // meldet — auch wenn einzelne Sensor-Events ausbleiben (Edge Case 20).
    // Ohne diese Karenzzeit kippt die Anzeige zwischen zwei Bezugssystemen,
    // die um bis zu 90° auseinanderliegen; der Wechsel selbst wird dann zur
    // Hauptursache des Springens.
    if (orientation.compassFresh && orientation.heading !== null) {
      deviceHeading = orientation.heading;
      headingSource = "compass";
    } else if (prevPos) {
      deviceHeading = headingFromPositions(prevPos.lat, prevPos.lng, position.lat, position.lng);
      headingSource = deviceHeading !== null ? "movement" : "none";
    }

    compassAvailable = headingSource === "compass";
    isNear = distance <= 50;
  }

  // Fortlaufende Rotation samt Peilungsdämpfung — die Akkumulation liegt im
  // Hook, damit dieser Render rein bleibt (Refinement 2026-09-20).
  const arrowRotation = useArrowRotation({ targetBearing, deviceHeading, distance });

  const directionUnknown = position !== null && headingSource === "none";

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

  /**
   * Kein GPS-Fix: Zustand erklären statt stumm einen Strich zeigen
   * (Refinement 2026-09-26, Edge Cases 24–26).
   *
   * Bis hierher war `position === null` folgenlos — keine Verzweigung griff,
   * und der Screen rendert mit `—` als Entfernung und einem Pfeil ohne
   * Rotation. Der Spieler bekam keinen Hinweis, keinen Knopf und keinen
   * Ausweg außer Zurück. Das traf nicht nur den Wiedereinstieg: Auch wer vor
   * dem ersten Fix ein Gebäude betritt, sah denselben stummen Strich.
   *
   * Steht **nach** der Ankunfts- und Signalverlust-Prüfung: Ein Aussetzer nach
   * erfolgreicher Navigation gehört zum 30s-Signalverlust oben, der den letzten
   * bekannten Stand stehen lässt — nicht hierher (Edge Case 28).
   *
   * Der Wortlaut kommt aus `PermissionScreen`, statt die fünf Zustände ein
   * zweites Mal zu formulieren. Sie entscheidet selbst, wann ein Knopf sinnvoll
   * ist — insbesondere **keinen** bei `insecure-context`, `unavailable` und
   * `searching`, wo der Spieler nichts ändern kann (Lehre aus BUG-6).
   */
  if (!position) {
    // `searching` ist kein Fehlerzustand. Ohne diese Ableitung sähe das Fenster
    // zwischen Watch-Start und erstem Fix wie ein Defekt aus und würde den
    // Spieler dazu erziehen, einen Hinweis wegzutippen, der sich von selbst
    // erledigt (Edge Case 26).
    const isPending = permission === "prompt" || permission === "granted";

    return (
      <div className="flex flex-col min-h-[100dvh]">
        <AppHeader title={station.name} onBack={onBack} />
        <div className="flex-1 flex flex-col">
          <PermissionScreen
            permissionState={permission}
            signalState={isPending ? "searching" : signal}
            onRequest={() => geoState.retry()}
            className="flex-1 py-10"
            blockedTitle="GPS wird gebraucht"
          />

          {/* Auf iOS fehlen beim Wiedereinstieg beide Freigaben gleichzeitig.
              Stünde der Kompass-Button nur im Navigations-Render, käme der
              Spieler nie an ihn heran, weil dieser Zweig vorher zurückkehrt —
              die GPS-Lücke würde die Kompass-Lösung verstecken (Edge Case 24). */}
          {orientation.canRequestPermission && (
            <div className="flex justify-center px-5 pb-10">
              <CompassActivateButton
                variant="secondary"
                onActivate={() => orientation.requestPermission()}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Trug bis 2026-09-06 eine eigene, inline nachgebaute Kopfzeile — dadurch
          blieb sie sticky und bekam das Burger-Menu nicht mit. Jetzt dieselbe
          AppHeader wie überall sonst. */}
      <AppHeader title={station.name} onBack={onBack} />

      {/* Progress indicator */}
      <div className="px-5 pt-2">
        <span className="text-tech text-[9px] tracking-[0.12em] text-gq-grey">
          Ziel {stationIndex + 1} von {totalStations}
        </span>
      </div>

      {/* Compass area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5">
        <DirectionArrow
          rotation={arrowRotation}
          isNear={isNear}
          directionUnknown={directionUnknown}
        />

        <div className="text-center">
          <div className={`font-display italic text-[64px] leading-none ${COLOR_MAP[distanceColor]}`}>
            {distance !== null ? distance : "—"}
            <span className="text-[26px] ml-1">m</span>
          </div>
          <div className="mt-1 text-tech text-[11px] tracking-[0.16em] text-gq-grey uppercase">
            {isNear ? "Du bist fast da" : "Zur nächsten Station"}
          </div>
        </div>

        {/* Bis 2026-09-06 stand hier nur ein 9px-grauer Hinweis — auf iOS mit
            ausstehender Sensorfreigabe war er sogar der falsche Rat, weil Laufen
            das Problem nicht löst (Edge Case 10). */}
        {!compassAvailable && orientation.canRequestPermission ? (
          <CompassActivateButton onActivate={() => orientation.requestPermission()} />
        ) : (
          !compassAvailable &&
          position && (
            <p className="font-body text-sm text-gq-grey text-center max-w-[240px]">
              Laufe ein paar Schritte, damit der Pfeil die Richtung findet.
            </p>
          )
        )}

        {/* Kalibrierungs-Hinweis (Edge Case 22). Stand bis 2026-09-20 mit 9px
            unter der 16px-Mindestgröße des PRD und war damit praktisch
            unlesbar — ausgerechnet der Hinweis, der eine springende Nadel
            erklärt. `text-gq-lime` ist ein fester Hex-Wert und nur deshalb
            zulässig, weil play/layout.tsx das Theme fest auf dark stellt. */}
        {orientation.needsCalibration && (
          <p className="font-body text-base text-gq-lime text-center max-w-[260px]">
            Bewege dein Handy in einer 8, damit sich der Kompass kalibriert.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * "Kompass aktivieren" (iOS-Sensorfreigabe).
 *
 * Bis 2026-09-26 stand dieser Button ausschließlich im Navigations-Render und
 * dort zusätzlich hinter `position` — er erschien also ausgerechnet dann nicht,
 * wenn beim Wiedereinstieg auf iOS **beide** Freigaben fehlten. Die GPS-Lücke
 * versteckte damit die Kompass-Lösung von Edge Case 10. Jetzt eine Komponente,
 * die in beiden Zweigen steht (mit und ohne Fix).
 */
function CompassActivateButton({
  onActivate,
  variant = "primary",
}: {
  onActivate: () => void;
  /**
   * Im Navigations-Render ist "Kompass aktivieren" die einzige Aktion und damit
   * primär. Im GPS-Zustands-Screen steht daneben bereits der GPS-Knopf — dort
   * wäre ein zweiter gefüllter Teal-Pill ein zweiter Haupt-CTA. Das Design
   * System sieht dafür "Button (Secondary): Teal Outline, Pill" vor.
   */
  variant?: "primary" | "secondary";
}) {
  const look =
    variant === "primary"
      ? "bg-gq-teal text-gq-black hover:bg-gq-teal-hover"
      : "border border-gq-teal text-gq-teal bg-transparent hover:bg-gq-teal/10";

  return (
    <Button
      onClick={onActivate}
      className={`rounded-pill font-tech text-xs uppercase tracking-[0.08em] px-6 h-11 active:scale-[0.96] transition-all duration-fast ease-gq ${look}`}
    >
      <Compass className="w-4 h-4 mr-2" />
      Kompass aktivieren
    </Button>
  );
}

function ArrivalOverlay({
  stationName,
  onContinue,
}: {
  stationName: string;
  onContinue: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-5 text-center overflow-hidden">
      <style>{`
        @keyframes gq-pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gq-rise {
          0% { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gq-arrival-step { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Konfetti-Kanone — ein Schuss von unten mittig */}
      <ConfettiEffect />

      {/* Brand-Pin mit Haken-Badge. Freigestelltes PNG (nicht das JPEG):
          Das JPEG bringt seinen eigenen dunklen Grund mit und zeichnete sich
          als Rechteck vom Hintergrund ab — siehe scripts/make-mark-pin-cutout.swift */}
      <div
        className="gq-arrival-step relative"
        style={{
          animation: "gq-pop 0.5s cubic-bezier(.34,1.56,.64,1) 0.1s both",
        }}
      >
        <img
          src="/assets/mark-pin.png"
          alt=""
          className="w-36 h-36 object-contain"
        />
        <div className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-gq-lime grid place-items-center shadow-glow-lime border-[3px] border-gq-black">
          <Check className="w-5 h-5 text-gq-black" strokeWidth={3} />
        </div>
      </div>

      {/* Headline + decorative line */}
      <div
        className="gq-arrival-step"
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

      {/* Stationsname — darf umbrechen statt abzuschneiden: abgeschnitten
          waere ausgerechnet die Belohnung unvollstaendig (Edge Case 16). */}
      <p
        className="gq-arrival-step text-tech text-sm tracking-[0.1em] text-gq-grey mt-3 max-w-xs text-balance"
        style={{
          animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.5s both",
        }}
      >
        {stationName}
      </p>

      {/* Kein Hinweis auf die naechste Station: Der Screen feiert diese
          Ankunft und nimmt nicht vorweg, was der Spieler gerade erst
          verdient hat (Refinement 2026-09-19). */}

      {/* CTA */}
      <div
        className="gq-arrival-step mt-10 w-full max-w-xs"
        style={{
          animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.7s both",
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
