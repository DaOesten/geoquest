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
