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
