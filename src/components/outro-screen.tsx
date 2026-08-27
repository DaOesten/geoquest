"use client";

import { Check } from "lucide-react";
import type { Quest } from "@/lib/quest-schema";
import { ConfettiEffect } from "./confetti-effect";

interface OutroScreenProps {
  quest: Quest;
  completedCount: number;
  totalCount: number;
  onDone: () => void;
}

export function OutroScreen({ quest, completedCount, totalCount, onDone }: OutroScreenProps) {
  const { outro } = quest;

  return (
    <div className="relative flex flex-col overflow-hidden">
      <style>{`
        @keyframes gq-pop {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes gq-rise {
          0% { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Confetti — falling from top */}
      <ConfettiEffect />

      {/* Background atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 10%, rgba(198,255,0,.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center px-5 pt-10 pb-6 text-center">
        {/* Brand pin with checkmark badge */}
        <div
          className="relative"
          style={{ animation: "gq-pop 0.5s cubic-bezier(.34,1.56,.64,1) 0.1s both" }}
        >
          <img
            src="/assets/mark-pin.jpg"
            alt=""
            className="w-28 h-28 object-contain rounded-2xl"
          />
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-gq-lime grid place-items-center shadow-glow-lime border-[3px] border-gq-black">
            <Check className="w-5 h-5 text-gq-black" strokeWidth={3} />
          </div>
        </div>

        {/* Headline */}
        <div
          className="mt-6"
          style={{ animation: "gq-pop 0.4s cubic-bezier(.34,1.56,.64,1) 0.3s both" }}
        >
          <h1 className="font-display italic text-[clamp(2rem,8vw,3.5rem)] leading-[0.95] uppercase text-foreground">
            {quest.name}
          </h1>
          <div className="mx-auto mt-2 w-2/5 max-w-[160px] h-[3px] rounded-full bg-gq-teal opacity-70" />
        </div>

        <p
          className="mt-3 text-tech text-[11px] tracking-[0.14em] text-gq-lime uppercase"
          style={{ animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.4s both" }}
        >
          {completedCount} von {totalCount} {totalCount === 1 ? "Station" : "Stationen"} abgeschlossen
        </p>

        {/* Media */}
        {outro.mediaUrl && outro.mediaType === "image" && (
          <div
            className="relative w-full rounded-card overflow-hidden border border-border/50 mt-6 shadow-card"
            style={{ animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.5s both" }}
          >
            <img
              src={outro.mediaUrl}
              alt=""
              className="w-full h-52 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gq-black/60 via-transparent to-transparent" />
          </div>
        )}

        {outro.mediaUrl && outro.mediaType === "audio" && (
          <audio controls className="w-full mt-6" preload="none">
            <source src={outro.mediaUrl} />
          </audio>
        )}

        {outro.mediaUrl && outro.mediaType === "video" && (
          <div className="w-full rounded-card overflow-hidden border border-border/50 mt-6 shadow-card">
            <video controls className="w-full" preload="none" playsInline>
              <source src={outro.mediaUrl} />
            </video>
          </div>
        )}

        {/* Outro text */}
        <p
          className="mt-6 font-body text-[15px] text-foreground/90 whitespace-pre-line leading-relaxed text-left w-full"
          style={{ animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.6s both" }}
        >
          {outro.text}
        </p>

        {/* CTA */}
        <div
          className="pt-8 pb-[14px] w-full"
          style={{ animation: "gq-rise 0.4s cubic-bezier(.16,.84,.44,1) 0.8s both" }}
        >
          <button
            onClick={onDone}
            className="w-full h-14 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold shadow-glow-strong hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
}
