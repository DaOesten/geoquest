"use client";

import Link from "next/link";
import { MoreVertical, Pencil, Rocket, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Quest } from "@/lib/quest-schema";

interface QuestManagementCardProps {
  quest: Quest;
  isComplete: boolean;
  isPublished: boolean;
  onPublish: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function QuestManagementCard({
  quest,
  isComplete,
  isPublished,
  onPublish,
  onRename,
  onDelete,
}: QuestManagementCardProps) {
  const totalCount = quest.stations.length;
  const metaLine = `${totalCount} ${totalCount === 1 ? "Station" : "Stationen"}`;
  // "Entwurf" covers two reasons: still structurally incomplete, or complete
  // but not yet published — both mean "not visible in the Play list".
  const showDraftBadge = !isComplete || !isPublished;

  const cardClasses = showDraftBadge
    ? "flex flex-col gap-2 p-4 rounded-card bg-[#EEF2F3] border-[1.5px] border-dashed border-border"
    : "flex flex-col gap-2 p-4 rounded-card bg-card border border-border shadow-card";

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between gap-2">
        {showDraftBadge ? (
          <Badge variant="outline" className="flex-shrink-0 text-tech text-[10px] tracking-[0.1em]">
            Entwurf
          </Badge>
        ) : (
          <span />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Quest-Aktionen"
            className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground transition-colors duration-fast ease-gq hover:text-primary active:scale-[0.96]"
          >
            <MoreVertical className="w-5 h-5" />
          </DropdownMenuTrigger>
          {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme here so CSS variables resolve correctly. */}
          <DropdownMenuContent align="end" data-theme="light">
            {!isPublished && (
              <DropdownMenuItem onSelect={onPublish} disabled={!isComplete}>
                <Rocket className="w-4 h-4" />
                Veröffentlichen
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={onRename}>
              <Pencil className="w-4 h-4" />
              Umbenennen
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link href={`/create/${quest.id}`} className="flex flex-col gap-1 min-w-0">
        <span className="font-display italic text-xl leading-tight uppercase text-foreground line-clamp-2">
          {quest.name}
        </span>
        <span className="font-body text-xs text-muted-foreground">{metaLine}</span>
      </Link>
    </div>
  );
}
