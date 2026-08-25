"use client";

import { Check, Lock, Navigation } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Progress } from "@/components/ui/progress";
import type { Station } from "@/lib/quest-schema";
import type { StationStatus } from "@/hooks/use-quest-progress";

interface StationListProps {
  questName: string;
  stations: Station[];
  getStatus: (station: Station, index: number) => StationStatus;
  visitedCount: number;
  onNavigate: (index: number) => void;
  onBack: () => void;
}

export function StationList({
  questName,
  stations,
  getStatus,
  visitedCount,
  onNavigate,
  onBack,
}: StationListProps) {
  const progressPercent = stations.length > 0 ? (visitedCount / stations.length) * 100 : 0;

  return (
    <>
      <AppHeader title={questName} backHref="/play" />
      <div className="px-5 pt-3 pb-2 flex flex-col gap-1">
        <Progress value={progressPercent} className="h-2" />
        <span className="text-tech text-[9px] tracking-[0.12em] text-gq-grey">
          Ziel {Math.min(visitedCount + 1, stations.length)} von {stations.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 px-5 py-3 pb-8">
        {stations.map((station, index) => {
          const status = getStatus(station, index);
          return (
            <StationRow
              key={station.id}
              station={station}
              index={index}
              status={status}
              onNavigate={() => onNavigate(index)}
            />
          );
        })}
      </div>
    </>
  );
}

interface StationRowProps {
  station: Station;
  index: number;
  status: StationStatus;
  onNavigate: () => void;
}

function StationRow({ station, index, status, onNavigate }: StationRowProps) {
  const isCurrent = status === "current";
  const isVisited = status === "visited";
  const isLocked = status === "locked";

  return (
    <button
      onClick={isCurrent ? onNavigate : undefined}
      disabled={isLocked}
      className={`
        flex items-center gap-3 w-full text-left rounded-card border transition-all duration-base ease-gq
        ${isCurrent
          ? "p-4 border-gq-teal bg-gq-teal/[0.08] card-glow-teal"
          : "p-3 border-border bg-card shadow-card"
        }
        ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isVisited ? "hover:border-gq-grey-dark" : ""}
      `}
      aria-label={
        isLocked
          ? `${station.name} — gesperrt`
          : isCurrent
            ? `Navigation zu ${station.name} starten`
            : `${station.name} — besucht`
      }
    >
      <span
        className={`
          w-9 h-9 flex-shrink-0 grid place-items-center rounded-pill text-tech text-[13px]
          ${isVisited ? "bg-gq-lime text-[#1B2200]" : ""}
          ${isCurrent ? "bg-gq-teal text-gq-black" : ""}
          ${isLocked ? "border-2 border-border text-gq-grey-dark" : ""}
        `}
      >
        {isVisited && <Check className="w-[17px] h-[17px]" />}
        {isCurrent && <span>{index + 1}</span>}
        {isLocked && <Lock className="w-[15px] h-[15px]" />}
      </span>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="text-display text-lg truncate">
          {station.name}
        </span>
        <span className="text-tech text-[9px] tracking-[0.12em] text-gq-grey">
          {station.modules.length} {station.modules.length === 1 ? "Modul" : "Module"}
        </span>
      </div>

      {isCurrent && (
        <span className="flex-shrink-0 w-10 h-10 grid place-items-center rounded-pill bg-gq-teal/20">
          <Navigation className="w-5 h-5 text-gq-teal" />
        </span>
      )}
    </button>
  );
}
