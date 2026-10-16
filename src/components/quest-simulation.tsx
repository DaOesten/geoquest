"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Footprints } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { DirectionArrow } from "@/components/direction-arrow";
import { IntroScreen } from "@/components/intro-screen";
import { ArrivalOverlay } from "@/components/navigation-screen";
import { OutroScreen } from "@/components/outro-screen";
import { StationList } from "@/components/station-list";
import { StationModules } from "@/components/station-modules";
import { buildDemoQuest } from "@/lib/about-demo-quest";
import { getDistanceColor } from "@/lib/geo-utils";
import { SimulationContext } from "@/lib/simulation-context";
import type { Station } from "@/lib/quest-schema";
import type { StationStatus } from "@/hooks/use-quest-progress";

type Screen =
  | { kind: "intro" }
  | { kind: "list" }
  | { kind: "walk"; index: number }
  | { kind: "arrival"; index: number }
  | { kind: "modules"; index: number }
  | { kind: "outro" };

/**
 * Startentfernung je Station. So gewählt, dass in rund 3 Sekunden jeder Meter
 * einzeln sichtbar herunterzählt (~50 ms je Meter) — bei 120 m sprang die
 * Anzeige in großen Schritten und wirkte unruhig statt wie Laufen
 * (Betreiber-Befund 2026-10-16). Alle knapp über 50 m, damit jede Station
 * beide Zustände zeigt: „Zur nächsten Station" (Lime), in der letzten Sekunde
 * „Du bist fast da" (Teal).
 */
const START_DISTANCE = [60, 55, 65];
/** So lange zählt „Hinlaufen" herunter (Spec: rund 3 Sekunden). */
const WALK_MS = 3000;
/** Feste Peilung je Station, damit der Pfeil nicht immer gleich steht. */
const ARROW_ROTATION = [22, -35, 48];

const COLOR_MAP = {
  red: "text-destructive",
  yellow: "text-gq-lime",
  green: "text-gq-teal",
} as const;

/**
 * Quest-Simulation auf /about (PROJ-13, Refinement 13) — läuft im iframe der
 * Route /about/simulation.
 *
 * Bildet den Ablauf von `QuestPlayer` nach, mit den ECHTEN Screens für Start,
 * Stationsliste, Ankunft, Stationsinhalte und Ende. Anders als dort:
 * - kein `useQuestProgress` — der schreibt `gq_progress_*` in localStorage;
 *   der Fortschritt lebt hier nur im State
 * - kein `NavigationScreen` — der fragt nach GPS und Sensor. Der Kompass wird
 *   mit `DirectionArrow` nachgestellt, „Hinlaufen" zählt die Entfernung herunter
 * - `SimulationContext` blendet das Burger-Menü aus, und die Stationsliste
 *   führt zurück zum Start statt nach /play: Nichts verlässt die Simulation
 */
export function QuestSimulation() {
  // Die Origin erst im Browser lesen; `buildDemoQuest` braucht sie nur für die
  // Bild-Adresse von Station 2.
  const [origin, setOrigin] = useState("");
  // eslint-disable-next-line react-hooks/set-state-in-effect -- einmaliges Lesen der Origin
  useEffect(() => setOrigin(window.location.origin), []);
  const quest = useMemo(() => buildDemoQuest(origin), [origin]);

  const [screen, setScreen] = useState<Screen>({ kind: "intro" });
  const [completed, setCompleted] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [solved, setSolved] = useState<Record<string, number[]>>({});

  const restart = () => {
    setCompleted([]);
    setVisited([]);
    setSolved({});
    setScreen({ kind: "intro" });
  };

  // Dieselbe Regel wie `useQuestProgress.getStationStatus`.
  const getStatus = (station: Station, index: number): StationStatus => {
    if (completed.includes(station.id)) return "completed";
    if (visited.includes(station.id)) return "visited";
    const firstOpen = quest.stations.findIndex((s) => !completed.includes(s.id));
    return index === firstOpen ? "current" : "locked";
  };

  let content: React.ReactNode;
  switch (screen.kind) {
    case "intro":
      content = <IntroScreen quest={quest} onStart={() => setScreen({ kind: "list" })} />;
      break;

    case "list":
      content = (
        <StationList
          questName={quest.name}
          stations={quest.stations}
          getStatus={getStatus}
          onNavigate={(index) => setScreen({ kind: "walk", index })}
          onOpenModules={(index) => setScreen({ kind: "modules", index })}
          onBack={() => setScreen({ kind: "intro" })}
        />
      );
      break;

    case "walk":
      content = (
        <SimulatedNavigation
          key={screen.index}
          station={quest.stations[screen.index]}
          stationIndex={screen.index}
          totalStations={quest.stations.length}
          onArrived={() => {
            const id = quest.stations[screen.index].id;
            setVisited((v) => (v.includes(id) ? v : [...v, id]));
            setScreen({ kind: "arrival", index: screen.index });
          }}
          onBack={() => setScreen({ kind: "list" })}
        />
      );
      break;

    case "arrival":
      content = (
        <ArrivalOverlay
          stationName={quest.stations[screen.index].name}
          onContinue={() => setScreen({ kind: "modules", index: screen.index })}
        />
      );
      break;

    case "modules": {
      const station = quest.stations[screen.index];
      const isLast = screen.index === quest.stations.length - 1;
      content = (
        <StationModules
          station={station}
          stationIndex={screen.index}
          totalStations={quest.stations.length}
          solvedTasks={solved[station.id] ?? []}
          onSolveTask={(moduleIndex) =>
            setSolved((s) => ({
              ...s,
              [station.id]: [...(s[station.id] ?? []), moduleIndex],
            }))
          }
          onComplete={() => {
            setCompleted((c) => (c.includes(station.id) ? c : [...c, station.id]));
            setScreen(isLast ? { kind: "outro" } : { kind: "list" });
          }}
          onBack={() => setScreen({ kind: "list" })}
          readOnly={completed.includes(station.id)}
        />
      );
      break;
    }

    case "outro":
      content = (
        <OutroScreen
          quest={quest}
          completedCount={completed.length}
          totalCount={quest.stations.length}
          onDone={restart}
        />
      );
      break;
  }

  return (
    <SimulationContext.Provider value={true}>
      {/* `key` setzt bei jedem Screen-Wechsel den Scroll-Zustand und die
          Einblend-Animationen zurück — wie ein echter Seitenwechsel. */}
      <div key={`${screen.kind}-${"index" in screen ? screen.index : ""}`}>{content}</div>
    </SimulationContext.Provider>
  );
}

/**
 * Nachgestellter Navigations-Screen: dieselbe Aufteilung wie
 * `NavigationScreen` (Kopfzeile, „Ziel X von Y", Pfeil, Entfernung), aber ohne
 * GPS. „Hinlaufen" zählt die Entfernung in rund drei Sekunden auf 0 herunter.
 */
function SimulatedNavigation({
  station,
  stationIndex,
  totalStations,
  onArrived,
  onBack,
}: {
  station: Station;
  stationIndex: number;
  totalStations: number;
  onArrived: () => void;
  onBack: () => void;
}) {
  const start = START_DISTANCE[stationIndex] ?? 100;
  const [distance, setDistance] = useState(start);
  const [walking, setWalking] = useState(false);
  // In einer Ref, damit ein neues `onArrived` der Elternkomponente das
  // laufende Herunterzählen nicht neu startet.
  const arrived = useRef(onArrived);
  useEffect(() => {
    arrived.current = onArrived;
  }, [onArrived]);

  useEffect(() => {
    if (!walking) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      arrived.current();
      return;
    }
    // Timer statt `requestAnimationFrame`: Browser drosseln oder pausieren
    // Animations-Frames in eingebetteten Fenstern (Stromsparmodus, Fokus
    // verloren), der Zähler lief dann unkontrolliert länger. Der Stand wird
    // aus der tatsächlich vergangenen Zeit berechnet, nicht aus der Zahl der
    // Ticks — ein verspäteter Tick holt auf, statt die Dauer zu dehnen.
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - t0) / WALK_MS);
      setDistance(Math.round(start * (1 - progress)));
      if (progress >= 1) {
        window.clearInterval(id);
        arrived.current();
      }
    }, WALK_MS / start);
    return () => window.clearInterval(id);
  }, [walking, start]);

  const isNear = distance <= 50;

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <AppHeader title={station.name} onBack={onBack} />

      <div className="px-5 pt-2">
        <span className="text-tech text-[9px] tracking-[0.12em] text-gq-grey">
          Ziel {stationIndex + 1} von {totalStations}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5 pb-8">
        <DirectionArrow rotation={ARROW_ROTATION[stationIndex] ?? 0} isNear={isNear} />

        <div className="text-center" aria-live="polite">
          <div
            className={`font-display italic text-[64px] leading-none ${COLOR_MAP[getDistanceColor(distance)]}`}
          >
            {distance}
            <span className="text-[26px] ml-1">m</span>
          </div>
          <div className="mt-1 text-tech text-[11px] tracking-[0.16em] text-gq-grey uppercase">
            {isNear ? "Du bist fast da" : "Zur nächsten Station"}
          </div>
        </div>

        {/* Ersetzt in der Simulation das echte Laufen. Teal-Pill wie die
            übrigen Haupt-Aktionen des Players. */}
        <button
          type="button"
          onClick={() => setWalking(true)}
          disabled={walking}
          className="flex items-center justify-center gap-2 h-12 px-7 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96] disabled:opacity-60"
        >
          <Footprints className="w-4 h-4" />
          {walking ? "Unterwegs …" : "Hinlaufen"}
        </button>
      </div>
    </div>
  );
}
