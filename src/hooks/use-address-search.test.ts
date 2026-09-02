/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAddressSearch } from "./use-address-search";

// Fake timers freeze real time, so testing-library's `waitFor` (which polls on
// real timers) never resolves here — flush pending microtasks explicitly
// instead after advancing the fake debounce timer.
async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function nominatimResult(overrides: Partial<{ place_id: number; display_name: string; lat: string; lon: string }> = {}) {
  return {
    place_id: 12345,
    display_name: "Brandenburger Tor, Pariser Platz, Berlin, Deutschland",
    lat: "52.5162746",
    lon: "13.3777041",
    ...overrides,
  };
}

describe("useAddressSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does not call fetch before the debounce window elapses", () => {
    const { result } = renderHook(() => useAddressSearch());

    act(() => {
      result.current.search("Brandenburger Tor");
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches Nominatim after the debounce window and maps results", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [nominatimResult()],
    } as Response);

    const { result } = renderHook(() => useAddressSearch());

    act(() => {
      result.current.search("Brandenburger Tor");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    await flushMicrotasks();
    expect(result.current.isLoading).toBe(false);

    expect(fetch).toHaveBeenCalledTimes(1);
    const requestedUrl = vi.mocked(fetch).mock.calls[0][0] as URL;
    expect(requestedUrl.toString()).toContain("nominatim.openstreetmap.org/search");
    expect(requestedUrl.toString()).toContain("q=Brandenburger");

    expect(result.current.results).toEqual([
      {
        id: "12345",
        displayName: "Brandenburger Tor, Pariser Platz, Berlin, Deutschland",
        lat: 52.5162746,
        lng: 13.3777041,
      },
    ]);
    expect(result.current.error).toBe(false);
  });

  it("collapses rapid keystrokes into a single request (debounce)", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => [] } as Response);
    const { result } = renderHook(() => useAddressSearch());

    act(() => result.current.search("B"));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.search("Br"));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.search("Bra"));
    act(() => vi.advanceTimersByTime(500));

    await flushMicrotasks();
    expect(result.current.isLoading).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("ignores a stale in-flight response when a newer search has already started", async () => {
    // A real fetch() rejects with AbortError as soon as its AbortSignal fires,
    // even if the network response arrives later — mirror that here instead of
    // resolving the stale request "manually", which would skip the abort path
    // the hook actually relies on to discard it.
    vi.mocked(fetch)
      .mockImplementationOnce(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
          })
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [nominatimResult({ place_id: 999, display_name: "Second result" })],
      } as Response);

    const { result } = renderHook(() => useAddressSearch());

    act(() => result.current.search("first query"));
    act(() => vi.advanceTimersByTime(500));

    act(() => result.current.search("second query"));
    act(() => vi.advanceTimersByTime(500));

    await flushMicrotasks();
    expect(result.current.isLoading).toBe(false);

    expect(result.current.results).toEqual([
      { id: "999", displayName: "Second result", lat: 52.5162746, lng: 13.3777041 },
    ]);
    expect(result.current.error).toBe(false);
  });

  it("sets error state when Nominatim is unreachable", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useAddressSearch());

    act(() => result.current.search("unreachable"));
    act(() => vi.advanceTimersByTime(500));

    await flushMicrotasks();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(true);
    expect(result.current.results).toEqual([]);
  });

  it("sets error state on a non-OK HTTP response", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);
    const { result } = renderHook(() => useAddressSearch());

    act(() => result.current.search("server error"));
    act(() => vi.advanceTimersByTime(500));

    await flushMicrotasks();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(true);
  });

  it("clears results and skips the request for an empty or whitespace-only query", () => {
    const { result } = renderHook(() => useAddressSearch());

    act(() => result.current.search("   "));
    act(() => vi.advanceTimersByTime(500));

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it("aborts an in-flight request on unmount without throwing", async () => {
    vi.mocked(fetch).mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        })
    );

    const { result, unmount } = renderHook(() => useAddressSearch());

    act(() => result.current.search("will be aborted"));
    act(() => vi.advanceTimersByTime(500));

    expect(() => unmount()).not.toThrow();
  });
});
