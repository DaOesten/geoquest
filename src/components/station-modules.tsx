"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { Station, Module } from "@/lib/quest-schema";
import { AppHeader } from "./app-header";
import { TextModule } from "./modules/text-module";
import { ImageModule } from "./modules/image-module";
import { AudioModule } from "./modules/audio-module";
import { VideoModule } from "./modules/video-module";
import { CodeTask } from "./modules/code-task";
import { MultipleChoiceTask } from "./modules/multiple-choice-task";
import { SortingTask } from "./modules/sorting-task";

// Randomized particle positions must never be part of the SSR/hydration diff.
const QuestListBackdrop = dynamic(
  () => import("./quest-list-backdrop").then((m) => m.QuestListBackdrop),
  { ssr: false }
);

interface StationModulesProps {
  station: Station;
  stationIndex: number;
  totalStations: number;
  solvedTasks: number[];
  onSolveTask: (moduleIndex: number) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function StationModules({
  station,
  stationIndex,
  totalStations,
  solvedTasks,
  onSolveTask,
  onComplete,
  onBack,
}: StationModulesProps) {
  const taskIndices = useMemo(
    () => station.modules
      .map((m, i) => (m.type === "task" ? i : -1))
      .filter((i) => i !== -1),
    [station.modules]
  );

  const unsolvedCount = taskIndices.filter((i) => !solvedTasks.includes(i)).length;
  const allTasksSolved = unsolvedCount === 0;

  return (
    <div className="relative flex flex-col min-h-dvh">
      <QuestListBackdrop />

      <div className="relative">
        <AppHeader onBack={onBack} transparent />

        <div className="px-5 pt-3">
          <span className="text-tech text-[10px] text-gq-teal">Stationsinhalte</span>
          <h1 className="font-display italic text-[clamp(1.8rem,8vw,2.4rem)] leading-[0.96] uppercase text-foreground mt-1">
            {station.name}
          </h1>
          <div className="flex items-center gap-2 mt-2.5 text-tech text-[10px] text-gq-grey">
            <span>
              Ziel {stationIndex + 1} von {totalStations}
            </span>
          </div>
          <div className="h-px bg-border mt-4" />
        </div>
      </div>

      {/* Module list */}
      <div className="relative flex-1 px-5 pt-4.5 pb-8 space-y-5">
        {station.modules.map((module, i) => (
          <ModuleRenderer
            key={i}
            module={module}
            moduleIndex={i}
            solved={solvedTasks.includes(i)}
            onSolved={() => onSolveTask(i)}
          />
        ))}

        {/* Complete button */}
        <div className="pt-4">
          <button
            onClick={onComplete}
            disabled={!allTasksSolved}
            className={`w-full h-14 rounded-pill font-tech text-sm uppercase tracking-[0.1em] font-bold transition-all duration-fast active:scale-[0.96] ${
              allTasksSolved
                ? "bg-gq-teal text-gq-black shadow-glow-strong hover:bg-gq-teal-hover"
                : "bg-[#2B3438] text-[#5B646A] cursor-not-allowed"
            }`}
          >
            {allTasksSolved ? "Station abschließen" : `Noch ${unsolvedCount} ${unsolvedCount === 1 ? "Aufgabe" : "Aufgaben"} offen`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModuleRenderer({
  module,
  moduleIndex,
  solved,
  onSolved,
}: {
  module: Module;
  moduleIndex: number;
  solved: boolean;
  onSolved: () => void;
}) {
  switch (module.type) {
    case "text":
      return <TextModule content={module.content} />;
    case "image":
      return <ImageModule url={module.url} caption={module.caption} />;
    case "audio":
      return <AudioModule url={module.url} caption={module.caption} />;
    case "video":
      return <VideoModule url={module.url} caption={module.caption} />;
    case "task":
      return <TaskRenderer module={module} moduleIndex={moduleIndex} solved={solved} onSolved={onSolved} />;
  }
}

function TaskRenderer({
  module,
  moduleIndex,
  solved,
  onSolved,
}: {
  module: Extract<Module, { type: "task" }>;
  moduleIndex: number;
  solved: boolean;
  onSolved: () => void;
}) {
  void moduleIndex;
  switch (module.taskType) {
    case "code":
      return <CodeTask question={module.question} answer={module.answer} solved={solved} onSolved={onSolved} />;
    case "multiple-choice":
      return (
        <MultipleChoiceTask
          question={module.question}
          options={module.options}
          correctIndices={module.correctIndices}
          solved={solved}
          onSolved={onSolved}
        />
      );
    case "sorting":
      return <SortingTask question={module.question} items={module.items} solved={solved} onSolved={onSolved} />;
  }
}
