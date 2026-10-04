"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ImageUrlPreview } from "@/components/image-url-preview";
import { PLATFORM_LABEL, PlatformFrame } from "@/components/platform-video";
import {
  resolveMediaUrl,
  type MediaField,
  type MediaNotice,
  type MediaProvider,
  type MediaSource,
  type PlatformEmbed,
} from "@/lib/media-link";

/**
 * Rückmeldung unter einem Medien-URL-Feld im Creator (PROJ-15).
 *
 * - Link-Hinweise: was erkannt wurde, oder warum diese Adresse nicht geht
 * - Bild: die bestehende Vorschau (PROJ-8), jetzt mit aufgelöster Adresse
 * - Audio/Video: ein Probe-Player mit genau den Quellen, die der Player lädt
 * - YouTube/Vimeo: Plattform-Vorschau erst nach „Vorschau laden"
 *
 * Alles hier ist Anzeige-Zustand; gespeichert wird weiterhin nur die Eingabe.
 */

export type FeedbackContext = "module" | "quest";

export const PROBE_DEBOUNCE_MS = 450;
/** Ohne Rückmeldung nach dieser Zeit (iOS lädt ohne Tippen oft nichts): neutraler Hinweis statt Warnung */
export const PROBE_TIMEOUT_MS = 6000;

export function MediaUrlFeedback({ url, field, context }: { url: string; field: MediaField; context: FeedbackContext }) {
  const input = url.trim();
  // Hinweise erscheinen sofort (rein lokal), der Probe-Player lädt erst nach
  // der Entprellung — sonst ginge jeder Tastendruck an einen fremden Server.
  const settled = useDebouncedValue(input, PROBE_DEBOUNCE_MS);
  if (!input.startsWith("https://") || input.length <= "https://".length) return null;
  const resolved = resolveMediaUrl(input, field);
  const pending = settled !== input;

  return (
    <div className="flex flex-col gap-2" data-testid="media-url-feedback" data-provider={resolved.provider}>
      {resolved.notices.map((notice) => (
        <NoticeAlert key={notice.code} notice={notice} field={field} context={context} />
      ))}
      {field === "image" && <ImageUrlPreview url={input} />}
      {field !== "image" && resolved.embed && <PlatformPreview key={resolved.embed.src} embed={resolved.embed} />}
      {field !== "image" && !resolved.embed && resolved.sources.length > 0 && (
        pending ? (
          <ProbeStatusLine status="loading" kind={field} provider={resolved.provider} />
        ) : (
          <MediaProbePlayer key={input} kind={field} sources={resolved.sources} provider={resolved.provider} />
        )
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function noticeText(notice: MediaNotice, field: MediaField, context: FeedbackContext): { title: string; text: string } {
  const where = context === "quest" ? "in den Intro- bzw. Outro-Text" : "in die Bildunterschrift";
  switch (notice.code) {
    case "youtube-recognized":
    case "vimeo-recognized": {
      const { name } = PLATFORM_LABEL[notice.code === "youtube-recognized" ? "youtube" : "vimeo"];
      return { title: `${name}-Video erkannt`, text: "Im Spiel wird es erst geladen, wenn jemand darauf tippt." };
    }
    case "platform-not-single-video":
      return {
        title: "Diese Adresse spielt im Spiel nichts ab.",
        text: "Das ist ein Kanal, eine Playlist oder eine Übersicht. Öffne das einzelne Video und kopiere dessen Adresse.",
      };
    case "platform-wrong-field":
      return {
        title: "YouTube- und Vimeo-Videos laufen nur im Video-Modul.",
        text: context === "quest" ? "Intro und Outro zeigen hier nur Bilder." : "Lege für dieses Video ein Video-Modul an.",
      };
    case "dropbox-recognized":
      return { title: "Dropbox-Datei erkannt", text: "Die Datei muss für „Jeder mit dem Link“ freigegeben sein." };
    case "gdrive-image-recognized":
      return { title: "Google-Drive-Bild erkannt", text: "Das Bild muss für „Jeder mit dem Link“ freigegeben sein." };
    case "gdrive-av-unsupported":
      return {
        title: `Google Drive spielt ${field === "audio" ? "Audio" : "Video"} nicht in anderen Apps ab.`,
        text: "Lege die Datei bei Dropbox ab und füge den Dropbox-Link ein.",
      };
    case "cloud-not-a-file":
      return {
        title: "Das ist kein Link auf eine einzelne Datei.",
        text: "Ordner und Übersichtsseiten funktionieren nicht. Öffne die Datei selbst und kopiere ihren Teilen-Link.",
      };
    case "wikimedia-recognized":
      return {
        title: "Wikimedia-Datei erkannt",
        text: `Übernimm Urheber und Lizenz von der Dateiseite ${where}.`,
      };
    case "wikimedia-not-a-file":
      return {
        title: "Diese Seite ist keine einzelne Datei.",
        text: "Tippe im Artikel auf das Bild und kopiere dann die Adresse aus der Adresszeile.",
      };
    case "wikimedia-iphone-format":
      return {
        title: "Spielt auf iPhones möglicherweise nicht ab.",
        text: "Für dieses Format bietet Wikimedia keine iPhone-taugliche Fassung an — auch wenn die Probe hier funktioniert.",
      };
  }
}

function NoticeAlert({ notice, field, context }: { notice: MediaNotice; field: MediaField; context: FeedbackContext }) {
  const { title, text } = noticeText(notice, field, context);
  const isWarning = notice.tone === "warning";
  return (
    <Alert
      variant={isWarning ? "destructive" : "default"}
      // Hinweise werden höflich angesagt, nur Warnungen als Alarm
      role={isWarning ? "alert" : "status"}
      className="font-body"
      data-notice={notice.code}
    >
      {isWarning ? <AlertTriangle className="w-4 h-4" aria-hidden="true" /> : <Info className="w-4 h-4" aria-hidden="true" />}
      <AlertTitle className="font-body text-sm font-semibold text-foreground">{title}</AlertTitle>
      <AlertDescription className="text-foreground">{text}</AlertDescription>
    </Alert>
  );
}

// ---------------------------------------------------------------------------

function PlatformPreview({ embed }: { embed: PlatformEmbed }) {
  const [loaded, setLoaded] = useState(false);
  const { name, company } = PLATFORM_LABEL[embed.platform];

  if (!loaded) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" className="h-11" onClick={() => setLoaded(true)}>
          Vorschau laden
        </Button>
        <span className="font-body text-xs text-muted-foreground">Lädt den Player von {name}; dabei gehen Daten an {company}.</span>
      </div>
    );
  }
  return (
    <div className="relative w-full aspect-video rounded-md overflow-hidden border border-border bg-black" data-testid="platform-preview">
      <PlatformFrame embed={embed} />
    </div>
  );
}

// ---------------------------------------------------------------------------

type ProbeStatus = "loading" | "ok" | "error" | "unknown";

/**
 * Spielt die aufgelösten Quellen in einem kleinen Player an. Meldet:
 * ok (Metadaten geladen), error (letzte Quelle gescheitert — also alle),
 * unknown (nach der Zeitgrenze keine Rückmeldung, typisch für iOS — nie eine
 * falsche Warnung). Neu eingehängt bei jeder neuen Adresse (`key`).
 */
function MediaProbePlayer({ kind, sources, provider }: { kind: "audio" | "video"; sources: MediaSource[]; provider: MediaProvider }) {
  const [status, setStatus] = useState<ProbeStatus>("loading");

  useEffect(() => {
    const timer = setTimeout(() => setStatus((s) => (s === "loading" ? "unknown" : s)), PROBE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const children = sources.map((source, i) => (
    <source
      key={source.src}
      src={source.src}
      type={source.type}
      onError={i === sources.length - 1 ? () => setStatus("error") : undefined}
    />
  ));
  const onReady = () => setStatus("ok");

  return (
    <div className="flex flex-col gap-2" data-testid="media-probe" data-status={status}>
      {status !== "error" &&
        (kind === "audio" ? (
          <audio controls preload="metadata" className="w-full" onLoadedMetadata={onReady} onPlaying={onReady}>
            {children}
          </audio>
        ) : (
          <video
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-48 rounded-md border border-border bg-black"
            onLoadedMetadata={onReady}
            onPlaying={onReady}
          >
            {children}
          </video>
        ))}
      <ProbeStatusLine status={status} kind={kind} provider={provider} />
    </div>
  );
}

function ProbeStatusLine({ status, kind, provider }: { status: ProbeStatus; kind: "audio" | "video"; provider: MediaProvider }) {
  const noun = kind === "audio" ? "Audio" : "Video";
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" aria-hidden="true" />
        <span>{noun} wird geprüft…</span>
      </div>
    );
  }
  if (status === "unknown") {
    return (
      <p className="font-body text-sm text-muted-foreground" role="status">
        Noch keine Rückmeldung — tippe zum Prüfen auf „Abspielen“.
      </p>
    );
  }
  if (status === "error") {
    return (
      <Alert variant="destructive" className="font-body">
        <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        <AlertTitle className="font-body text-sm font-semibold text-foreground">
          Unter dieser Adresse ist kein abspielbares {noun}.
        </AlertTitle>
        <AlertDescription className="text-foreground">
          So bleibt die Stelle im Spiel stumm. Oft ist das die Adresse einer Webseite, nicht die der Datei. Öffne die Datei,
          drücke lange darauf (am Computer: Rechtsklick) und kopiere ihre Adresse.
          {provider === "dropbox" && " Prüfe auch, ob die Datei für „Jeder mit dem Link“ freigegeben ist."}
        </AlertDescription>
      </Alert>
    );
  }
  return null;
}

/** Die beim Einhängen vorhandene Adresse gilt sofort, spätere Eingaben werden entprellt. */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
