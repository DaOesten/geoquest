"use client";

import Link from "next/link";
import { CloudOff, Download, MoreVertical, Pencil, Rocket, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Quest } from "@/lib/quest-schema";

interface QuestManagementCardProps {
  quest: Quest;
  isDraft: boolean;
  hasUnsavedChanges: boolean;
  onExport: () => void;
  onPublish: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function QuestManagementCard({
  quest,
  isDraft,
  hasUnsavedChanges,
  onExport,
  onPublish,
  onRename,
  onDelete,
}: QuestManagementCardProps) {
  const totalCount = quest.stations.length;
  const metaLine = `${totalCount} ${totalCount === 1 ? "Station" : "Stationen"}`;

  const cardClasses = isDraft
    ? "relative flex flex-col gap-2 p-4 rounded-card bg-[#EEF2F3] border-[1.5px] border-dashed border-border transition-all duration-base ease-gq hover:-translate-y-0.5 hover:border-gq-lime"
    : "relative flex flex-col gap-2 p-4 rounded-card bg-card border border-border shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:border-gq-lime hover:shadow-card-hover";

  return (
    <div className={cardClasses}>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Quest-Aktionen"
          className="absolute top-2 right-2 flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground transition-colors duration-fast ease-gq hover:text-primary active:scale-[0.96]"
        >
          <MoreVertical className="w-5 h-5" />
        </DropdownMenuTrigger>
        {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme here so CSS variables resolve correctly. */}
        <DropdownMenuContent align="end" data-theme="light">
          <DropdownMenuItem onSelect={onExport}>
            <Download className="w-4 h-4" />
            Sicherung
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onPublish}>
            <Rocket className="w-4 h-4" />
            Veröffentlichen
          </DropdownMenuItem>
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
      <Link href={`/create/${quest.id}`} className="flex flex-col gap-1 min-w-0 pr-9">
        <span className="font-display italic text-xl leading-tight uppercase text-foreground line-clamp-2">
          {quest.name}
        </span>
        <span className="font-body text-xs text-muted-foreground">{metaLine}</span>
        {hasUnsavedChanges && (
          <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
            <CloudOff className="w-3.5 h-3.5" />
            Nicht gesichert
          </span>
        )}
      </Link>
    </div>
  );
}
