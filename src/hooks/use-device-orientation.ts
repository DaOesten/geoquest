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

function isIOS(): boolean {
  return (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
  );
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
