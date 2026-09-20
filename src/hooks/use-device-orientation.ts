"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { smoothAngle, angleDistance } from "@/lib/geo-utils";

export type OrientationPermission = "prompt" | "granted" | "denied" | "unsupported";

export interface UseDeviceOrientationReturn {
  permission: OrientationPermission;
  /**
   * Geglättetes Heading (Refinement 2026-09-20). Der rohe Sensorwert schwankt
   * am Gerät um mehrere Grad und feuert mit ~60 Hz — ungefiltert zittert die
   * Nadel und der ganze Navigations-Screen rendert bei jedem Event neu
   * (Edge Case 19).
   */
  heading: number | null;
  /** Ungeglätteter Sensorwert. Nur für Diagnose/Tests, nicht für die Anzeige. */
  rawHeading: number | null;
  /**
   * True, solange innerhalb der Karenzzeit ein Kompass-Heading eingetroffen ist
   * (Refinement 2026-09-20, Edge Case 20).
   *
   * Ein einzelner ausbleibender Sensor-Event ist kein Kompassausfall. Ohne
   * Karenzzeit schaltet die Anzeige zwischen Kompass und GPS-Bewegungsrichtung
   * hin und her — zwei Bezugssysteme, die um bis zu 90° auseinanderliegen.
   */
  compassFresh: boolean;
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

/**
 * Glättungsfaktor pro Sensor-Event (exponentieller Tiefpass).
 *
 * Bei der iOS-typischen Rate von ~60 Hz erreicht die Nadel damit rund 90 % einer
 * Drehung in ~0,2 s — schnell genug, dass ein Schwenk direkt wirkt, langsam
 * genug, dass Rauschen um wenige Grad nicht sichtbar wird.
 */
const SMOOTHING_FACTOR = 0.15;

/**
 * Unterhalb dieser Änderung wird der State gar nicht erst aktualisiert.
 *
 * Ohne die Schwelle kriecht der geglättete Wert endlos weiter und rendert den
 * Navigations-Screen bei jedem Event neu. Damit wird "steht still" zu einem
 * echten Zustand statt zu einer sehr langsamen Bewegung.
 */
const UPDATE_THRESHOLD_DEG = 0.75;

/**
 * Wie lange ein zuletzt empfangenes Kompass-Heading weiter als gültig gilt
 * (Edge Case 20). Länger als übliche Sensor-Aussetzer, kürzer als ein echter
 * Ausfall.
 */
const COMPASS_GRACE_MS = 3000;

export function useDeviceOrientation(): UseDeviceOrientationReturn {
  const [permission, setPermission] = useState<OrientationPermission>(() => {
    if (typeof window === "undefined") return "prompt";
    if (typeof DeviceOrientationEvent === "undefined") return "unsupported";
    if (!isIOS()) return "granted";
    return "prompt";
  });
  const [heading, setHeading] = useState<number | null>(null);
  const [rawHeading, setRawHeading] = useState<number | null>(null);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const listenerAdded = useRef(false);
  /**
   * Der geglättete Wert wird in einer Ref mitgeführt, nicht aus dem State
   * gelesen: `handleOrientation` ist über `useCallback` stabil und sähe sonst
   * dauerhaft den Wert vom ersten Render.
   */
  const smoothedRef = useRef<number | null>(null);
  const [compassFresh, setCompassFresh] = useState(false);
  /**
   * Timer, der die Karenzzeit abläuft. Bewusst im Hook statt im
   * Navigations-Screen: `Date.now()` während des Renders zu lesen macht den
   * Render unrein (react-hooks/purity) und ist unter konkurrierendem Rendering
   * nicht verlässlich.
   */
  const staleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyHeading = useCallback((next: number) => {
    setRawHeading(next);
    setCompassFresh(true);
    if (staleTimer.current) clearTimeout(staleTimer.current);
    staleTimer.current = setTimeout(() => setCompassFresh(false), COMPASS_GRACE_MS);

    const previous = smoothedRef.current;
    if (previous === null) {
      // Erster Wert: direkt übernehmen. Gegen `null` zu glätten gäbe es
      // nichts, und ein Einschwingen von 0° aus wäre eine sichtbare
      // Anfangsdrehung, die der Sensor nie gemeldet hat.
      smoothedRef.current = next;
      setHeading(next);
      return;
    }

    const smoothed = smoothAngle(previous, next, SMOOTHING_FACTOR);
    smoothedRef.current = smoothed;

    // Nur rendern, wenn sich sichtbar etwas geändert hat (Edge Case 19).
    setHeading((current) =>
      current === null || angleDistance(current, smoothed) >= UPDATE_THRESHOLD_DEG
        ? smoothed
        : current
    );
  }, []);

  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      if (event.webkitCompassHeading !== undefined) {
        applyHeading(event.webkitCompassHeading as number);
        setNeedsCalibration(false);
      } else if (event.alpha !== null) {
        applyHeading((360 - event.alpha) % 360);
        setNeedsCalibration(event.absolute === false);
      }
    },
    [applyHeading]
  );

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
      if (staleTimer.current) {
        clearTimeout(staleTimer.current);
        staleTimer.current = null;
      }
    };
  }, [addListener, handleOrientation]);

  return {
    permission,
    heading,
    rawHeading,
    compassFresh,
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
