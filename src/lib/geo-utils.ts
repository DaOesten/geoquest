const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = (lat2 - lat1) * DEG;
  const dLng = (lng2 - lng1) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function bearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = (lng2 - lng1) * DEG;
  const y = Math.sin(dLng) * Math.cos(lat2 * DEG);
  const x =
    Math.cos(lat1 * DEG) * Math.sin(lat2 * DEG) -
    Math.sin(lat1 * DEG) * Math.cos(lat2 * DEG) * Math.cos(dLng);
  return ((Math.atan2(y, x) * RAD + 360) % 360);
}

export function headingFromPositions(
  prevLat: number,
  prevLng: number,
  currLat: number,
  currLng: number
): number | null {
  const dist = haversine(prevLat, prevLng, currLat, currLng);
  if (dist < 2) return null;
  return bearing(prevLat, prevLng, currLat, currLng);
}

export type DistanceColor = "red" | "yellow" | "green";

export function getDistanceColor(meters: number): DistanceColor {
  if (meters > 200) return "red";
  if (meters > 50) return "yellow";
  return "green";
}

/* ------------------------------------------------------------------ *
 * Winkelmathematik für die ruhige Kompassnadel (Refinement 2026-09-20)
 * ------------------------------------------------------------------ */

/**
 * Kürzeste Differenz zwischen zwei Winkeln, im Bereich (-180, 180].
 *
 * Das ist die Grundlage für alles Weitere: 359° → 1° ergibt +2°, nicht -358°.
 * Ohne sie animiert CSS bei jedem Nulldurchgang eine fast volle Umdrehung
 * (Edge Case 18) — das gemeldete "dreht sich um sich selbst".
 */
export function shortestAngleDelta(from: number, to: number): number {
  // Zweifaches Modulo: JavaScripts `%` liefert bei negativen Operanden ein
  // negatives Ergebnis (-184 % 360 === -184), wodurch ein einfaches
  // `(d + 540) % 360 - 180` aus dem Zielbereich fällt. Erst normalisieren,
  // dann spiegeln. Der Fall tritt real auf, sobald die fortlaufende Rotation
  // ins Negative gelaufen ist.
  const diff = (((to - from) % 360) + 360) % 360;
  // `diff` liegt jetzt in [0, 360). Alles über 180 ist rückwärts kürzer.
  // Bei exakt 180 sind beide Wege gleich lang — wir wählen deterministisch
  // +180, damit die Nadel nicht zwischen den Vorzeichen zappelt.
  return diff > 180 ? diff - 360 : diff;
}

/**
 * Rechnet einen neuen Zielwinkel (0..360) auf einen fortlaufenden,
 * unbeschränkten Rotationswert um, der beliebig über 360 hinaus oder unter 0
 * laufen darf.
 *
 * Genau das braucht die CSS-Transition: Sie interpoliert numerisch zwischen
 * altem und neuem `rotate()`-Wert. Nur wenn der Zahlenwert dem kürzeren Weg
 * folgt, tut es die Nadel auch.
 */
export function unwrapAngle(currentContinuous: number, targetDegrees: number): number {
  return currentContinuous + shortestAngleDelta(currentContinuous, targetDegrees);
}

/**
 * Exponentielle Glättung zweier Winkel entlang des kürzeren Wegs.
 *
 * `factor` 0 = bleibt stehen, 1 = springt sofort auf den neuen Wert.
 *
 * Bewusst **nicht** als arithmetisches Mittel implementiert: Der Mittelwert aus
 * 359° und 1° wäre 180° — die exakte Gegenrichtung. Das wäre derselbe
 * Fehlertyp, den dieses Refinement behebt, nur eine Ebene tiefer.
 */
export function smoothAngle(current: number, target: number, factor: number): number {
  const delta = shortestAngleDelta(current, target);
  return (current + delta * factor + 360) % 360;
}

/**
 * Absoluter Abstand zweier Winkel in Grad, immer 0..180.
 * Für Schwellenvergleiche ("hat sich überhaupt genug geändert?").
 */
export function angleDistance(a: number, b: number): number {
  return Math.abs(shortestAngleDelta(a, b));
}
