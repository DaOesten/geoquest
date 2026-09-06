"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type GeoPermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unavailable"
  | "insecure-context"
  | "no-fix";
export type GeoSignalState = "waiting" | "searching" | "active" | "lost";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeolocationOptions {
  onFirstPosition?: () => void;
}

export interface UseGeolocationReturn {
  permission: GeoPermissionState;
  signal: GeoSignalState;
  position: GeoPosition | null;
  requestPermission: () => void;
  retry: () => void;
}

const SIGNAL_TIMEOUT_MS = 30_000;

/**
 * Wie lange wir nach erteilter Permission auf den ersten Fix warten, bevor wir
 * dem Spieler sagen, dass er nach draußen gehen soll. Drinnen (Schule, Keller,
 * Wohnung) kommt oft nie ein Fix — ohne dieses Timeout blieb der Spieler vor
 * einem unveränderten "Standort erlauben"-Button stehen (Refinement 2026-09-06).
 */
const FIRST_FIX_TIMEOUT_MS = 15_000;

export function useGeolocation(options?: UseGeolocationOptions): UseGeolocationReturn {
  const [permission, setPermission] = useState<GeoPermissionState>("prompt");
  const [signal, setSignal] = useState<GeoSignalState>("waiting");
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const watchId = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstFixTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstPositionFired = useRef(false);
  const hasFix = useRef(false);
  const onFirstPositionRef = useRef(options?.onFirstPosition);

  useEffect(() => {
    onFirstPositionRef.current = options?.onFirstPosition;
  });

  const clearWatch = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (firstFixTimeoutRef.current) {
      clearTimeout(firstFixTimeoutRef.current);
      firstFixTimeoutRef.current = null;
    }
  }, []);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSignal("lost");
    }, SIGNAL_TIMEOUT_MS);
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission("unavailable");
      return;
    }

    // Ohne HTTPS schlägt jeder Geolocation-Call fehl, obwohl das API-Objekt
    // existiert. Das als "Gerät unterstützt kein GPS" auszugeben wäre eine
    // falsche Diagnose — der Spieler kann daran nichts ändern, der Betreiber schon.
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setPermission("insecure-context");
      return;
    }

    hasFix.current = false;
    setSignal("searching");

    // Läuft parallel zum watch: Wenn nach 15s kein Fix da ist, ist der Spieler
    // vermutlich drinnen. watchPosition meldet in dem Fall oft gar keinen Fehler.
    if (firstFixTimeoutRef.current) clearTimeout(firstFixTimeoutRef.current);
    firstFixTimeoutRef.current = setTimeout(() => {
      if (!hasFix.current) {
        setPermission((current) => (current === "denied" ? current : "no-fix"));
      }
    }, FIRST_FIX_TIMEOUT_MS);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setSignal("active");
        setPermission("granted");
        hasFix.current = true;
        if (firstFixTimeoutRef.current) {
          clearTimeout(firstFixTimeoutRef.current);
          firstFixTimeoutRef.current = null;
        }
        resetTimeout();

        if (!firstPositionFired.current) {
          firstPositionFired.current = true;
          onFirstPositionRef.current?.();
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermission("denied");
          setSignal("waiting");
          if (firstFixTimeoutRef.current) {
            clearTimeout(firstFixTimeoutRef.current);
            firstFixTimeoutRef.current = null;
          }
          return;
        }

        // POSITION_UNAVAILABLE / TIMEOUT wurden bis 2026-09-06 verschluckt: Der
        // Spieler blieb ohne Erklärung auf dem Permission-Screen stehen. Vor dem
        // ersten Fix ist das ein Kein-Fix-Zustand; danach übernimmt der bestehende
        // 30s-Signalverlust, damit ein einzelner Aussetzer die Navigation nicht abbricht.
        if (!hasFix.current) {
          setPermission("no-fix");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10_000,
      }
    );

    resetTimeout();
  }, [resetTimeout]);

  const requestPermission = useCallback(() => {
    clearWatch();
    firstPositionFired.current = false;
    setPermission("prompt");
    startWatching();
  }, [clearWatch, startWatching]);

  const retry = useCallback(() => {
    clearWatch();
    // Ohne diesen Reset bliebe der Screen im no-fix-Zustand hängen, obwohl der
    // Watch längst wieder sucht.
    setPermission((current) => (current === "no-fix" ? "prompt" : current));
    startWatching();
  }, [clearWatch, startWatching]);

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          startWatching();
        } else if (result.state === "denied") {
          setPermission("denied");
        }
      }).catch(() => {});
    }
    return () => clearWatch();
  }, [clearWatch, startWatching]);

  return { permission, signal, position, requestPermission, retry };
}
