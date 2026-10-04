import { describe, expect, it } from "vitest";
import { md5 } from "./md5";

describe("md5", () => {
  it("liefert die RFC-1321-Testvektoren", () => {
    expect(md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
    expect(md5("a")).toBe("0cc175b9c0f1b6a831c399e269772661");
    expect(md5("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
    expect(md5("message digest")).toBe("f96b697d7cb7938d525a2f31aaf161d0");
    expect(md5("12345678901234567890123456789012345678901234567890123456789012345678901234567890")).toBe(
      "57edf4a22be3c955ac49da2e2107b67a"
    );
  });

  it("rechnet über UTF-8, nicht über UTF-16 (Umlaute)", () => {
    // gemessener Wikimedia-Pfad: /0/0d/K%C3%B6lner_Dom_von_Osten.jpg
    expect(md5("Kölner_Dom_von_Osten.jpg").slice(0, 2)).toBe("0d");
  });

  it("trifft die am 2026-10-04 gemessenen Wikimedia-Ablagepfade", () => {
    expect(md5("Ludwig_van_Beethoven_-_symphony_no._5_in_c_minor,_op._67_-_i._allegro_con_brio.ogg").slice(0, 2)).toBe("e6");
    expect(md5("Big_Buck_Bunny_4K.webm").slice(0, 2)).toBe("c0");
    expect(md5("(iPod)_touch-4G.png").slice(0, 2)).toBe("75");
    expect(md5("Cologne_Cathedral.jpg").slice(0, 2)).toBe("fe");
  });

  it("verarbeitet Eingaben über mehrere 64-Byte-Blöcke", () => {
    expect(md5("x".repeat(1000))).toMatch(/^[0-9a-f]{32}$/);
    expect(md5("x".repeat(55))).not.toBe(md5("x".repeat(56)));
  });
});
