"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AddressSearchResult {
  id: string;
  displayName: string;
  lat: number;
  lng: number;
}

export interface UseAddressSearchReturn {
  results: AddressSearchResult[];
  isLoading: boolean;
  error: boolean;
  search: (query: string) => void;
}

const DEBOUNCE_MS = 500;
const RESULT_LIMIT = 5;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Debounced Nominatim (OpenStreetMap) address search for the "Adresse suchen"
 * field in the station editor. Mirrors useCurrentPosition's return shape
 * (loading state + result) so both position sources feel consistent to the
 * caller. A single AbortController per hook instance covers both the
 * stale-response race (a newer keystroke should win over an older in-flight
 * request) and cleanup when the sheet closes mid-search.
 */
export function useAddressSearch(): UseAddressSearchReturn {
  const [results, setResults] = useState<AddressSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(false);

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", String(RESULT_LIMIT));

      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Nominatim ${response.status}`);

      const data: NominatimResult[] = await response.json();
      setResults(
        data.map((item) => ({
          id: String(item.place_id),
          displayName: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      );
      setIsLoading(false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
      setError(true);
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const trimmed = query.trim();
      if (!trimmed) {
        abortRef.current?.abort();
        setResults([]);
        setIsLoading(false);
        setError(false);
        return;
      }

      debounceRef.current = setTimeout(() => runSearch(trimmed), DEBOUNCE_MS);
    },
    [runSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return { results, isLoading, error, search };
}
