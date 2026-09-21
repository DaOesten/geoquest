import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { resolve } from "node:path";

/**
 * Wächter über die freigestellten Marken-Bilder (PROJ-1, Refinement
 * 2026-09-20; PROJ-3, Refinement 2026-09-19).
 *
 * Warum als Unit-Test und nicht per E2E: Ein Browser zeigt nicht, ob ein PNG
 * einen Alpha-Kanal hat — er komponiert es auf den Seitenhintergrund, und
 * genau dort fiel der Fehler ja nur als dezentes Rechteck auf. Die Zusicherung
 * lässt sich nur an der Datei selbst prüfen.
 *
 * Der eigentliche Befund war: `logo-lockup.png` ist 8-bit RGB **ohne** Alpha
 * und bringt eine opake Platte von rgb(5-6,7-8,9-10) mit, während der
 * App-Hintergrund rgb(11,15,18) misst. Auf Dunkel fällt dieser Versatz auf,
 * weil Helligkeitswahrnehmung nahe Schwarz feiner auflöst.
 */

const ASSETS = resolve(__dirname, "../../public/assets");

/** Farbtyp 6 = RGBA, 2 = RGB ohne Alpha. */
function readPngHeader(file: string) {
  const buf = readFileSync(resolve(ASSETS, file));
  // IHDR steht immer als erster Chunk direkt nach der 8-Byte-Signatur.
  return {
    buf,
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    bitDepth: buf[24],
    colorType: buf[25],
  };
}

/**
 * Dekodiert ein RGBA-PNG zu rohen Pixeln.
 *
 * Bewusst eine eigene Mini-Implementierung statt einer Abhängigkeit: Das
 * Projekt hat 41 Pakete und soll für einen Test kein 42. bekommen. Deckt nur
 * ab, was hier vorkommt (8 Bit, Farbtyp 6, nicht interlaced).
 */
function decodeRgba(file: string) {
  const { buf, width, height, bitDepth, colorType } = readPngHeader(file);
  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`${file}: erwartet 8-bit RGBA, ist bitDepth=${bitDepth} colorType=${colorType}`);
  }

  const idat: Buffer[] = [];
  let pos = 8;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    if (type === "IDAT") idat.push(buf.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const out = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  let i = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[i++];
    const line = Buffer.from(raw.subarray(i, i + stride));
    i += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? line[x - 4] : 0;
      const b = prev[x];
      const c = x >= 4 ? prev[x - 4] : 0;
      if (filter === 1) line[x] = (line[x] + a) & 255;
      else if (filter === 2) line[x] = (line[x] + b) & 255;
      else if (filter === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        line[x] = (line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
    }
    line.copy(out, y * stride);
    prev = line;
  }

  return { width, height, px: out };
}

describe("freigestellte Marken-Bilder", () => {
  it("das Logo-Lockup hat einen Alpha-Kanal", () => {
    const { colorType } = readPngHeader("logo-lockup-cutout.png");
    // Farbtyp 6 = RGBA. Die Quelldatei ist Typ 2 (RGB) — genau der Befund.
    expect(colorType).toBe(6);
  });

  it("die Quelldatei bleibt als Ausgangsmaterial liegen", () => {
    // Das Skript darf sein eigenes Ergebnis nicht überschreiben, sonst wäre
    // es beim zweiten Lauf nicht mehr reproduzierbar.
    const { colorType } = readPngHeader("logo-lockup.png");
    expect(colorType).toBe(2);
  });

  /**
   * Der Kern: Auf dem App-Hintergrund kompositiert darf im äußeren Rahmen
   * kein Pixel vom Hintergrund abweichen. Genau diese Abweichung war das
   * sichtbare Rechteck.
   *
   * Dieselbe Messlatte, die `mark-pin.png` seit PROJ-3 erfüllt.
   */
  it.each([
    ["logo-lockup-cutout.png"],
    ["mark-pin.png"],
  ])("%s ist auf #0B0F12 kantenfrei", (file) => {
    const { width, height, px } = decodeRgba(file);
    const BG = [11, 15, 18];
    const FRAME = 12;
    let worst = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const inFrame =
          x < FRAME || y < FRAME || x >= width - FRAME || y >= height - FRAME;
        if (!inFrame) continue;
        const o = (y * width + x) * 4;
        const a = px[o + 3] / 255;
        // Die Kanäle liegen premultipliziert vor: out = src + bg * (1 - a)
        for (let ch = 0; ch < 3; ch++) {
          const out = px[o + ch] + BG[ch] * (1 - a);
          worst = Math.max(worst, Math.abs(out - BG[ch]));
        }
      }
    }

    expect(worst).toBe(0);
  });

  it("das Lockup behält sein Motiv — nichts ist weggefiltert", () => {
    const { width, height, px } = decodeRgba("logo-lockup-cutout.png");
    let opaque = 0;
    for (let p = 0; p < width * height; p++) {
      if (px[p * 4 + 3] === 255) opaque++;
    }
    const share = opaque / (width * height);
    // Gemessen 29,0%. Die Grenzen sind weit genug, um Rauschen zuzulassen,
    // aber eng genug, damit ein zu scharfer Filter (Motiv weg) oder ein
    // fehlender Filter (Platte zurück) auffällt.
    expect(share).toBeGreaterThan(0.2);
    expect(share).toBeLessThan(0.4);
  });
});
