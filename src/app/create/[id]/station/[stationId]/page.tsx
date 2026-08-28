"use client";

import { use, useCallback, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Puzzle, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { ModuleListItem } from "@/components/module-list-item";
import { ModuleTypePicker } from "@/components/module-type-picker";
import { ModuleEditorSheet, type ModuleType, type TaskType } from "@/components/module-editor-sheets";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuests } from "@/hooks/use-quests";
import { deleteModule, getStationById, reorderModules, upsertModule, type DraftModule } from "@/lib/quest-storage";

interface StationModulesPageProps {
  params: Promise<{ id: string; stationId: string }>;
}

export default function StationModulesPage({ params }: StationModulesPageProps) {
  const { id: questId, stationId } = use(params);
  const { quests, refreshQuests } = useQuests();
  const quest = quests.find((q) => q.id === questId);
  const station = quest ? getStationById(questId, stationId) : undefined;

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickedType, setPickedType] = useState<{ type: ModuleType; taskType?: TaskType } | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const modules = useMemo(() => (station?.modules ?? []) as DraftModule[], [station]);

  const handleAddModule = useCallback(() => {
    setEditIndex(null);
    setPickedType(null);
    setIsPickerOpen(true);
  }, []);

  const handlePickType = useCallback((type: ModuleType, taskType?: TaskType) => {
    setPickedType({ type, taskType });
    setIsEditorOpen(true);
  }, []);

  const handleEditModule = useCallback((index: number) => {
    setEditIndex(index);
    setPickedType(null);
    setIsEditorOpen(true);
  }, []);

  const handleSaveModule = useCallback(
    (draft: DraftModule) => {
      upsertModule(questId, stationId, editIndex, draft);
      refreshQuests();
      toast.success("Modul gespeichert");
    },
    [questId, stationId, editIndex, refreshQuests]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteIndex === null) return;
    deleteModule(questId, stationId, deleteIndex);
    refreshQuests();
    toast.success("Modul gelöscht");
    setDeleteIndex(null);
  }, [deleteIndex, questId, stationId, refreshQuests]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = modules.findIndex((_, i) => `module-${i}` === active.id);
      const newIndex = modules.findIndex((_, i) => `module-${i}` === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const order = modules.map((_, i) => i);
      const [moved] = order.splice(oldIndex, 1);
      order.splice(newIndex, 0, moved);

      reorderModules(questId, stationId, order);
      refreshQuests();
    },
    [modules, questId, stationId, refreshQuests]
  );

  if (!quest || !station) {
    notFound();
  }

  const editorModule = editIndex !== null ? modules[editIndex] ?? null : null;
  const deleteTargetModule = deleteIndex !== null ? modules[deleteIndex] : null;

  return (
    <>
      <AppHeader title={station.name || "Unbenannte Station"} backHref={`/create/${questId}`} variant="light" />

      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
          <Puzzle className="w-12 h-12 text-gq-grey" />
          <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">Noch keine Module</p>
          <p className="font-body text-sm text-[#5B646A] max-w-xs">
            Füge dein erstes Modul hinzu — Text, Bild, Audio, Video oder eine Aufgabe.
          </p>
          <Button
            onClick={handleAddModule}
            className="mt-4 rounded-pill h-11 px-6 bg-primary text-primary-foreground text-tech text-xs tracking-[0.08em] active:scale-[0.96] transition-all duration-fast ease-gq"
          >
            <Plus className="w-4 h-4" />
            Modul hinzufügen
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 py-4 pb-28">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map((_, i) => `module-${i}`)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-3">
                {modules.map((module, index) => (
                  <li key={`module-${index}`}>
                    <ModuleListItem
                      module={module}
                      index={index}
                      onEdit={() => handleEditModule(index)}
                      onDelete={() => setDeleteIndex(index)}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {modules.length > 0 && (
        <button
          type="button"
          onClick={handleAddModule}
          aria-label="Modul hinzufügen"
          className="fixed bottom-6 right-5 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-base ease-gq active:scale-[0.96]"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      )}

      <ModuleTypePicker open={isPickerOpen} onOpenChange={setIsPickerOpen} onPick={handlePickType} />

      <ModuleEditorSheet
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        module={editorModule}
        newModuleType={pickedType?.type ?? null}
        newTaskType={pickedType?.taskType ?? null}
        onSave={handleSaveModule}
      />

      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
            and its text color here (color is otherwise inherited pre-computed from <body>'s dark default) so
            descendants without their own explicit color class render correctly. */}
        <AlertDialogContent data-theme="light" className="text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Modul wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTargetModule ? "Dieses Modul" : "Das Modul"} wird endgültig gelöscht. Das kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
