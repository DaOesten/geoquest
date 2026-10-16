import { PhoneFrame } from "@/components/phone-frame";

/**
 * Die Quest-Simulation im Handy auf /about (PROJ-13, Refinement 13).
 *
 * Ein iframe auf /about/simulation statt der Komponenten direkt in der Seite:
 * Die Player-Screens rechnen mit dem Viewport (`clamp(…, 11vw, …)`,
 * `min-h-[100dvh]`, `fixed` positioniertes Konfetti). Im iframe ist der
 * Viewport der Handy-Bildschirm — die Screens verhalten sich wie auf einem
 * echten Gerät.
 *
 * Keine `scale()`-Verkleinerung, damit Tap-Ziele 44px bleiben. Stattdessen ist
 * der Bildschirm höchstens 320px breit und wird auf sehr schmalen Geräten
 * (unter 375px) so breit wie der Platz erlaubt — die App passt sich an, statt
 * kleiner gezeichnet zu werden.
 */
export function AboutSimulationPhone() {
  return (
    <PhoneFrame className="w-full max-w-[334px] lg:w-[334px]">
      <div className="relative h-[620px]">
        {/* Liegt unter dem iframe: Solange es lädt oder falls es blockiert
            ist, steht hier ein ruhiger Hinweis statt einer leeren Fläche. */}
        <p className="absolute inset-0 grid place-items-center px-8 text-center font-body text-sm text-muted-foreground">
          Die Simulation wird geladen …
        </p>
        <iframe
          src="/about/simulation"
          title="Simulation einer Quest: Das Waldgeheimnis"
          loading="lazy"
          className="relative block h-full w-full border-0 bg-transparent"
        />
      </div>
    </PhoneFrame>
  );
}
