"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  INSTALL_HINT_DISMISS_MS,
  INSTALL_HINT_STORAGE_KEY,
} from "@/lib/app-nav";
import {
  FIRST_VISIT_DONE_EVENT,
  FIRST_VISIT_STORAGE_KEY,
} from "@/components/first-visit-dialog";

/**
 * Das Chrome/Android-Ereignis, das den nativen Installationsdialog anbietet.
 * Steht in keiner Standard-Typdefinition — Safari und Firefox kennen es nicht.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Welcher Installationsweg steht zur Verfügung?
 *
 * - `none`    — kein Weg, der Hinweis erscheint nicht
 * - `prompt`  — Android/Chrome: nativer Dialog per Knopfdruck
 * - `ios`     — iOS Safari: kein programmatischer Weg, nur die Anleitung
 *               „Teilen → Zum Home-Bildschirm"
 */
export type InstallMethod = "none" | "prompt" | "ios";

export interface UseInstallPromptReturn {
  /** Darf der Hinweis jetzt erscheinen? Alle vier Bedingungen erfüllt. */
  shouldShow: boolean;
  method: InstallMethod;
  /** Öffnet den nativen Dialog (nur bei `method === "prompt"`). */
  promptInstall: () => Promise<void>;
  /** Wegklicken — schweigt danach 30 Tage. */
  dismiss: () => void;
}

/**
 * Läuft die App bereits installiert (Homescreen-Start, keine Adressleiste)?
 *
 * `display-mode: standalone` ist der Standardweg; `navigator.standalone` ist
 * Apples älterer, nicht standardisierter Weg, den ältere iOS-Versionen als
 * einziges Signal liefern.
 */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
    // iOS bis einschließlich der Versionen, die `display-mode` nicht melden.
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) {
      return true;
    }
  } catch {
    // matchMedia kann in exotischen Umgebungen fehlen — dann gilt "nicht
    // installiert", und der Hinweis erscheint im Zweifel einmal zu viel statt
    // nie.
  }

  return false;
}

/**
 * Echte iOS-Erkennung — **bewusst an mehreren Signalen zugleich**.
 *
 * Direkte Lehre aus BUG-6 (PROJ-3, 2026-09-07): Dort schloss `isIOS()` allein
 * aus der Existenz von `DeviceOrientationEvent.requestPermission` auf iOS und
 * lag auf Desktop-Chrome falsch — der Spieler bekam einen Button angeboten, der
 * garantiert fehlschlug. Ein einzelnes Merkmal genügt hier nicht.
 *
 * Geprüft wird deshalb die Plattform-Kennung **und** dass es sich um Safari
 * handelt: Chrome und Firefox auf iOS benutzen zwar WebKit, bieten aber kein
 * „Zum Home-Bildschirm" an — eine Anleitung dorthin ginge dort ins Leere.
 *
 * iPadOS meldet sich seit iOS 13 als „Macintosh"; `maxTouchPoints > 1` trennt
 * es von einem echten Mac (dort 0).
 *
 * Im Zweifel `false`: Ein ausbleibender Hinweis ist harmlos, eine Anleitung,
 * die auf dem Gerät nicht funktioniert, ist der eigentliche Fehler.
 */
export function isIOSSafari(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;

  const isIPhone = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS = ua.includes("Macintosh") && navigator.maxTouchPoints > 1;
  if (!isIPhone && !isIPadOS) return false;

  // Chrome (CriOS), Firefox (FxiOS), Edge (EdgiOS) und Opera (OPiOS) auf iOS
  // haben kein "Zum Home-Bildschirm". Ebenso In-App-Browser, die sich als
  // solche zu erkennen geben.
  if (/CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV|Line\//.test(ua)) return false;

  // Positiv auf Safari prüfen statt nur die Ausnahmen abzuziehen — ein
  // unbekannter WebKit-Wrapper fällt damit auf "nicht anzeigen".
  return /Safari/.test(ua);
}

/**
 * Steht der Erststart-Dialog (PROJ-1) noch aus?
 *
 * Er hat Vorrang (Edge Case 13): Zwei Aufforderungen auf einem Screen sind eine
 * zu viel, und seine Aussage — dass Quests nur lokal im Browser liegen — ist
 * eine Pflichtinformation, während der Installations-Hinweis ein Angebot ist.
 *
 * Gelesen wird derselbe Schlüssel, den der Dialog schreibt; damit gibt es keine
 * zweite Quelle, die auseinanderlaufen könnte.
 */
export function isFirstVisitPending(): boolean {
  try {
    return !localStorage.getItem(FIRST_VISIT_STORAGE_KEY);
  } catch {
    // Speicher blockiert: Der Dialog erscheint dann bei jedem Besuch (so
    // verhält er sich heute schon) — der Hinweis tritt entsprechend zurück.
    return true;
  }
}

/**
 * Wurde der Hinweis weggeklickt und schweigt noch? (30-Tage-Frist)
 *
 * Ist der Browser-Speicher blockiert oder voll, gilt „nicht weggeklickt" —
 * genauso verhält sich heute schon der Erststart-Dialog (Edge Case 4).
 */
export function isDismissed(now: number = Date.now()): boolean {
  try {
    const raw = localStorage.getItem(INSTALL_HINT_STORAGE_KEY);
    if (!raw) return false;

    const dismissedAt = Number(raw);
    // Kaputter Wert (von Hand geändert, alte Fassung): wie "nie weggeklickt"
    // behandeln, statt dauerhaft zu schweigen.
    if (!Number.isFinite(dismissedAt)) return false;

    return now - dismissedAt < INSTALL_HINT_DISMISS_MS;
  } catch {
    return false;
  }
}

/**
 * Darf der Installations-Hinweis erscheinen — und auf welchem Weg? (PROJ-12)
 *
 * Vier Bedingungen, davon eine zeitabhängig. Als Hook steht die Regel einmal da
 * und ist ohne Browser prüfbar; gebraucht wird sie an zwei Orten (`/` und
 * `/play`).
 *
 *   1. Läuft die App schon installiert?      → nie zeigen
 *   2. Weggeklickt und Frist nicht um?       → nicht zeigen
 *   3. Gibt es überhaupt einen Weg?          → sonst nicht zeigen
 *   4. Hat der Nutzer gerade installiert?    → sofort ausblenden
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  /**
   * "Fuer diese Sitzung erledigt" — gesetzt beim Wegklicken und nach
   * erfolgter Installation. Getrennt von der 30-Tage-Frist im Speicher, damit
   * der Hinweis auch dann sofort verschwindet, wenn `localStorage` blockiert
   * ist (Edge Case 4).
   */
  const [hiddenForSession, setHiddenForSession] = useState(false);
  /** Zählt Wegklicken und Dialog-Schließen — zwingt den Store zum Neulesen. */
  const [revision, setRevision] = useState(0);
  /**
   * Der Erststart-Dialog wurde in dieser Sitzung geschlossen. Nötig zusätzlich
   * zum Speicher-Schlüssel, weil dieser bei blockiertem `localStorage` nie
   * geschrieben wird (siehe `onFirstVisitDone`).
   */
  const [firstVisitDoneThisSession, setFirstVisitDoneThisSession] = useState(false);

  useEffect(() => {
    // Bedingung 3, Android-Zweig. Chrome feuert das Ereignis, sobald Manifest
    // und Service Worker die Installationsbedingungen erfüllen.
    const onBeforeInstallPrompt = (event: Event) => {
      // Verhindert Chromes eigenen Mini-Infobar — der Hinweis der App tritt an
      // seine Stelle und lässt sich wegklicken.
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
    };

    // Bedingung 4: Wurde die App gerade installiert, verschwindet der Hinweis
    // sofort, ohne dass der Nutzer ihn zusätzlich wegklicken muss.
    const onInstalled = () => {
      setDeferredEvent(null);
      setHiddenForSession(true);
    };

    /**
     * Der Erststart-Dialog meldet sein Schließen, damit der Hinweis ohne
     * Neuladen nachrückt (Edge Case 13).
     *
     * Das Ereignis gilt als Beweis für sich und wird nicht gegen den Speicher
     * gegengeprüft: Bei blockiertem `localStorage` schreibt der Dialog seinen
     * Schlüssel nicht, `isFirstVisitPending()` bliebe dauerhaft `true` — und
     * der Hinweis erschiene in dieser Sitzung nie, obwohl der Dialog längst
     * weg ist.
     */
    const onFirstVisitDone = () => {
      setFirstVisitDoneThisSession(true);
      setRevision((r) => r + 1);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener(FIRST_VISIT_DONE_EVENT, onFirstVisitDone);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener(FIRST_VISIT_DONE_EVENT, onFirstVisitDone);
    };
  }, []);

  /**
   * Anzeigemodus, 30-Tage-Frist und Erststart-Dialog werden aus der Umgebung
   * gelesen, nicht in React gehalten — `useSyncExternalStore` statt `useState`
   * im Effekt (gleiches Muster wie `FirstVisitDialog`).
   *
   * Der Server-Snapshot ist bewusst `false`: Er kennt weder Anzeigemodus noch
   * `localStorage`. Würde hier geraten, wäre die Abweichung ein
   * Hydration-Fehler.
   */
  const environmentAllows = useSyncExternalStore(
    // Die Quellen melden sich nicht von selbst; das Neulesen stößt `revision`
    // an. `subscribe` muss trotzdem eine Funktion zurückgeben.
    useCallback(() => () => {}, []),
    useCallback(
      () =>
        !isStandalone() &&
        !isDismissed() &&
        (firstVisitDoneThisSession || !isFirstVisitPending()),
      [revision, firstVisitDoneThisSession]
    ),
    () => false
  );

  /**
   * Die Plattform-Erkennung läuft ebenfalls über den Store, nicht über einen
   * Effekt: Der Server hat keinen User-Agent des Besuchers, der Snapshot dort
   * ist deshalb `false`. Auf dem Client ist der Wert über die Lebensdauer der
   * Seite konstant — `subscribe` hat nichts zu melden.
   */
  const isIOSSafariClient = useSyncExternalStore(
    useCallback(() => () => {}, []),
    isIOSSafari,
    () => false
  );

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(INSTALL_HINT_STORAGE_KEY, String(Date.now()));
    } catch {
      // Speicher blockiert oder voll: Der Hinweis verschwindet für diese
      // Sitzung und kann beim nächsten Besuch erneut erscheinen (Edge Case 4).
      // `hiddenForSession` sorgt dafür, dass er trotzdem sofort verschwindet.
    }
    setHiddenForSession(true);
    setRevision((r) => r + 1);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return;

    try {
      await deferredEvent.prompt();
      await deferredEvent.userChoice;
    } catch {
      // Der Dialog lässt sich pro Ereignis nur einmal öffnen; ein zweiter
      // Aufruf wirft. Für den Nutzer ändert das nichts — der Hinweis
      // verschwindet so oder so.
    }

    // Auch bei Abbruch als weggeklickt behandeln (Edge Case 3): Wer aktiv
    // abbricht, hat eine Entscheidung getroffen. Ihn im selben Besuch erneut zu
    // fragen wäre aufdringlich.
    setDeferredEvent(null);
    dismiss();
  }, [deferredEvent, dismiss]);

  /**
   * Android hat Vorrang vor der iOS-Anleitung: Wo ein echter Dialog existiert,
   * ist eine Handanleitung der schlechtere Weg.
   *
   * `method` beschreibt nur den *Weg* und bleibt deshalb auch dann gesetzt,
   * wenn der Hinweis gerade nicht erscheinen darf — `shouldShow` entscheidet
   * darüber getrennt. Das macht die beiden Fragen einzeln testbar.
   */
  const method: InstallMethod = deferredEvent
    ? "prompt"
    : isIOSSafariClient
      ? "ios"
      : "none";

  return {
    // `environmentAllows` deckt Anzeigemodus, 30-Tage-Frist und den Vorrang des
    // Erststart-Dialogs ab (Edge Case 13) — der Hinweis verschwindet dadurch
    // nicht, er wartet.
    shouldShow: environmentAllows && !hiddenForSession && method !== "none",
    method,
    promptInstall,
    dismiss,
  };
}
