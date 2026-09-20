"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  // Stable ids: the item text may repeat, and dnd-kit needs a key that survives reordering.
  const [items, setItems] = useState<{ id: string; value: string }[]>(() => {
    let shuffled = shuffle(correctOrder);
    while (shuffled.join(",") === correctOrder.join(",") && correctOrder.length > 1) {
      shuffled = shuffle(correctOrder);
    }
    return shuffled.map((value, i) => ({ id: `item-${i}-${crypto.randomUUID()}`, value }));
  });
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  /**
   * Long-press before a drag begins (150ms/8px), identical to the creator's
   * sortable lists. Without the delay, every vertical swipe across an item
   * reorders the list while the player only wanted to scroll past it.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  // Checking only succeeds when `items` already equals `correctOrder`, so once solved,
  // the canonical order IS the submitted order — display it directly rather than storing it.
  const displayItems = solved ? correctOrder : items.map((i) => i.value);

  const handleCheck = () => {
    if (items.map((i) => i.value).join(",") === correctOrder.join(",")) {
      setFeedback("correct");
      onSolved();
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setItems(reordered);
  }

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
        {solved ? (
          <div className="space-y-1.5">
            {displayItems.map((item, i) => (
              <div
                key={`${item}-${i}`}
                className="flex items-center gap-2 min-h-[52px] pr-3 py-3 rounded-[12px] border border-border/30 bg-gq-black/30 select-none"
              >
                <span className="flex-shrink-0 w-11 h-11 -my-1 grid place-items-center">
                  <GripVertical className="w-5 h-5 text-gq-grey/30" />
                </span>
                <span className="font-body text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <SortableItemRow key={item.id} id={item.id} value={item.value} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

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

function SortableItemRow({ id, value }: { id: string; value: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        // The lift scale goes into the same transform as dnd-kit's translate.
        // A Tailwind `scale-*` class would set `transform` too and lose to this
        // inline style, so the item would follow the finger but never grow.
        transform: CSS.Transform.toString(
          transform ? { ...transform, scaleX: isDragging ? 1.03 : 1, scaleY: isDragging ? 1.03 : 1 } : null
        ),
        transition,
      }}
      className={
        "flex items-center gap-2 min-h-[52px] pr-3 py-3 rounded-[12px] border bg-gq-black/30 select-none transition-shadow duration-fast ease-gq " +
        (isDragging
          ? "border-gq-teal/60 shadow-card-hover z-10 relative"
          : "border-border/30")
      }
    >
      {/*
        Drag listeners and `touch-action: none` belong on the handle, not the row:
        with them on the row, the browser may never scroll from anywhere on it, so
        a quick swipe to read on is swallowed instead of falling through to a scroll.
      */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`${value} verschieben`}
        className="flex-shrink-0 w-11 h-11 -my-1 rounded-full grid place-items-center text-gq-grey cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <span className="font-body text-sm text-foreground">{value}</span>
    </div>
  );
}
