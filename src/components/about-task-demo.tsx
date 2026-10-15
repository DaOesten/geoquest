"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeTask } from "@/components/modules/code-task";
import { MultipleChoiceTask } from "@/components/modules/multiple-choice-task";
import { SortingTask } from "@/components/modules/sorting-task";

type DemoKind = "choice" | "code" | "sorting";

const TRIGGER =
  "min-h-11 px-4 rounded-pill border border-border text-tech text-[11px] tracking-[0.08em] text-gq-grey shadow-none transition-all duration-base ease-gq hover:text-gq-teal hover:border-gq-teal/60 data-[state=active]:border-gq-teal data-[state=active]:bg-gq-teal/15 data-[state=active]:text-gq-teal data-[state=active]:shadow-none";

/**
 * Live-Demo auf /about (PROJ-13, Refinement 12): die drei Aufgabentypen der
 * App zum Ausprobieren.
 *
 * Bewusst die ECHTEN Player-Komponenten statt eines Nachbaus — was der
 * Besucher hier probiert, sieht genau so aus wie beim Spielen und kann nicht
 * auseinanderlaufen. Die Komponenten sind in sich geschlossen
 * (`solved`/`onSolved`) und schreiben nichts in den Speicher; der geloeste
 * Zustand lebt nur hier im State. Kein GPS, keine Punkte, kein Spielstand.
 *
 * Hydration: `SortingTask` mischt im `useState`-Initialisierer, Server und
 * Browser wuerden also unterschiedlich mischen. Radix rendert nur den aktiven
 * Reiter — die Sortier-Aufgabe entsteht damit erst nach einem Klick im
 * Browser, nie auf dem Server. Der Start-Reiter muss deshalb ein
 * deterministischer Aufgabentyp bleiben (ein Test haelt das fest).
 */
export function AboutTaskDemo() {
  const [solved, setSolved] = useState<Record<DemoKind, boolean>>({
    choice: false,
    code: false,
    sorting: false,
  });

  const markSolved = (kind: DemoKind) => () =>
    setSolved((prev) => ({ ...prev, [kind]: true }));

  return (
    <Tabs defaultValue="choice">
      <TabsList
        aria-label="Aufgabentyp wählen"
        className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0"
      >
        <TabsTrigger value="choice" className={TRIGGER}>
          Multiple Choice
        </TabsTrigger>
        <TabsTrigger value="code" className={TRIGGER}>
          Code
        </TabsTrigger>
        <TabsTrigger value="sorting" className={TRIGGER}>
          Sortieren
        </TabsTrigger>
      </TabsList>

      <TabsContent value="choice" className="mt-5 max-w-[560px]">
        <MultipleChoiceTask
          question="Welches Tier kann seinen Kopf fast ganz nach hinten drehen?"
          options={["Eichhörnchen", "Eule", "Igel"]}
          correctIndices={[1]}
          solved={solved.choice}
          onSolved={markSolved("choice")}
        />
      </TabsContent>
      <TabsContent value="code" className="mt-5 max-w-[560px]">
        <CodeTask
          question="Zähle die Beine einer Spinne. Wie viele sind es?"
          answer="8"
          solved={solved.code}
          onSolved={markSolved("code")}
        />
      </TabsContent>
      <TabsContent value="sorting" className="mt-5 max-w-[560px]">
        <SortingTask
          question="Bring die Entwicklung des Frosches in die richtige Reihenfolge."
          items={["Laich", "Kaulquappe", "Kaulquappe mit Beinen", "Frosch"]}
          solved={solved.sorting}
          onSolved={markSolved("sorting")}
        />
      </TabsContent>
    </Tabs>
  );
}
