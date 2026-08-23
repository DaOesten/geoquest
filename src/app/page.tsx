import Image from "next/image";
import { Compass, PenTool } from "lucide-react";
import { ModeCard } from "@/components/mode-card";
import { FirstVisitDialog } from "@/components/first-visit-dialog";

export default function StartScreen() {
  return (
    <main className="flex flex-col items-center justify-center min-h-dvh px-5 py-12 gap-10 bg-gq-black">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/assets/logo-lockup.png"
          alt="Geo Quest"
          width={260}
          height={100}
          priority
          className="w-[260px] h-auto"
        />
        <p className="text-tech text-xs text-gq-grey tracking-[0.12em]">
          Navigiere. Entdecke. Löse.
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <ModeCard
          title="Play"
          description="Finde Ziele, löse Aufgaben"
          href="/play"
          icon={<Compass className="w-8 h-8" />}
        />
        <ModeCard
          title="Create"
          description="Bau deine eigene Quest"
          href="/create"
          icon={<PenTool className="w-8 h-8" />}
        />
      </div>

      <FirstVisitDialog />
    </main>
  );
}
