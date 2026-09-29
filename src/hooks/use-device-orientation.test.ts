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

  /** Feuert ein iOS-Event mit Heading und gemeldeter Kompass-Abweichung (Grad). */
  function fireIOS(heading: number, accuracy: number) {
    const event = new Event("deviceorientation");
    Object.defineProperty(event, "webkitCompassHeading", { value: heading, configurable: true });
    Object.defineProperty(event, "webkitCompassAccuracy", { value: accuracy, configurable: true });
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

  // Gezogen 2026-09-28: Bis dahin prüften diese beiden Tests, dass
  // `absolute === false` den Kalibrierungs-Hinweis auslöst. Die Prämisse war
  // falsch — `absolute === false` heißt „relatives Bezugssystem" (Android-Chrome
  // standardmäßig), nicht „unkalibriert". Sie kodierten den Android-Fehler als
  // gewünschtes Verhalten (Edge Cases 29/30).
  it("nutzt ein relatives Heading nicht als Kompass und meldet dafür keinen Kalibrierungsbedarf", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => {
      const event = new Event("deviceorientation") as DeviceOrientationEvent;
      Object.defineProperty(event, "alpha", { value: 90, configurable: true });
      Object.defineProperty(event, "absolute", { value: false, configurable: true });
      window.dispatchEvent(event);
    });
    expect(result.current.heading).toBeNull();
    expect(result.current.compassFresh).toBe(false);
    expect(result.current.needsCalibration).toBe(false);
  });

  it("nimmt den iOS-Kalibrierungs-Hinweis zurück, sobald die gemeldete Genauigkeit gut ist", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireIOS(90, 40));
    expect(result.current.needsCalibration).toBe(true);

    act(() => fireIOS(90, 10));
    expect(result.current.needsCalibration).toBe(false);
  });
});

/**
 * BUG-12 (QA 2026-09-20): Ein `deviceorientation`-Event mit `NaN` oder
 * `Infinity` als Heading vergiftete die Glättungs-Ref. `NaN` ist in der
 * Glättung absorbierend — der Pfeil fror auf seiner letzten Rotation ein und
 * erholte sich für den Rest der Session nicht mehr, auch wenn wieder gültige
 * Werte kamen.
 */
describe("Ungültige Sensorwerte (BUG-12, Edge Case 23)", () => {
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

  /**
   * Der `alpha`-Pfad reicht einen **berechneten** Wert `(360 - alpha) % 360`
   * weiter — auch der wird mit NaN/Infinity zu NaN. Zusätzlich läuft
   * `setNeedsCalibration` dort außerhalb des Guards.
   */
  function fireAlpha(alpha: number, absolute = true) {
    const event = new Event("deviceorientation") as DeviceOrientationEvent;
    Object.defineProperty(event, "alpha", { value: alpha, configurable: true });
    Object.defineProperty(event, "absolute", { value: absolute, configurable: true });
    window.dispatchEvent(event);
  }

  beforeEach(() => {
    setUserAgent(CHROME_UA);
    setRequestPermission(null);
  });

  it("erholt sich nach einem NaN-Heading wieder", () => {
    // Das ist der gemeldete Fehler: nicht dass NaN ankommt, sondern dass der
    // Kompass danach **dauerhaft** tot bleibt.
    const { result } = renderHook(() => useDeviceOrientation());
    for (let i = 0; i < 60; i++) act(() => fireHeading(90));
    expect(result.current.heading).toBeCloseTo(90, 0);

    act(() => fireHeading(NaN));
    for (let i = 0; i < 120; i++) act(() => fireHeading(180));

    expect(Number.isFinite(result.current.heading)).toBe(true);
    expect(Math.abs(((result.current.heading! - 180 + 540) % 360) - 180)).toBeLessThan(1);
  });

  it("erholt sich nach Infinity und -Infinity wieder", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    for (let i = 0; i < 60; i++) act(() => fireHeading(90));

    act(() => fireHeading(Infinity));
    act(() => fireHeading(-Infinity));
    for (let i = 0; i < 120; i++) act(() => fireHeading(270));

    expect(Number.isFinite(result.current.heading)).toBe(true);
    expect(Math.abs(((result.current.heading! - 270 + 540) % 360) - 180)).toBeLessThan(1);
  });

  it("hält das Heading beim ungültigen Wert unverändert, statt es zu verwerfen", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    for (let i = 0; i < 60; i++) act(() => fireHeading(120));
    const before = result.current.heading;

    act(() => fireHeading(NaN));
    expect(result.current.heading).toBe(before);

    // "Unverändert" allein genügt als Nachweis nicht: Auch die **kaputte**
    // Fassung ließ den sichtbaren Wert stehen — sie hatte nur zusätzlich die
    // interne Ref vergiftet. Entscheidend ist, dass der nächste gültige Wert
    // wieder greift.
    for (let i = 0; i < 60; i++) act(() => fireHeading(200));
    expect(Number.isFinite(result.current.heading)).toBe(true);
    expect(Math.abs(((result.current.heading! - 200 + 540) % 360) - 180)).toBeLessThan(1);
  });

  it("lässt einen ungültigen Wert nicht als Kompass-Lebenszeichen gelten", () => {
    // Sonst hielte die Karenzzeit den unbrauchbaren Zustand am Leben und
    // verdrängte die GPS-Bewegungsrichtung, die noch funktioniert.
    const { result } = renderHook(() => useDeviceOrientation());
    expect(result.current.compassFresh).toBe(false);

    act(() => fireHeading(NaN));
    expect(result.current.compassFresh).toBe(false);

    act(() => fireHeading(90));
    expect(result.current.compassFresh).toBe(true);
  });

  it("übergeht einen ungültigen Wert auch als allerersten Wert", () => {
    // Der Sonderpfad "erster Wert" umgeht die Glättung — er darf NaN
    // ebensowenig durchlassen.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(NaN));
    expect(result.current.heading).toBeNull();

    act(() => fireHeading(75));
    expect(result.current.heading).toBeCloseTo(75, 6);
  });

  it("erholt sich auch im alpha-Pfad nach NaN und Infinity", () => {
    // `Number.isFinite` allein genügt hier **nicht** als Zusicherung: Der
    // eingefrorene Wert der kaputten Fassung ist ebenfalls endlich. Geprüft
    // wird deshalb, dass das Heading dem neuen alpha tatsächlich **folgt**.
    // Der alpha-Pfad rechnet `(360 - alpha) % 360`, also alpha 90 -> 270
    // und alpha 200 -> 160.
    const { result } = renderHook(() => useDeviceOrientation());
    for (let i = 0; i < 60; i++) act(() => fireAlpha(90));
    expect(result.current.heading).toBeCloseTo(270, 0);

    act(() => fireAlpha(NaN));
    act(() => fireAlpha(Infinity));
    for (let i = 0; i < 120; i++) act(() => fireAlpha(200));

    expect(Number.isFinite(result.current.heading)).toBe(true);
    expect(Math.abs(((result.current.heading! - 160 + 540) % 360) - 180)).toBeLessThan(1);
  });

  it("ein unbrauchbarer relativer alpha-Wert löst weder Kompass noch Kalibrierungs-Hinweis aus", () => {
    // Gezogen 2026-09-28: prüfte bis dahin, dass ein relatives `alpha` den
    // Hinweis auslöst — dieselbe falsche Prämisse wie Edge Case 22.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireAlpha(NaN, false));
    expect(result.current.needsCalibration).toBe(false);
    expect(result.current.compassFresh).toBe(false);

    act(() => fireAlpha(90, true));
    expect(result.current.heading).toBeCloseTo(270, 6);
    expect(result.current.needsCalibration).toBe(false);
  });

  it("verwirft ein Heading von 0 nicht (Nord ist gültig)", () => {
    // Die klassische Falle: Ein Falsy-Check (`if (!next) return`) statt
    // `Number.isFinite` hätte 0° mitverworfen — ausgerechnet Nord.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fireHeading(0));
    expect(result.current.heading).toBe(0);
    expect(result.current.compassFresh).toBe(true);
  });
});

/**
 * Refinement 2026-09-28: Android-Chrome liefert über `deviceorientation` ein
 * **relatives** Heading (`absolute: false`) — Norden war dort die Richtung, in
 * die das Gerät beim Laden zeigte. Das absolute Heading kommt über
 * `deviceorientationabsolute`, das bis dahin niemand abhörte (Edge Case 29).
 * Auf iOS hing der Kalibrierungs-Hinweis fest an `false`, obwohl
 * `webkitCompassAccuracy` den Zustand kennt (Edge Case 30).
 */
describe("Bezugssystem und Kalibrierung (Refinement 2026-09-28)", () => {
  function fire(type: string, props: Record<string, unknown>) {
    const event = new Event(type);
    for (const [key, value] of Object.entries(props)) {
      Object.defineProperty(event, key, { value, configurable: true });
    }
    window.dispatchEvent(event);
  }

  beforeEach(() => {
    setUserAgent(CHROME_UA);
    setRequestPermission(null);
  });

  it("übernimmt das Heading aus deviceorientationabsolute (Android)", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fire("deviceorientationabsolute", { alpha: 100, absolute: true }));
    expect(result.current.heading).toBeCloseTo(260, 6);
    expect(result.current.compassFresh).toBe(true);
  });

  it("folgt dem absoluten Heading, auch wenn parallel relative Werte eintreffen", () => {
    // Genau so feuert Android-Chrome: beide Ereignisse, mit unterschiedlichem
    // Nullpunkt. Ein relativer Wert darf den Pfeil nicht verziehen.
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fire("deviceorientationabsolute", { alpha: 200, absolute: true }));
    for (let i = 0; i < 20; i++) {
      act(() => fire("deviceorientation", { alpha: 10, absolute: false }));
    }
    expect(result.current.heading).toBeCloseTo(160, 6);
    expect(result.current.rawHeading).toBeCloseTo(160, 6);
  });

  it("akzeptiert ein deviceorientation-Event, das sich selbst als absolut meldet", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fire("deviceorientation", { alpha: 30, absolute: true }));
    expect(result.current.heading).toBeCloseTo(330, 6);
  });

  it("liefert ohne absolutes Heading keinen Kompass — Rückfall auf die Bewegungsrichtung", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    for (let i = 0; i < 10; i++) {
      act(() => fire("deviceorientation", { alpha: 45 + i, absolute: false }));
    }
    expect(result.current.heading).toBeNull();
    expect(result.current.compassFresh).toBe(false);
  });

  it("meldet auf iOS Kalibrierungsbedarf bei schlechter oder ungültiger Genauigkeit", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fire("deviceorientation", { webkitCompassHeading: 90, webkitCompassAccuracy: 40 }));
    expect(result.current.needsCalibration).toBe(true);
    act(() => fire("deviceorientation", { webkitCompassHeading: 90, webkitCompassAccuracy: -1 }));
    expect(result.current.needsCalibration).toBe(true);
    act(() => fire("deviceorientation", { webkitCompassHeading: 90, webkitCompassAccuracy: 15 }));
    expect(result.current.needsCalibration).toBe(false);
  });

  it("meldet auf iOS keinen Kalibrierungsbedarf, wenn keine Genauigkeit mitkommt", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fire("deviceorientation", { webkitCompassHeading: 90 }));
    expect(result.current.needsCalibration).toBe(false);
  });

  it("meldet auf Android mit absolutem Heading keinen dauerhaften Kalibrierungsbedarf", () => {
    const { result } = renderHook(() => useDeviceOrientation());
    act(() => fire("deviceorientation", { alpha: 10, absolute: false }));
    act(() => fire("deviceorientationabsolute", { alpha: 100, absolute: true }));
    expect(result.current.needsCalibration).toBe(false);
  });

  it("hängt den Listener für deviceorientationabsolute beim Unmount wieder ab", () => {
    const { result, unmount } = renderHook(() => useDeviceOrientation());
    unmount();
    act(() => fire("deviceorientationabsolute", { alpha: 100, absolute: true }));
    expect(result.current.heading).toBeNull();
  });
});
