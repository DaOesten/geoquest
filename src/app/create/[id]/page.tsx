import { AppHeader } from "@/components/app-header";
import { PenTool } from "lucide-react";

export default function CreateQuestPage() {
  return (
    <>
      <AppHeader title="Quest bearbeiten" backHref="/create" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5 text-center">
        <PenTool className="w-12 h-12 text-gq-grey" />
        <p className="font-body text-sm text-[#5B646A]">
          Quest-Editor wird in PROJ-7 implementiert.
        </p>
      </div>
    </>
  );
}
