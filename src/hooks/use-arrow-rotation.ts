"use client";

import { useState, useRef, useEffect } from "react";
import { unwrapAngle, smoothAngle } from "@/lib/geo-utils";

/**
 * Glättung der Zielpeilung gegen GPS-Rauschen (Edge Case 21).
 *
 * Nah am Ziel schlägt Positionsrauschen überproportional durch: bei 15 m
 * Ungenauigkeit auf 30 m Distanz bis zu ±30° Peilungsänderung, ohne dass sich
 * der Spieler bewegt.
 */
const BEARING_SMOOTHING_FACTOR = 0.25;

/**
 * Ab dieser Entfernung wird die Peilung nicht mehr gedämpft.
 *
 * Weit weg ist sie ohnehin stabil — dieselbe Positionsabweichung wirkt sich
 * über die Distanz kaum aus —, und die Dämpfung würde dort nur nachlaufen.
 */
const BEARING_SMOOTHING_MAX_DISTANCE_M = 200;

export interface UseArrowRotationInput {
  /** Peilung zur Station in Grad, oder null ohne Position. */
  targetBearing: number | null;
  /** Aktuelles Heading des Geräts in Grad, oder null ohne Heading-Quelle. */
  deviceHeading: number | null;
  /** Entfernung zur Station in Metern — steuert, ob die Peilung gedämpft wird. */
  distance: number | null;
}

/**
 * Führt die Pfeil-Rotation als **fortlaufenden, unbeschränkten** Winkel
 * (Refinement 2026-09-20).
 *
 * Der bis dahin auf 0..360 normalisierte Wert war die Ursache der vollen
 * Gegendrehung: CSS interpoliert numerisch zwischen altem und neuem
 * `rotate()`, also animiert 359 → 1 den langen Weg über 358° (Edge Case 18).
 *
 * Die Akkumulation läuft in einem Effekt, nicht im Render. Refs während des
 * Renders zu mutieren ist unter konkurrierendem Rendering nicht verlässlich —
 * React darf einen Render verwerfen und wiederholen, und jeder Durchlauf würde
 * den Winkel erneut weiterdrehen.
 */
export function useArrowRotation({
  targetBearing,
  deviceHeading,
  distance,
}: UseArrowRotationInput): number {
  const [rotation, setRotation] = useState(0);
  const continuous = useRef(0);
  const smoothedBearing = useRef<number | null>(null);

  useEffect(() => {
    if (targetBearing === null) return;

    // Peilung dämpfen, solange wir nah genug dran sind, dass Positionsrauschen
    // sichtbar durchschlägt.
    let effectiveBearing = targetBearing;
    if (distance !== null && distance <= BEARING_SMOOTHING_MAX_DISTANCE_M) {
      smoothedBearing.current =
        smoothedBearing.current === null
          ? targetBearing
          : smoothAngle(smoothedBearing.current, targetBearing, BEARING_SMOOTHING_FACTOR);
      effectiveBearing = smoothedBearing.current;
    } else {
      // Außerhalb der Dämpfungszone den Puffer mitführen, damit der Eintritt in
      // die Zone nicht gegen einen veralteten Wert glättet.
      smoothedBearing.current = targetBearing;
    }

    // Ohne Heading bleibt die Rotation stehen, statt auf 0 zu springen — der
    // Pfeil wird ohnehin sichtbar als richtungslos markiert (Edge Case 11).
    if (deviceHeading === null) return;

    const target = (effectiveBearing - deviceHeading + 360) % 360;
    continuous.current = unwrapAngle(continuous.current, target);
    setRotation(continuous.current);
  }, [targetBearing, deviceHeading, distance]);

  return rotation;
}
