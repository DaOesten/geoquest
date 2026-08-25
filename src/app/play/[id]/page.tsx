"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { QuestPlayer } from "@/components/quest-player";
import { getQuestById } from "@/lib/quest-storage";

interface PlayQuestPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayQuestPage({ params }: PlayQuestPageProps) {
  const { id } = use(params);
  const quest = getQuestById(id);

  if (!quest) {
    notFound();
  }

  return <QuestPlayer quest={quest} />;
}
