"use client";

import { useState, useCallback, useRef } from "react";
import { parseAndValidateQuestFile, type ImportError } from "@/lib/quest-import";
import { saveQuest, questExists } from "@/lib/quest-storage";
import type { Quest } from "@/lib/quest-schema";

type ImportState =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "confirm-overwrite"; quest: Quest; skippedModules: number }
  | { status: "success"; questName: string; skippedModules: number }
  | { status: "error"; error: ImportError };

export function useQuestImport() {
  const [state, setState] = useState<ImportState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setState({ status: "processing" });

    const result = await parseAndValidateQuestFile(file);

    if (!result.success) {
      setState({ status: "error", error: result.error });
      return;
    }

    if (questExists(result.quest.id)) {
      setState({ status: "confirm-overwrite", quest: result.quest, skippedModules: result.skippedModules });
      return;
    }

    try {
      saveQuest(result.quest);
      setState({ status: "success", questName: result.quest.name, skippedModules: result.skippedModules });
    } catch (e) {
      setState({
        status: "error",
        error: { type: "validation-error", message: (e as Error).message },
      });
    }
  }, []);

  const confirmOverwrite = useCallback(() => {
    if (state.status !== "confirm-overwrite") return;
    try {
      saveQuest(state.quest);
      setState({ status: "success", questName: state.quest.name, skippedModules: state.skippedModules });
    } catch (e) {
      setState({
        status: "error",
        error: { type: "validation-error", message: (e as Error).message },
      });
    }
  }, [state]);

  const cancelOverwrite = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    state,
    fileInputRef,
    triggerFilePicker,
    handleFileSelect,
    confirmOverwrite,
    cancelOverwrite,
    reset,
  };
}
