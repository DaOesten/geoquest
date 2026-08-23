import { Compass } from "lucide-react";
import { AppHeader } from "@/components/app-header";

export default function PlayPage() {
  return (
    <>
      <AppHeader title="Meine Quests" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
        <Compass className="w-12 h-12 text-gq-grey" />
        <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">
          Keine Quests geladen
        </p>
        <p className="font-body text-sm text-gq-grey max-w-xs">
          Importiere eine Quest-Datei, um loszulegen.
        </p>
      </div>
    </>
  );
}
