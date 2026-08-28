"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  AlertTriangle,
  Type,
  Image as ImageIcon,
  Music,
  Video,
  Code,
  CheckSquare,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DraftModule } from "@/lib/quest-storage";
import { getModuleWarning } from "@/lib/module-warnings";

interface ModuleListItemProps {
  module: DraftModule;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function moduleIcon(module: DraftModule) {
  const className = "w-4 h-4";
  if (module.type === "task") {
    switch (module.taskType) {
      case "code":
        return <Code className={className} />;
      case "multiple-choice":
        return <CheckSquare className={className} />;
      case "sorting":
        return <ArrowUpDown className={className} />;
    }
  }
  switch (module.type) {
    case "text":
      return <Type className={className} />;
    case "image":
      return <ImageIcon className={className} />;
    case "audio":
      return <Music className={className} />;
    case "video":
      return <Video className={className} />;
  }
}

function moduleLabel(module: DraftModule): string {
  switch (module.type) {
    case "text":
      return "Text";
    case "image":
      return "Bild";
    case "audio":
      return "Audio";
    case "video":
      return "Video";
    case "task":
      switch (module.taskType) {
        case "code":
          return "Code-Eingabe";
        case "multiple-choice":
          return "Multiple Choice";
        case "sorting":
          return "Sortierung";
      }
  }
}

function modulePreview(module: DraftModule): string {
  switch (module.type) {
    case "text":
      return module.content.trim().slice(0, 60) || "Kein Inhalt";
    case "image":
    case "audio":
    case "video": {
      const fileName = module.url.split("/").filter(Boolean).pop();
      return fileName || "Keine URL";
    }
    case "task":
      return module.question.trim() || "Keine Frage";
  }
}

export function ModuleListItem({ module, index, onEdit, onDelete }: ModuleListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `module-${index}`,
  });

  const icon = moduleIcon(module);
  const warning = getModuleWarning(module);

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

      <div className="flex-shrink-0 w-9 h-9 rounded-full grid place-items-center bg-primary/10 text-primary">
        {icon}
      </div>

      <button type="button" onClick={onEdit} className="flex flex-col gap-1 min-w-0 flex-1 text-left">
        <span className="font-body text-sm font-medium text-foreground truncate">
          {index + 1}. {moduleLabel(module)}
        </span>
        <span className="flex items-center gap-1.5 font-body text-xs text-muted-foreground truncate">
          {warning ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-destructive" />
              <span className="text-destructive">{warning}</span>
            </>
          ) : (
            <span className="truncate">{modulePreview(module)}</span>
          )}
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Modul-Aktionen"
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
