"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type OrientationPermission = "prompt" | "granted" | "denied" | "unsupported";

export interface UseDeviceOrientationReturn {
  permission: OrientationPermission;
  heading: number | null;
  needsCalibration: boolean;
  requestPermission: () => Promise<void>;
  /**
   * True, wenn die Sensorfreigabe auf iOS noch aussteht und per Nutzergeste
   * nachgeholt werden kann. Beim Wiedereinstieg über gespeicherten Fortschritt
   * überspringt der Spieler den Permission-Screen — bis 2026-09-06 blieb der
   * Kompass dann die ganze Session stumm, ohne Hinweis (Edge Case 10).
   */
  canRequestPermission: boolean;
}

/**
 * Existiert die iOS-Sensorfreigabe-API? Notwendige, aber **nicht hinreichende**
 * Bedingung für iOS — Desktop-Chrome stellt `requestPermission` ebenfalls als
 * Funktion bereit (gemessen: Chrome 152, 2026-09-07).
 */
function hasRequestPermissionApi(): boolean {
  return (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
      .requestPermission === "function"
  );
}

/**
 * Echte iOS-Erkennung (BUG-6, Edge Case 13).
 *
 * Bis 2026-09-07 galt allein `typeof requestPermission === "function"` als
 * iOS-Beweis. Chrome erfüllt das ebenfalls, bekam dadurch den
 * "Kompass aktivieren"-Button — der dort in eine Sackgasse führt, weil
 * `requestPermission()` `denied` liefert. Deshalb zusätzlich ein
 * Plattform-Signal.
 *
 * iPadOS meldet sich als "MacIntel" mit Touch-Punkten, daher die zweite
 * Bedingung. `maxTouchPoints` schließt echte Macs aus (dort 0).
 */
function isIOS(): boolean {
  if (!hasRequestPermissionApi()) return false;
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const isIPhoneOrIPad = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;

  return isIPhoneOrIPad || isIPadOS;
}

export function useDeviceOrientation(): UseDeviceOrientationReturn {
  const [permission, setPermission] = useState<OrientationPermission>(() => {
    if (typeof window === "undefined") return "prompt";
    if (typeof DeviceOrientationEvent === "undefined") return "unsupported";
    if (!isIOS()) return "granted";
    return "prompt";
  });
  const [heading, setHeading] = useState<number | null>(null);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const listenerAdded = useRef(false);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.webkitCompassHeading !== undefined) {
      setHeading(event.webkitCompassHeading as number);
      setNeedsCalibration(false);
    } else if (event.alpha !== null) {
      setHeading((360 - event.alpha) % 360);
      setNeedsCalibration(event.absolute === false);
    }
  }, []);

  const addListener = useCallback(() => {
    if (listenerAdded.current) return;
    listenerAdded.current = true;
    window.addEventListener("deviceorientation", handleOrientation, true);
  }, [handleOrientation]);

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent === "undefined") {
      setPermission("unsupported");
      return;
    }

    // Zweite Verteidigungslinie (Edge Case 14): Ein `denied` oder ein Fehler
    // muss immer im "Laufe ein paar Schritte"-Zustand landen, damit der Screen
    // nie ohne Erklärung zurückbleibt — unabhängig davon, ob die
    // Plattformerkennung oben richtig lag.
    if (isIOS()) {
      try {
        const result = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (result === "granted") {
          setPermission("granted");
          addListener();
        } else {
          setPermission("denied");
        }
      } catch {
        setPermission("denied");
      }
    } else {
      setPermission("granted");
      addListener();
    }
  }, [addListener]);

  useEffect(() => {
    if (!isIOS() && typeof DeviceOrientationEvent !== "undefined") {
      addListener();
    }
    return () => {
      if (listenerAdded.current) {
        window.removeEventListener("deviceorientation", handleOrientation, true);
        listenerAdded.current = false;
      }
    };
  }, [addListener, handleOrientation]);

  return {
    permission,
    heading,
    needsCalibration,
    requestPermission,
    canRequestPermission: permission === "prompt" && isIOS(),
  };
}

declare global {
  interface DeviceOrientationEvent {
    webkitCompassHeading?: number;
  }
}
