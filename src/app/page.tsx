import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Pencil } from "lucide-react";
import { ModeCard } from "@/components/mode-card";
import { FirstVisitDialog } from "@/components/first-visit-dialog";
import { AppNavMenu } from "@/components/app-nav-menu";

export default function StartScreen() {
  return (
    /* `relative` traegt den Positionierungs-Kontext fuer das Menu unten: ohne
       ihn bezoege sich `absolute` auf den Viewport, und das Icon saesse bei
       zentriertem Layout am Bildschirm- statt am Container-Rand. */
    <main className="relative flex flex-col min-h-dvh bg-gq-black overflow-y-auto px-5 py-6 mx-auto w-full max-w-[430px]">
      {/* Burger-Menu (BUG-10, 2026-09-10). Bewusst KEIN `AppHeader`: dessen
          56px-Zeile haette den Startscreen auf 360x640 zum Ueberlaufen
          gebracht (gemessen: Inhalt endet dann bei 615/640) und das Kriterium
          "ohne Scrollen sichtbar" gebrochen. `/` braucht ohnehin weder
          Zurueck-Pfeil (oberste Ebene) noch Titel — also auch keine Zeile fuer
          beides. Absolut positioniert kostet das Icon 0px Layout-Hoehe; die
          Zone oben rechts ist auf 320-390px Breite frei.

          `top-3 right-3` statt der Screen-Gutter von 20px: das Tap-Ziel ist
          44x44 mit dem Icon in der Mitte, damit sitzt das Icon optisch auf
          derselben Hoehe wie in `AppHeader`. */}
      <div className="absolute top-3 right-3 z-10">
        <AppNavMenu />
      </div>

      {/* Logo — fuehrt zur Landing Page (PROJ-13). Bewusst ohne sichtbaren
          Link-Hinweis: das Lockup ist ein Markenelement, der Link ein
          Bonus-Pfad neben den beiden Mode-Cards. */}
      <div className="grid place-items-center">
        <Link
          href="/about"
          aria-label="Geo Quest — Was ist das?"
          className="inline-block w-3/5 max-w-[240px] rounded-[12px] outline-none transition-all duration-[120ms] [transition-timing-function:cubic-bezier(.16,.84,.44,1)] active:scale-[0.97] active:opacity-90 focus-visible:ring-[3px] focus-visible:ring-[rgba(0,224,209,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-gq-black"
        >
          <Image
            src="/assets/logo-lockup.png"
            alt="Geo Quest"
            width={390}
            height={260}
            priority
            className="w-full h-auto object-contain"
          />
        </Link>
      </div>

      {/* Headline + Subtitle */}
      <div className="text-center mt-6">
        <h1 className="text-display text-[clamp(24px,8vw,32px)] leading-[0.96] text-gq-white">
          Bist du bereit
        </h1>
        <h1 className="text-display text-[clamp(24px,8vw,32px)] leading-[0.96] text-gq-teal">
          für dein Abenteuer?
        </h1>
        <div className="mx-auto mt-1.5 w-2/5 max-w-[190px] h-[3px] rounded-full bg-gq-teal opacity-70" />
        <p className="mx-auto mt-3 max-w-[290px] font-body text-[clamp(13px,4vw,15px)] leading-relaxed text-[#E7EAEC]">
          Spiele eine Quest oder bau deine eigene.
        </p>
      </div>

      {/* Mode Cards */}
      <div className="flex flex-col gap-5 mt-5">
        <ModeCard
          title="Deine Quests"
          description="Spiele Outdoor Quests, finde die Stationen, löse alle Aufgaben."
          href="/play"
          icon={<Gamepad2 className="w-6 h-6" />}
          accent="teal"
        />
        <ModeCard
          title="Quest Creator"
          description="Eigene Route setzen, Aufgaben schreiben, Quest mit deinen Freunden teilen."
          href="/create"
          icon={<Pencil className="w-6 h-6" />}
          accent="lime"
        />
      </div>

      <FirstVisitDialog />
    </main>
  );
}
