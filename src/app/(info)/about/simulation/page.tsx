import type { Metadata } from "next";
import { QuestSimulation } from "@/components/quest-simulation";

/**
 * Die Quest-Simulation, eingebettet als iframe in /about (PROJ-13,
 * Refinement 13).
 *
 * Eigene Route statt direkt in der Seite: Die Player-Screens rechnen mit dem
 * Viewport (`vw`, `dvh`, `fixed`). Im iframe ist der Viewport das Handy, und
 * die Screens verhalten sich wie auf einem echten Gerät, ohne umgebaut zu
 * werden. Keine eigenständige Seite — deshalb `noindex` und in keiner
 * Navigation.
 */
export const metadata: Metadata = {
  title: "Quest-Simulation",
  robots: { index: false, follow: false },
};

export default function SimulationPage() {
  return (
    <div data-theme="dark" className="min-h-dvh bg-background text-foreground">
      <QuestSimulation />
    </div>
  );
}
