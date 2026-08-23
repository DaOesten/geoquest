"use client";

import { PenTool } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { QuestImportButton } from "@/components/quest-import-button";
import { useQuests } from "@/hooks/use-quests";

export default function CreatePage() {
  const { quests, refreshQuests } = useQuests();

  return (
    <>
      <AppHeader title="Meine Quests" variant="light" />
      {quests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
          <PenTool className="w-12 h-12 text-gq-grey" />
          <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">
            Noch keine Quests erstellt
          </p>
          <p className="font-body text-sm text-[#5B646A] max-w-xs">
            Erstelle deine erste Quest oder importiere eine bestehende.
          </p>
          <div className="mt-4">
            <QuestImportButton variant="light" onImportSuccess={refreshQuests} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 px-5 py-4">
            <ul className="flex flex-col gap-3">
              {quests.map((quest) => (
                <li
                  key={quest.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-tech text-xs truncate">{quest.name}</span>
                    <span className="font-body text-xs text-muted-foreground">
                      {quest.stations.length} {quest.stations.length === 1 ? "Station" : "Stationen"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <QuestImportButton variant="light" floating onImportSuccess={refreshQuests} />
        </>
      )}
    </>
  );
}
