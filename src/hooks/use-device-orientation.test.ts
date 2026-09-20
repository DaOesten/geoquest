/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDeviceOrientation } from "./use-device-orientation";

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36";
const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36";
const IPADOS_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

/**
 * Nur einzelne Properties patchen statt `window`/`navigator` zu ersetzen —
 * sonst verliert jsdom sein document (gleiches Muster wie use-geolocation.test).
 */
function setUserAgent(ua: string) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
}

function setMaxTouchPoints(n: number) {
  Object.defineProperty(navigator, "maxTouchPoints", { value: n, configurable: true });
}

/** Setzt `DeviceOrientationEvent.requestPermission` — oder entfernt es. */
function setRequestPermission(fn: (() => Promise<string>) | null) {
  const DOE = window.DeviceOrientationEvent as unknown as Record<string, unknown>;
  if (fn === null) {
    delete DOE.requestPermission;
  } else {
    DOE.requestPermission = fn;
  }
}

const originalUA = navigator.userAgent;
const originalTouchPoints = navigator.maxTouchPoints;

beforeEach(() => {
  // jsdom kennt DeviceOrientationEvent nicht — minimaler Stub als Basis.
  if (typeof window.DeviceOrientationEvent === "undefined") {
    (window as unknown as Record<string, unknown>).DeviceOrientationEvent = class {};
  }
  setRequestPermission(null);
  setMaxTouchPoints(0);
});

afterEach(() => {
  setUserAgent(originalUA);
  setMaxTouchPoints(originalTouchPoints);
  setRequestPermission(null);
  vi.restoreAllMocks();
});

/**
 * BUG-6 (2026-09-07): Desktop-Chrome stellt `requestPermission` bereit, ohne
 * eine iOS-artige Sensorfreigabe zu kennen. Die alte Erkennung prüfte nur auf
 * diese Funktion und hielt Chrome deshalb für ein iPhone — der Spieler bekam
 * den "Kompass aktivieren"-Button, der dort in eine Sackgasse führt.
 */
describe("Plattformerkennung (BUG-6, Edge Case 13)", () => {
  it("bietet auf Desktop-Chrome keine Sensorfreigabe an, obwohl die API existiert", () => {
    setUserAgent(CHROME_UA);
    setMaxTouchPoints(0);
    setRequestPermission(async () => "denied");

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.canRequestPermission).toBe(false);
    expect(result.current.permission).toBe("granted");
  });

  it("bietet auf Android-Chrome keine Sensorfreigabe an", () => {
    setUserAgent(ANDROID_CHROME_UA);
    setMaxTouchPoints(5);
    setRequestPermission(async () => "denied");

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.canRequestPermission).toBe(false);
  });

  it("bietet die Sensorfreigabe auf dem iPhone weiterhin an", () => {
    setUserAgent(IOS_UA);
    setMaxTouchPoints(5);
    setRequestPermission(async () => "granted");

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.canRequestPermission).toBe(true);
    expect(result.current.permission).toBe("prompt");
  });

  it("erkennt iPadOS, das sich als Macintosh mit Touch-Punkten meldet", () => {
    setUserAgent(IPADOS_UA);
    setMaxTouchPoints(5);
    setRequestPermission(async () => "granted");

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.canRequestPermission).toBe(true);
  });

  it("hält einen echten Mac (keine Touch-Punkte) nicht für ein iPad", () => {
    setUserAgent(IPADOS_UA);
    setMaxTouchPoints(0);
    setRequestPermission(async () => "denied");

    const { result } = renderHook(() => useDeviceOrientation());

    expect(result.current.canRequestPermission).toBe(false);
  });
});

/**
 * Zweite Verteidigungslinie (Edge Case 14): Egal ob die Plattformerkennung
 * richtig lag — nach einem `denied` darf der Screen nie ohne Erklärung
 * zurückbleiben. `canRequestPermission: false` blendet den Button aus und
 * damit den "Laufe ein paar Schritte"-Hinweis ein.
 */
describe("Rückfall nach abgelehnter Freigabe (Edge Case 14)", () => {
  it("blendet den Button nach einem denied aus", async () => {
    setUserAgent(IOS_UA);
    setMaxTouchPoints(5);
    setRequestPermission(async () => "denied");

    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current.canRequestPermission).toBe(true);

    await act(async () => {
      await result.current.requestPermission();
    });

    await waitFor(() => {
      expect(result.current.permission).toBe("denied");
      expect(result.current.canRequestPermission).toBe(false);
    });
  });

  it("blendet den Button auch aus, wenn requestPermission wirft", async () => {
    setUserAgent(IOS_UA);
    setMaxTouchPoints(5);
    setRequestPermission(async () => {
      throw new Error("NotAllowedError");
    });

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    await waitFor(() => {
      expect(result.current.permission).toBe("denied");
      expect(result.current.canRequestPermission).toBe(false);
    });
  });

  it("richtet den Kompass nach erteilter Freigabe aus, ohne Neuladen", async () => {
    setUserAgent(IOS_UA);
    setMaxTouchPoints(5);
    setRequestPermission(async () => "granted");

    const { result } = renderHook(() => useDeviceOrientation());

    await act(async () => {
      await result.current.requestPermission();
    });

    await waitFor(() => expect(result.current.permission).toBe("granted"));

    act(() => {
      const ev = new Event("deviceorientation") as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
      };
      Object.defineProperty(ev, "webkitCompassHeading", { value: 90 });
      window.dispatchEvent(ev);
    });

    await waitFor(() => expect(result.current.heading).toBe(90));
  });
});

describe("Nicht unterstützte Umgebung", () => {
  it("meldet unsupported, wenn DeviceOrientationEvent fehlt", () => {
    const DOE = window.DeviceOrientationEvent;
    delete (window as unknown as Record<string, unknown>).DeviceOrientationEvent;

    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current.permission).toBe("unsupported");
    expect(result.current.canRequestPermission).toBe(false);

    (window as unknown as Record<string, unknown>).DeviceOrientationEvent = DOE;
  });
});

/**
 * Refinement 2026-09-20: Der rohe Sensorwert landete ungefiltert im State.
 * Auf dem Gerät schwankt `webkitCompassHeading` um mehrere Grad und feuert mit
 * ~60 Hz — die Nadel zitterte, und der Navigations-Screen rendert bei jedem
 * Event neu (Edge Case 19).
 */
describe("Glättung des Kompass-Headings (Edge Case 19)", () => {
  /** Feuert ein deviceorientation-Event mit webkitCompassHeading. */
  function fireHeading(heading: number) {
    const event = new Event("deviceorientation") as DeviceOrientationEvent & {
      webkitCompassHeading?: number;
    };
    Object.defineProperty(event, "webkitCompassHeading", {
      value: heading,
      configurable: true,
    });
    window.dispatchEvent(event);
  }

  beforeEach(() => {
    // Nicht-iOS: der Listener hängt sich direkt im Effekt ein.
    setUserAgent(CHROME_UA);
    setRequestPermission(null);
  });

  it("übernimmt den allerersten Wert unverändert", () => {
    // Gegen null zu glätten gäbe es nichts — und ein Einschwingen von 0° aus
    // wäre eine Anfangsdrehung, die der Sensor nie gemeldet hat.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(120));
    expect(result.current.heading).toBeCloseTo(120, 6);
  });

  it("dämpft Rauschen um einen ruhenden Wert", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(90));

    // Gerät liegt still, Sensor schwankt um ±6°. Gemessen wird der **größte
    // Ausschlag über die ganze Sequenz**, nicht der Endwert: Ein Endwert allein
    // besteht diesen Test auch ohne jede Glättung, wenn die Sequenz zufällig
    // nah an der Mitte endet. Genau das ist mir hier zuerst passiert.
    const noise = [96, 84, 95, 85, 94, 86, 93, 87, 92, 88];
    let maxDeviation = 0;
    for (const raw of noise) {
      act(() => fireHeading(raw));
      maxDeviation = Math.max(
        maxDeviation,
        Math.abs(((result.current.heading! - 90 + 540) % 360) - 180)
      );
    }

    // Das Rohsignal schlägt um 6° aus, der geglättete Wert muss klar darunter
    // bleiben.
    expect(maxDeviation).toBeLessThan(3);
  });

  it("klappt an der Nordgrenze nicht in die Gegenrichtung um", () => {
    // Der naheliegende gleitende Mittelwert aus 350 und 10 wäre 180 — also
    // exakt rückwärts. Genau dieser Fehlertyp darf hier nicht entstehen.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(350));
    act(() => fireHeading(10));

    // Der Zwischenwert ist der aussagekräftige: Bei korrekter Glättung liegt er
    // zwischen 350 und 10 — also **nahe Nord** —, bei einem arithmetischen
    // Mittel dagegen bei ~180, der exakten Gegenrichtung.
    const h = result.current.heading!;
    const distanceToNorth = Math.min(h, 360 - h);
    expect(distanceToNorth).toBeLessThan(15);
    expect(Math.abs(h - 180)).toBeGreaterThan(90);

    // Und die Glättung muss hier wirklich greifen: Der Wert darf nicht einfach
    // der durchgereichte Rohwert 10 sein.
    expect(h).not.toBeCloseTo(10, 3);
    expect(h).toBeGreaterThan(340);
  });

  it("folgt einer echten Drehung vollständig", () => {
    // Die Dämpfung darf nicht bedeuten, dass die Nadel das Ziel nie erreicht.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(0));
    for (let i = 0; i < 80; i++) {
      act(() => fireHeading(270));
    }
    const h = result.current.heading!;
    expect(Math.abs(((h - 270 + 540) % 360) - 180)).toBeLessThan(1);
  });

  it("stellt den ungeglätteten Wert weiterhin bereit", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(100));
    act(() => fireHeading(160));
    expect(result.current.rawHeading).toBeCloseTo(160, 6);
    // Das geglättete Heading hinkt bewusst hinterher.
    expect(result.current.heading).toBeLessThan(160);
  });

  it("aktualisiert den State nicht bei Änderungen unterhalb der Schwelle", () => {
    // Das ist der Teil, der den ganzen Navigations-Screen vor ~60 Re-Renders
    // pro Sekunde bewahrt.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(45));
    const before = result.current.heading;

    // Eine Abweichung von 1° ergibt bei Faktor 0.15 rund 0.15° Bewegung —
    // unterhalb der Schwelle von 0.75°.
    act(() => fireHeading(46));
    expect(result.current.heading).toBe(before);
  });

  it("meldet Kalibrierungsbedarf bei nicht-absolutem Heading (Edge Case 22)", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => {
      const event = new Event("deviceorientation") as DeviceOrientationEvent;
      Object.defineProperty(event, "alpha", { value: 90, configurable: true });
      Object.defineProperty(event, "absolute", { value: false, configurable: true });
      window.dispatchEvent(event);
    });
    expect(result.current.needsCalibration).toBe(true);
  });

  it("nimmt den Kalibrierungs-Hinweis zurück, sobald ein absolutes Heading kommt", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => {
      const event = new Event("deviceorientation") as DeviceOrientationEvent;
      Object.defineProperty(event, "alpha", { value: 90, configurable: true });
      Object.defineProperty(event, "absolute", { value: false, configurable: true });
      window.dispatchEvent(event);
    });
    expect(result.current.needsCalibration).toBe(true);

    act(() => fireHeading(90));
    expect(result.current.needsCalibration).toBe(false);
  });
});
