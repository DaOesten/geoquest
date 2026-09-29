import { describe, it, expect } from "vitest";
import {
  haversine,
  bearing,
  headingFromPositions,
  getDistanceColor,
  shortestAngleDelta,
  unwrapAngle,
  smoothAngle,
  angleDistance,
  shouldAcceptFix,
  smoothPosition,
  GPS_ACCURACY_THRESHOLD_M,
  GPS_FALLBACK_MS,
} from "./geo-utils";

describe("haversine", () => {
  it("returns 0 for identical points", () => {
    expect(haversine(52.52, 13.405, 52.52, 13.405)).toBe(0);
  });

  it("calculates distance between Berlin and Hamburg (~255 km)", () => {
    const dist = haversine(52.52, 13.405, 53.5511, 9.9937);
    expect(dist).toBeGreaterThan(250_000);
    expect(dist).toBeLessThan(260_000);
  });

  it("calculates short distance (~100m)", () => {
    const dist = haversine(53.6103, 10.0415, 53.6112, 10.0415);
    expect(dist).toBeGreaterThan(90);
    expect(dist).toBeLessThan(110);
  });
});

describe("bearing", () => {
  it("returns ~0 (north) when target is directly north", () => {
    const b = bearing(52.0, 13.0, 53.0, 13.0);
    expect(b).toBeLessThan(1);
  });

  it("returns ~90 (east) when target is directly east", () => {
    const b = bearing(52.0, 13.0, 52.0, 14.0);
    expect(b).toBeGreaterThan(85);
    expect(b).toBeLessThan(95);
  });

  it("returns ~180 (south) when target is directly south", () => {
    const b = bearing(53.0, 13.0, 52.0, 13.0);
    expect(b).toBeGreaterThan(175);
    expect(b).toBeLessThan(185);
  });

  it("returns ~270 (west) when target is directly west", () => {
    const b = bearing(52.0, 14.0, 52.0, 13.0);
    expect(b).toBeGreaterThan(265);
    expect(b).toBeLessThan(275);
  });
});

describe("headingFromPositions", () => {
  it("returns null when positions are too close (<2m)", () => {
    expect(headingFromPositions(52.0, 13.0, 52.0, 13.0)).toBeNull();
  });

  it("returns bearing when distance >= 2m", () => {
    const h = headingFromPositions(52.0, 13.0, 52.001, 13.0);
    expect(h).not.toBeNull();
    expect(h).toBeLessThan(1);
  });
});

describe("getDistanceColor", () => {
  it("returns red for > 200m", () => {
    expect(getDistanceColor(201)).toBe("red");
    expect(getDistanceColor(1000)).toBe("red");
  });

  it("returns yellow for 51-200m", () => {
    expect(getDistanceColor(200)).toBe("yellow");
    expect(getDistanceColor(51)).toBe("yellow");
  });

  it("returns green for <= 50m", () => {
    expect(getDistanceColor(50)).toBe("green");
    expect(getDistanceColor(0)).toBe("green");
  });
});

/* ------------------------------------------------------------------ *
 * Winkelmathematik der ruhigen Kompassnadel (Refinement 2026-09-20)
 * ------------------------------------------------------------------ */

describe("shortestAngleDelta", () => {
  it("nimmt den kurzen Weg über die Nordgrenze hinweg", () => {
    // Der Kern des gemeldeten Befunds: 2° reale Drehung dürfen nicht
    // als -358° herauskommen (Edge Case 18).
    expect(shortestAngleDelta(359, 1)).toBe(2);
    expect(shortestAngleDelta(1, 359)).toBe(-2);
  });

  it("liefert für normale Drehungen die direkte Differenz", () => {
    expect(shortestAngleDelta(10, 40)).toBe(30);
    expect(shortestAngleDelta(40, 10)).toBe(-30);
  });

  it("bleibt bei exakt 180° eindeutig statt zu flackern", () => {
    // Bei genau gegenüberliegenden Winkeln sind beide Wege gleich lang.
    // Wichtig ist nur, dass das Ergebnis deterministisch ist — sonst
    // zappelt die Nadel zwischen +180 und -180 hin und her.
    expect(shortestAngleDelta(0, 180)).toBe(180);
    expect(shortestAngleDelta(0, 180)).toBe(shortestAngleDelta(0, 180));
  });

  it("bleibt im Bereich (-180, 180], egal wie die Eingabe aussieht", () => {
    for (let from = -720; from <= 720; from += 17) {
      for (let to = -720; to <= 720; to += 23) {
        const d = shortestAngleDelta(from, to);
        expect(d).toBeGreaterThan(-180.0001);
        expect(d).toBeLessThanOrEqual(180.0001);
      }
    }
  });

  it("ist konsistent mit der tatsächlichen Zielrichtung", () => {
    // Von `from` um `delta` weiterzudrehen muss modulo 360 bei `to` landen.
    for (let from = 0; from < 360; from += 13) {
      for (let to = 0; to < 360; to += 11) {
        const landed = (((from + shortestAngleDelta(from, to)) % 360) + 360) % 360;
        expect(landed).toBeCloseTo(to, 6);
      }
    }
  });
});

describe("unwrapAngle", () => {
  it("läuft über 360 hinaus statt zurückzuspringen", () => {
    // Genau das erwartet die CSS-Transition: ein fortlaufender Zahlenwert.
    expect(unwrapAngle(359, 1)).toBe(361);
    expect(unwrapAngle(361, 359)).toBe(359);
  });

  it("läuft auch unter 0 weiter", () => {
    expect(unwrapAngle(1, 359)).toBe(-1);
  });

  it("dreht sich bei einer vollen Runde monoton weiter, ohne Rückwärtssprung", () => {
    // Simuliert einen Spieler, der sich einmal ganz um sich selbst dreht.
    // Kein einziger Schritt darf rückwärts gehen — das wäre die sichtbare
    // Gegendrehung aus dem Befund.
    let continuous = 0;
    let previous = 0;
    for (let heading = 5; heading <= 720; heading += 5) {
      continuous = unwrapAngle(continuous, ((heading % 360) + 360) % 360);
      expect(continuous).toBeGreaterThanOrEqual(previous);
      // Kein Schritt darf größer sein als die reale Drehung.
      expect(continuous - previous).toBeLessThanOrEqual(5.0001);
      previous = continuous;
    }
    // Zwei volle Runden müssen auch als zwei Runden herauskommen.
    expect(continuous).toBeCloseTo(720, 6);
  });
});

describe("smoothAngle", () => {
  it("bewegt sich anteilig auf das Ziel zu", () => {
    expect(smoothAngle(0, 100, 0.5)).toBeCloseTo(50, 6);
  });

  it("glättet über die Nordgrenze, ohne umzuklappen", () => {
    // Ein arithmetisches Mittel aus 350 und 10 wäre 180 — die exakte
    // Gegenrichtung. Genau dieser Fehler darf hier nicht entstehen.
    const result = smoothAngle(350, 10, 0.5);
    expect(result).toBeCloseTo(0, 6);
    expect(result).not.toBeCloseTo(180, 0);
  });

  it("bleibt bei factor 0 stehen und springt bei factor 1 ganz", () => {
    expect(smoothAngle(30, 200, 0)).toBeCloseTo(30, 6);
    expect(smoothAngle(30, 200, 1)).toBeCloseTo(200, 6);
  });

  it("gibt immer einen Winkel in 0..360 zurück", () => {
    for (let current = 0; current < 360; current += 29) {
      for (let target = 0; target < 360; target += 31) {
        const r = smoothAngle(current, target, 0.25);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(360);
      }
    }
  });

  it("konvergiert bei wiederholter Anwendung gegen das Ziel", () => {
    let angle = 350;
    for (let i = 0; i < 60; i++) angle = smoothAngle(angle, 10, 0.25);
    expect(angleDistance(angle, 10)).toBeLessThan(0.5);
  });

  it("dämpft Sensorrauschen um einen ruhenden Wert", () => {
    // Nachbildung von Edge Case 19: Das Gerät liegt still, der Sensor
    // schwankt um ±6°. Der geglättete Wert muss deutlich enger liegen
    // als das Rohsignal.
    const noise = [90, 96, 84, 93, 87, 95, 85, 92, 88, 94, 86, 91];
    let smoothed = 90;
    let maxDeviation = 0;
    for (const raw of noise) {
      smoothed = smoothAngle(smoothed, raw, 0.2);
      maxDeviation = Math.max(maxDeviation, angleDistance(smoothed, 90));
    }
    expect(maxDeviation).toBeLessThan(3);
  });
});

describe("angleDistance", () => {
  it("misst den Abstand über die Nordgrenze korrekt", () => {
    expect(angleDistance(359, 1)).toBe(2);
    expect(angleDistance(1, 359)).toBe(2);
  });

  it("ist symmetrisch und nie negativ", () => {
    for (let a = 0; a < 360; a += 37) {
      for (let b = 0; b < 360; b += 41) {
        expect(angleDistance(a, b)).toBeCloseTo(angleDistance(b, a), 6);
        expect(angleDistance(a, b)).toBeGreaterThanOrEqual(0);
        expect(angleDistance(a, b)).toBeLessThanOrEqual(180.0001);
      }
    }
  });
});

/**
 * Refinement 2026-09-28: Jede GPS-Messung landete ungefiltert in Anzeige und
 * Ankunft — ein 20-m-Sprung im normalen Messrauschen ließ die Entfernung von
 * 30 m auf 10 m fallen, obwohl der Spieler einen Schritt gemacht hatte.
 */
describe("shouldAcceptFix (Edge Cases 31/32)", () => {
  const T0 = 1_000_000;

  it("übernimmt jede genaue Messung", () => {
    expect(shouldAcceptFix({ accuracy: 12, timestamp: T0 }, { accuracy: 5 }, T0)).toBe(true);
    expect(shouldAcceptFix({ accuracy: GPS_ACCURACY_THRESHOLD_M, timestamp: T0 }, { accuracy: 5 }, T0)).toBe(true);
  });

  it("übernimmt die allererste Messung, auch wenn sie grob ist", () => {
    // Die erste Position ist oft eine WLAN-Schätzung — besser als keine.
    expect(shouldAcceptFix({ accuracy: 120, timestamp: T0 }, null, T0)).toBe(true);
  });

  it("verwirft eine ungenaue Messung, solange eine genauere vorliegt", () => {
    expect(shouldAcceptFix({ accuracy: 60, timestamp: T0 + 1000 }, { accuracy: 8 }, T0)).toBe(false);
  });

  it("übernimmt eine ungenaue Messung, wenn sie besser ist als die bisherige", () => {
    expect(shouldAcceptFix({ accuracy: 50, timestamp: T0 + 1000 }, { accuracy: 90 }, T0)).toBe(true);
  });

  it("fällt nach der Frist auf die beste verfügbare Messung zurück", () => {
    const late = T0 + GPS_FALLBACK_MS;
    expect(shouldAcceptFix({ accuracy: 60, timestamp: late - 1 }, { accuracy: 8 }, T0)).toBe(false);
    expect(shouldAcceptFix({ accuracy: 60, timestamp: late }, { accuracy: 8 }, T0)).toBe(true);
  });

  it("übernimmt eine Messung ohne verwertbare Genauigkeit (NaN)", () => {
    expect(shouldAcceptFix({ accuracy: NaN, timestamp: T0 }, { accuracy: 5 }, T0)).toBe(true);
  });
});

describe("smoothPosition (Edge Case 31)", () => {
  const LAT = 53.55;
  const LNG = 10.0;
  /** Meter nach Norden als Breitengrad-Differenz. */
  const north = (m: number) => m / 111_195;
  const fix = (metersNorth: number, accuracy: number, second: number) => ({
    lat: LAT + north(metersNorth),
    lng: LNG,
    accuracy,
    timestamp: second * 1000,
  });
  const metersNorthOf = (p: { lat: number }) => (p.lat - LAT) * 111_195;

  it("übernimmt die erste Messung unverändert", () => {
    const p = smoothPosition(null, fix(10, 15, 0));
    expect(metersNorthOf(p)).toBeCloseTo(10, 6);
  });

  it("übernimmt Messungen mit Genauigkeit 0 unverändert (Emulator, Playwright)", () => {
    let p = smoothPosition(null, fix(0, 0, 0));
    p = smoothPosition(p, fix(500, 0, 1));
    expect(metersNorthOf(p)).toBeCloseTo(500, 6);
  });

  it("dämpft einen einzelnen 20-m-Ausreißer — der gemeldete Befund „30 m → 10 m“", () => {
    // Spieler steht still, das Gerät misst mit ±15 m. Eine Messung springt 20 m.
    let p = smoothPosition(null, fix(0, 15, 0));
    for (let s = 1; s <= 5; s++) p = smoothPosition(p, fix(0, 15, s));
    p = smoothPosition(p, fix(20, 15, 6));
    expect(Math.abs(metersNorthOf(p))).toBeLessThan(8);
  });

  it("folgt echter Bewegung im Gehtempo innerhalb weniger Meter", () => {
    // 1,4 m/s nach Norden, Messung jede Sekunde mit ±10 m, ohne Rauschen.
    let p = smoothPosition(null, fix(0, 10, 0));
    for (let s = 1; s <= 20; s++) p = smoothPosition(p, fix(1.4 * s, 10, s));
    expect(Math.abs(metersNorthOf(p) - 1.4 * 20)).toBeLessThan(6);
  });

  it("gewichtet eine genaue Messung stärker als eine ungenaue", () => {
    const base = smoothPosition(smoothPosition(null, fix(0, 20, 0)), fix(0, 20, 1));
    const precise = smoothPosition(base, fix(10, 3, 2));
    const vague = smoothPosition(base, fix(10, 40, 2));
    expect(metersNorthOf(precise)).toBeGreaterThan(metersNorthOf(vague));
    expect(metersNorthOf(precise)).toBeGreaterThan(8);
  });

  it("setzt nach langer Pause neu an statt gegen eine veraltete Position zu glätten", () => {
    let p = smoothPosition(null, fix(0, 15, 0));
    p = smoothPosition(p, fix(300, 15, 120));
    expect(metersNorthOf(p)).toBeCloseTo(300, 6);
  });
});
