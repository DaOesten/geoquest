"use client";

import { use, useCallback, useMemo, useState } from "react";
import { notFound, useRouter } from "next/navigation";
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
import { MapPinned, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { StationListItem } from "@/components/station-list-item";
import { StationEditorSheet } from "@/components/station-editor-sheet";
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
import { deleteStation, reorderStations, upsertStation, type DraftStation } from "@/lib/quest-storage";

interface CreateQuestPageProps {
  params: Promise<{ id: string }>;
}

export default function CreateQuestPage({ params }: CreateQuestPageProps) {
  const { id: questId } = use(params);
  const router = useRouter();
  const { quests, refreshQuests } = useQuests();
  const quest = quests.find((q) => q.id === questId);

  const [editorStation, setEditorStation] = useState<DraftStation | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DraftStation | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  const stations = useMemo(() => quest?.stations ?? [], [quest]);

  const handleAddStation = useCallback(() => {
    setEditorStation(null);
    setIsEditorOpen(true);
  }, []);

  const handleEditStation = useCallback((station: DraftStation) => {
    setEditorStation(station);
    setIsEditorOpen(true);
  }, []);

  const handleEditModules = useCallback(
    (station: DraftStation) => {
      router.push(`/create/${questId}/station/${station.id}`);
    },
    [questId, router]
  );

  const handleSaveStation = useCallback(
    (station: DraftStation) => {
      upsertStation(questId, station);
      refreshQuests();
      toast.success("Station gespeichert");
    },
    [questId, refreshQuests]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteStation(questId, deleteTarget.id);
    refreshQuests();
    toast.success("Station gelöscht");
    setDeleteTarget(null);
  }, [deleteTarget, questId, refreshQuests]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = stations.findIndex((s) => s.id === active.id);
      const newIndex = stations.findIndex((s) => s.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;

      const reordered = [...stations];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      reorderStations(questId, reordered.map((s) => s.id));
      refreshQuests();
    },
    [stations, questId, refreshQuests]
  );

  const contextPins = useMemo(
    () =>
      stations
        .filter((s) => s.id !== editorStation?.id && s.lat !== undefined && s.lng !== undefined)
        .map((s) => ({ id: s.id, lat: s.lat as number, lng: s.lng as number })),
    [stations, editorStation]
  );

  if (!quest) {
    notFound();
  }

  return (
    <>
      <AppHeader title={quest.name} backHref="/create" variant="light" />

      {stations.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
          <MapPinned className="w-12 h-12 text-gq-grey" />
          <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">Noch keine Stationen</p>
          <p className="font-body text-sm text-[#5B646A] max-w-xs">
            Füge deine erste Station hinzu und platziere sie auf der Karte.
          </p>
          <Button
            onClick={handleAddStation}
            className="mt-4 rounded-pill h-11 px-6 bg-primary text-primary-foreground text-tech text-xs tracking-[0.08em] active:scale-[0.96] transition-all duration-fast ease-gq"
          >
            <Plus className="w-4 h-4" />
            Station hinzufügen
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 py-4 pb-28">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stations.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-3">
                {stations.map((station, index) => (
                  <li key={station.id}>
                    <StationListItem
                      station={station}
                      index={index}
                      onEdit={() => handleEditStation(station)}
                      onDelete={() => setDeleteTarget(station)}
                      onEditModules={() => handleEditModules(station)}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {stations.length > 0 && (
        <button
          type="button"
          onClick={handleAddStation}
          aria-label="Station hinzufügen"
          className="fixed bottom-6 right-5 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-base ease-gq active:scale-[0.96]"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      )}

      <StationEditorSheet
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        station={editorStation}
        contextPins={contextPins}
        onSave={handleSaveStation}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
            and its text color here (color is otherwise inherited pre-computed from <body>'s dark default) so
            descendants without their own explicit color class render correctly. */}
        <AlertDialogContent data-theme="light" className="text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Station wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deleteTarget?.name || "Unbenannte Station"}“ wird endgültig gelöscht. Das kann nicht rückgängig
              gemacht werden.
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
