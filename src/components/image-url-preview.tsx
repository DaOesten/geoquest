"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Vorschau unter einem Bild-URL-Feld (PROJ-8, Refinement 2026-09-28).
 *
 * Anlass: Eine Seiten-URL (z.B. die Detailseite einer Stockbild-Plattform)
 * erfüllt das `https://`-Format, wird aber nie als Bild angezeigt. Der
 * Ersteller merkte das bisher erst beim Spielen.
 *
 * Geprüft wird durch Laden **als Bild**, nicht per `fetch()`: `fetch`
 * unterliegt CORS und würde Bilder als kaputt melden, die der Player als
 * `<img>` problemlos anzeigt. Ohne `crossOrigin` und mit der Referrer-Policy
 * des Dokuments gelten hier dieselben Ladebedingungen wie im Player — was
 * hier lädt, lädt auch beim Spielen.
 *
 * Das Ergebnis ist reiner Anzeige-Zustand und wird nie gespeichert.
 */

export const IMAGE_CHECK_DEBOUNCE_MS = 450;

type CheckState =
  | { url: string; status: "loading" }
  | { url: string; status: "ok" }
  | { url: string; status: "error" };

export function ImageUrlPreview({ url }: { url: string }) {
  const candidate = url.trim();
  const checkable = candidate.startsWith("https://") && candidate.length > "https://".length;

  const [state, setState] = useState<CheckState | null>(null);
  // Die beim Öffnen vorhandene Adresse wird sofort geprüft, jede spätere
  // Eingabe entprellt — sonst geht jeder Tastendruck an einen fremden Server.
  const isFirstCheck = useRef(true);

  useEffect(() => {
    if (!checkable) {
      isFirstCheck.current = false;
      return;
    }

    let cancelled = false;
    let image: HTMLImageElement | null = null;
    const delay = isFirstCheck.current ? 0 : IMAGE_CHECK_DEBOUNCE_MS;
    isFirstCheck.current = false;

    const timer = setTimeout(() => {
      setState({ url: candidate, status: "loading" });
      image = new Image();
      // Eine ältere, noch laufende Prüfung darf das Ergebnis einer neueren
      // nicht überschreiben — der Cleanup setzt `cancelled`.
      image.onload = () => {
        if (!cancelled) setState({ url: candidate, status: "ok" });
      };
      image.onerror = () => {
        if (!cancelled) setState({ url: candidate, status: "error" });
      };
      image.src = candidate;
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [candidate, checkable]);

  if (!checkable) return null;

  // Solange die Prüfung der aktuellen Adresse aussteht (Entprellung oder
  // Laden), gilt „wird geprüft" — nie das Ergebnis einer früheren Adresse.
  const status = state && state.url === candidate ? state.status : "loading";

  return (
    <div data-testid="image-url-preview" data-status={status}>
      {status === "loading" && (
        <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" aria-hidden="true" />
          <span>Bild wird geprüft…</span>
        </div>
      )}

      {status === "ok" && (
        // eslint-disable-next-line @next/next/no-img-element -- beliebige fremde Hosts, next/image bräuchte eine Host-Liste
        <img
          src={candidate}
          alt=""
          className="block max-w-full max-h-48 w-auto h-auto object-contain rounded-md border border-border"
        />
      )}

      {status === "error" && (
        <Alert variant="destructive" className="font-body">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          <AlertTitle className="font-body text-sm font-semibold text-foreground">Unter dieser Adresse ist kein Bild.</AlertTitle>
          <AlertDescription className="text-foreground">
            So bleibt die Stelle im Spiel leer. Oft ist das die Adresse der Webseite, nicht die des Bildes. Öffne das
            Bild, drücke lange darauf (am Computer: Rechtsklick) und wähle „Bildadresse kopieren“.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
