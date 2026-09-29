/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGeolocation } from "./use-geolocation";

type SuccessCb = (pos: GeolocationPosition) => void;
type ErrorCb = (err: GeolocationPositionError) => void;

let successCb: SuccessCb | null = null;
let errorCb: ErrorCb | null = null;

const mockGeolocation = {
  watchPosition: vi.fn((success: SuccessCb, error: ErrorCb) => {
    successCb = success;
    errorCb = error;
    return 1;
  }),
  clearWatch: vi.fn(),
  getCurrentPosition: vi.fn(),
};

function makePosition(lat = 52.5, lng = 13.4): GeolocationPosition {
  return {
    coords: { latitude: lat, longitude: lng, accuracy: 10 },
    timestamp: Date.now(),
  } as GeolocationPosition;
}

/** Die Codes entsprechen der W3C-Spec: 1 = DENIED, 2 = UNAVAILABLE, 3 = TIMEOUT. */
function makeError(code: 1 | 2 | 3): GeolocationPositionError {
  return {
    code,
    message: "",
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError;
}

/**
 * Nur einzelne Properties patchen statt `window`/`navigator` komplett zu
 * ersetzen — sonst verliert jsdom sein document und testing-library bricht ab.
 */
function setSecureContext(value: boolean) {
  Object.defineProperty(window, "isSecureContext", {
    value,
    configurable: true,
    writable: true,
  });
}

function setGeolocation(value: unknown) {
  Object.defineProperty(navigator, "geolocation", {
    value,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  successCb = null;
  errorCb = null;
  vi.clearAllMocks();
  vi.useFakeTimers();
  setGeolocation(mockGeolocation);
  setSecureContext(true);
  // permissions bewusst entfernt: der Hook muss auch ohne die API laufen.
  Object.defineProperty(navigator, "permissions", {
    value: undefined,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useGeolocation — Kein-Fix-Zustand (Refinement 2026-09-06)", () => {
  it("geht nach dem Anfordern in den Suchzustand", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());

    expect(result.current.signal).toBe("searching");
  });

  it("meldet no-fix, wenn nach 15s keine Position kommt", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());
    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    expect(result.current.permission).toBe("no-fix");
  });

  it("meldet KEIN no-fix, wenn die Position rechtzeitig eintrifft", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());
    act(() => successCb?.(makePosition()));
    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    expect(result.current.permission).toBe("granted");
    expect(result.current.signal).toBe("active");
  });

  it.each([
    ["POSITION_UNAVAILABLE", 2 as const],
    ["TIMEOUT", 3 as const],
  ])("mappt %s vor dem ersten Fix auf no-fix statt es zu verschlucken", (_name, code) => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());
    act(() => errorCb?.(makeError(code)));

    expect(result.current.permission).toBe("no-fix");
  });

  it("unterscheidet PERMISSION_DENIED weiterhin von no-fix", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());
    act(() => errorCb?.(makeError(1)));

    expect(result.current.permission).toBe("denied");
  });

  it("wirft nach einem erfolgreichen Fix nicht mehr in no-fix zurück", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());
    act(() => successCb?.(makePosition()));
    // Aussetzer im laufenden Betrieb: dafür ist der 30s-Signalverlust zuständig,
    // nicht der Kein-Fix-Zustand.
    act(() => errorCb?.(makeError(2)));

    expect(result.current.permission).toBe("granted");
  });

  it("verlässt den no-fix-Zustand beim Retry", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());
    act(() => errorCb?.(makeError(2)));
    expect(result.current.permission).toBe("no-fix");

    act(() => result.current.retry());

    expect(result.current.permission).not.toBe("no-fix");
    expect(result.current.signal).toBe("searching");
  });
});

describe("useGeolocation — unsicherer Kontext", () => {
  it("meldet insecure-context statt 'Gerät unterstützt kein GPS'", () => {
    setSecureContext(false);
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());

    expect(result.current.permission).toBe("insecure-context");
    expect(mockGeolocation.watchPosition).not.toHaveBeenCalled();
  });
});

describe("useGeolocation — fehlende API", () => {
  it("meldet unavailable, wenn navigator.geolocation fehlt", () => {
    setGeolocation(undefined);
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());

    expect(result.current.permission).toBe("unavailable");
  });
});

describe("useGeolocation — watchActive-Signal (Refinement 2026-09-26)", () => {
  it("meldet zunaechst keinen laufenden Watch", () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.watchActive).toBe(false);
  });

  it("meldet einen laufenden Watch nach requestPermission", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());

    expect(result.current.watchActive).toBe(true);
  });

  /**
   * Der Kern des Signals: Zwischen Watch-Start und erstem Fix sind `position`
   * und `signal` von "nie gestartet" nicht unterscheidbar. Wer daraus ableitet,
   * startet in diesem Fenster unnoetig neu oder verpasst den Start.
   */
  it("unterscheidet 'Watch laeuft, Fix fehlt' von 'nie gestartet'", () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());

    expect(result.current.position).toBeNull();
    expect(result.current.watchActive).toBe(true);
  });

  it("meldet KEINEN laufenden Watch ohne Geolocation-API", () => {
    setGeolocation(undefined);
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());

    expect(result.current.permission).toBe("unavailable");
    expect(result.current.watchActive).toBe(false);
  });

  it("meldet KEINEN laufenden Watch ohne sicheren Kontext", () => {
    setSecureContext(false);
    const { result } = renderHook(() => useGeolocation());

    act(() => result.current.requestPermission());

    expect(result.current.permission).toBe("insecure-context");
    expect(result.current.watchActive).toBe(false);
  });

  /**
   * Edge Case 24: iOS Safari fuehrt Geolocation nicht im Permissions-API.
   * `query()` rejected, der Hook verschluckt das — also startet ohne Zutun
   * NIE ein Watch. Genau daran hing der gemeldete Wiedereinstiegs-Fehler.
   */
  it("startet ohne Zutun keinen Watch, wenn permissions.query rejected (iOS Safari)", async () => {
    Object.defineProperty(navigator, "permissions", {
      value: { query: vi.fn(() => Promise.reject(new TypeError("unsupported"))) },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useGeolocation());
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.watchActive).toBe(false);
    expect(mockGeolocation.watchPosition).not.toHaveBeenCalled();
  });

  it("startet von selbst einen Watch, wenn permissions.query 'granted' meldet", async () => {
    Object.defineProperty(navigator, "permissions", {
      value: { query: vi.fn(() => Promise.resolve({ state: "granted" })) },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useGeolocation());
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.watchActive).toBe(true);
  });
});

/**
 * QA 2026-09-29 — Filter, Glättung und Ankunfts-Messliste (Refinement
 * 2026-09-28) am Hook selbst. Die E2E-Suite prüft das Ergebnis am Bildschirm;
 * hier liegt, was nur mit kontrollierter Zeit prüfbar ist: Rückfallfrist,
 * 30s-Signalverlust bei lauter verworfenen Messungen, veraltete
 * Gerätezeitstempel.
 */
describe("useGeolocation — Genauigkeitsfilter (QA 2026-09-29)", () => {
  /** Meter nördlich eines Bezugspunkts. */
  const north = (m: number) => 52.5 + m / 111_195;
  function fix(metersNorth: number, accuracy: number, timestamp = Date.now()): GeolocationPosition {
    return { coords: { latitude: north(metersNorth), longitude: 13.4, accuracy }, timestamp } as GeolocationPosition;
  }
  const metersOf = (lat: number) => (lat - 52.5) * 111_195;

  function started() {
    const hook = renderHook(() => useGeolocation());
    act(() => hook.result.current.requestPermission());
    return hook;
  }

  it("verwirft eine grobe Messung nach einer genauen — Position und Messliste bleiben", () => {
    const { result } = started();
    act(() => successCb!(fix(0, 5)));
    act(() => successCb!(fix(200, 80)));
    expect(metersOf(result.current.position!.lat)).toBeCloseTo(0, 3);
    expect(result.current.recentFixes).toHaveLength(1);
  });

  it("übernimmt nach 5 s ohne genaue Messung die grobe (Rückfall)", () => {
    const { result } = started();
    act(() => successCb!(fix(0, 5)));
    act(() => vi.advanceTimersByTime(4000));
    act(() => successCb!(fix(200, 80)));
    expect(result.current.recentFixes).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1100));
    act(() => successCb!(fix(200, 80)));
    expect(result.current.recentFixes).toHaveLength(2);
  });

  it("rechnet die Frist mit der Empfangszeit, nicht mit einem veralteten Gerätezeitstempel", () => {
    // Die erste Messung trägt einen eine Minute alten Zeitstempel (vor dem
    // Seitenaufruf gemessen). Mit dem Gerätezeitstempel wäre die Frist sofort
    // abgelaufen und die grobe Messung eine Sekunde später übernommen worden.
    const { result } = started();
    act(() => successCb!(fix(0, 5, Date.now() - 60_000)));
    act(() => vi.advanceTimersByTime(1000));
    act(() => successCb!(fix(200, 80)));
    expect(result.current.recentFixes).toHaveLength(1);
  });

  it("verworfene Messungen halten das Signal am Leben — kein vorgetäuschter Signalverlust", () => {
    const { result } = started();
    act(() => successCb!(fix(0, 5)));
    // 40 s lang nur grobe Messungen, jeweils vor Ablauf der Rückfallfrist
    // wieder eine genaue — die groben werden verworfen, sind aber Lebenszeichen.
    for (let t = 0; t < 40; t += 4) {
      act(() => vi.advanceTimersByTime(2000));
      act(() => successCb!(fix(300, 90)));
      act(() => vi.advanceTimersByTime(2000));
      act(() => successCb!(fix(0, 5)));
    }
    expect(result.current.signal).toBe("active");
  });

  it("meldet weiterhin Signalverlust, wenn 30 s gar nichts mehr kommt", () => {
    const { result } = started();
    act(() => successCb!(fix(0, 5)));
    act(() => vi.advanceTimersByTime(30_500));
    expect(result.current.signal).toBe("lost");
  });

  it("verliert keine Messung, wenn zwei im selben Render eintreffen", () => {
    const { result } = started();
    act(() => {
      successCb!(fix(0, 0));
      successCb!(fix(1, 0));
    });
    expect(result.current.recentFixes.map((f) => f.seq)).toEqual([1, 2]);
  });

  it("hält höchstens die letzten 5 Messungen vor, fortlaufend nummeriert", () => {
    const { result } = started();
    for (let i = 0; i < 8; i++) act(() => successCb!(fix(i, 0)));
    expect(result.current.recentFixes.map((f) => f.seq)).toEqual([4, 5, 6, 7, 8]);
  });

  it("glättet die angezeigte Position, die Messliste bleibt ungeglättet", () => {
    const { result } = started();
    act(() => successCb!(fix(0, 15)));
    act(() => vi.advanceTimersByTime(1000));
    act(() => successCb!(fix(20, 15)));
    const shown = metersOf(result.current.position!.lat);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(20);
    expect(metersOf(result.current.recentFixes[1].lat)).toBeCloseTo(20, 3);
  });

  it("setzt die Glättung bei einem neuen Watch zurück", () => {
    const { result } = started();
    act(() => successCb!(fix(0, 15)));
    act(() => result.current.requestPermission());
    act(() => vi.advanceTimersByTime(1000));
    act(() => successCb!(fix(100, 15)));
    expect(metersOf(result.current.position!.lat)).toBeCloseTo(100, 3);
  });
});
