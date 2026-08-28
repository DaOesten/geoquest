"use client";

import { useCallback, useState } from "react";

export interface CurrentPositionResult {
  lat: number;
  lng: number;
}

export interface UseCurrentPositionReturn {
  isLoading: boolean;
  request: () => Promise<CurrentPositionResult | null>;
}

/**
 * One-shot geolocation lookup (getCurrentPosition, not watchPosition) for the
 * "Aktuelle Position verwenden" button in the station editor. Unlike the
 * player's useGeolocation (PROJ-3), the creator doesn't need continuous
 * tracking — just a single coordinate to drop a pin at.
 */
export function useCurrentPosition(): UseCurrentPositionReturn {
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback((): Promise<CurrentPositionResult | null> => {
    if (!navigator.geolocation) {
      return Promise.resolve(null);
    }

    setIsLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLoading(false);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setIsLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
      );
    });
  }, []);

  return { isLoading, request };
}
