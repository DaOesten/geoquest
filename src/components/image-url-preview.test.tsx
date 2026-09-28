import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { ImageUrlPreview, IMAGE_CHECK_DEBOUNCE_MS } from "./image-url-preview";

// jsdom lädt keine Bilder — `onload`/`onerror` feuern nie von selbst.
// Die Attrappe merkt sich jede angelegte Prüfung, der Test entscheidet,
// ob sie gelingt.
class FakeImage {
  static instances: FakeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";
  constructor() {
    FakeImage.instances.push(this);
  }
}

function lastCheckFor(url: string) {
  return [...FakeImage.instances].reverse().find((img) => img.src === url);
}

function status() {
  return screen.getByTestId("image-url-preview").getAttribute("data-status");
}

describe("ImageUrlPreview", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeImage.instances = [];
    vi.stubGlobal("Image", FakeImage);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("rendert nichts bei leerem Feld oder fehlendem https://-Präfix", () => {
    const { container, rerender } = render(<ImageUrlPreview url="" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ImageUrlPreview url="http://example.com/a.png" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ImageUrlPreview url="https://" />);
    expect(container).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(2000));
    expect(FakeImage.instances).toHaveLength(0);
  });

  it("prüft die beim Öffnen vorhandene Adresse sofort, ohne Entprellung", () => {
    render(<ImageUrlPreview url="https://example.com/a.png" />);
    act(() => vi.advanceTimersByTime(0));
    expect(lastCheckFor("https://example.com/a.png")).toBeDefined();
  });

  it("zeigt die Vorschau, wenn die Adresse als Bild lädt", () => {
    render(<ImageUrlPreview url="https://example.com/a.png" />);
    act(() => vi.advanceTimersByTime(0));
    expect(status()).toBe("loading");
    act(() => lastCheckFor("https://example.com/a.png")!.onload!());
    expect(status()).toBe("ok");
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "https://example.com/a.png");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("warnt mit Anleitung, wenn die Adresse kein Bild ist (z.B. eine Webseite)", () => {
    const page = "https://www.magnific.com/de/vektoren-kostenlos/lass-uns_24467363.htm";
    render(<ImageUrlPreview url={page} />);
    act(() => vi.advanceTimersByTime(0));
    act(() => lastCheckFor(page)!.onerror!());
    expect(status()).toBe("error");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Unter dieser Adresse ist kein Bild.");
    expect(alert).toHaveTextContent("Bildadresse kopieren");
  });

  it("entprellt spätere Eingaben und prüft nur die letzte", () => {
    const { rerender } = render(<ImageUrlPreview url="" />);
    rerender(<ImageUrlPreview url="https://example.com/a" />);
    act(() => vi.advanceTimersByTime(100));
    rerender(<ImageUrlPreview url="https://example.com/a.png" />);
    act(() => vi.advanceTimersByTime(IMAGE_CHECK_DEBOUNCE_MS - 1));
    expect(FakeImage.instances).toHaveLength(0);
    act(() => vi.advanceTimersByTime(1));
    expect(FakeImage.instances.map((i) => i.src)).toEqual(["https://example.com/a.png"]);
  });

  it("lässt das späte Ergebnis einer alten Adresse die neue nicht überschreiben", () => {
    const { rerender } = render(<ImageUrlPreview url="https://example.com/seite.htm" />);
    act(() => vi.advanceTimersByTime(0));
    const old = lastCheckFor("https://example.com/seite.htm")!;

    rerender(<ImageUrlPreview url="https://example.com/bild.png" />);
    act(() => vi.advanceTimersByTime(IMAGE_CHECK_DEBOUNCE_MS));
    act(() => lastCheckFor("https://example.com/bild.png")!.onload!());
    expect(status()).toBe("ok");

    // Die alte Prüfung meldet sich erst jetzt — sie darf nichts mehr ändern.
    act(() => old.onerror?.());
    expect(status()).toBe("ok");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("zeigt nach einer Änderung nie das Ergebnis der vorherigen Adresse", () => {
    const { rerender } = render(<ImageUrlPreview url="https://example.com/seite.htm" />);
    act(() => vi.advanceTimersByTime(0));
    act(() => lastCheckFor("https://example.com/seite.htm")!.onerror!());
    expect(status()).toBe("error");

    rerender(<ImageUrlPreview url="https://example.com/bild.png" />);
    // Noch in der Entprellung: keine veraltete Warnung, sondern „wird geprüft".
    expect(status()).toBe("loading");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("prüft die getrimmte Adresse", () => {
    render(<ImageUrlPreview url="  https://example.com/a.png  " />);
    act(() => vi.advanceTimersByTime(0));
    expect(lastCheckFor("https://example.com/a.png")).toBeDefined();
  });
});
