import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const standalone = { value: false };
vi.mock("@/hooks/use-install-prompt", () => ({ isStandalone: () => standalone.value }));

import { AppStartRedirect, wasDocumentLoadedAt } from "./app-start-redirect";

/** Setzt den Navigation-Timing-Eintrag, den der Browser für das Dokument führt. */
function documentLoadedAt(url: string | null) {
  vi.spyOn(performance, "getEntriesByType").mockReturnValue(
    (url === null ? [] : [{ name: url }]) as unknown as PerformanceEntryList
  );
}

describe("wasDocumentLoadedAt (PROJ-16)", () => {
  afterEach(() => vi.restoreAllMocks());

  it("erkennt ein unter / geladenes Dokument", () => {
    documentLoadedAt("https://geoquest.technolomagie.de/");
    expect(wasDocumentLoadedAt("/")).toBe(true);
  });

  it("ignoriert Query und Hash", () => {
    documentLoadedAt("https://geoquest.technolomagie.de/?utm_source=homescreen#top");
    expect(wasDocumentLoadedAt("/")).toBe(true);
  });

  it("ein unter /app geladenes Dokument gilt nicht als /", () => {
    documentLoadedAt("https://geoquest.technolomagie.de/app");
    expect(wasDocumentLoadedAt("/")).toBe(false);
  });

  it("ohne Eintrag lieber keine Weiterleitung", () => {
    documentLoadedAt(null);
    expect(wasDocumentLoadedAt("/")).toBe(false);
  });

  it("wirft nicht, wenn die Timing-API fehlt oder Unsinn liefert", () => {
    vi.spyOn(performance, "getEntriesByType").mockImplementation(() => {
      throw new Error("nicht unterstützt");
    });
    expect(wasDocumentLoadedAt("/")).toBe(false);
    vi.restoreAllMocks();
    documentLoadedAt("kein-url");
    expect(wasDocumentLoadedAt("/")).toBe(false);
  });
});

describe("AppStartRedirect (PROJ-16)", () => {
  beforeEach(() => {
    replace.mockClear();
    standalone.value = false;
  });
  afterEach(() => vi.restoreAllMocks());

  it("installierte App, unter / gestartet: ersetzt die Adresse durch /app", () => {
    standalone.value = true;
    documentLoadedAt("https://geoquest.technolomagie.de/");
    render(<AppStartRedirect />);
    expect(replace).toHaveBeenCalledExactlyOnceWith("/app");
  });

  it("im Browser: keine Weiterleitung", () => {
    documentLoadedAt("https://geoquest.technolomagie.de/");
    render(<AppStartRedirect />);
    expect(replace).not.toHaveBeenCalled();
  });

  it("installierte App, unter /app gestartet und per Menü auf „Über“: keine Weiterleitung", () => {
    standalone.value = true;
    documentLoadedAt("https://geoquest.technolomagie.de/app");
    render(<AppStartRedirect />);
    expect(replace).not.toHaveBeenCalled();
  });

  it("rendert nichts Sichtbares", () => {
    documentLoadedAt(null);
    const { container } = render(<AppStartRedirect />);
    expect(container.innerHTML).toBe("");
  });
});
