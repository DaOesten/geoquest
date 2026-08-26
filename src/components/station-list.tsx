"use client";

import { Check, Lock, Navigation, BookOpen } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import type { Station } from "@/lib/quest-schema";
import type { StationStatus } from "@/hooks/use-quest-progress";

interface StationListProps {
  questName: string;
  stations: Station[];
  getStatus: (station: Station, index: number) => StationStatus;
  completedCount: number;
  onNavigate: (index: number) => void;
  onOpenModules: (index: number) => void;
  onBack: () => void;
}

export function StationList({
  questName,
  stations,
  getStatus,
  onNavigate,
  onOpenModules,
}: StationListProps) {
  return (
    <>
      <style>{`
        @keyframes gq-slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <AppHeader title={questName} backHref="/play" />

      <div className="flex flex-col gap-3 px-5 pt-4 pb-10">
        {stations.map((station, index) => {
          const status = getStatus(station, index);
          return (
            <div
              key={station.id}
              style={{
                animation: `gq-slide-up 0.4s cubic-bezier(.16,.84,.44,1) ${index * 0.08}s both`,
              }}
            >
              <StationRow
                station={station}
                index={index}
                status={status}
                onNavigate={() => onNavigate(index)}
                onOpenModules={() => onOpenModules(index)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

const cardStyles: Record<StationStatus, React.CSSProperties> = {
  completed: {
    background: "#0E1F24",
    border: "1px solid rgba(198,255,0,0.15)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
  },
  visited: {
    background: "#0E1F24",
    border: "1px solid rgba(0,224,209,0.25)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
  },
  current: {
    background: "rgba(0,224,209,0.06)",
    border: "1px solid #00E0D1",
    boxShadow: "0 0 0 1px rgba(0,224,209,0.33), 0 0 24px rgba(0,224,209,0.27), 0 14px 32px rgba(0,0,0,0.55)",
  },
  locked: {
    background: "#0E1F24",
    border: "1px solid rgba(160,167,173,0.22)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.45)",
    opacity: 0.4,
  },
};

const badgeStyles: Record<StationStatus, React.CSSProperties> = {
  completed: {
    background: "#C6FF00",
    boxShadow: "0 0 12px rgba(198,255,0,0.4)",
  },
  visited: {
    background: "rgba(0,224,209,0.2)",
    border: "2px solid #00E0D1",
  },
  current: {
    background: "#00E0D1",
    boxShadow: "0 0 16px rgba(0,224,209,0.5)",
    animation: "gq-pulse 2.5s ease-in-out infinite",
  },
  locked: {
    background: "#0E1F24",
    border: "2px solid rgba(160,167,173,0.2)",
  },
};

const badgeTextColor: Record<StationStatus, string> = {
  completed: "#0B0F12",
  visited: "#00E0D1",
  current: "#0B0F12",
  locked: "rgba(160,167,173,0.5)",
};

const iconBgStyles: Record<string, React.CSSProperties> = {
  nav: { background: "rgba(0,224,209,0.15)", border: "2px solid #00E0D1" },
  book: { background: "rgba(0,224,209,0.1)" },
  check: { background: "rgba(198,255,0,0.1)" },
  lock: {},
};

interface StationRowProps {
  station: Station;
  index: number;
  status: StationStatus;
  onNavigate: () => void;
  onOpenModules: () => void;
}

function StationRow({ station, index, status, onNavigate, onOpenModules }: StationRowProps) {
  const isCompleted = status === "completed";
  const isVisited = status === "visited";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  const handleClick = () => {
    if (isCurrent) onNavigate();
    else if (isVisited) onOpenModules();
  };

  const iconType = isCurrent ? "nav" : isVisited ? "book" : isCompleted ? "check" : "lock";

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      style={{
        ...cardStyles[status],
        borderRadius: 16,
        padding: "14px 16px",
        cursor: isLocked ? "not-allowed" : "pointer",
        transition: "all 180ms cubic-bezier(.16,.84,.44,1)",
      }}
      className="flex items-center gap-5 w-full text-left"
      aria-label={
        isLocked
          ? `${station.name} — gesperrt`
          : isCurrent
            ? `Navigation zu ${station.name} starten`
            : isVisited
              ? `${station.name} — Aufgaben fortsetzen`
              : `${station.name} — abgeschlossen`
      }
    >
      {/* Number badge */}
      <div
        style={{
          ...badgeStyles[status],
          width: 40,
          height: 40,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        <span
          className="text-display"
          style={{ fontSize: 18, color: badgeTextColor[status] }}
        >
          {index + 1}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span
          className="text-display truncate block"
          style={{
            fontSize: 17,
            lineHeight: 1.1,
            color: isLocked ? "rgba(160,167,173,0.5)" : "#FFFFFF",
          }}
        >
          {station.name}
        </span>
        {isCompleted && (
          <span
            className="text-tech block"
            style={{ fontSize: 9, letterSpacing: "0.12em", color: "#C6FF00", marginTop: 4 }}
          >
            Abgeschlossen
          </span>
        )}
      </div>

      {/* Right icon */}
      <span
        style={{
          ...iconBgStyles[iconType],
          width: 40,
          height: 40,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
        }}
      >
        {isCurrent && <Navigation style={{ width: 20, height: 20, color: "#00E0D1" }} />}
        {isVisited && <BookOpen style={{ width: 18, height: 18, color: "#00E0D1" }} />}
        {isCompleted && <Check style={{ width: 18, height: 18, color: "#C6FF00" }} />}
        {isLocked && <Lock style={{ width: 16, height: 16, color: "rgba(160,167,173,0.5)" }} />}
      </span>
    </button>
  );
}
