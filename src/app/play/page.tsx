"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Compass } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { QuestImportButton } from "@/components/quest-import-button";
import { QuestCard } from "@/components/quest-card";
import { QuestFilterTabs, type QuestFilter } from "@/components/quest-filter-tabs";

// Randomized particle positions must never be part of the SSR/hydration diff.
const QuestListBackdrop = dynamic(
  () => import("@/components/quest-list-backdrop").then((m) => m.QuestListBackdrop),
  { ssr: false }
);
import { useQuests } from "@/hooks/use-quests";
import { getProgress, deleteProgress, getQuestListStatus, type QuestListStatus } from "@/lib/quest-progress";
import { isPublished } from "@/lib/quest-storage";

const STATUS_ORDER: Record<QuestListStatus, number> = { live: 0, new: 1, done: 2 };

export default function PlayPage() {
  const { quests: allQuests, refreshQuests } = useQuests();
  const [filter, setFilter] = useState<QuestFilter>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Unpublished quests (still being built/tested in the Creator) aren't playable yet.
  const quests = useMemo(() => allQuests.filter(isPublished), [allQuests]);

  const questsWithStatus = useMemo(() => {
    return quests.map((quest) => {
      const progress = getProgress(quest.id);
      const status = getQuestListStatus(progress, quest.stations.length);
      const completedCount = progress?.completedStations.length ?? 0;
      return { quest, status, completedCount };
    });
    // refreshKey forces recomputation after a reset, since progress lives outside useQuests' snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quests, refreshKey]);

  const liveCount = useMemo(
    () => questsWithStatus.filter((q) => q.status === "live").length,
    [questsWithStatus]
  );

  const visibleQuests = useMemo(() => {
    const filtered =
      filter === "all"
        ? questsWithStatus
        : questsWithStatus.filter((q) => q.status === filter);
    return [...filtered].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }, [questsWithStatus, filter]);

  const handleReset = useCallback((questId: string) => {
    deleteProgress(questId);
    setRefreshKey((k) => k + 1);
    toast.success("Fortschritt zurückgesetzt");
  }, []);

  return (
    <>
      <QuestListBackdrop />
      <AppHeader />

      <div className="relative px-5 pt-4">
        <h1 className="font-display italic text-[clamp(1.8rem,8vw,2.4rem)] leading-[0.95] uppercase text-foreground">
          Meine Quests
        </h1>
        {quests.length > 0 && (
          <p className="mt-2 text-tech text-[10px] tracking-[0.12em] text-gq-grey uppercase">
            <span className="text-gq-teal">
              {quests.length} {quests.length === 1 ? "Quest" : "Quests"}
            </span>
            {liveCount > 0 && <> · {liveCount} live</>}
          </p>
        )}
      </div>

      {quests.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center min-h-[50vh] gap-4 px-5 text-center">
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
          <div className="relative mt-4">
            <QuestFilterTabs active={filter} onChange={setFilter} />
          </div>

          <div className="relative flex flex-col gap-3 px-5 py-4">
            {visibleQuests.length === 0 ? (
              <p className="font-body text-sm text-gq-grey text-center py-8">
                {filter === "live" ? "Keine aktiven Quests" : "Keine neuen Quests"}
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {visibleQuests.map(({ quest, status, completedCount }) => (
                  <li key={quest.id}>
                    <QuestCard
                      quest={quest}
                      status={status}
                      completedCount={completedCount}
                      onReset={() => handleReset(quest.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <QuestImportButton variant="dark" floating onImportSuccess={refreshQuests} />
        </>
      )}
    </>
  );
}
