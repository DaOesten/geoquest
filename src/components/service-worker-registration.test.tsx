/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * PROJ-12 — Service Worker nur in Production (Refinement 2026-09-20).
 *
 * WARUM DIESE TESTS ALS UNIT-TESTS LAUFEN UND NICHT ALS E2E:
 * Die E2E-Suite fährt ausschließlich gegen den **Production-Build**
 * (`playwright.prod.config.ts`, Port 3100) — dort ist `NODE_ENV` immer
 * `production`. Der Dev-Zweig dieser Komponente ist dort strukturell nicht
 * erreichbar. Genau der Zweig ist aber der Gegenstand des Refinements, also
 * wird er hier geprüft, wo sich `NODE_ENV` setzen lässt.
 *
 * Der Produktionszweig bleibt zusätzlich durch die 67 E2E-Tests abgedeckt.
 */

/** Ein Registrierungsobjekt, das mitzählt, ob es abgemeldet wurde. */
function macheRegistrierung() {
  return { unregister: vi.fn(async () => true) };
}

type Umgebung = {
  registrierungen: ReturnType<typeof macheRegistrierung>[];
  register: ReturnType<typeof vi.fn>;
  geloeschteCaches: string[];
};

/** Baut `navigator.serviceWorker` und `caches` nach. */
function baueUmgebung(cacheNamen: string[] = []): Umgebung {
  const registrierungen = [macheRegistrierung()];
  const register = vi.fn(async () => macheRegistrierung());
  const geloeschteCaches: string[] = [];

  Object.defineProperty(navigator, "serviceWorker", {
    value: {
      register,
      getRegistrations: vi.fn(async () => registrierungen),
      controller: null,
    },
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "caches", {
    value: {
      keys: vi.fn(async () => cacheNamen),
      delete: vi.fn(async (name: string) => {
        geloeschteCaches.push(name);
        return true;
      }),
    },
    configurable: true,
    writable: true,
  });

  Object.defineProperty(window, "isSecureContext", { value: true, configurable: true });

  return { registrierungen, register, geloeschteCaches };
}

/**
 * Lädt die Komponente mit gesetztem `NODE_ENV` neu.
 *
 * Nötig, weil die Komponente den Wert beim **Modul-Laden** in eine Konstante
 * schreibt — ein späteres Ändern der Variable hätte keine Wirkung mehr. Genau
 * dieses Verhalten will der Produktionscode: Next.js ersetzt den Ausdruck beim
 * Bauen durch ein Literal.
 */
async function ladeKomponente(modus: "development" | "production" | "test") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", modus);
  const modul = await import("./service-worker-registration");
  return modul.ServiceWorkerRegistration;
}

/** Wartet die schwebenden Promises des Aufräum-Zweigs ab. */
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("ServiceWorkerRegistration — nur in Production", () => {
  beforeEach(() => {
    Object.defineProperty(document, "readyState", { value: "complete", configurable: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("registriert den Worker in Production", async () => {
    const umgebung = baueUmgebung();
    const Komponente = await ladeKomponente("production");

    render(<Komponente />);
    await flush();

    expect(umgebung.register).toHaveBeenCalledWith("/sw.js");
  });

  it("registriert außerhalb von Production KEINEN Worker", async () => {
    const umgebung = baueUmgebung();
    const Komponente = await ladeKomponente("development");

    render(<Komponente />);
    await flush();

    expect(umgebung.register).not.toHaveBeenCalled();
  });

  /**
   * Edge Case 17: Der Worker aus einem früheren Besuch überlebt den Dev-Server
   * und gilt für die ganze Origin. Nur keine neuen Registrierungen zu machen
   * würde ihn auf jedem Entwicklerrechner liegen lassen.
   */
  it("meldet einen bereits vorhandenen lokalen Worker ab", async () => {
    const umgebung = baueUmgebung();
    const Komponente = await ladeKomponente("development");

    render(<Komponente />);
    await flush();

    expect(umgebung.registrierungen[0].unregister).toHaveBeenCalled();
  });

  it("löscht die eigenen Caches mit, weil unregister() sie stehen lässt", async () => {
    const umgebung = baueUmgebung(["geoquest-offline-v1"]);
    const Komponente = await ladeKomponente("development");

    render(<Komponente />);
    await flush();

    expect(umgebung.geloeschteCaches).toEqual(["geoquest-offline-v1"]);
  });

  /** Fremde Caches gehören anderen Projekten auf derselben Origin. */
  it("fasst fremde Caches nicht an", async () => {
    const umgebung = baueUmgebung(["anderes-projekt-v2", "geoquest-offline-v1"]);
    const Komponente = await ladeKomponente("development");

    render(<Komponente />);
    await flush();

    expect(umgebung.geloeschteCaches).toEqual(["geoquest-offline-v1"]);
    expect(umgebung.geloeschteCaches).not.toContain("anderes-projekt-v2");
  });

  it("räumt in Production NICHT auf — dort soll der Worker bleiben", async () => {
    const umgebung = baueUmgebung(["geoquest-offline-v1"]);
    const Komponente = await ladeKomponente("production");

    render(<Komponente />);
    await flush();

    expect(umgebung.registrierungen[0].unregister).not.toHaveBeenCalled();
    expect(umgebung.geloeschteCaches).toEqual([]);
  });

  /** BUG-11 bleibt abgedeckt: Wert prüfen, nicht Existenz der Eigenschaft. */
  it("wirft nicht, wenn serviceWorker undefined ist (BUG-11)", async () => {
    baueUmgebung();
    Object.defineProperty(navigator, "serviceWorker", {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const Komponente = await ladeKomponente("development");

    expect(() => render(<Komponente />)).not.toThrow();
  });
});
