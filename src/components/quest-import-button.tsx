"use client";

import { Plus, Upload } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
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
import { useQuestImport } from "@/hooks/use-quest-import";

interface QuestImportButtonProps {
  variant?: "dark" | "light";
  floating?: boolean;
  onImportSuccess?: () => void;
  /** Overrides the built-in button markup (used to fold the trigger into a custom control, e.g. an expandable FAB) while still reusing the file input, import pipeline, and overwrite dialog below. */
  renderTrigger?: (opts: { onClick: () => void; disabled: boolean }) => React.ReactNode;
}

export function QuestImportButton({ variant = "dark", floating = false, onImportSuccess, renderTrigger }: QuestImportButtonProps) {
  const {
    state,
    fileInputRef,
    triggerFilePicker,
    handleFileSelect,
    confirmOverwrite,
    cancelOverwrite,
    reset,
  } = useQuestImport();

  /**
   * Der schwebende Installations-Hinweis (PROJ-12) sitzt seit dem Refinement
   * vom 2026-09-20 fest am unteren Rand und laege sonst unter diesem Button.
   *
   * Beide sind vollwertige Bedienelemente — eines teilweise zu verdecken waere
   * in beide Richtungen falsch. Der FAB ist das beweglichere von beiden (er
   * schwebt ohnehin schon frei), also weicht er aus und faellt zurueck, sobald
   * der Hinweis weggeklickt ist.
   *
   * Die Information kommt aus derselben Quelle wie der Hinweis selbst; ein
   * zweiter, eigener Zustand koennte auseinanderlaufen.
   */
  const { shouldShow: installHintVisible } = useInstallPrompt();

  useEffect(() => {
    if (state.status === "success") {
      let message = `„${state.questName}" erfolgreich importiert!`;
      if (state.skippedModules > 0) {
        message += ` (${state.skippedModules} unbekannte${state.skippedModules === 1 ? "s Modul" : " Module"} übersprungen)`;
      }
      toast.success(message);
      reset();
      onImportSuccess?.();
    }
    if (state.status === "error") {
      toast.error(state.error.message);
      reset();
    }
  }, [state, reset, onImportSuccess]);

  const fabColors = variant === "light"
    ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
    : "bg-gq-teal text-[#0B0F12] shadow-lg shadow-gq-teal/25 hover:bg-gq-teal/90";

  const inlineColors = variant === "light"
    ? "border-primary text-primary hover:bg-primary/10"
    : "border-gq-teal text-gq-teal hover:bg-gq-teal/10";

  return (
    <>
      {renderTrigger ? (
        renderTrigger({ onClick: triggerFilePicker, disabled: state.status === "processing" })
      ) : floating ? (
        <button
          type="button"
          onClick={triggerFilePicker}
          disabled={state.status === "processing"}
          aria-label="Quest importieren"
          /* `bottom-6` ist die gewohnte Position. Solange der Hinweis steht,
             rueckt der Button ueber ihn: 44px Zeile + 14px Safe-Area-Gutter +
             12px Polsterung des Overlays, aufgerundet auf 5.5rem. Die
             Safe-Area kommt hinzu, weil das Overlay sie ebenfalls addiert. */
          className={`fixed right-5 z-40 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-base ease-gq active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none ${
            installHintVisible
              ? "bottom-[calc(env(safe-area-inset-bottom)+5.5rem)]"
              : "bottom-6"
          } ${fabColors}`}
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      ) : (
        <button
          type="button"
          onClick={triggerFilePicker}
          disabled={state.status === "processing"}
          className={`flex items-center gap-2 px-5 py-3 rounded-full border text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none ${inlineColors}`}
        >
          <Upload className="w-4 h-4" />
          Quest importieren
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />

      <AlertDialog open={state.status === "confirm-overwrite"} onOpenChange={(open) => { if (!open) cancelOverwrite(); }}>
        {/* Radix portals to <body>, outside the page's themed container — re-apply the theme and its text color
            here (color is otherwise inherited pre-computed from <body>'s dark default) so descendants without
            their own explicit color class render correctly. */}
        <AlertDialogContent data-theme={variant} className="text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Quest überschreiben?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Quest existiert bereits. Möchtest du sie mit der neuen Version überschreiben? Die bisherige Version geht dabei verloren.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOverwrite}>
              Überschreiben
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
