import { BatteryFull, Signal, Wifi } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
  /** Breite des Rahmens, z. B. `w-[230px] sm:w-[260px]`. */
  className?: string;
}

/**
 * Neutrales Smartphone in CSS (PROJ-13, Refinement 13) — für das Handy im
 * Hero und die Quest-Simulation auf /about.
 *
 * Klar als Handy erkennbar (schmaler Rand, Kamera-Aussparung, Statusleiste,
 * Seitentasten), aber ohne Marke: kein Mockup-Bild eines bestimmten Geräts,
 * damit niemand „das falsche Handy" sieht und nichts zusätzlich lädt.
 *
 * Die Statusleiste zeichnet der Rahmen selbst; was darunter liegt
 * (Screenshot oder iframe), beginnt mit der Kopfzeile der App.
 */
export function PhoneFrame({ children, className = "" }: PhoneFrameProps) {
  return (
    <div
      className={`relative rounded-[44px] bg-[#05080A] p-[7px] ring-1 ring-white/10 shadow-[0_0_0_1px_rgba(0,224,209,0.16),0_0_48px_rgba(0,224,209,0.16),0_24px_48px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* Seitentasten: links Lautstärke, rechts Ein/Aus. Rein dekorativ. */}
      <span aria-hidden className="absolute -left-[3px] top-[96px] h-7 w-[3px] rounded-l bg-[#1B2327]" />
      <span aria-hidden className="absolute -left-[3px] top-[136px] h-12 w-[3px] rounded-l bg-[#1B2327]" />
      <span aria-hidden className="absolute -right-[3px] top-[120px] h-16 w-[3px] rounded-r bg-[#1B2327]" />

      <div className="relative overflow-hidden rounded-[37px] bg-background">
        {/* Statusleiste mit Kamera-Aussparung in der Mitte. */}
        <div
          aria-hidden
          className="relative flex h-[30px] items-center justify-between px-6 font-body text-[12px] font-semibold text-foreground"
        >
          <span>9:41</span>
          <span className="absolute left-1/2 top-[7px] h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <Signal className="h-3 w-3" strokeWidth={2.5} />
            <Wifi className="h-3 w-3" strokeWidth={2.5} />
            <BatteryFull className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
