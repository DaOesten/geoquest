/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useInstallPrompt,
  isIOSSafari,
  isStandalone,
  isDismissed,
  isFirstVisitPending,
} from "./use-install-prompt";
import {
  INSTALL_HINT_DISMISS_MS,
  INSTALL_HINT_STORAGE_KEY,
} from "@/lib/app-nav";
import { FIRST_VISIT_DONE_EVENT, FIRST_VISIT_STORAGE_KEY } from "@/components/first-visit-dialog";

/**
 * Unit-Tests fuer die Anzeige-Logik des Installations-Hinweises (PROJ-12).
 *
 * Diese Datei existiert aus einem konkreten Grund: **Die Luecke, durch die
 * BUG-6 live gehen konnte, war ein ungetesteter Hook.** In `use-device-
 * orientation.ts` schloss `isIOS()` allein aus der Existenz einer API auf iOS
 * und lag auf Desktop-Chrome falsch — ohne Test fiel das bis nach Production
 * niemandem auf. Die Plattform-Erkennung hier wird deshalb gegen echte
 * User-Agent-Strings geprueft, inklusive der Faelle, die *nicht* iOS-Safari
 * sind, obwohl sie danach aussehen.
 */

const IPHONE_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/152.0.0.0 Mobile/15E148 Safari/604.1";
const IPHONE_FIREFOX_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15";
const IPADOS_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const MAC_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
const DESKTOP_CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36";
const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36";

/**
 * jsdom stellt in dieser Konfiguration kein `localStorage` bereit — gleiche
 * Mock-Konstruktion wie in `first-visit-dialog.test.tsx`.
 */
let store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  get length() {
    return Object.keys(store).length;
  },
};

/**
 * Setzt die Implementierungen neu. Noetig in jedem `beforeEach`, weil
 * `vi.clearAllMocks()` sie sonst entfernt und die Tests dann gegen einen
 * Speicher liefen, der auf alles `undefined` antwortet.
 */
function resetLocalStorageMock() {
  store = {};
  localStorageMock.getItem.mockImplementation((key: string) => store[key] ?? null);
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    store[key] = value;
  });
  localStorageMock.removeItem.mockImplementation((key: string) => {
    delete store[key];
  });
  localStorageMock.clear.mockImplementation(() => {
    store = {};
  });
  localStorageMock.key.mockImplementation((i: number) => Object.keys(store)[i] ?? null);
}

Object.defineProperty(window, "localStorage", { value: localStorageMock });

const originalUA = navigator.userAgent;
const originalTouchPoints = navigator.maxTouchPoints;
const originalMatchMedia = window.matchMedia;

/** Nur einzelne Properties patchen — `navigator` ersetzen bricht jsdom. */
function setUserAgent(ua: string) {
  Object.defineProperty(navigator, "userAgent", { value: ua, configurable: true });
}

function setMaxTouchPoints(n: number) {
  Object.defineProperty(navigator, "maxTouchPoints", { value: n, configurable: true });
}

function setDisplayMode(standalone: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: standalone && query === "(display-mode: standalone)",
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

/** Stellt ein `beforeinstallprompt`-Ereignis nach (Chrome/Android). */
function fireBeforeInstallPrompt(userChoice: "accepted" | "dismissed" = "accepted") {
  const event = new Event("beforeinstallprompt") as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: userChoice });
  window.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  resetLocalStorageMock();
  // Der Erststart-Dialog gilt in den meisten Tests als erledigt; sein Vorrang
  // bekommt eigene Tests weiter unten.
  localStorage.setItem(FIRST_VISIT_STORAGE_KEY, "true");
  setUserAgent(DESKTOP_CHROME_UA);
  setMaxTouchPoints(0);
  setDisplayMode(false);
});

afterEach(() => {
  setUserAgent(originalUA);
  setMaxTouchPoints(originalTouchPoints);
  window.matchMedia = originalMatchMedia;
  // Bewusst `clearAllMocks` statt `restoreAllMocks`: Letzteres würde auch die
  // Implementierungen des localStorage-Mocks entfernen, den alle Tests teilen.
  vi.clearAllMocks();
});

describe("isIOSSafari — Plattform-Erkennung (Lehre aus BUG-6)", () => {
  it("erkennt iPhone-Safari", () => {
    setUserAgent(IPHONE_SAFARI_UA);
    expect(isIOSSafari()).toBe(true);
  });

  it("erkennt iPadOS-Safari, das sich als Macintosh meldet", () => {
    setUserAgent(IPADOS_SAFARI_UA);
    setMaxTouchPoints(5);
    expect(isIOSSafari()).toBe(true);
  });

  it("erkennt einen echten Mac NICHT als iOS (gleiche UA wie iPadOS, aber 0 Touch-Punkte)", () => {
    setUserAgent(MAC_SAFARI_UA);
    setMaxTouchPoints(0);
    expect(isIOSSafari()).toBe(false);
  });

  it("erkennt Desktop-Chrome NICHT als iOS", () => {
    setUserAgent(DESKTOP_CHROME_UA);
    expect(isIOSSafari()).toBe(false);
  });

  it("erkennt Android-Chrome NICHT als iOS", () => {
    setUserAgent(ANDROID_CHROME_UA);
    expect(isIOSSafari()).toBe(false);
  });

  /**
   * Der Kern der BUG-6-Lehre: Chrome auf iOS läuft auf WebKit und sieht einer
   * iOS-UA sehr ähnlich — bietet aber kein „Zum Home-Bildschirm". Eine
   * Anleitung dorthin ginge ins Leere, also lieber gar kein Hinweis.
   */
  it("erkennt Chrome auf iOS NICHT als Ziel für die Safari-Anleitung", () => {
    setUserAgent(IPHONE_CHROME_UA);
    expect(isIOSSafari()).toBe(false);
  });

  it("erkennt Firefox auf iOS NICHT als Ziel für die Safari-Anleitung", () => {
    setUserAgent(IPHONE_FIREFOX_UA);
    expect(isIOSSafari()).toBe(false);
  });
});

describe("isStandalone — läuft die App bereits installiert?", () => {
  it("ist false im normalen Browser-Tab", () => {
    setDisplayMode(false);
    expect(isStandalone()).toBe(false);
  });

  it("ist true bei display-mode: standalone", () => {
    setDisplayMode(true);
    expect(isStandalone()).toBe(true);
  });

  it("ist true bei Apples älterem navigator.standalone", () => {
    setDisplayMode(false);
    Object.defineProperty(navigator, "standalone", { value: true, configurable: true });
    expect(isStandalone()).toBe(true);
    delete (navigator as unknown as Record<string, unknown>).standalone;
  });
});

describe("isDismissed — die 30-Tage-Frist", () => {
  it("ist false, wenn nie weggeklickt wurde", () => {
    expect(isDismissed()).toBe(false);
  });

  it("ist true direkt nach dem Wegklicken", () => {
    const now = Date.now();
    localStorage.setItem(INSTALL_HINT_STORAGE_KEY, String(now));
    expect(isDismissed(now)).toBe(true);
  });

  it("ist nach 29 Tagen noch true", () => {
    const now = Date.now();
    localStorage.setItem(INSTALL_HINT_STORAGE_KEY, String(now - 29 * 24 * 60 * 60 * 1000));
    expect(isDismissed(now)).toBe(true);
  });

  it("ist nach 31 Tagen false — der Hinweis darf erneut erscheinen", () => {
    const now = Date.now();
    localStorage.setItem(INSTALL_HINT_STORAGE_KEY, String(now - 31 * 24 * 60 * 60 * 1000));
    expect(isDismissed(now)).toBe(false);
  });

  it("kippt exakt an der 30-Tage-Grenze", () => {
    const now = Date.now();
    localStorage.setItem(INSTALL_HINT_STORAGE_KEY, String(now - INSTALL_HINT_DISMISS_MS));
    expect(isDismissed(now)).toBe(false);
  });

  it("behandelt einen kaputten Wert wie 'nie weggeklickt', statt dauerhaft zu schweigen", () => {
    localStorage.setItem(INSTALL_HINT_STORAGE_KEY, "nicht-eine-zahl");
    expect(isDismissed()).toBe(false);
  });
});

describe("isFirstVisitPending — Vorrang des Erststart-Dialogs", () => {
  it("ist true, solange der Dialog nicht bestätigt wurde", () => {
    localStorage.removeItem(FIRST_VISIT_STORAGE_KEY);
    expect(isFirstVisitPending()).toBe(true);
  });

  it("ist false, sobald er bestätigt wurde", () => {
    localStorage.setItem(FIRST_VISIT_STORAGE_KEY, "true");
    expect(isFirstVisitPending()).toBe(false);
  });
});

describe("useInstallPrompt — die vier Bedingungen zusammen", () => {
  it("zeigt nichts, solange kein Installationsweg existiert (Desktop-Chrome ohne Event)", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.shouldShow).toBe(false);
    expect(result.current.method).toBe("none");
  });

  it("zeigt den Android-Weg, sobald beforeinstallprompt feuert", () => {
    setUserAgent(ANDROID_CHROME_UA);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      fireBeforeInstallPrompt();
    });

    expect(result.current.method).toBe("prompt");
    expect(result.current.shouldShow).toBe(true);
  });

  it("zeigt den iOS-Weg auf iPhone-Safari, ganz ohne Event", () => {
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.method).toBe("ios");
    expect(result.current.shouldShow).toBe(true);
  });

  it("zeigt NICHTS, wenn die App bereits installiert läuft — auch wenn das Event feuert", () => {
    setDisplayMode(true);
    setUserAgent(ANDROID_CHROME_UA);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      fireBeforeInstallPrompt();
    });

    expect(result.current.shouldShow).toBe(false);
  });

  it("zeigt NICHTS, wenn innerhalb der 30 Tage weggeklickt wurde", () => {
    localStorage.setItem(INSTALL_HINT_STORAGE_KEY, String(Date.now()));
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.shouldShow).toBe(false);
  });

  it("zeigt wieder, wenn das Wegklicken länger als 30 Tage her ist", () => {
    localStorage.setItem(
      INSTALL_HINT_STORAGE_KEY,
      String(Date.now() - 31 * 24 * 60 * 60 * 1000)
    );
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.shouldShow).toBe(true);
  });

  it("schreibt beim Wegklicken einen Zeitstempel und verschwindet sofort", () => {
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.shouldShow).toBe(true);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.shouldShow).toBe(false);
    const stored = Number(localStorage.getItem(INSTALL_HINT_STORAGE_KEY));
    expect(Number.isFinite(stored)).toBe(true);
    expect(Math.abs(Date.now() - stored)).toBeLessThan(5000);
  });

  it("verschwindet nach der Installation von selbst (appinstalled)", () => {
    setUserAgent(ANDROID_CHROME_UA);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      fireBeforeInstallPrompt();
    });
    expect(result.current.shouldShow).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(result.current.shouldShow).toBe(false);
  });

  /** Edge Case 3: Wer aktiv abbricht, hat eine Entscheidung getroffen. */
  it("gilt auch bei Abbruch des nativen Dialogs als weggeklickt", async () => {
    setUserAgent(ANDROID_CHROME_UA);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      fireBeforeInstallPrompt("dismissed");
    });

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(result.current.shouldShow).toBe(false);
    expect(localStorage.getItem(INSTALL_HINT_STORAGE_KEY)).not.toBeNull();
  });

  it("überlebt einen werfenden prompt() ohne den Nutzer im Regen stehen zu lassen", async () => {
    setUserAgent(ANDROID_CHROME_UA);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event("beforeinstallprompt") as Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: string }>;
      };
      event.prompt = vi.fn().mockRejectedValue(new Error("bereits geöffnet"));
      event.userChoice = Promise.resolve({ outcome: "dismissed" });
      window.dispatchEvent(event);
    });

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(result.current.shouldShow).toBe(false);
  });

  /** Edge Case 13: Der Erststart-Dialog hat Vorrang. */
  it("hält sich zurück, solange der Erststart-Dialog aussteht", () => {
    localStorage.removeItem(FIRST_VISIT_STORAGE_KEY);
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.method).toBe("ios");
    expect(result.current.shouldShow).toBe(false);
  });

  it("rückt nach, sobald der Erststart-Dialog geschlossen wird — ohne Neuladen", () => {
    localStorage.removeItem(FIRST_VISIT_STORAGE_KEY);
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.shouldShow).toBe(false);

    act(() => {
      // Genau die Reihenfolge des echten Dialogs: erst schreiben, dann melden.
      localStorage.setItem(FIRST_VISIT_STORAGE_KEY, "true");
      window.dispatchEvent(new Event(FIRST_VISIT_DONE_EVENT));
    });

    expect(result.current.shouldShow).toBe(true);
  });

  /**
   * Edge Cases 4 und 13 zusammen: Bei blockiertem Speicher schreibt der
   * Erststart-Dialog seinen Schlüssel nicht — der Hinweis darf trotzdem
   * nachrücken, sonst bliebe er die ganze Sitzung aus.
   */
  it("rückt auch dann nach, wenn der Dialog seinen Schlüssel nicht schreiben konnte", () => {
    localStorage.removeItem(FIRST_VISIT_STORAGE_KEY);
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.shouldShow).toBe(false);

    act(() => {
      // Kein setItem — genau der Fall bei blockiertem localStorage.
      window.dispatchEvent(new Event(FIRST_VISIT_DONE_EVENT));
    });

    expect(result.current.shouldShow).toBe(true);
  });

  /** Edge Case 4: blockierter Speicher darf nichts kaputt machen. */
  it("funktioniert, wenn localStorage wirft", () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error("QuotaExceeded");
    });

    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      result.current.dismiss();
    });

    // Fuer diese Sitzung weg — beim naechsten Besuch darf er wiederkommen.
    expect(result.current.shouldShow).toBe(false);
  });

  it("bevorzugt den nativen Dialog, wenn beide Wege in Frage kämen", () => {
    // Konstruiert: iOS-UA und zugleich ein Event. Wo ein echter Dialog
    // existiert, ist eine Handanleitung der schlechtere Weg.
    setUserAgent(IPHONE_SAFARI_UA);
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      fireBeforeInstallPrompt();
    });

    expect(result.current.method).toBe("prompt");
  });
});
