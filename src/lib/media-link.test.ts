import { describe, expect, it } from "vitest";
import { parseYouTubeTime, resolveMediaUrl, type MediaField } from "./media-link";

const codes = (url: string, field: MediaField) => resolveMediaUrl(url, field).notices.map((n) => n.code);
const srcs = (url: string, field: MediaField) => resolveMediaUrl(url, field).sources.map((s) => s.src);
const embed = (url: string) => resolveMediaUrl(url, "video").embed?.src ?? null;

describe("resolveMediaUrl — direkte Dateien bleiben wie bisher", () => {
  it.each(["https://beispiel.de/ton.mp3", "https://beispiel.de/bild.jpg?x=1", "http://beispiel.de/a.png", "kein link", ""])(
    "%s",
    (url) => {
      const r = resolveMediaUrl(url, "audio");
      expect(r.provider).toBe("direct");
      expect(r.sources.map((s) => s.src)).toEqual(url === "" ? [] : [url]);
      expect(r.notices).toEqual([]);
      expect(r.embed).toBeNull();
    }
  );

  it("schneidet nur Leerraum am Rand ab", () => {
    expect(srcs("  https://beispiel.de/a.png ", "image")).toEqual(["https://beispiel.de/a.png"]);
  });
});

describe("resolveMediaUrl — YouTube", () => {
  const ID = "dQw4w9WgXcQ";
  const base = `https://www.youtube-nocookie.com/embed/${ID}?rel=0&playsinline=1&autoplay=1`;

  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&feature=share`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}?si=abc123`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}`,
  ])("erkennt %s", (url) => {
    expect(embed(url)).toBe(base);
    expect(codes(url, "video")).toEqual(["youtube-recognized"]);
    expect(srcs(url, "video")).toEqual([]);
  });

  it.each([
    [`https://www.youtube.com/watch?v=${ID}&t=90`, 90],
    [`https://youtu.be/${ID}?t=1m30s`, 90],
    [`https://www.youtube.com/embed/${ID}?start=75`, 75],
    [`https://www.youtube.com/watch?v=${ID}#t=1h0m5s`, 3605],
  ])("übernimmt die Startzeit aus %s", (url, start) => {
    expect(embed(url)).toBe(`${base}&start=${start}`);
  });

  it("bettet bei einer Playlist nur das einzelne Video ein", () => {
    expect(embed(`https://www.youtube.com/watch?v=${ID}&list=PL1234567890`)).toBe(base);
  });

  it.each([
    "https://www.youtube.com/@kanal",
    "https://www.youtube.com/channel/UC123",
    "https://www.youtube.com/playlist?list=PL1234567890",
    "https://www.youtube.com/results?search_query=dom",
    "https://www.youtube.com/",
    "https://www.youtube.com/watch?v=zu-kurz",
  ])("warnt bei %s: kein einzelnes Video", (url) => {
    expect(embed(url)).toBeNull();
    expect(codes(url, "video")).toEqual(["platform-not-single-video"]);
  });

  it("warnt im Bild- und Audio-Feld, dass Plattform-Videos nur im Video-Modul laufen", () => {
    for (const field of ["image", "audio"] as const) {
      const r = resolveMediaUrl(`https://youtu.be/${ID}`, field);
      expect(r.notices.map((n) => n.code)).toEqual(["platform-wrong-field"]);
      expect(r.sources).toEqual([]);
      expect(r.embed).toBeNull();
    }
  });
});

describe("parseYouTubeTime", () => {
  it.each([
    [null, 0],
    ["", 0],
    ["90", 90],
    ["90s", 90],
    ["2m", 120],
    ["1h2m3s", 3723],
    ["abc", 0],
    ["1m30", 0],
  ])("%s → %s", (input, expected) => {
    expect(parseYouTubeTime(input)).toBe(expected);
  });
});

describe("resolveMediaUrl — Vimeo", () => {
  it.each([
    ["https://vimeo.com/76979871", "https://player.vimeo.com/video/76979871?dnt=1&autoplay=1&playsinline=1"],
    ["https://player.vimeo.com/video/76979871", "https://player.vimeo.com/video/76979871?dnt=1&autoplay=1&playsinline=1"],
  ])("erkennt %s", (url, expected) => {
    expect(embed(url)).toBe(expected);
    expect(codes(url, "video")).toEqual(["vimeo-recognized"]);
  });

  it("behält den Hash nicht gelisteter Videos — in beiden Schreibweisen", () => {
    const expected = "https://player.vimeo.com/video/123456789?dnt=1&autoplay=1&playsinline=1&h=abcdef1234";
    expect(embed("https://vimeo.com/123456789/abcdef1234")).toBe(expected);
    expect(embed("https://player.vimeo.com/video/123456789?h=abcdef1234")).toBe(expected);
  });

  it.each(["https://vimeo.com/kanalname", "https://vimeo.com/channels/staffpicks/123", "https://vimeo.com/123/<script>"])(
    "warnt bei %s",
    (url) => {
      expect(embed(url)).toBeNull();
      expect(codes(url, "video")).toEqual(["platform-not-single-video"]);
    }
  );
});

describe("resolveMediaUrl — Dropbox", () => {
  it("wandelt die ältere Form in einen Direktlink", () => {
    const url = "https://www.dropbox.com/s/abc123xyz/hoerspiel.mp3?dl=0";
    expect(srcs(url, "audio")).toEqual(["https://www.dropbox.com/s/abc123xyz/hoerspiel.mp3?raw=1"]);
    expect(codes(url, "audio")).toEqual(["dropbox-recognized"]);
  });

  it("wandelt die neuere Form und behält rlkey (und st), verwirft Tracking", () => {
    const url = "https://www.dropbox.com/scl/fi/k3j4h5g6f7/Bild%20eins.jpg?rlkey=a1b2c3d4e5&st=zz99yy88&e=1&dl=0";
    expect(srcs(url, "image")).toEqual([
      "https://www.dropbox.com/scl/fi/k3j4h5g6f7/Bild%20eins.jpg?rlkey=a1b2c3d4e5&st=zz99yy88&raw=1",
    ]);
  });

  it.each([
    "https://www.dropbox.com/scl/fo/k3j4h5g6f7/AAA?rlkey=a1b2c3d4e5",
    "https://www.dropbox.com/sh/abc123xyz/AAAbbb",
    "https://www.dropbox.com/home",
    "https://www.dropbox.com/scl/fi/k3j4h5g6f7/datei.jpg",
  ])("warnt bei %s: kein Link auf eine einzelne Datei", (url) => {
    expect(srcs(url, "image")).toEqual([]);
    expect(codes(url, "image")).toEqual(["cloud-not-a-file"]);
  });
});

describe("resolveMediaUrl — Google Drive", () => {
  const ID = "1K81jyY-pdF0ixDOxWC1ieioR-6SMC53L"; // gemessenes Testbild des Betreibers

  it.each([
    `https://drive.google.com/file/d/${ID}/view?usp=sharing`,
    `https://drive.google.com/open?id=${ID}`,
    `https://drive.google.com/uc?export=view&id=${ID}`,
  ])("lädt Bilder über Googles Bild-Server: %s", (url) => {
    expect(srcs(url, "image")).toEqual([`https://lh3.googleusercontent.com/d/${ID}=w1280`]);
    expect(codes(url, "image")).toEqual(["gdrive-image-recognized"]);
  });

  it("versucht Audio und Video nicht, sondern warnt (gemessen gesperrt)", () => {
    for (const field of ["audio", "video"] as const) {
      expect(srcs(`https://drive.google.com/file/d/${ID}/view`, field)).toEqual([]);
      expect(codes(`https://drive.google.com/file/d/${ID}/view`, field)).toEqual(["gdrive-av-unsupported"]);
    }
  });

  it.each(["https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrStUvWx", "https://drive.google.com/file/d/kurz/view"])(
    "warnt bei %s",
    (url) => {
      expect(codes(url, "image")).toEqual(["cloud-not-a-file"]);
    }
  );
});

describe("resolveMediaUrl — Wikimedia Bilder", () => {
  it("Commons-Dateiseite → Special:FilePath mit Web-Breite", () => {
    expect(srcs("https://commons.wikimedia.org/wiki/File:Cologne_Cathedral.jpg", "image")).toEqual([
      "https://commons.wikimedia.org/wiki/Special:FilePath/File:Cologne_Cathedral.jpg?width=1280",
    ]);
    expect(codes("https://commons.wikimedia.org/wiki/File:Cologne_Cathedral.jpg", "image")).toEqual(["wikimedia-recognized"]);
  });

  it("mobile Commons-Seite und deutsche Schreibweise", () => {
    expect(srcs("https://commons.m.wikimedia.org/wiki/Datei:Cologne_Cathedral.jpg", "image")).toEqual([
      "https://commons.wikimedia.org/wiki/Special:FilePath/Datei:Cologne_Cathedral.jpg?width=1280",
    ]);
  });

  it("Wikipedia-Bildbetrachter → Datei im Herkunfts-Wiki, nicht das Artikelbild", () => {
    expect(srcs("https://de.wikipedia.org/wiki/K%C3%B6lner_Dom#/media/Datei:K%C3%B6lner_Dom_von_Osten.jpg", "image")).toEqual([
      "https://de.wikipedia.org/wiki/Special:FilePath/Datei:K%C3%B6lner_Dom_von_Osten.jpg?width=1280",
    ]);
  });

  it("mobile Wikipedia, Leerzeichen und kleiner Anfangsbuchstabe werden normalisiert", () => {
    expect(srcs("https://de.m.wikipedia.org/wiki/Datei:kölner Dom.jpg", "image")).toEqual([
      "https://de.wikipedia.org/wiki/Special:FilePath/Datei:K%C3%B6lner_Dom.jpg?width=1280",
    ]);
  });

  it("reicht lokalisierte Präfixe unverändert an das Herkunfts-Wiki weiter", () => {
    expect(srcs("https://fr.wikipedia.org/wiki/Cath%C3%A9drale#/media/Fichier:Cologne_Cathedral.jpg", "image")).toEqual([
      "https://fr.wikipedia.org/wiki/Special:FilePath/Fichier:Cologne_Cathedral.jpg?width=1280",
    ]);
  });

  it("Dateiseite über /w/index.php?title=", () => {
    expect(srcs("https://de.wikipedia.org/w/index.php?title=Datei:Cologne_Cathedral.jpg", "image")).toEqual([
      "https://de.wikipedia.org/wiki/Special:FilePath/Datei:Cologne_Cathedral.jpg?width=1280",
    ]);
  });

  it("vorhandener upload.wikimedia.org-Direktlink lädt künftig in Web-Größe (Edge Case 22)", () => {
    expect(
      srcs("https://upload.wikimedia.org/wikipedia/commons/0/0d/K%C3%B6lner_Dom_von_Osten.jpg", "image")
    ).toEqual(["https://commons.wikimedia.org/wiki/Special:FilePath/File:K%C3%B6lner_Dom_von_Osten.jpg?width=1280"]);
    expect(srcs("https://upload.wikimedia.org/wikipedia/de/7/75/%28iPod%29_touch-4G.png", "image")).toEqual([
      "https://de.wikipedia.org/wiki/Special:FilePath/File:(iPod)_touch-4G.png?width=1280",
    ]);
  });

  it("Vorschaubilder und Fassungen auf upload.wikimedia.org bleiben unverändert", () => {
    const thumb = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/A.jpg/800px-A.jpg";
    expect(srcs(thumb, "image")).toEqual([thumb]);
    expect(codes(thumb, "image")).toEqual(["wikimedia-recognized"]);
  });

  it.each([
    "https://de.wikipedia.org/wiki/K%C3%B6lner_Dom",
    "https://de.wikipedia.org/wiki/Kategorie:K%C3%B6ln",
    "https://commons.wikimedia.org/wiki/Category:Cologne_Cathedral",
    "https://de.wikipedia.org/wiki/Star_Wars:_Episode_I",
    "https://de.wikipedia.org/",
  ])("warnt bei %s: keine einzelne Datei", (url) => {
    expect(srcs(url, "image")).toEqual([]);
    expect(codes(url, "image")).toEqual(["wikimedia-not-a-file"]);
  });
});

describe("resolveMediaUrl — Wikimedia Audio und Video", () => {
  it("Ogg-Audio: zuerst die MP3-Fassung (Pfad aus MD5), dann das Original", () => {
    const r = resolveMediaUrl("https://commons.wikimedia.org/wiki/File:Toco_Toucan_call_(Ramphastos_toco).ogg", "audio");
    expect(r.sources).toEqual([
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a8/Toco_Toucan_call_(Ramphastos_toco).ogg/Toco_Toucan_call_(Ramphastos_toco).ogg.mp3",
        type: "audio/mpeg",
      },
      { src: "https://commons.wikimedia.org/wiki/Special:FilePath/File:Toco_Toucan_call_(Ramphastos_toco).ogg" },
    ]);
    expect(r.notices.map((n) => n.code)).toEqual(["wikimedia-recognized"]);
  });

  it("Audio aus einem Sprach-Wiki: MP3 auf Commons und im Sprach-Wiki versuchen", () => {
    const r = resolveMediaUrl("https://de.wikipedia.org/wiki/Tukan#/media/Datei:Ruf.ogg", "audio");
    expect(r.sources.map((s) => s.src.split("/transcoded/")[0])).toEqual([
      "https://upload.wikimedia.org/wikipedia/commons",
      "https://upload.wikimedia.org/wikipedia/de",
      "https://de.wikipedia.org/wiki/Special:FilePath/Datei:Ruf.ogg",
    ]);
  });

  it("MP3 auf Commons wird direkt gespielt, ohne Fassung", () => {
    expect(srcs("https://commons.wikimedia.org/wiki/File:Glocke.mp3", "audio")).toEqual([
      "https://commons.wikimedia.org/wiki/Special:FilePath/File:Glocke.mp3",
    ]);
  });

  it("Video: 480p-WebM, 360p-MOV, Original zuletzt — nie das Original zuerst", () => {
    const r = resolveMediaUrl("https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm", "video");
    expect(r.sources).toEqual([
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm",
        type: "video/webm",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.mpeg4.mov",
        type: "video/quicktime",
      },
      { src: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm" },
    ]);
  });

  it("Format ohne bekannte iPhone-taugliche Fassung bekommt den iPhone-Hinweis", () => {
    expect(codes("https://commons.wikimedia.org/wiki/File:Bild.png", "video")).toEqual([
      "wikimedia-recognized",
      "wikimedia-iphone-format",
    ]);
    expect(codes("https://commons.wikimedia.org/wiki/File:Bild.png", "audio")).toContain("wikimedia-iphone-format");
  });
});

describe("resolveMediaUrl — Sicherheit", () => {
  it.each([
    "https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ",
    "https://evil.example/dropbox.com/s/abc123xyz/a.mp3",
    "https://evil.example/?u=https://www.dropbox.com/s/abc123xyz/a.mp3",
    "https://dropbox.com.evil.example/s/abc123xyz/a.mp3",
    "https://de.wikipedia.org.evil.example/wiki/Datei:x.jpg",
    "https://drive.google.com.evil.example/file/d/1K81jyY-pdF0ixDOxWC1ieioR-6SMC53L/view",
    "https://www.wikipedia.org/wiki/Datei:x.jpg",
  ])("behandelt %s wie eine unbekannte Adresse", (url) => {
    const r = resolveMediaUrl(url, "video");
    expect(r.provider).toBe("direct");
    expect(r.embed).toBeNull();
    expect(r.notices).toEqual([]);
  });

  it("baut keine Adresse aus Dateinamen mit Pfad- oder Steuerzeichen", () => {
    expect(srcs("https://www.dropbox.com/s/abc123xyz/..%2F..%2Fadmin", "audio")).toEqual([]);
    expect(srcs("https://commons.wikimedia.org/wiki/File:a%2F..%2Fb.jpg", "image")).toEqual([]);
    expect(srcs("https://de.wikipedia.org/wiki/X#/media/Datei:a%0Ab.jpg", "image")).toEqual([]);
  });

  it("lässt keine Zeichen aus der Eingabe in die Embed-Adresse durch", () => {
    for (const url of [
      'https://www.youtube.com/watch?v=dQw4w9WgXc"',
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1;alert(1)",
      "https://vimeo.com/123?h=abc<x>",
    ]) {
      const src = embed(url);
      if (src) expect(src).toMatch(/^https:\/\/(www\.youtube-nocookie\.com|player\.vimeo\.com)\/[A-Za-z0-9/_?&=.-]+$/);
    }
  });

  it("jede gebaute Adresse zeigt auf einen offiziellen Host", () => {
    const official = /^https:\/\/(www\.dropbox\.com|lh3\.googleusercontent\.com|upload\.wikimedia\.org|commons\.wikimedia\.org|[a-z0-9-]+\.wikipedia\.org)\//;
    for (const [url, field] of [
      ["https://www.dropbox.com/s/abc123xyz/a.mp3", "audio"],
      ["https://drive.google.com/file/d/1K81jyY-pdF0ixDOxWC1ieioR-6SMC53L/view", "image"],
      ["https://de.wikipedia.org/wiki/X#/media/Datei:a.ogg", "audio"],
      ["https://commons.wikimedia.org/wiki/File:a.webm", "video"],
    ] as const) {
      for (const s of srcs(url, field)) expect(s).toMatch(official);
    }
  });
});
