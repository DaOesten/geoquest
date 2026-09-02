"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface MultipleChoiceTaskProps {
  question: string;
  options: string[];
  correctIndices: number[];
  solved: boolean;
  onSolved: () => void;
}

export function MultipleChoiceTask({ question, options, correctIndices, solved, onSolved }: MultipleChoiceTaskProps) {
  const isMulti = correctIndices.length > 1;
  const questionId = useId();
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  // Checking only succeeds when `selected` exactly equals `correctIndices`, so once solved,
  // the canonical answer IS what the user picked — display it directly rather than storing it.
  const displaySelected = solved ? correctIndices : selected;

  const handleCheckboxToggle = (index: number) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCheck = () => {
    const isCorrect =
      selected.length === correctIndices.length &&
      selected.every((i) => correctIndices.includes(i));

    if (isCorrect) {
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

  const optionRowClass = (isSelected: boolean) =>
    `flex items-center gap-3 w-full min-h-[44px] px-4 py-3 rounded-[12px] border font-body text-sm text-foreground transition-all duration-fast ${
      solved ? "cursor-default" : "cursor-pointer"
    } ${
      isSelected
        ? "border-gq-teal bg-gq-teal/10"
        : "border-border/30 bg-gq-black/30" + (solved ? "" : " hover:border-border/50")
    }`;

  return (
    <div className={`rounded-card bg-gq-dark-teal ${borderClass} p-5 transition-colors duration-base`}>
      <span className="text-tech text-[10px] text-gq-grey">Aufgabe</span>
      <p id={questionId} className="font-body text-base leading-relaxed text-foreground mt-1 mb-4">{question}</p>

      {isMulti ? (
        <div className="space-y-3">
          <div className="space-y-2" role="group" aria-labelledby={questionId}>
            {options.map((option, i) => {
              const isSelected = displaySelected.includes(i);
              const optionId = `${questionId}-option-${i}`;
              return (
                <label key={i} htmlFor={optionId} className={optionRowClass(isSelected)}>
                  <Checkbox
                    id={optionId}
                    checked={isSelected}
                    disabled={solved}
                    onCheckedChange={() => handleCheckboxToggle(i)}
                    className="shrink-0 h-5 w-5 rounded-[4px] border-2 border-gq-grey/50 data-[state=checked]:border-gq-teal data-[state=checked]:bg-gq-teal data-[state=checked]:text-gq-black disabled:opacity-100"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
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
                disabled={selected.length === 0}
                className="w-full h-12 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast disabled:bg-[#2B3438] disabled:text-[#5B646A]"
              >
                Prüfen
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <RadioGroup
            value={displaySelected[0]?.toString() ?? ""}
            onValueChange={(value) => setSelected([Number(value)])}
            aria-labelledby={questionId}
            disabled={solved}
            className="space-y-2"
          >
            {options.map((option, i) => {
              const isSelected = displaySelected.includes(i);
              const optionId = `${questionId}-option-${i}`;
              return (
                <label key={i} htmlFor={optionId} className={optionRowClass(isSelected)}>
                  <RadioGroupItem
                    id={optionId}
                    value={i.toString()}
                    className="shrink-0 h-5 w-5 border-2 border-gq-grey/50 text-gq-teal data-[state=checked]:border-gq-teal disabled:opacity-100"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </RadioGroup>

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
                disabled={selected.length === 0}
                className="w-full h-12 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast disabled:bg-[#2B3438] disabled:text-[#5B646A]"
              >
                Prüfen
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
