"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CodeTaskProps {
  question: string;
  answer: string;
  solved: boolean;
  onSolved: () => void;
}

export function CodeTask({ question, answer, solved, onSolved }: CodeTaskProps) {
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const handleCheck = () => {
    if (input.trim().toLowerCase() === answer.trim().toLowerCase()) {
      setFeedback("correct");
      onSolved();
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 1500);
    }
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
        <Input
          value={solved ? answer : input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Deine Antwort..."
          readOnly={solved}
          disabled={solved}
          className="bg-gq-black/50 border-border/30 text-foreground font-body disabled:opacity-100 disabled:cursor-default"
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) handleCheck();
          }}
        />

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
              disabled={!input.trim()}
              className="w-full h-12 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast disabled:bg-[#2B3438] disabled:text-[#5B646A]"
            >
              Prüfen
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
