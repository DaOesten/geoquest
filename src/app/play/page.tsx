"use client";

import Link from "next/link";
import { Compass, ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { QuestImportButton } from "@/components/quest-import-button";
import { useQuests } from "@/hooks/use-quests";

export default function PlayPage() {
  const { quests, refreshQuests } = useQuests();

  return (
    <>
      <AppHeader title="Meine Quests" />
      {quests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
          <Compass className="w-12 h-12 text-gq-grey" />
          <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">
            Keine Quests geladen
          </p>
          <p className="font-body text-sm text-gq-grey max-w-xs">
            Importiere deine erste Quest, um loszulegen.
          </p>
          <div className="mt-4">
            <QuestImportButton variant="dark" onImportSuccess={refreshQuests} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 px-5 py-4">
            <ul className="flex flex-col gap-3">
              {quests.map((quest) => (
                <li key={quest.id}>
                  <Link
                    href={`/play/${quest.id}`}
                    className="flex items-center justify-between p-4 rounded-card border border-border bg-card shadow-card transition-all duration-base ease-gq hover:border-gq-grey-dark hover:shadow-card-hover active:scale-[0.98]"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-tech text-xs truncate">{quest.name}</span>
                      <span className="font-body text-xs text-gq-grey">
                        {quest.stations.length} {quest.stations.length === 1 ? "Ziel" : "Ziele"}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gq-grey flex-shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <QuestImportButton variant="dark" floating onImportSuccess={refreshQuests} />
        </>
      )}
    </>
  );
}
