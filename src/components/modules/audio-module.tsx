"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioModuleProps {
  url: string;
  caption?: string;
}

const WAVEFORM_BAR_COUNT = 28;
// Deterministic pseudo-random heights so the waveform looks organic but stays stable across re-renders.
const WAVEFORM_HEIGHTS = Array.from({ length: WAVEFORM_BAR_COUNT }, (_, i) => {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  return 30 + (Math.abs(seed - Math.floor(seed)) * 70);
});

export function AudioModule({ url, caption }: AudioModuleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setProgress(0); };
    const onError = () => setError(true);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  if (error) {
    return (
      <div className="w-full rounded-card bg-gq-dark-teal border border-border/40 p-4 flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-gq-grey shrink-0" />
        <p className="font-body text-sm text-gq-grey">Audio konnte nicht geladen werden</p>
      </div>
    );
  }

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <audio ref={audioRef} src={url} preload="metadata" />
      <div className="w-full rounded-card bg-gq-dark-teal border border-border/40 shadow-card p-4 flex items-center gap-3.5">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gq-teal grid place-items-center shrink-0 active:scale-[0.96] transition-transform duration-fast"
          aria-label={playing ? "Pause" : "Abspielen"}
        >
          {playing ? (
            <Pause className="w-5 h-5 text-gq-black" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 text-gq-black ml-0.5" fill="currentColor" />
          )}
        </button>
        <div className="flex-1 space-y-2">
          <div
            className="flex items-end gap-[3px] h-[34px] cursor-pointer"
            onClick={handleSeek}
            role="slider"
            aria-label="Abspielposition"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
          >
            {WAVEFORM_HEIGHTS.map((height, i) => {
              const played = duration > 0 && i / WAVEFORM_BAR_COUNT <= progress;
              return (
                <span
                  key={i}
                  className={`flex-1 rounded-[2px] transition-colors duration-fast ${played ? "bg-gq-lime" : "bg-gq-grey/30"}`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between">
            <span className="font-tech text-[10px] text-gq-grey tracking-wider">
              {formatTime(progress * duration)}
            </span>
            <span className="font-tech text-[10px] text-gq-grey tracking-wider">
              {duration > 0 ? formatTime(duration) : "--:--"}
            </span>
          </div>
        </div>
      </div>
      {caption && (
        <p className="font-body text-sm text-gq-grey mt-2 px-1">{caption}</p>
      )}
    </div>
  );
}
