"use client";

import Link from "next/link";
import { MoreVertical, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Quest } from "@/lib/quest-schema";
import type { QuestListStatus } from "@/lib/quest-progress";

interface QuestCardProps {
  quest: Quest;
  status: QuestListStatus;
  completedCount: number;
  onReset: () => void;
  onDelete: () => void;
}

/**
 * Aktionsmenue der Quest-Karte.
 *
 * Sitzt absolut oben rechts, ausserhalb des Karten-Links: Ein Button *in* einem
 * <Link> waere ungueltiges HTML und sein Tap wuerde mit der Navigation
 * kollidieren. Genau deshalb sind seit dem Refinement vom 2026-09-21 alle drei
 * Kartenzustaende gleich gebaut (<div> + Trigger + innerer <Link>) — vorher
 * waren "Neu" und "Live" ein einziger, die ganze Karte umschliessender Link.
 *
 * "Zuruecksetzen" erscheint nur bei abgeschlossenen Quests: Bei "Neu" gibt es
 * nichts zurueckzusetzen, bei "Live" ist der Fortschritt die laufende Partie.
 */
function QuestCardMenu({
  onReset,
  onDelete,
}: {
  onReset?: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Quest-Aktionen"
        className="absolute top-2 right-2 z-10 flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-gq-grey transition-colors duration-fast ease-gq hover:text-gq-teal active:scale-[0.96]"
      >
        <MoreVertical className="w-5 h-5" />
      </DropdownMenuTrigger>
      {/* Radix portaliert nach <body> — ausserhalb des data-theme="dark"-Containers
          aus play/layout.tsx. Ohne erneutes Setzen loesen die CSS-Variablen gegen
          den hellen Standard auf. Im Creator steht derselbe Griff mit "light". */}
      <DropdownMenuContent align="end" data-theme="dark" className="text-foreground">
        {onReset && (
          <DropdownMenuItem onSelect={onReset}>
            <RotateCcw className="w-4 h-4" />
            Zurücksetzen
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4" />
          Löschen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function QuestCard({ quest, status, completedCount, onReset, onDelete }: QuestCardProps) {
  const totalCount = quest.stations.length;
  const metaLine = `${totalCount} ${totalCount === 1 ? "Ziel" : "Ziele"}`;

  if (status === "done") {
    return (
      <div className="relative flex flex-col gap-2 p-4 rounded-card bg-card border border-border shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:shadow-card-hover">
        <QuestCardMenu onReset={onReset} onDelete={onDelete} />
        <Link href={`/play/${quest.id}`} className="flex flex-col gap-1 min-w-0 pr-11">
          <span className="font-display italic text-xl leading-tight uppercase text-foreground/75 line-clamp-2">
            {quest.name}
          </span>
          <span className="font-body text-xs text-gq-grey">{metaLine}</span>
        </Link>
      </div>
    );
  }

  if (status === "live") {
    return (
      <div className="relative flex flex-col gap-3 p-4 rounded-card bg-card border-2 border-gq-teal shadow-glow transition-all duration-base ease-gq hover:-translate-y-0.5">
        <QuestCardMenu onDelete={onDelete} />
        <div className="flex items-center gap-2 pr-11">
          <span className="text-tech text-[9px] tracking-[0.14em] text-gq-teal uppercase">
            Aktuelle Quest
          </span>
          <Badge className="flex-shrink-0 border-transparent bg-gq-teal text-gq-black text-tech text-[10px] tracking-[0.1em] shadow-glow">
            Live
          </Badge>
        </div>
        <Link
          href={`/play/${quest.id}`}
          className="flex flex-col gap-3 min-w-0 transition-transform duration-base ease-gq active:scale-[0.98]"
        >
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-display italic text-xl leading-tight uppercase text-foreground line-clamp-2">
              {quest.name}
            </span>
            <span className="font-body text-xs text-gq-grey">{metaLine}</span>
          </div>
          <Progress value={(completedCount / totalCount) * 100} className="h-1.5" />
          <span className="text-tech text-[9px] tracking-[0.12em] text-gq-grey uppercase">
            {completedCount} von {totalCount} Stationen abgeschlossen
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-2 p-4 rounded-card bg-card border border-border shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:border-gq-grey-dark hover:shadow-card-hover">
      <QuestCardMenu onDelete={onDelete} />
      <div className="flex justify-start pr-11">
        <Badge variant="outline" className="flex-shrink-0 text-tech text-[10px] tracking-[0.1em]">
          Neu
        </Badge>
      </div>
      <Link
        href={`/play/${quest.id}`}
        className="flex flex-col gap-1 min-w-0 transition-transform duration-base ease-gq active:scale-[0.98]"
      >
        <span className="font-display italic text-xl leading-tight uppercase text-foreground line-clamp-2">
          {quest.name}
        </span>
        <span className="font-body text-xs text-gq-grey">{metaLine}</span>
      </Link>
    </div>
  );
}
