"use client";

import type { Quest } from "@/lib/quest-schema";

interface IntroScreenProps {
  quest: Quest;
  onStart: () => void;
}

export function IntroScreen({ quest, onStart }: IntroScreenProps) {
  const { intro } = quest;

  return (
    <div className="relative overflow-hidden">
      {/* Background atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 10%, rgba(0,224,209,.08) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col px-5 pt-8 pb-6">
        {/* Header area */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          {/* Decorative pin icon */}
          <div className="w-16 h-16 grid place-items-center mb-2">
            <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="#00E0D1"
                style={{
                  filter: "drop-shadow(0 0 12px rgba(0,224,209,.5))",
                }}
              />
              <circle cx="12" cy="9" r="2.5" fill="#0B0F12" />
            </svg>
          </div>

          <h1 className="font-display italic text-[clamp(2rem,8vw,3.5rem)] leading-[0.95] uppercase tracking-wide text-foreground">
            {quest.name}
          </h1>

          {/* Meta badges */}
          <div className="flex items-center gap-3 mt-2">
            {quest.estimatedDuration && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-badge bg-gq-dark-teal border border-border/40 text-tech text-[10px] tracking-[0.1em] text-gq-grey uppercase">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-gq-teal" fill="currentColor">
                  <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm0 2a6 6 0 100 12A6 6 0 008 2zm.5 2v4.25l2.9 1.72-.75 1.27L7.5 9V4h1z" />
                </svg>
                {quest.estimatedDuration}
              </span>
            )}
            {quest.stations.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-badge bg-gq-dark-teal border border-border/40 text-tech text-[10px] tracking-[0.1em] text-gq-grey uppercase">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-gq-lime" fill="currentColor">
                  <path d="M8 1a5 5 0 00-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                {quest.stations.length} {quest.stations.length === 1 ? "Ziel" : "Ziele"}
              </span>
            )}
          </div>
        </div>

        {/* Media */}
        {intro.mediaUrl && intro.mediaType === "image" && (
          <div className="relative rounded-card overflow-hidden border border-border/50 mb-6 shadow-card">
            <img
              src={intro.mediaUrl}
              alt=""
              className="w-full h-52 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gq-black/60 via-transparent to-transparent" />
          </div>
        )}

        {intro.mediaUrl && intro.mediaType === "audio" && (
          <audio controls className="w-full mb-6" preload="none">
            <source src={intro.mediaUrl} />
          </audio>
        )}

        {intro.mediaUrl && intro.mediaType === "video" && (
          <div className="rounded-card overflow-hidden border border-border/50 mb-6 shadow-card">
            <video controls className="w-full" preload="none" playsInline>
              <source src={intro.mediaUrl} />
            </video>
          </div>
        )}

        {/* Quest description */}
        <div>
          <p className="font-body text-[15px] text-foreground/90 whitespace-pre-line leading-relaxed">
            {intro.text}
          </p>
        </div>

        {/* CTA */}
        <div className="pt-8 pb-[14px]">
          <button
            onClick={onStart}
            className="w-full h-14 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold shadow-glow-strong hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq"
          >
            Los geht&apos;s
          </button>
        </div>
      </div>
    </div>
  );
}
