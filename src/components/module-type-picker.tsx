"use client";

import { useState } from "react";
import { Type, Image, Music, Video, ListChecks, Code, CheckSquare, ArrowUpDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ModuleType, TaskType } from "./module-editor-sheets";

interface ModuleTypePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (type: ModuleType, taskType?: TaskType) => void;
}

const MODULE_TILES: { type: ModuleType; label: string; icon: typeof Type }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Bild", icon: Image },
  { type: "audio", label: "Audio", icon: Music },
  { type: "video", label: "Video", icon: Video },
  { type: "task", label: "Aufgabe", icon: ListChecks },
];

const TASK_TILES: { taskType: TaskType; label: string; icon: typeof Code }[] = [
  { taskType: "code", label: "Code-Eingabe", icon: Code },
  { taskType: "multiple-choice", label: "Multiple Choice", icon: CheckSquare },
  { taskType: "sorting", label: "Sortierung", icon: ArrowUpDown },
];

export function ModuleTypePicker({ open, onOpenChange, onPick }: ModuleTypePickerProps) {
  const [showTaskTypes, setShowTaskTypes] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setShowTaskTypes(false);
    onOpenChange(next);
  }

  function handleTileClick(type: ModuleType) {
    if (type === "task") {
      setShowTaskTypes(true);
      return;
    }
    onPick(type);
    handleOpenChange(false);
  }

  function handleTaskTileClick(taskType: TaskType) {
    onPick("task", taskType);
    handleOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
          here so descendants without their own explicit color class render correctly (see PROJ-6/7 pattern). */}
      <SheetContent
        side="bottom"
        data-theme="light"
        className="text-foreground max-w-none sm:max-w-none flex flex-col gap-4 rounded-t-card"
      >
        <SheetHeader>
          <SheetTitle className="font-display italic text-2xl uppercase text-foreground">
            {showTaskTypes ? "Aufgabentyp wählen" : "Modultyp wählen"}
          </SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 pb-4">
          {showTaskTypes
            ? TASK_TILES.map(({ taskType, label, icon: Icon }) => (
                <button
                  key={taskType}
                  type="button"
                  onClick={() => handleTaskTileClick(taskType)}
                  className="flex flex-col items-center justify-center gap-2 h-24 rounded-card bg-card border border-border shadow-card transition-all duration-fast ease-gq hover:border-primary active:scale-[0.96]"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="font-body text-sm font-medium text-foreground">{label}</span>
                </button>
              ))
            : MODULE_TILES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTileClick(type)}
                  className="flex flex-col items-center justify-center gap-2 h-24 rounded-card bg-card border border-border shadow-card transition-all duration-fast ease-gq hover:border-primary active:scale-[0.96]"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="font-body text-sm font-medium text-foreground">{label}</span>
                </button>
              ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
