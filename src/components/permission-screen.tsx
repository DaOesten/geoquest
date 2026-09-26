"use client";

import { Navigation, SatelliteDish, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeoPermissionState, GeoSignalState } from "@/hooks/use-geolocation";

interface PermissionScreenProps {
  permissionState: GeoPermissionState;
  signalState?: GeoSignalState;
  onRequest: () => void;
  /**
   * Zusätzliche Klassen für den äußeren Container (Refinement 2026-09-26).
   *
   * Die Höhe gehört an die Aufrufstelle, nicht in die Komponente: Beim
   * Quest-Start füllt sie den Bildschirm (`min-h-[80vh]`), im
   * Navigations-Screen steht sie **unter** einer Kopfzeile und darf sie nicht
   * aus dem Bild schieben. Der Default hält den Quest-Start unverändert.
   */
  className?: string;
  /**
   * Überschrift für den Fall, dass weder gesucht wird noch ein Fix fehlt —
   * also `denied`, `unavailable` und `insecure-context` (Refinement 2026-09-26).
   *
   * Der Default "Navigation aktivieren" ist beim Quest-Start richtig: Dort hat
   * die Navigation noch nicht begonnen. Im Navigations-Screen läuft sie bereits,
   * und dieselbe Zeile würde den Spieler auffordern, etwas zu aktivieren, das er
   * gerade benutzt. Nur die Überschrift ist kontextabhängig — die Erklärtexte
   * und die Knopf-Logik bleiben geteilt, sonst wäre es eine zweite Wahrheit.
   */
  blockedTitle?: string;
}

export function PermissionScreen({
  permissionState,
  signalState = "waiting",
  onRequest,
  className = "min-h-[80vh]",
  blockedTitle = "Navigation aktivieren",
}: PermissionScreenProps) {
  const isDenied = permissionState === "denied";
  const isUnavailable = permissionState === "unavailable";
  const isInsecure = permissionState === "insecure-context";
  const isNoFix = permissionState === "no-fix";
  // Permission erteilt, Fix steht noch aus: Bis 2026-09-06 blieb hier der
  // unveränderte "Standort erlauben"-Button stehen, als wäre nichts passiert.
  const isSearching = !isDenied && !isNoFix && signalState === "searching";

  const Icon = isNoFix ? SatelliteDish : isInsecure ? ShieldAlert : Navigation;

  return (
    <div className={`flex flex-col items-center justify-center gap-6 px-5 text-center ${className}`}>
      <div
        className={`w-20 h-20 rounded-full bg-gq-teal/10 flex items-center justify-center ${
          isSearching ? "animate-[gq-pulse_1.2s_ease-out_infinite]" : ""
        }`}
      >
        <Icon className="w-10 h-10 text-gq-teal" />
      </div>

      <div className="flex flex-col gap-2 max-w-xs">
        <h2 className="text-display text-2xl">
          {isSearching ? "Suche GPS-Signal…" : isNoFix ? "Kein GPS-Signal" : blockedTitle}
        </h2>

        {isUnavailable ? (
          <p className="font-body text-sm text-gq-grey">
            Dein Gerät unterstützt kein GPS. Diese Quest benötigt Standort-Zugriff zum Spielen.
          </p>
        ) : isInsecure ? (
          <p className="font-body text-sm text-gq-grey">
            Diese Seite läuft ohne sichere Verbindung (HTTPS). Browser geben den Standort dann nicht
            frei. Öffne die Seite über https://
          </p>
        ) : isNoFix ? (
          <p className="font-body text-sm text-gq-grey">
            Wir finden dein GPS-Signal nicht. Gehe nach draußen und versuche es nochmal.
          </p>
        ) : isDenied ? (
          <p className="font-body text-sm text-gq-grey">
            GPS wurde blockiert. Öffne deine Geräte-Einstellungen und erlaube den Standort-Zugriff für
            diese Seite.
          </p>
        ) : isSearching ? (
          <p className="font-body text-sm text-gq-grey">
            Wir suchen dein Signal. Unter freiem Himmel geht das am schnellsten.
          </p>
        ) : (
          <p className="font-body text-sm text-gq-grey">
            Damit wir dich zur nächsten Station navigieren können, brauchen wir Zugriff auf deinen
            Standort.
          </p>
        )}
      </div>

      {!isUnavailable && !isInsecure && !isSearching && (
        <Button
          onClick={onRequest}
          className="rounded-pill bg-gq-teal text-gq-black font-tech text-xs uppercase tracking-[0.08em] px-8 h-12 hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq"
        >
          {isDenied ? "Einstellungen prüfen" : isNoFix ? "Erneut versuchen" : "Standort erlauben"}
        </Button>
      )}
    </div>
  );
}
