import { PenTool } from "lucide-react";
import { AppHeader } from "@/components/app-header";

export default function CreatePage() {
  return (
    <>
      <AppHeader title="Meine Quests" variant="light" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
        <PenTool className="w-12 h-12 text-gq-grey" />
        <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">
          Noch keine Quests erstellt
        </p>
        <p className="font-body text-sm text-[#5B646A] max-w-xs">
          Erstelle deine erste Quest und teile sie mit Freunden.
        </p>
      </div>
    </>
  );
}
