"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioModuleProps {
  url: string;
  caption?: string;
}

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
      <div className="w-full rounded-card bg-gq-dark-teal border border-border/40 p-4 flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-gq-teal grid place-items-center shrink-0 active:scale-[0.96] transition-transform duration-fast"
          aria-label={playing ? "Pause" : "Abspielen"}
        >
          {playing ? (
            <Pause className="w-5 h-5 text-gq-black" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 text-gq-black ml-0.5" fill="currentColor" />
          )}
        </button>
        <div className="flex-1 space-y-1.5">
          <div
            className="h-2 rounded-full bg-gq-black/50 cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="absolute inset-y-0 left-0 bg-gq-teal rounded-full transition-[width] duration-100"
              style={{ width: `${progress * 100}%` }}
            />
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
