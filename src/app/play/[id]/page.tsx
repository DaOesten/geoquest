import { AppHeader } from "@/components/app-header";
import { MapPinOff } from "lucide-react";

export default function PlayQuestPage() {
  return (
    <>
      <AppHeader title="Quest" backHref="/play" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
        <MapPinOff className="w-12 h-12 text-gq-grey" />
        <p className="font-body text-sm text-gq-grey">
          Quest-Player wird in PROJ-3 implementiert.
        </p>
      </div>
    </>
  );
}
