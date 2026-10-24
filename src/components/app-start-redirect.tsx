"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isStandalone } from "@/hooks/use-install-prompt";
import { ROUTES } from "@/lib/app-nav";

/**
 * Wurde das Dokument selbst unter dieser Adresse geladen?
 *
 * Der Navigation-Timing-Eintrag beschreibt den ersten Dokument-Ladevorgang des
 * Tabs und ändert sich bei Client-Navigationen von Next.js nicht. Startet die
 * installierte App auf `/app` und der Nutzer tippt im Menü „Über", steht dort
 * weiter `/app`; startet sie auf `/`, steht dort `/`.
 *
 * Ohne Eintrag (sehr alte Browser) `false`: Eine ausbleibende Weiterleitung
 * zeigt die Landingpage, eine falsche würde den Nutzer aus „Über" werfen.
 */
export function wasDocumentLoadedAt(pathname: string): boolean {
  try {
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (!entry?.name) return false;
    return new URL(entry.name).pathname === pathname;
  } catch {
    return false;
  }
}

/**
 * Startweiche für die installierte App (PROJ-16).
 *
 * Seit PROJ-16 liegt auf `/` die Landingpage, das Manifest startet auf `/app`.
 * Diese Weiche ist das Sicherheitsnetz für zwei Fälle, in denen die installierte
 * App trotzdem auf `/` startet: Installationen von vor dem Umzug, und iPhones,
 * die beim „Zum Home-Bildschirm" die gerade offene Seite statt `start_url`
 * speichern (am Gerät nicht geklärt).
 *
 * Greift nur, wenn beides zutrifft: Die Seite läuft als installierte App
 * (dieselbe Prüfung wie der Installations-Hinweis, keine zweite Erkennung) und
 * das Dokument wurde unter `/` geladen. Im Browser tut sie nichts; eine
 * Menü-Navigation zu „Über" in der App lässt die Landingpage stehen.
 *
 * `replace` statt `push`: Sonst führt „Zurück" auf Android nach `/`, und die
 * Weiche schickt sofort wieder nach `/app`.
 */
export function AppStartRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (isStandalone() && wasDocumentLoadedAt(ROUTES.home)) {
      router.replace(ROUTES.app);
    }
  }, [router]);

  return null;
}
