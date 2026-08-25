import { describe, it, expect } from "vitest";
import { haversine, bearing, headingFromPositions, getDistanceColor } from "./geo-utils";

describe("haversine", () => {
  it("returns 0 for identical points", () => {
    expect(haversine(52.52, 13.405, 52.52, 13.405)).toBe(0);
  });

  it("calculates distance between Berlin and Hamburg (~255 km)", () => {
    const dist = haversine(52.52, 13.405, 53.5511, 9.9937);
    expect(dist).toBeGreaterThan(250_000);
    expect(dist).toBeLessThan(260_000);
  });

  it("calculates short distance (~100m)", () => {
    const dist = haversine(53.6103, 10.0415, 53.6112, 10.0415);
    expect(dist).toBeGreaterThan(90);
    expect(dist).toBeLessThan(110);
  });
});

describe("bearing", () => {
  it("returns ~0 (north) when target is directly north", () => {
    const b = bearing(52.0, 13.0, 53.0, 13.0);
    expect(b).toBeLessThan(1);
  });

  it("returns ~90 (east) when target is directly east", () => {
    const b = bearing(52.0, 13.0, 52.0, 14.0);
    expect(b).toBeGreaterThan(85);
    expect(b).toBeLessThan(95);
  });

  it("returns ~180 (south) when target is directly south", () => {
    const b = bearing(53.0, 13.0, 52.0, 13.0);
    expect(b).toBeGreaterThan(175);
    expect(b).toBeLessThan(185);
  });

  it("returns ~270 (west) when target is directly west", () => {
    const b = bearing(52.0, 14.0, 52.0, 13.0);
    expect(b).toBeGreaterThan(265);
    expect(b).toBeLessThan(275);
  });
});

describe("headingFromPositions", () => {
  it("returns null when positions are too close (<2m)", () => {
    expect(headingFromPositions(52.0, 13.0, 52.0, 13.0)).toBeNull();
  });

  it("returns bearing when distance >= 2m", () => {
    const h = headingFromPositions(52.0, 13.0, 52.001, 13.0);
    expect(h).not.toBeNull();
    expect(h).toBeLessThan(1);
  });
});

describe("getDistanceColor", () => {
  it("returns red for > 200m", () => {
    expect(getDistanceColor(201)).toBe("red");
    expect(getDistanceColor(1000)).toBe("red");
  });

  it("returns yellow for 51-200m", () => {
    expect(getDistanceColor(200)).toBe("yellow");
    expect(getDistanceColor(51)).toBe("yellow");
  });

  it("returns green for <= 50m", () => {
    expect(getDistanceColor(50)).toBe("green");
    expect(getDistanceColor(0)).toBe("green");
  });
});
