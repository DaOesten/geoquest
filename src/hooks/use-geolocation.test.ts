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
