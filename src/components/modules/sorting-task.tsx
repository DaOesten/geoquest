"use client";

import { useState, useRef, useCallback } from "react";
import { Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortingTaskProps {
  question: string;
  items: string[];
  solved: boolean;
  onSolved: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function SortingTask({ question, items: correctOrder, solved, onSolved }: SortingTaskProps) {
  const [items, setItems] = useState<string[]>(() => {
    let shuffled = shuffle(correctOrder);
    while (shuffled.join(",") === correctOrder.join(",") && correctOrder.length > 1) {
      shuffled = shuffle(correctOrder);
    }
    return shuffled;
  });
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const touchStartY = useRef(0);
  const touchItem = useRef<number | null>(null);
  // Checking only succeeds when `items` already equals `correctOrder`, so once solved,
  // the canonical order IS the submitted order — display it directly rather than storing it.
  const displayItems = solved ? correctOrder : items;

  const handleCheck = () => {
    if (items.join(",") === correctOrder.join(",")) {
      setFeedback("correct");
      onSolved();
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const moveItem = useCallback((from: number, to: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragging(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragging !== null && dragging !== index) {
      moveItem(dragging, index);
    }
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    touchStartY.current = e.touches[0].clientY;
    touchItem.current = index;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchItem.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    // min-h-[52px] row + 6px (space-y-1.5) gap between rows
    const itemHeight = 58;
    const steps = Math.round(diff / itemHeight);
    if (steps !== 0) {
      const from = touchItem.current;
      const to = Math.max(0, Math.min(items.length - 1, from + steps));
      if (from !== to) {
        moveItem(from, to);
        touchItem.current = to;
        touchStartY.current = currentY;
      }
    }
  };

  const handleTouchEnd = () => {
    touchItem.current = null;
  };

  const borderClass = solved
    ? "border-2 border-gq-lime/60"
    : feedback === "wrong"
      ? "border-2 border-destructive/60 animate-shake"
      : "border-2 border-gq-teal/30 shadow-glow";

  return (
    <div className={`rounded-card bg-gq-dark-teal ${borderClass} p-5 transition-colors duration-base`}>
      <span className="text-tech text-[10px] text-gq-grey">Aufgabe</span>
      <p className="font-body text-base leading-relaxed text-foreground mt-1 mb-4">{question}</p>

      <div className="space-y-3">
        <div className="space-y-1.5">
          {displayItems.map((item, i) => (
            <div
              key={`${item}-${i}`}
              draggable={!solved}
              onDragStart={solved ? undefined : (e) => handleDragStart(e, i)}
              onDragOver={solved ? undefined : (e) => handleDragOver(e, i)}
              onDrop={solved ? undefined : (e) => handleDrop(e, i)}
              onDragEnd={solved ? undefined : handleDragEnd}
              onTouchStart={solved ? undefined : (e) => handleTouchStart(e, i)}
              onTouchMove={solved ? undefined : handleTouchMove}
              onTouchEnd={solved ? undefined : handleTouchEnd}
              className={`flex items-center gap-2 min-h-[52px] px-3 py-3 rounded-[12px] border bg-gq-black/30 select-none transition-all duration-fast ${
                solved
                  ? "border-border/30"
                  : "cursor-grab active:cursor-grabbing " +
                    (dragging === i
                      ? "opacity-50 scale-95"
                      : dragOver === i
                        ? "border-gq-teal/60 bg-gq-teal/5"
                        : "border-border/30")
              }`}
            >
              <GripVertical className={`w-5 h-5 shrink-0 ${solved ? "text-gq-grey/30" : "text-gq-grey"}`} />
              <span className="font-body text-sm text-foreground">{item}</span>
            </div>
          ))}
        </div>

        {solved ? (
          <div className="flex items-center gap-2 text-gq-lime">
            <div className="w-8 h-8 rounded-full bg-gq-lime/20 grid place-items-center">
              <Check className="w-4 h-4 text-gq-lime" />
            </div>
            <span className="font-tech text-sm tracking-wider uppercase">Richtig</span>
          </div>
        ) : (
          <>
            {feedback === "wrong" && (
              <div className="rounded-md border-2 border-destructive/60 bg-destructive/10 px-3.5 py-3">
                <p className="font-body text-sm leading-relaxed text-foreground">Leider falsch, versuch&apos;s nochmal!</p>
              </div>
            )}
            <Button
              onClick={handleCheck}
              className="w-full h-12 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast"
            >
              Prüfen
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
