import { md5 } from "./md5";

/**
 * Auflösung von Medienadressen (PROJ-15).
 *
 * Ersteller fügen Links ein, wie sie sie vorliegen haben: YouTube, Vimeo,
 * Dropbox, Google Drive, Wikimedia. Alle führen auf eine Webseite statt auf eine
 * Datei. Diese Funktion beantwortet für Creator **und** Player dieselben zwei
 * Fragen — „was ist das für ein Link?" und „was wird geladen?". Zwei Kopien
 * dieser Logik könnten auseinanderlaufen (die Fehlerklasse von BUG-6).
 *
 * Grundregeln:
 * - Erkannt wird am **geparsten Host**, nie per Textsuche in der Adresse.
 * - Jede geladene Adresse wird hier **selbst gebaut** — aus geprüften
 *   Bestandteilen (Video-ID, Datei-ID, Dateiname) auf den offiziellen Hosts.
 *   Die gespeicherte Adresse wird nie als iframe-Quelle verwendet.
 * - Gespeichert bleibt die Eingabe unverändert; diese Funktion läuft beim Anzeigen.
 * - Unbekannte oder nicht stimmige Adressen bleiben exakt wie bisher.
 *
 * Messgrundlage der Wikimedia- und Google-Drive-Regeln: Tech Design der Spec,
 * „Messung vom 2026-10-04".
 */

export type MediaField = "image" | "audio" | "video";

export type MediaProvider = "direct" | "youtube" | "vimeo" | "dropbox" | "gdrive" | "wikimedia";

export interface MediaSource {
  src: string;
  /** MIME-Typ, damit der Browser Fassungen überspringt, die er nicht abspielen kann */
  type?: string;
}

export type MediaNoticeCode =
  | "youtube-recognized"
  | "vimeo-recognized"
  | "platform-not-single-video"
  | "platform-wrong-field"
  | "dropbox-recognized"
  | "gdrive-image-recognized"
  | "gdrive-av-unsupported"
  | "cloud-not-a-file"
  | "wikimedia-recognized"
  | "wikimedia-not-a-file"
  | "wikimedia-iphone-format";

export interface MediaNotice {
  code: MediaNoticeCode;
  tone: "info" | "warning";
}

export interface PlatformEmbed {
  platform: "youtube" | "vimeo";
  src: string;
}

export interface ResolvedMedia {
  provider: MediaProvider;
  /** In dieser Reihenfolge laden; der Browser nimmt die erste, die geht. Leer = nichts Abspielbares. */
  sources: MediaSource[];
  /** Nur im Video-Feld bei einem einzelnen YouTube-/Vimeo-Video */
  embed: PlatformEmbed | null;
  notices: MediaNotice[];
}

/** Zielbreite für Wikimedia- und Google-Drive-Bilder (Spec: Richtwert ~1280 px). */
export const WEB_IMAGE_WIDTH = 1280;

const info = (code: MediaNoticeCode): MediaNotice => ({ code, tone: "info" });
const warning = (code: MediaNoticeCode): MediaNotice => ({ code, tone: "warning" });

function asDirect(url: string): ResolvedMedia {
  return { provider: "direct", sources: url === "" ? [] : [{ src: url }], embed: null, notices: [] };
}

function nothingPlayable(provider: MediaProvider, notice: MediaNotice): ResolvedMedia {
  return { provider, sources: [], embed: null, notices: [notice] };
}

export function resolveMediaUrl(rawUrl: string, field: MediaField): ResolvedMedia {
  const url = rawUrl.trim();
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return asDirect(url);
  }
  if (parsed.protocol !== "https:") return asDirect(url);

  const host = parsed.hostname;
  return (
    resolveYouTube(parsed, host, field) ??
    resolveVimeo(parsed, host, field) ??
    resolveDropbox(parsed, host, field) ??
    resolveGoogleDrive(parsed, host, field) ??
    resolveWikimedia(parsed, host, field) ??
    asDirect(url)
  );
}

// ---------------------------------------------------------------------------
// YouTube
// ---------------------------------------------------------------------------

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function resolveYouTube(url: URL, host: string, field: MediaField): ResolvedMedia | null {
  if (!YOUTUBE_HOSTS.has(host)) return null;
  if (field !== "video") return nothingPlayable("youtube", warning("platform-wrong-field"));

  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  if (host === "youtu.be") {
    id = segments[0] ?? null;
  } else if (segments[0] === "watch") {
    id = url.searchParams.get("v");
  } else if (["shorts", "embed", "live", "v"].includes(segments[0] ?? "")) {
    id = segments[1] ?? null;
  }
  if (!id || !YOUTUBE_ID.test(id)) return nothingPlayable("youtube", warning("platform-not-single-video"));

  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const start = parseYouTubeTime(url.searchParams.get("t") ?? url.searchParams.get("start") ?? hashParams.get("t"));

  // Playlist-Parameter (`list`) wird bewusst nicht übernommen: nur das einzelne Video.
  const params = new URLSearchParams({ rel: "0", playsinline: "1", autoplay: "1" });
  if (start > 0) params.set("start", String(start));
  return {
    provider: "youtube",
    sources: [],
    embed: { platform: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}?${params}` },
    notices: [info("youtube-recognized")],
  };
}

/** "90", "90s", "1m30s", "1h2m3s" → Sekunden; alles andere → 0 */
export function parseYouTubeTime(value: string | null): number {
  if (!value) return 0;
  if (/^\d{1,6}$/.test(value)) return Number(value);
  const match = /^(?:(\d{1,3})h)?(?:(\d{1,4})m)?(?:(\d{1,6})s)?$/.exec(value);
  if (!match || match[0] === "") return 0;
  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

// ---------------------------------------------------------------------------
// Vimeo
// ---------------------------------------------------------------------------

const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const VIMEO_ID = /^\d{1,12}$/;
const VIMEO_HASH = /^[0-9a-f]{6,20}$/i;

function resolveVimeo(url: URL, host: string, field: MediaField): ResolvedMedia | null {
  if (!VIMEO_HOSTS.has(host)) return null;
  if (field !== "video") return nothingPlayable("vimeo", warning("platform-wrong-field"));

  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | undefined;
  let hash: string | null = url.searchParams.get("h");
  if (host === "player.vimeo.com") {
    if (segments[0] === "video") id = segments[1];
  } else {
    id = segments[0];
    // Nicht gelistetes Video: vimeo.com/<Zahl>/<Hash> — ohne Hash verweigert Vimeo die Wiedergabe
    if (segments[1] !== undefined) hash = segments[1];
    if (segments.length > 2) id = undefined;
  }
  if (!id || !VIMEO_ID.test(id)) return nothingPlayable("vimeo", warning("platform-not-single-video"));
  if (hash !== null && !VIMEO_HASH.test(hash)) return nothingPlayable("vimeo", warning("platform-not-single-video"));

  const params = new URLSearchParams({ dnt: "1", autoplay: "1", playsinline: "1" });
  if (hash) params.set("h", hash);
  return {
    provider: "vimeo",
    sources: [],
    embed: { platform: "vimeo", src: `https://player.vimeo.com/video/${id}?${params}` },
    notices: [info("vimeo-recognized")],
  };
}

// ---------------------------------------------------------------------------
// Dropbox
// ---------------------------------------------------------------------------

const DROPBOX_HOSTS = new Set(["dropbox.com", "www.dropbox.com"]);
const DROPBOX_KEY = /^[A-Za-z0-9_-]{5,80}$/;
const DROPBOX_TOKEN = /^[A-Za-z0-9]{5,80}$/;

function resolveDropbox(url: URL, host: string, _field: MediaField): ResolvedMedia | null {
  if (!DROPBOX_HOSTS.has(host)) return null;

  const segments = url.pathname.split("/").filter(Boolean);
  const notAFile = () => nothingPlayable("dropbox", warning("cloud-not-a-file"));

  let path: string;
  const params = new URLSearchParams();
  if (segments[0] === "s" && segments.length === 3) {
    // ältere Form: /s/<Schlüssel>/<Dateiname>
    const name = safeFileName(segments[2]);
    if (!DROPBOX_KEY.test(segments[1]) || !name) return notAFile();
    path = `/s/${segments[1]}/${encodeURIComponent(name)}`;
  } else if (segments[0] === "scl" && segments[1] === "fi" && segments.length === 4) {
    // neuere Form: /scl/fi/<ID>/<Dateiname>?rlkey=… — ohne rlkey keine Datei
    const name = safeFileName(segments[3]);
    const rlkey = url.searchParams.get("rlkey");
    if (!DROPBOX_KEY.test(segments[2]) || !name || !rlkey || !DROPBOX_TOKEN.test(rlkey)) return notAFile();
    path = `/scl/fi/${segments[2]}/${encodeURIComponent(name)}`;
    params.set("rlkey", rlkey);
    const st = url.searchParams.get("st");
    if (st && DROPBOX_TOKEN.test(st)) params.set("st", st);
  } else {
    // Ordner (/scl/fo/…, /sh/…) und alles andere auf dropbox.com
    return notAFile();
  }
  params.set("raw", "1");
  return {
    provider: "dropbox",
    sources: [{ src: `https://www.dropbox.com${path}?${params}` }],
    embed: null,
    notices: [info("dropbox-recognized")],
  };
}

// ---------------------------------------------------------------------------
// Google Drive
// ---------------------------------------------------------------------------

const GDRIVE_ID = /^[A-Za-z0-9_-]{20,100}$/;

function resolveGoogleDrive(url: URL, host: string, field: MediaField): ResolvedMedia | null {
  if (host !== "drive.google.com") return null;

  const segments = url.pathname.split("/").filter(Boolean);
  let id: string | null = null;
  if (segments[0] === "file" && segments[1] === "d") {
    id = segments[2] ?? null;
  } else if (segments[0] === "open" || segments[0] === "uc") {
    id = url.searchParams.get("id");
  }
  if (!id || !GDRIVE_ID.test(id)) return nothingPlayable("gdrive", warning("cloud-not-a-file"));

  // Gemessen 2026-10-04: Google sperrt das Einbetten über die Download-Adressen
  // (403 in Chrome und WebKit, für Bild, Audio und Video). Nur der Bild-Server
  // liefert — und der kann kein Audio/Video.
  if (field !== "image") return nothingPlayable("gdrive", warning("gdrive-av-unsupported"));
  return {
    provider: "gdrive",
    sources: [{ src: `https://lh3.googleusercontent.com/d/${id}=w${WEB_IMAGE_WIDTH}` }],
    embed: null,
    notices: [info("gdrive-image-recognized")],
  };
}

// ---------------------------------------------------------------------------
// Wikimedia (Commons und Wikipedia)
// ---------------------------------------------------------------------------

const WIKI_LANG = /^[a-z][a-z0-9-]{1,20}$/;
const MEDIA_EXTENSION =
  /\.(jpe?g|png|gif|svg|webp|tiff?|bmp|xcf|ogg|oga|ogv|opus|flac|wav|mp3|mid|midi|webm|mpe?g)$/i;
const AUDIO_TRANSCODED = new Set(["ogg", "oga", "opus", "flac", "wav", "mid", "midi"]);
const AUDIO_IPHONE_OK = new Set(["mp3", "m4a", "aac"]);
const VIDEO_TRANSCODED = new Set(["webm", "ogv", "ogg", "mpg", "mpeg"]);

interface WikiFile {
  /** z.B. https://de.wikipedia.org — dort wird aufgelöst, damit lokal gespeicherte Dateien gefunden werden */
  wiki: string;
  /** Ablagen auf upload.wikimedia.org, in denen die Datei liegen kann ("commons", "de") */
  repos: string[];
  /** Präfix wie im Herkunfts-Wiki ("Datei", "Fichier", "File") */
  prefix: string;
  /** Dateiname ohne Präfix, MediaWiki-normalisiert (Unterstriche, erster Buchstabe groß) */
  name: string;
  /** Original-Adresse, falls schon ein Direktlink auf upload.wikimedia.org eingetragen war */
  originalUrl?: string;
}

function resolveWikimedia(url: URL, host: string, field: MediaField): ResolvedMedia | null {
  if (host === "upload.wikimedia.org") return resolveWikimediaUpload(url, field);

  let wiki: string;
  let repos: string[];
  if (host === "commons.wikimedia.org" || host === "commons.m.wikimedia.org") {
    wiki = "https://commons.wikimedia.org";
    repos = ["commons"];
  } else {
    const match = /^([a-z0-9-]+)(?:\.m)?\.wikipedia\.org$/.exec(host);
    if (!match || !WIKI_LANG.test(match[1]) || match[1] === "www") return null;
    wiki = `https://${match[1]}.wikipedia.org`;
    // Die meisten Dateien liegen auf Commons, manche nur im Sprach-Wiki
    repos = ["commons", match[1]];
  }

  const title = wikiTitle(url);
  const fromMediaViewer = url.hash.startsWith("#/media/");
  const split = title ? splitFileTitle(title) : null;
  if (!split || (!fromMediaViewer && !MEDIA_EXTENSION.test(split.name))) {
    return nothingPlayable("wikimedia", warning("wikimedia-not-a-file"));
  }
  return wikimediaFile({ wiki, repos, ...split }, field);
}

function wikiTitle(url: URL): string | null {
  try {
    if (url.hash.startsWith("#/media/")) return decodeURIComponent(url.hash.slice("#/media/".length));
    if (url.pathname.startsWith("/wiki/")) return decodeURIComponent(url.pathname.slice("/wiki/".length));
    if (url.pathname === "/w/index.php") return url.searchParams.get("title");
  } catch {
    // kaputte Prozent-Kodierung
  }
  return null;
}

/** "Datei:Kölner Dom.jpg" → { prefix: "Datei", name: "Kölner_Dom.jpg" } */
function splitFileTitle(title: string): { prefix: string; name: string } | null {
  const colon = title.indexOf(":");
  if (colon <= 0) return null;
  const prefix = title.slice(0, colon).trim();
  const name = checkFileName(title.slice(colon + 1));
  if (!/^[\p{L}\p{N} _-]{1,30}$/u.test(prefix) || !name) return null;
  return { prefix: prefix.replace(/ /g, "_"), name: normalizeWikiName(name) };
}

function resolveWikimediaUpload(url: URL, field: MediaField): ResolvedMedia {
  const segments = url.pathname.split("/").filter(Boolean);
  const recognized: ResolvedMedia = {
    provider: "wikimedia",
    sources: [{ src: url.href }],
    embed: null,
    notices: [info("wikimedia-recognized")],
  };
  // /wikipedia/<Ablage>/<a>/<ab>/<Datei> — Vorschaubilder (/thumb/) und Fassungen
  // (/transcoded/) sind bereits fertige Adressen und bleiben unverändert.
  if (segments[0] !== "wikipedia" || segments.length !== 5) return recognized;
  const [, repo, h1, h2, rawName] = segments;
  const name = safeFileName(rawName);
  if (!WIKI_LANG.test(repo) || !/^[0-9a-f]$/.test(h1) || !/^[0-9a-f]{2}$/.test(h2) || !name) return recognized;

  const wiki = repo === "commons" ? "https://commons.wikimedia.org" : `https://${repo}.wikipedia.org`;
  return wikimediaFile(
    { wiki, repos: [repo], prefix: "File", name: normalizeWikiName(name), originalUrl: `https://upload.wikimedia.org${url.pathname}` },
    field
  );
}

function wikimediaFile(file: WikiFile, field: MediaField): ResolvedMedia {
  const filePath = `${file.wiki}/wiki/Special:FilePath/${encodeURIComponent(file.prefix)}:${encodeURIComponent(file.name)}`;
  const original = file.originalUrl ?? filePath;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const notices: MediaNotice[] = [info("wikimedia-recognized")];
  let sources: MediaSource[];

  if (field === "image") {
    // Gemessen: verkleinert, vergrößert nichts, SVG → PNG, GIF-Animation bleibt
    sources = [{ src: `${filePath}?width=${WEB_IMAGE_WIDTH}` }];
  } else if (field === "audio") {
    sources = AUDIO_TRANSCODED.has(extension)
      ? [...transcodes(file, [["mp3", "audio/mpeg"]]), { src: original }]
      : [{ src: original }];
    if (!AUDIO_TRANSCODED.has(extension) && !AUDIO_IPHONE_OK.has(extension)) notices.push(warning("wikimedia-iphone-format"));
  } else {
    // Nie das Original zuerst: Commons-Originale können Gigabyte groß sein.
    sources = VIDEO_TRANSCODED.has(extension)
      ? [
          ...transcodes(file, [
            ["480p.vp9.webm", "video/webm"],
            ["360p.mpeg4.mov", "video/quicktime"],
          ]),
          { src: original },
        ]
      : [{ src: original }];
    if (!VIDEO_TRANSCODED.has(extension)) notices.push(warning("wikimedia-iphone-format"));
  }
  return { provider: "wikimedia", sources, embed: null, notices };
}

/** Fassungen von Wikimedia: Pfad aus MD5 des Dateinamens, ohne Wikimedia-API */
function transcodes(file: WikiFile, variants: [suffix: string, type: string][]): MediaSource[] {
  const hash = md5(file.name);
  const encoded = encodeURIComponent(file.name);
  return file.repos.flatMap((repo) =>
    variants.map(([suffix, type]) => ({
      src: `https://upload.wikimedia.org/wikipedia/${repo}/transcoded/${hash[0]}/${hash.slice(0, 2)}/${encoded}/${encoded}.${suffix}`,
      type,
    }))
  );
}

function normalizeWikiName(name: string): string {
  const underscored = name.trim().replace(/ /g, "_");
  return underscored.charAt(0).toUpperCase() + underscored.slice(1);
}

// ---------------------------------------------------------------------------

/** Pfadsegment dekodieren und als Dateiname prüfen. */
function safeFileName(segment: string): string | null {
  let name: string;
  try {
    name = decodeURIComponent(segment);
  } catch {
    return null;
  }
  return checkFileName(name);
}

/**
 * Bereits dekodierten Dateinamen prüfen. Verworfen wird alles mit Pfad- oder
 * Steuerzeichen, damit kein Bestandteil die gebaute Adresse verbiegen kann
 * (`../`, `?`, `#`, Zeilenumbrüche).
 */
function checkFileName(raw: string): string | null {
  const name = raw.trim();
  if (name === "" || name === "." || name === ".." || name.length > 240) return null;
  if (/[\u0000-\u001f\u007f/\\?#<>[\]{}|]/.test(name)) return null;
  return name;
}
