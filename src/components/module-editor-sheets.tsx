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
import { GripVertical, Plus, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { DraftModule } from "@/lib/quest-storage";

export type ModuleType = "text" | "image" | "audio" | "video" | "task";
export type TaskType = "code" | "multiple-choice" | "sorting";

interface ModuleEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The module being edited, or null when creating a new one. */
  module: DraftModule | null;
  /** Type of a new module — ignored when `module` is set (the existing module's type is used instead). */
  newModuleType: ModuleType | null;
  newTaskType: TaskType | null;
  onSave: (draft: DraftModule) => void;
}

const MEDIA_LABELS: Record<"image" | "audio" | "video", { title: string; placeholder: string }> = {
  image: { title: "Bild-Modul", placeholder: "https://beispiel.de/bild.jpg" },
  audio: { title: "Audio-Modul", placeholder: "https://beispiel.de/ton.mp3" },
  video: { title: "Video-Modul", placeholder: "https://beispiel.de/video.mp4" },
};

/**
 * Routes to the correct typed editor Sheet based on the module being edited
 * (or the type chosen in ModuleTypePicker for a new module). Only one Sheet
 * is ever mounted/open at a time — the parent page owns which module/type is active.
 */
export function ModuleEditorSheet({ open, onOpenChange, module, newModuleType, newTaskType, onSave }: ModuleEditorSheetProps) {
  const type = module?.type ?? newModuleType;
  const taskType = module?.type === "task" ? module.taskType : newTaskType;

  if (type === "text") {
    return <TextModuleSheet open={open} onOpenChange={onOpenChange} module={module as Extract<DraftModule, { type: "text" }> | null} onSave={onSave} />;
  }
  if (type === "image" || type === "video" || type === "audio") {
    return (
      <MediaModuleSheet
        open={open}
        onOpenChange={onOpenChange}
        mediaType={type}
        module={module as Extract<DraftModule, { type: "image" | "audio" | "video" }> | null}
        onSave={onSave}
      />
    );
  }
  if (type === "task" && taskType === "code") {
    return <CodeTaskSheet open={open} onOpenChange={onOpenChange} module={module as Extract<DraftModule, { taskType: "code" }> | null} onSave={onSave} />;
  }
  if (type === "task" && taskType === "multiple-choice") {
    return (
      <MultipleChoiceSheet
        open={open}
        onOpenChange={onOpenChange}
        module={module as Extract<DraftModule, { taskType: "multiple-choice" }> | null}
        onSave={onSave}
      />
    );
  }
  if (type === "task" && taskType === "sorting") {
    return <SortingTaskSheet open={open} onOpenChange={onOpenChange} module={module as Extract<DraftModule, { taskType: "sorting" }> | null} onSave={onSave} />;
  }
  return null;
}

function SheetShell({
  open,
  onOpenChange,
  title,
  children,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Radix portals to <body>, outside the light-themed container from create/layout.tsx — re-apply the theme
          here so descendants without their own explicit color class render correctly (see PROJ-6/7 pattern). */}
      <SheetContent
        side="bottom"
        data-theme="light"
        className="text-foreground h-[92dvh] max-w-none sm:max-w-none flex flex-col gap-4 rounded-t-card overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="font-display italic text-2xl uppercase text-foreground">{title}</SheetTitle>
        </SheetHeader>

        {children}

        <SheetFooter className="mt-auto pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-pill h-11 text-tech text-xs tracking-[0.08em]"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={onSave}
            className="rounded-pill h-11 bg-primary text-primary-foreground text-tech text-xs tracking-[0.08em] active:scale-[0.96] transition-all duration-fast ease-gq"
          >
            Speichern
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function TextModuleSheet({
  open,
  onOpenChange,
  module,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Extract<DraftModule, { type: "text" }> | null;
  onSave: (draft: DraftModule) => void;
}) {
  const [content, setContent] = useState(module?.content ?? "");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setContent(module?.content ?? "");
  }

  function handleSave() {
    onSave({ type: "text", content });
    onOpenChange(false);
  }

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title={module ? "Text bearbeiten" : "Text-Modul"} onSave={handleSave}>
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <Label htmlFor="text-content" className="text-tech text-[10px] tracking-[0.1em]">
          Inhalt
        </Label>
        <Textarea
          id="text-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"Willkommen an dieser Station …\n- Hinweis eins\n- Hinweis zwei"}
          autoFocus
          className="flex-1 min-h-[220px] resize-none"
        />
      </div>
    </SheetShell>
  );
}

function MediaModuleSheet({
  open,
  onOpenChange,
  mediaType,
  module,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaType: "image" | "audio" | "video";
  module: Extract<DraftModule, { type: "image" | "audio" | "video" }> | null;
  onSave: (draft: DraftModule) => void;
}) {
  const [url, setUrl] = useState(module?.url ?? "");
  const [caption, setCaption] = useState(module?.caption ?? "");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setUrl(module?.url ?? "");
      setCaption(module?.caption ?? "");
      setUrlError(null);
    }
  }

  function handleSave() {
    const trimmedUrl = url.trim();
    if (trimmedUrl !== "" && !trimmedUrl.startsWith("https://")) {
      setUrlError("Nur HTTPS-URLs sind erlaubt.");
      return;
    }
    onSave({ type: mediaType, url: trimmedUrl, caption: caption.trim() === "" ? undefined : caption });
    onOpenChange(false);
  }

  const { title, placeholder } = MEDIA_LABELS[mediaType];

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title={module ? `${title} bearbeiten` : title} onSave={handleSave}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="media-url" className="text-tech text-[10px] tracking-[0.1em]">
          URL
        </Label>
        <Input
          id="media-url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setUrlError(null);
          }}
          placeholder={placeholder}
          autoFocus
        />
        {urlError && <p className="font-body text-xs text-destructive">{urlError}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="media-caption" className="text-tech text-[10px] tracking-[0.1em]">
          Bildunterschrift (optional)
        </Label>
        <Input id="media-caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="z.B. Der geheime Eingang" />
      </div>
    </SheetShell>
  );
}

function CodeTaskSheet({
  open,
  onOpenChange,
  module,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Extract<DraftModule, { taskType: "code" }> | null;
  onSave: (draft: DraftModule) => void;
}) {
  const [question, setQuestion] = useState(module?.question ?? "");
  const [answer, setAnswer] = useState(module?.answer ?? "");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuestion(module?.question ?? "");
      setAnswer(module?.answer ?? "");
    }
  }

  function handleSave() {
    onSave({ type: "task", taskType: "code", question, answer });
    onOpenChange(false);
  }

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title={module ? "Code-Aufgabe bearbeiten" : "Code-Eingabe"} onSave={handleSave}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="code-question" className="text-tech text-[10px] tracking-[0.1em]">
          Frage
        </Label>
        <Textarea id="code-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Welcher Code steht auf dem Schild?" autoFocus />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="code-answer" className="text-tech text-[10px] tracking-[0.1em]">
          Richtige Antwort
        </Label>
        <Input id="code-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="z.B. 1789" />
      </div>
    </SheetShell>
  );
}

function MultipleChoiceSheet({
  open,
  onOpenChange,
  module,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Extract<DraftModule, { taskType: "multiple-choice" }> | null;
  onSave: (draft: DraftModule) => void;
}) {
  const [question, setQuestion] = useState(module?.question ?? "");
  const [options, setOptions] = useState<string[]>(module?.options ?? ["", ""]);
  const [correctIndices, setCorrectIndices] = useState<Set<number>>(new Set(module?.correctIndices ?? []));
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuestion(module?.question ?? "");
      setOptions(module?.options ?? ["", ""]);
      setCorrectIndices(new Set(module?.correctIndices ?? []));
    }
  }

  function handleAddOption() {
    if (options.length >= 5) return;
    setOptions([...options, ""]);
  }

  function handleRemoveOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
    // Re-index correctIndices so a hole left by the removed option doesn't leave
    // a stale index pointing at the wrong (shifted-up) option (see Tech Design note).
    setCorrectIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  function handleOptionChange(index: number, value: string) {
    setOptions(options.map((o, i) => (i === index ? value : o)));
  }

  function handleToggleCorrect(index: number) {
    setCorrectIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleSave() {
    onSave({
      type: "task",
      taskType: "multiple-choice",
      question,
      options,
      correctIndices: Array.from(correctIndices).sort((a, b) => a - b),
    });
    onOpenChange(false);
  }

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title={module ? "Multiple Choice bearbeiten" : "Multiple Choice"} onSave={handleSave}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="mc-question" className="text-tech text-[10px] tracking-[0.1em]">
          Frage
        </Label>
        <Textarea id="mc-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Was siehst du an dieser Station?" autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-tech text-[10px] tracking-[0.1em]">Optionen</Label>
        <div className="flex flex-col gap-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={correctIndices.has(index)}
                onCheckedChange={() => handleToggleCorrect(index)}
                aria-label={`Option ${index + 1} als korrekt markieren`}
                className="flex-shrink-0 w-6 h-6"
              />
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                disabled={options.length <= 2}
                aria-label={`Option ${index + 1} entfernen`}
                className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground transition-colors duration-fast ease-gq hover:text-destructive active:scale-[0.96] disabled:opacity-30 disabled:pointer-events-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          disabled={options.length >= 5}
          className="self-start rounded-pill h-11 text-tech text-[10px] tracking-[0.08em]"
        >
          <Plus className="w-4 h-4" />
          Option hinzufügen
        </Button>
      </div>
    </SheetShell>
  );
}

function SortingTaskSheet({
  open,
  onOpenChange,
  module,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Extract<DraftModule, { taskType: "sorting" }> | null;
  onSave: (draft: DraftModule) => void;
}) {
  const [question, setQuestion] = useState(module?.question ?? "");
  const [items, setItems] = useState<{ id: string; value: string }[]>(
    () => (module?.items ?? ["", "", ""]).map((value) => ({ id: crypto.randomUUID(), value }))
  );
  const [prevOpen, setPrevOpen] = useState(open);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuestion(module?.question ?? "");
      setItems((module?.items ?? ["", "", ""]).map((value) => ({ id: crypto.randomUUID(), value })));
    }
  }

  function handleAddItem() {
    if (items.length >= 6) return;
    setItems([...items, { id: crypto.randomUUID(), value: "" }]);
  }

  function handleRemoveItem(id: string) {
    if (items.length <= 3) return;
    setItems(items.filter((i) => i.id !== id));
  }

  function handleItemChange(id: string, value: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, value } : i)));
  }

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

  function handleSave() {
    onSave({ type: "task", taskType: "sorting", question, items: items.map((i) => i.value) });
    onOpenChange(false);
  }

  return (
    <SheetShell open={open} onOpenChange={onOpenChange} title={module ? "Sortierung bearbeiten" : "Sortierung"} onSave={handleSave}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="sorting-question" className="text-tech text-[10px] tracking-[0.1em]">
          Frage
        </Label>
        <Textarea id="sorting-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Bringe die Schritte in die richtige Reihenfolge" autoFocus />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-tech text-[10px] tracking-[0.1em]">Korrekte Reihenfolge</Label>
        {/* Own DndContext, independent of the module list's own drag context on the parent page. */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <SortableItemRow
                  key={item.id}
                  id={item.id}
                  index={index}
                  value={item.value}
                  onChange={(value) => handleItemChange(item.id, value)}
                  onRemove={() => handleRemoveItem(item.id)}
                  canRemove={items.length > 3}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          disabled={items.length >= 6}
          className="self-start rounded-pill h-11 text-tech text-[10px] tracking-[0.08em]"
        >
          <Plus className="w-4 h-4" />
          Item hinzufügen
        </Button>
      </div>
    </SheetShell>
  );
}

function SortableItemRow({
  id,
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}: {
  id: string;
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={"flex items-center gap-2" + (isDragging ? " opacity-50" : "")}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Reihenfolge ändern"
        className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Item ${index + 1}`} className="flex-1" />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label={`Item ${index + 1} entfernen`}
        className="flex-shrink-0 w-11 h-11 rounded-full grid place-items-center text-muted-foreground transition-colors duration-fast ease-gq hover:text-destructive active:scale-[0.96] disabled:opacity-30 disabled:pointer-events-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
