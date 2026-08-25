"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type GeoPermissionState = "prompt" | "granted" | "denied" | "unavailable";
export type GeoSignalState = "waiting" | "active" | "lost";

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

export function useGeolocation(options?: UseGeolocationOptions): UseGeolocationReturn {
  const [permission, setPermission] = useState<GeoPermissionState>("prompt");
  const [signal, setSignal] = useState<GeoSignalState>("waiting");
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const watchId = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstPositionFired = useRef(false);
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

    setSignal("waiting");

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
    startWatching();
  }, [clearWatch, startWatching]);

  const retry = useCallback(() => {
    clearWatch();
    startWatching();
  }, [clearWatch, startWatching]);

  useEffect(() => {
    return () => clearWatch();
  }, [clearWatch]);

  return { permission, signal, position, requestPermission, retry };
}
