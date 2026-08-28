"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Quest } from "@/lib/quest-schema";
import type { QuestListStatus } from "@/lib/quest-progress";

interface QuestCardProps {
  quest: Quest;
  status: QuestListStatus;
  completedCount: number;
  onReset: () => void;
}

export function QuestCard({ quest, status, completedCount, onReset }: QuestCardProps) {
  const totalCount = quest.stations.length;
  const metaLine = `${totalCount} ${totalCount === 1 ? "Ziel" : "Ziele"}`;

  if (status === "done") {
    return (
      <div className="flex flex-col gap-2 p-4 rounded-card bg-card border border-border shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:shadow-card-hover">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onReset}
            aria-label="Quest zurücksetzen"
            className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center border border-border text-gq-grey transition-colors duration-fast ease-gq hover:text-gq-teal hover:border-gq-teal active:scale-[0.96]"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
        <Link href={`/play/${quest.id}`} className="flex flex-col gap-1 min-w-0">
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
      <Link
        href={`/play/${quest.id}`}
        className="flex flex-col gap-3 p-4 rounded-card bg-card border-2 border-gq-teal shadow-glow transition-all duration-base ease-gq hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-tech text-[9px] tracking-[0.14em] text-gq-teal uppercase">
            Aktuelle Quest
          </span>
          <Badge className="flex-shrink-0 border-transparent bg-gq-teal text-gq-black text-tech text-[10px] tracking-[0.1em] shadow-glow">
            Live
          </Badge>
        </div>
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
    );
  }

  return (
    <Link
      href={`/play/${quest.id}`}
      className="flex flex-col gap-2 p-4 rounded-card bg-card border border-border shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:border-gq-grey-dark hover:shadow-card-hover active:scale-[0.98]"
    >
      <div className="flex justify-end">
        <Badge variant="outline" className="flex-shrink-0 text-tech text-[10px] tracking-[0.1em]">
          Neu
        </Badge>
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-display italic text-xl leading-tight uppercase text-foreground line-clamp-2">
          {quest.name}
        </span>
        <span className="font-body text-xs text-gq-grey">{metaLine}</span>
      </div>
    </Link>
  );
}
