"use client";

import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeoPermissionState } from "@/hooks/use-geolocation";

interface PermissionScreenProps {
  permissionState: GeoPermissionState;
  onRequest: () => void;
}

export function PermissionScreen({ permissionState, onRequest }: PermissionScreenProps) {
  const isDenied = permissionState === "denied";
  const isUnavailable = permissionState === "unavailable";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-5 text-center">
      <div className="w-20 h-20 rounded-full bg-gq-teal/10 flex items-center justify-center">
        <Navigation className="w-10 h-10 text-gq-teal" />
      </div>

      <div className="flex flex-col gap-2 max-w-xs">
        <h2 className="text-display text-2xl">Navigation aktivieren</h2>
        {isUnavailable ? (
          <p className="font-body text-sm text-gq-grey">
            Dein Gerät unterstützt kein GPS. Diese Quest benötigt Standort-Zugriff zum Spielen.
          </p>
        ) : isDenied ? (
          <p className="font-body text-sm text-gq-grey">
            GPS wurde blockiert. Öffne deine Geräte-Einstellungen und erlaube den Standort-Zugriff für diese Seite.
          </p>
        ) : (
          <p className="font-body text-sm text-gq-grey">
            Damit wir dich zur nächsten Station navigieren können, brauchen wir Zugriff auf deinen Standort.
          </p>
        )}
      </div>

      {!isUnavailable && (
        <Button
          onClick={onRequest}
          className="rounded-pill bg-gq-teal text-gq-black font-tech text-xs uppercase tracking-[0.08em] px-8 h-12 hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq"
        >
          {isDenied ? "Einstellungen prüfen" : "Standort erlauben"}
        </Button>
      )}
    </div>
  );
}
