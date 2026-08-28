"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, MapPinOff, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DraftStation } from "@/lib/quest-storage";

interface StationListItemProps {
  station: DraftStation;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onEditModules: () => void;
}

export function StationListItem({ station, index, onEdit, onDelete, onEditModules }: StationListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: station.id,
  });

  const hasPosition = station.lat !== undefined && station.lng !== undefined;
  const moduleCount = station.modules.length;
  const moduleLabel = `${moduleCount} ${moduleCount === 1 ? "Modul" : "Module"}`;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={
        "flex items-center gap-2 p-3 rounded-card bg-card border border-border shadow-card" +
        (isDragging ? " opacity-50" : "")
      }
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reihenfolge ändern"
        className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <button type="button" onClick={onEdit} className="flex flex-col gap-1 min-w-0 flex-1 text-left">
        <span className="font-body text-sm font-medium text-foreground truncate">
          {index + 1}. {station.name || "Unbenannte Station"}
        </span>
        <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
          {hasPosition ? (
            <>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              {moduleLabel}
            </>
          ) : (
            <>
              <MapPinOff className="w-3.5 h-3.5 flex-shrink-0" />
              Keine Position gesetzt
            </>
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={onEditModules}
        aria-label="Module bearbeiten"
        className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground transition-colors duration-fast ease-gq hover:text-primary active:scale-[0.96]"
      >
        <Pencil className="w-5 h-5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Stations-Aktionen"
          className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground transition-colors duration-fast ease-gq hover:text-primary active:scale-[0.96]"
        >
          <MoreVertical className="w-5 h-5" />
        </DropdownMenuTrigger>
        {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme here so CSS variables resolve correctly. */}
        <DropdownMenuContent align="end" data-theme="light">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="w-4 h-4" />
            Bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="w-4 h-4" />
            Löschen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
