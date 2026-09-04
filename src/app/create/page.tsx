"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenTool, Plus, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import { CreatorBackdrop } from "@/components/creator-backdrop";
import { QuestImportButton } from "@/components/quest-import-button";
import { QuestManagementCard } from "@/components/quest-management-card";
import { QuestManagementFilterTabs, type QuestManagementFilter } from "@/components/quest-management-filter-tabs";
import { QuestFormDialog, type QuestFormValues } from "@/components/quest-form-dialog";
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
import {
  createDraftQuest,
  deleteQuest,
  hasUnsavedChanges as questHasUnsavedChanges,
  isPublished,
  markExported,
  publishQuest,
  saveQuest,
  updateQuestDetails,
} from "@/lib/quest-storage";
import { exportQuest } from "@/lib/quest-export";
import { deleteProgress } from "@/lib/quest-progress";
import type { Quest } from "@/lib/quest-schema";

type FormDialogState = { mode: "create" } | { mode: "edit"; quest: Quest } | null;

export default function CreatePage() {
  const router = useRouter();
  const { quests, refreshQuests } = useQuests();
  const [formDialog, setFormDialog] = useState<FormDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Quest | null>(null);
  const [filter, setFilter] = useState<QuestManagementFilter>("all");
  const [fabOpen, setFabOpen] = useState(false);

  const sortedQuests = useMemo(
    () =>
      [...quests]
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
        .map((quest) => ({
          quest,
          isDraft: !isPublished(quest),
          hasUnsavedChanges: questHasUnsavedChanges(quest),
        })),
    [quests]
  );

  const visibleQuests = useMemo(
    () => (filter === "all" ? sortedQuests : sortedQuests.filter((q) => q.isDraft)),
    [sortedQuests, filter]
  );

  const handleFormConfirm = useCallback(
    (values: QuestFormValues) => {
      if (!formDialog) return;
      try {
        if (formDialog.mode === "create") {
          const quest = createDraftQuest(values.name, values.intro, values.outro);
          saveQuest({ ...quest, passwordHash: values.passwordHash });
          setFormDialog(null);
          router.push(`/create/${quest.id}`);
        } else {
          updateQuestDetails(formDialog.quest.id, values);
          refreshQuests();
          toast.success("Quest gespeichert");
          setFormDialog(null);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
      }
    },
    [formDialog, refreshQuests, router]
  );

  const handleExport = useCallback(
    (quest: Quest) => {
      exportQuest(quest);
      try {
        markExported(quest.id);
        refreshQuests();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
      }
    },
    [refreshQuests]
  );

  const handlePublish = useCallback(
    (quest: Quest) => {
      exportQuest(quest);
      try {
        markExported(quest.id);
        const published = publishQuest(quest.id);
        refreshQuests();
        if (published) {
          toast.success("Quest veröffentlicht");
        } else {
          toast.error("Quest braucht mindestens 1 Station, um veröffentlicht zu werden.");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
      }
    },
    [refreshQuests]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteQuest(deleteTarget.id);
    deleteProgress(deleteTarget.id);
    refreshQuests();
    toast.success("Quest gelöscht");
    setDeleteTarget(null);
  }, [deleteTarget, refreshQuests]);

  return (
    <>
      <CreatorBackdrop />
      <div className="relative">
        <AppHeader variant="light" transparent />

        <div className="px-5 pt-4">
          <h1 className="font-display italic text-[clamp(1.8rem,8vw,2.4rem)] leading-[0.95] uppercase text-foreground">
            Create
          </h1>
        </div>

        {quests.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
            <PenTool className="w-12 h-12 text-gq-grey" />
            <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">
              Noch keine Quests erstellt
            </p>
            <p className="font-body text-sm text-[#5B646A] max-w-xs">
              Erstelle deine erste Quest oder importiere eine bestehende.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3">
              <Button
                onClick={() => setFormDialog({ mode: "create" })}
                className="rounded-pill h-11 px-6 bg-primary text-primary-foreground text-tech text-xs tracking-[0.08em] active:scale-[0.96] transition-all duration-fast ease-gq"
              >
                <Plus className="w-4 h-4" />
                Neue Quest erstellen
              </Button>
              <QuestImportButton variant="light" onImportSuccess={refreshQuests} />
              <Link
                href="/anleitung"
                className="flex items-center gap-2 h-11 px-4 text-tech text-[11px] tracking-[0.08em] text-primary transition-colors duration-base ease-gq hover:text-primary/70"
              >
                <Sparkles className="w-4 h-4" />
                Quest mit KI bauen
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <QuestManagementFilterTabs active={filter} onChange={setFilter} />
            </div>

            <div className="flex flex-col gap-3 px-5 py-4">
              {visibleQuests.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-8">
                  Keine Entwürfe
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {visibleQuests.map(({ quest, isDraft, hasUnsavedChanges }) => (
                    <li key={quest.id}>
                      <QuestManagementCard
                        quest={quest}
                        isDraft={isDraft}
                        hasUnsavedChanges={hasUnsavedChanges}
                        onExport={() => handleExport(quest)}
                        onPublish={() => handlePublish(quest)}
                        onEdit={() => setFormDialog({ mode: "edit", quest })}
                        onDelete={() => setDeleteTarget(quest)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Scrim behind the expanded FAB — tapping it closes the actions back up */}
            <div
              onClick={() => setFabOpen(false)}
              aria-hidden="true"
              className={cn(
                "fixed inset-0 z-30 bg-black/35 transition-opacity duration-base ease-gq",
                fabOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              )}
            />

            {/* Actions revealed by the FAB */}
            <div
              className={cn(
                "fixed bottom-[84px] right-5 z-40 flex flex-col items-end gap-3 transition-all duration-base ease-gq",
                fabOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
              )}
            >
              <QuestImportButton
                variant="light"
                onImportSuccess={() => {
                  refreshQuests();
                  setFabOpen(false);
                }}
                renderTrigger={({ onClick, disabled }) => (
                  <button
                    type="button"
                    onClick={() => {
                      onClick();
                      setFabOpen(false);
                    }}
                    disabled={disabled}
                    className="flex items-center gap-2 h-11 px-5 rounded-pill border border-primary bg-card text-primary shadow-card text-tech text-xs tracking-[0.08em] transition-all duration-fast ease-gq active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    Quest importieren
                  </button>
                )}
              />
              <button
                type="button"
                onClick={() => {
                  setFormDialog({ mode: "create" });
                  setFabOpen(false);
                }}
                className="flex items-center gap-2 h-11 px-5 rounded-pill bg-primary text-primary-foreground shadow-card text-tech text-xs tracking-[0.08em] transition-all duration-fast ease-gq active:scale-[0.96] whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Neue Quest
              </button>
            </div>

            {/* Main FAB — rotates into a close glyph while the actions above are open */}
            <button
              type="button"
              onClick={() => setFabOpen((open) => !open)}
              aria-label={fabOpen ? "Aktionen schließen" : "Quest hinzufügen"}
              aria-expanded={fabOpen}
              className="fixed bottom-6 right-5 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-base ease-gq active:scale-[0.96]"
            >
              <Plus
                className={cn("w-5 h-5 transition-transform duration-base ease-gq", fabOpen && "rotate-45")}
                strokeWidth={2.5}
              />
            </button>
          </>
        )}

        <QuestFormDialog
          open={formDialog !== null}
          onOpenChange={(open) => !open && setFormDialog(null)}
          title={formDialog?.mode === "edit" ? "Quest bearbeiten" : "Neue Quest erstellen"}
          confirmLabel={formDialog?.mode === "edit" ? "Speichern" : "Erstellen"}
          initialValues={
            formDialog?.mode === "edit"
              ? {
                  name: formDialog.quest.name,
                  intro: formDialog.quest.intro,
                  outro: formDialog.quest.outro,
                  passwordHash: formDialog.quest.passwordHash,
                }
              : undefined
          }
          hasExistingPassword={formDialog?.mode === "edit" && Boolean(formDialog.quest.passwordHash)}
          onConfirm={handleFormConfirm}
        />

        <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
              and its text color here (color is otherwise inherited pre-computed from <body>'s dark default) so
              descendants without their own explicit color class render correctly. */}
          <AlertDialogContent data-theme="light" className="text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle>Quest wirklich löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                „{deleteTarget?.name}“ wird endgültig gelöscht. Das kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
