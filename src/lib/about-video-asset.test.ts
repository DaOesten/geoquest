import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Wächter über das Erklärvideo auf /about (PROJ-13, Refinement 10).
 *
 * Diese Eigenschaften sieht man im Browser nicht, sie entscheiden aber, ob
 * das Video auf dem Handy schnell startet: Liegt das `moov`-Atom (das
 * Inhaltsverzeichnis) hinter den Mediendaten, lädt der Browser die ganze
 * Datei, bevor das erste Bild kommt. Ein Neu-Export ohne „faststart" würde
 * das still kaputt machen.
 */

const ASSETS = resolve(__dirname, "../../public/assets");
const VIDEO = "video-geoquest-4x5-game-web.mp4";
const POSTER = "video-geoquest-4x5-game-poster.jpg";

function topLevelAtoms(buf: Buffer) {
  const atoms: { type: string; offset: number; size: number }[] = [];
  let pos = 0;
  while (pos + 8 <= buf.length) {
    let size = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    if (size === 1) size = Number(buf.readBigUInt64BE(pos + 8));
    if (size === 0) size = buf.length - pos;
    atoms.push({ type, offset: pos, size });
    pos += size;
  }
  return atoms;
}

/** Breite/Höhe aus allen `tkhd`-Boxen; Audio-Spuren haben 0×0. */
function trackDimensions(buf: Buffer) {
  const dims: [number, number][] = [];
  let i = buf.indexOf("tkhd", 0, "latin1");
  while (i !== -1) {
    const boxStart = i - 4;
    const boxEnd = boxStart + buf.readUInt32BE(boxStart);
    // Breite und Höhe sind die letzten 8 Byte der Box, 16.16-Festkomma.
    dims.push([buf.readUInt32BE(boxEnd - 8) >>> 16, buf.readUInt32BE(boxEnd - 4) >>> 16]);
    i = buf.indexOf("tkhd", i + 4, "latin1");
  }
  return dims.filter(([w, h]) => w > 0 && h > 0);
}

function jpegDimensions(buf: Buffer) {
  let pos = 2;
  while (pos < buf.length) {
    const marker = buf[pos + 1];
    const len = buf.readUInt16BE(pos + 2);
    // SOF0..SOF3 tragen Höhe/Breite.
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buf.readUInt16BE(pos + 5), width: buf.readUInt16BE(pos + 7) };
    }
    pos += 2 + len;
  }
  throw new Error("kein SOF-Marker");
}

describe("Erklärvideo auf /about", () => {
  const video = readFileSync(resolve(ASSETS, VIDEO));

  it("ist für Streaming vorbereitet: moov steht vor mdat", () => {
    const atoms = topLevelAtoms(video);
    const moov = atoms.find((a) => a.type === "moov");
    const mdat = atoms.find((a) => a.type === "mdat");
    expect(atoms[0].type).toBe("ftyp");
    expect(moov, "kein moov-Atom").toBeDefined();
    expect(mdat, "kein mdat-Atom").toBeDefined();
    expect(moov!.offset).toBeLessThan(mdat!.offset);
  });

  it("bleibt unter 3 MB (PRD-Ladezeit, Vorgabe aus Refinement 10)", () => {
    expect(video.length).toBeLessThan(3 * 1024 * 1024);
  });

  it("ist 4:5 und höchstens 720px breit", () => {
    const [[w, h]] = trackDimensions(video);
    expect(w).toBeLessThanOrEqual(720);
    expect(h / w).toBeCloseTo(1.25, 2);
  });

  it("das Poster hat dieselben Maße wie das Video", () => {
    const [[w, h]] = trackDimensions(video);
    const poster = jpegDimensions(readFileSync(resolve(ASSETS, POSTER)));
    expect(poster).toEqual({ width: w, height: h });
  });
});
