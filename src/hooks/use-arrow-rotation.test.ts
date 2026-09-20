/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useArrowRotation, type UseArrowRotationInput } from "./use-arrow-rotation";

describe("useArrowRotation — fortlaufende Rotation (Edge Case 18)", () => {
  it("startet bei 0, solange keine Peilung vorliegt", () => {
    const { result } = renderHook(() =>
      useArrowRotation({ targetBearing: null, deviceHeading: null, distance: null })
    );
    expect(result.current).toBe(0);
  });

  it("zeigt bei Heading gleich Peilung geradeaus", () => {
    const { result } = renderHook(() =>
      useArrowRotation({ targetBearing: 90, deviceHeading: 90, distance: 500 })
    );
    expect(result.current % 360).toBeCloseTo(0, 6);
  });

  it("läuft über die Nordgrenze fortlaufend weiter statt zurückzuspringen", () => {
    // Der Kern des gemeldeten Befunds. Ohne fortlaufenden Winkel fiele der
    // Wert hier von ~359 auf ~1 — und CSS animierte die volle Gegendrehung.
    const { result, rerender } = renderHook((props) => useArrowRotation(props), {
      initialProps: { targetBearing: 359, deviceHeading: 0, distance: 500 },
    });
    // Von 0 aus ist 359° eine Drehung um 1° **rückwärts** — der fortlaufende
    // Wert ist deshalb -1, nicht 359. Genau das ist der Punkt: Der Zahlenwert
    // folgt dem kurzen Weg, den auch die Hand des Spielers nimmt.
    const first = result.current;
    expect(first).toBeCloseTo(-1, 0);

    rerender({ targetBearing: 1, deviceHeading: 0, distance: 500 });
    // 359° → 1° sind 2° vorwärts, also -1 + 2 = 1. Entscheidend ist die
    // Schrittweite: Ohne fortlaufenden Winkel läge hier eine Differenz von
    // ~358° und CSS animierte die volle Gegendrehung.
    expect(result.current - first).toBeCloseTo(2, 0);
  });

  it("dreht bei einer vollen Spielerdrehung monoton mit", () => {
    const { result, rerender } = renderHook((props) => useArrowRotation(props), {
      initialProps: { targetBearing: 0, deviceHeading: 0, distance: 500 },
    });

    let previous = result.current;
    // Der Spieler dreht sich einmal ganz um sich selbst: das Heading wandert,
    // die Peilung bleibt. Der Pfeil muss durchgehend in eine Richtung laufen.
    for (let heading = 10; heading <= 360; heading += 10) {
      rerender({ targetBearing: 0, deviceHeading: heading % 360, distance: 500 });
      // Kein einziger Rückwärtssprung — das wäre die sichtbare Gegendrehung.
      expect(result.current).toBeLessThanOrEqual(previous + 0.0001);
      expect(previous - result.current).toBeLessThanOrEqual(10.0001);
      previous = result.current;
    }
    // Eine volle Drehung des Spielers = eine volle Gegendrehung des Pfeils.
    expect(result.current).toBeCloseTo(-360, 0);
  });

  it("bleibt stehen, wenn das Heading verloren geht", () => {
    // Auf 0 zu springen wäre das alte Verhalten und sähe aus wie "geradeaus".
    // Explizit typisiert: Ohne das leitet TypeScript `deviceHeading: number`
    // aus den initialProps ab, und das spätere `null` wäre ein Typfehler.
    const { result, rerender } = renderHook(
      (props: UseArrowRotationInput) => useArrowRotation(props),
      {
        initialProps: {
          targetBearing: 90,
          deviceHeading: 0,
          distance: 500,
        } as UseArrowRotationInput,
      }
    );
    const before = result.current;
    expect(before).toBeCloseTo(90, 0);

    rerender({ targetBearing: 90, deviceHeading: null, distance: 500 });
    expect(result.current).toBe(before);
  });
});

describe("useArrowRotation — Dämpfung der Zielpeilung (Edge Case 21)", () => {
  it("dämpft Peilungsrauschen nahe am Ziel", () => {
    // Nachbildung des realen Falls: Der Spieler steht 30 m vom Ziel, die
    // GPS-Position springt innerhalb ihrer Genauigkeit, die Peilung schwankt
    // dadurch um ±30°.
    const { result, rerender } = renderHook((props) => useArrowRotation(props), {
      initialProps: { targetBearing: 90, deviceHeading: 0, distance: 30 },
    });

    let maxDeviation = 0;
    for (const noisy of [120, 60, 115, 65, 110, 70, 105, 75]) {
      rerender({ targetBearing: noisy, deviceHeading: 0, distance: 30 });
      maxDeviation = Math.max(maxDeviation, Math.abs(result.current - 90));
    }

    // Das Rohsignal schlägt um 30° aus; gedämpft muss es klar darunter bleiben.
    expect(maxDeviation).toBeLessThan(15);
  });

  it("dämpft weit entfernt nicht, weil die Peilung dort ohnehin stabil ist", () => {
    const { result, rerender } = renderHook((props) => useArrowRotation(props), {
      initialProps: { targetBearing: 90, deviceHeading: 0, distance: 1000 },
    });
    rerender({ targetBearing: 120, deviceHeading: 0, distance: 1000 });
    // Ohne Dämpfung folgt der Pfeil sofort.
    expect(result.current).toBeCloseTo(120, 0);
  });

  it("glättet beim Eintritt in die Dämpfungszone nicht gegen einen veralteten Wert", () => {
    // Der Puffer wird auch außerhalb der Zone mitgeführt. Ohne das würde der
    // Pfeil beim Unterschreiten der Grenze gegen eine lange veraltete Peilung
    // glätten und sichtbar in die falsche Richtung ziehen.
    const { result, rerender } = renderHook((props) => useArrowRotation(props), {
      initialProps: { targetBearing: 10, deviceHeading: 0, distance: 1000 },
    });
    rerender({ targetBearing: 200, deviceHeading: 0, distance: 1000 });
    rerender({ targetBearing: 200, deviceHeading: 0, distance: 50 });
    // Muss nahe 200 liegen, nicht irgendwo zwischen 10 und 200.
    expect(Math.abs(((result.current - 200 + 540) % 360) - 180)).toBeLessThan(5);
  });
});
