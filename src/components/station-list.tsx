"use client";

import { useLayoutEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Check, Lock, Navigation, BookOpen } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import type { Station } from "@/lib/quest-schema";
import type { StationStatus } from "@/hooks/use-quest-progress";
import { haversine } from "@/lib/geo-utils";

// Randomized particle positions must never be part of the SSR/hydration diff.
const QuestListBackdrop = dynamic(
  () => import("@/components/quest-list-backdrop").then((m) => m.QuestListBackdrop),
  { ssr: false }
);

interface StationListProps {
  questName: string;
  stations: Station[];
  getStatus: (station: Station, index: number) => StationStatus;
  onNavigate: (index: number) => void;
  onOpenModules: (index: number) => void;
}

function totalRouteKm(stations: Station[]): number {
  let meters = 0;
  for (let i = 1; i < stations.length; i++) {
    meters += haversine(stations[i - 1].lat, stations[i - 1].lng, stations[i].lat, stations[i].lng);
  }
  return meters / 1000;
}

export function StationList({
  questName,
  stations,
  getStatus,
  onNavigate,
  onOpenModules,
}: StationListProps) {
  const routeKm = totalRouteKm(stations);

  const listRef = useRef<HTMLDivElement>(null);
  const firstBadgeRef = useRef<HTMLDivElement>(null);
  const lastBadgeRef = useRef<HTMLDivElement>(null);
  const [routePoints, setRoutePoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const measureRoute = useCallback(() => {
    const container = listRef.current;
    const first = firstBadgeRef.current;
    const last = lastBadgeRef.current;
    if (!container || !first || !last || first === last) {
      setRoutePoints(null);
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const firstRect = first.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    setRoutePoints({
      x1: firstRect.left + firstRect.width / 2 - containerRect.left,
      y1: firstRect.top + firstRect.height / 2 - containerRect.top,
      x2: lastRect.left + lastRect.width / 2 - containerRect.left,
      y2: lastRect.top + lastRect.height / 2 - containerRect.top,
    });
  }, []);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(measureRoute);
    window.addEventListener("resize", measureRoute);
    const observer = new ResizeObserver(measureRoute);
    if (listRef.current) observer.observe(listRef.current);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureRoute);
      observer.disconnect();
    };
  }, [measureRoute, stations.length]);

  return (
    <div className="relative">
      <style>{`
        @keyframes gq-slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <QuestListBackdrop />

      <div className="relative">
        <AppHeader backHref="/play" transparent />

        <div className="px-5 pt-3">
          <span className="text-tech text-[10px] text-gq-teal">Stationen</span>
          <h1 className="font-display italic text-[clamp(1.8rem,8vw,2.4rem)] leading-[0.96] uppercase text-foreground mt-1">
            {questName}
          </h1>
          <div className="flex items-center gap-2 mt-2.5 text-tech text-[10px] text-gq-grey">
            <span>
              {stations.length} {stations.length === 1 ? "Ziel" : "Ziele"}
            </span>
            {routeKm > 0 && (
              <>
                <span>·</span>
                <span>{routeKm.toFixed(1).replace(".", ",")} km</span>
              </>
            )}
          </div>
          <div className="h-px bg-border mt-4" />
        </div>

        <div ref={listRef} className="relative z-0 flex flex-col gap-3.5 px-5 pt-4.5 pb-10">
          <RouteLine points={routePoints} waveCount={Math.max(1, stations.length - 1)} />

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
                  badgeRef={index === 0 ? firstBadgeRef : index === stations.length - 1 ? lastBadgeRef : undefined}
                  onNavigate={() => onNavigate(index)}
                  onOpenModules={() => onOpenModules(index)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Weaves a snake-like S-curve between two points, echoing the hand-drawn
// route line from Station_Screen.html (which bulges left/right/left between
// its two endpoints via chained cubic beziers, rather than bowing smoothly).
// The first segment is a plain C; every following segment continues with S
// (a smooth reflection of the previous control point), exactly like the
// design's own path, so the curve has no kinks at the anchors in between.
// The number of bulges scales with waveCount so longer station lists still
// read as an organic trail instead of one giant sideways loop.
function wavyPath(x1: number, y1: number, x2: number, y2: number, amplitude: number, waveCount: number): string {
  const segments = Math.max(1, waveCount);
  const segHeight = (y2 - y1) / segments;
  let d = `M${x1},${y1}`;

  for (let i = 0; i < segments; i++) {
    const anchorX = i === segments - 1 ? x2 : x1;
    const anchorY = y1 + segHeight * (i + 1);
    const bulgeX = i % 2 === 0 ? x1 + amplitude : x1 - amplitude;
    const cp2Y = anchorY - segHeight / 3;

    if (i === 0) {
      const cp1Y = y1 + segHeight / 3;
      d += ` C${bulgeX},${cp1Y} ${bulgeX},${cp2Y} ${anchorX},${anchorY}`;
    } else {
      d += ` S${bulgeX},${cp2Y} ${anchorX},${anchorY}`;
    }
  }

  return d;
}

const DASH_PERIOD = 14 + 18; // strokeDasharray "14 18" — one full dash+gap cycle, in px

function RouteLine({ points, waveCount }: { points: { x1: number; y1: number; x2: number; y2: number } | null; waveCount: number }) {
  if (!points) return null;
  const { x1, y1, x2, y2 } = points;
  const amplitude = 37;
  const d = wavyPath(x1, y1, x2, y2, amplitude, waveCount);

  // Approximate path length so the dash "flow" moves at a constant px/s speed
  // regardless of how many waves the path has — a fixed offset (BUG-2) made
  // long, multi-wave paths look like they crawled while short ones raced.
  // Each segment's chord is a diagonal from the amplitude swing plus its
  // vertical run; the real bezier is a bit longer than its chord, so a small
  // upward fudge factor keeps the loop seamless without needing
  // getTotalLength() (which needs a mounted DOM node to measure).
  const segments = Math.max(1, waveCount);
  const segHeight = (y2 - y1) / segments;
  const segChord = Math.hypot(amplitude, segHeight);
  const pathLength = segments * segChord * 1.15;
  const dashOffset = -Math.max(DASH_PERIOD, Math.round(pathLength / DASH_PERIOD) * DASH_PERIOD);
  const duration = (pathLength / 40).toFixed(1); // ~40px/s, matches the original 176px/6s pace

  return (
    <svg
      className="pointer-events-none absolute inset-0 -z-10 w-full h-full overflow-visible"
      aria-hidden="true"
    >
      <style>{`
        @keyframes gq-dash-${waveCount} { to { stroke-dashoffset: ${dashOffset}px; } }
      `}</style>
      <path
        d={d}
        fill="none"
        stroke="#C6FF00"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="14 18"
        opacity={0.85}
        style={{
          filter: "drop-shadow(0 0 8px #C6FF00)",
          animation: `gq-dash-${waveCount} ${duration}s linear infinite`,
        }}
      />
      <circle cx={x1} cy={y1} r={5} fill="#C6FF00" style={{ filter: "drop-shadow(0 0 12px #C6FF00)" }} />
      <circle cx={x2} cy={y2} r={5} fill="#C6FF00" style={{ filter: "drop-shadow(0 0 12px #C6FF00)" }} />
    </svg>
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
    background: "rgba(14,31,36,0.78)",
    border: "1px solid rgba(160,167,173,0.22)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
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
    background: "rgba(11,15,18,0.75)",
    border: "2px solid rgba(160,167,173,0.55)",
  },
};

const badgeTextColor: Record<StationStatus, string> = {
  completed: "#0B0F12",
  visited: "#00E0D1",
  current: "#0B0F12",
  locked: "#C4CACE",
};

const iconBgStyles: Record<string, React.CSSProperties> = {
  nav: { background: "rgba(0,224,209,0.15)", border: "2px solid #00E0D1" },
  book: { background: "rgba(0,224,209,0.1)" },
  check: { background: "rgba(198,255,0,0.1)" },
};

interface StationRowProps {
  station: Station;
  index: number;
  status: StationStatus;
  badgeRef?: React.RefObject<HTMLDivElement | null>;
  onNavigate: () => void;
  onOpenModules: () => void;
}

function StationRow({ station, index, status, badgeRef, onNavigate, onOpenModules }: StationRowProps) {
  const isCompleted = status === "completed";
  const isVisited = status === "visited";
  const isCurrent = status === "current";
  const isLocked = status === "locked";

  const handleClick = () => {
    if (isCurrent) onNavigate();
    else if (isVisited) onOpenModules();
  };

  const iconType = isCurrent ? "nav" : isVisited ? "book" : "check";

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
        ref={badgeRef}
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
            color: isLocked ? "#C4CACE" : "#FFFFFF",
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
        {isCurrent && (
          <span
            className="text-tech block"
            style={{ fontSize: 9, letterSpacing: "0.12em", color: "#00E0D1", marginTop: 4 }}
          >
            Aktiv
          </span>
        )}
        {isLocked && (
          <span
            className="text-tech block"
            style={{ fontSize: 9, letterSpacing: "0.12em", color: "#A0A7AD", marginTop: 4 }}
          >
            Gesperrt
          </span>
        )}
      </div>

      {/* Right icon */}
      {isLocked ? (
        <Lock style={{ width: 18, height: 18, color: "#A0A7AD", flexShrink: 0 }} />
      ) : (
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
        </span>
      )}
    </button>
  );
}
