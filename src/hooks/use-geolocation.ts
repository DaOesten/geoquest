"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GPS_ACCURACY_THRESHOLD_M, shouldAcceptFix, smoothPosition, type SmoothedPosition } from "@/lib/geo-utils";

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

/**
 * Eine übernommene Einzelmessung mit fortlaufender Nummer (Refinement
 * 2026-09-28). Die Nummer macht jede Messung unterscheidbar, auch wenn sie an
 * derselben Stelle liegt wie die vorige — die Ankunftsprüfung zählt Messungen,
 * nicht Positionswechsel.
 */
export interface GeoFix extends GeoPosition {
  seq: number;
}

export interface UseGeolocationOptions {
  onFirstPosition?: () => void;
}

export interface UseGeolocationReturn {
  permission: GeoPermissionState;
  signal: GeoSignalState;
  /**
   * **Geglättete** Position für Anzeige, Peilung und Bewegungsrichtung
   * (Refinement 2026-09-28, Edge Case 31). Ungenaue Messungen sind
   * herausgefiltert, der Rest ist nach `accuracy` gewichtet — sonst springt
   * die Entfernung mit jedem Ausreißer ("30 m, einen Schritt später 10 m").
   */
  position: GeoPosition | null;
  /**
   * Die zuletzt **übernommenen** Einzelmessungen, ungeglättet, älteste zuerst
   * (höchstens `RECENT_FIXES`). Für die Ankunftsprüfung: Sie zählt
   * aufeinanderfolgende Messungen im Radius und würde gegen eine geglättete
   * Position nachlaufen.
   *
   * Eine Liste statt nur der letzten Messung, weil React zwei kurz
   * aufeinanderfolgende Updates in **einem** Render bündeln kann — der Zähler
   * sähe dann nur die zweite und verlöre die erste (gemessen: zwei Messungen
   * im Abstand von 1 ms, Chrome).
   */
  recentFixes: GeoFix[];
  /**
   * Läuft in **dieser Session** ein `watchPosition`? (Refinement 2026-09-26,
   * Edge Case 24)
   *
   * Bewusst ein eigenes Signal statt einer Ableitung aus `position`/`signal`:
   * Zwischen Watch-Start und erstem Fix sind beide von "nie gestartet" nicht
   * unterscheidbar (`position: null`, `signal: "waiting"`). Wer das ableitet,
   * startet in diesem Fenster entweder unnötig neu oder verpasst den Start —
   * beides Fehler, die nur zeitabhängig auftreten.
   *
   * Nötig, weil der Wiedereinstieg über gespeicherten Fortschritt den
   * Permission-Screen überspringt und damit den einzigen Ort, an dem
   * `requestPermission()` aufgerufen wird. Der Auto-Start unten hängt am
   * Permissions-API, das iOS Safari für Geolocation nicht führt.
   */
  watchActive: boolean;
  requestPermission: () => void;
  retry: () => void;
}

const SIGNAL_TIMEOUT_MS = 30_000;

/** So viele übernommene Messungen hält der Hook für die Ankunftsprüfung vor. */
const RECENT_FIXES = 5;

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
  const [recentFixes, setRecentFixes] = useState<GeoFix[]>([]);
  /** Filter- und Glättungszustand — Refs, weil der Watch-Callback stabil bleibt. */
  const smoothedRef = useRef<SmoothedPosition | null>(null);
  const acceptedRef = useRef<{ accuracy: number } | null>(null);
  const lastGoodAtRef = useRef(0);
  const fixSeq = useRef(0);
  const [watchActive, setWatchActive] = useState(false);
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
    setWatchActive(false);
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
    // Neuer Watch, neue Messreihe: Die Rückfallfrist zählt ab jetzt, und die
    // Glättung setzt nicht an einer Position aus einer früheren Sitzung an.
    smoothedRef.current = null;
    acceptedRef.current = null;
    lastGoodAtRef.current = Date.now();

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
        // Zeit des **Empfangs**, nicht `pos.timestamp`: Der Gerätezeitstempel
        // kann deutlich älter sein (eine vor dem Seitenaufruf gemessene
        // Position) oder auf manchen Android-Geräten schlicht falsch gehen.
        // Rückfallfrist und Glättung rechneten damit sonst mit einer Zeit, die
        // nichts mit „wie lange warten wir schon" zu tun hat.
        const measurement = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now(),
        };

        // Jede Messung ist ein Lebenszeichen — auch eine verworfene. Der
        // 30s-Signalverlust soll "das Gerät liefert nichts mehr" erkennen,
        // nicht "das Gerät liefert Ungenaues"; sonst täuschte der Filter
        // drinnen einen Signalverlust vor (Refinement 2026-09-28).
        setSignal("active");
        setPermission("granted");
        hasFix.current = true;
        if (firstFixTimeoutRef.current) {
          clearTimeout(firstFixTimeoutRef.current);
          firstFixTimeoutRef.current = null;
        }
        resetTimeout();

        if (!shouldAcceptFix(measurement, acceptedRef.current, lastGoodAtRef.current)) return;
        acceptedRef.current = { accuracy: measurement.accuracy };
        if (!(measurement.accuracy > GPS_ACCURACY_THRESHOLD_M)) lastGoodAtRef.current = measurement.timestamp;

        const smoothed = smoothPosition(smoothedRef.current, measurement);
        smoothedRef.current = smoothed;
        setPosition({ lat: smoothed.lat, lng: smoothed.lng, accuracy: measurement.accuracy, timestamp: measurement.timestamp });
        fixSeq.current += 1;
        const entry: GeoFix = { ...measurement, seq: fixSeq.current };
        setRecentFixes((list) => [...list, entry].slice(-RECENT_FIXES));

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

    // Erst hier, nicht bei den beiden frühen Returns oben: Bei `unavailable` und
    // `insecure-context` läuft kein Watch, und ein erneuter Startversuch wäre
    // sinnlos — aber auch nicht schädlich. Wichtig ist, dass der Screen diese
    // Zustände nicht für "Watch läuft" hält.
    setWatchActive(true);

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

  return { permission, signal, position, recentFixes, watchActive, requestPermission, retry };
}
