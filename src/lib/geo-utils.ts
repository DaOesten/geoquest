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

// ---------------------------------------------------------------------------
// GPS-Genauigkeit (Refinement 2026-09-28)
// ---------------------------------------------------------------------------

/**
 * Oberhalb dieser Ungenauigkeit gilt eine Messung als unbrauchbar, solange eine
 * genauere vorliegt (Edge Case 31). Handy-GPS liegt im Freien meist bei
 * 5–20 m; darüber sind es typischerweise WLAN-/Funkzellen-Schätzungen oder
 * Messungen zwischen Häusern.
 */
export const GPS_ACCURACY_THRESHOLD_M = 30;

/**
 * Kommt so lange keine genaue Messung, gilt die beste verfügbare
 * (Edge Case 32). Ein harter Filter würde drinnen keine einzige Position
 * durchlassen — die Navigation fiele genau dort aus, wo GPS ohnehin schwach ist.
 */
export const GPS_FALLBACK_MS = 5000;

/**
 * Soll eine neue Messung übernommen werden?
 *
 * Verworfen wird nur, wenn **gleichzeitig** gilt: die Messung ist ungenau, es
 * liegt schon eine genauere vor, und die letzte genaue Messung ist jünger als
 * die Rückfallfrist. Damit kommt die allererste Messung immer durch (auch eine
 * grobe WLAN-Schätzung ist besser als keine), und eine Folge ungenauer
 * Messungen legt die Anzeige nie länger als die Frist still.
 */
export function shouldAcceptFix(
  fix: { accuracy: number; timestamp: number },
  current: { accuracy: number } | null,
  lastGoodAt: number
): boolean {
  if (!Number.isFinite(fix.accuracy) || fix.accuracy <= GPS_ACCURACY_THRESHOLD_M) return true;
  if (current === null) return true;
  if (fix.accuracy <= current.accuracy) return true;
  return fix.timestamp - lastGoodAt >= GPS_FALLBACK_MS;
}

/**
 * Wie schnell sich die wahre Position zwischen zwei Messungen verändern darf,
 * als Varianz pro Sekunde (m²/s). Entspricht grob 4 m/s — schneller als
 * Gehen, damit die Anzeige einem Spieler innerhalb weniger Sekunden folgt,
 * statt Meter um Meter nachzulaufen.
 */
const POSITION_PROCESS_NOISE = 16;

/** Nach so langer Pause wird nicht mehr geglättet, sondern neu angesetzt. */
const POSITION_STALE_MS = 60_000;

export interface SmoothedPosition {
  lat: number;
  lng: number;
  /** Unsicherheit der geglätteten Position als Varianz in m². */
  variance: number;
  timestamp: number;
}

/**
 * Geglättete Position nach einer neuen Messung (eindimensionaler Kalman-Filter,
 * für Breite und Länge mit derselben Verstärkung).
 *
 * Die Gewichtung folgt der gemeldeten `accuracy`: Eine genaue Messung zieht
 * die Position fast ganz zu sich, eine ungenaue nur ein Stück. So springt die
 * Anzeige bei einem 20-m-Ausreißer nicht mit (Befund „30 m, einen Schritt
 * später 10 m"), folgt aber echter Bewegung.
 *
 * Eine Messung mit `accuracy` 0 (Emulatoren, Playwright) wird unverändert
 * übernommen — der Filter hat dann keinen Grund, ihr zu misstrauen.
 */
export function smoothPosition(
  previous: SmoothedPosition | null,
  fix: { lat: number; lng: number; accuracy: number; timestamp: number }
): SmoothedPosition {
  const measurementVariance = Math.max(0, fix.accuracy) ** 2;

  if (previous === null || fix.timestamp - previous.timestamp > POSITION_STALE_MS) {
    return { lat: fix.lat, lng: fix.lng, variance: measurementVariance, timestamp: fix.timestamp };
  }

  const dt = Math.max(0, (fix.timestamp - previous.timestamp) / 1000);
  const predicted = previous.variance + POSITION_PROCESS_NOISE * dt;
  const denominator = predicted + measurementVariance;
  const gain = denominator === 0 ? 1 : predicted / denominator;

  return {
    lat: previous.lat + gain * (fix.lat - previous.lat),
    lng: previous.lng + gain * (fix.lng - previous.lng),
    variance: (1 - gain) * predicted,
    timestamp: fix.timestamp,
  };
}
