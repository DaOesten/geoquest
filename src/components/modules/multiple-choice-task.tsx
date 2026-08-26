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
    ? "border-gq-lime/60"
    : feedback === "wrong"
      ? "border-red-500/60 animate-shake"
      : "border-border/40";

  const optionRowClass = (isSelected: boolean) =>
    `flex items-center gap-3 w-full min-h-[44px] px-4 py-3 rounded-[12px] border cursor-pointer font-body text-sm text-foreground transition-all duration-fast ${
      isSelected
        ? "border-gq-teal bg-gq-teal/10"
        : "border-border/30 bg-gq-black/30 hover:border-border/50"
    }`;

  return (
    <div className={`rounded-card bg-gq-dark-teal border ${borderClass} p-5 transition-colors duration-base`}>
      <p id={questionId} className="font-body text-base leading-relaxed text-foreground mb-4">{question}</p>

      {solved ? (
        <div className="flex items-center gap-2 text-gq-lime">
          <div className="w-8 h-8 rounded-full bg-gq-lime/20 grid place-items-center">
            <Check className="w-4 h-4 text-gq-lime" />
          </div>
          <span className="font-tech text-sm tracking-wider uppercase">Richtig</span>
        </div>
      ) : isMulti ? (
        <div className="space-y-3">
          <div className="space-y-2" role="group" aria-labelledby={questionId}>
            {options.map((option, i) => {
              const isSelected = selected.includes(i);
              const optionId = `${questionId}-option-${i}`;
              return (
                <label key={i} htmlFor={optionId} className={optionRowClass(isSelected)}>
                  <Checkbox
                    id={optionId}
                    checked={isSelected}
                    onCheckedChange={() => handleCheckboxToggle(i)}
                    className="shrink-0 h-5 w-5 rounded-[4px] border-2 border-gq-grey/50 data-[state=checked]:border-gq-teal data-[state=checked]:bg-gq-teal data-[state=checked]:text-gq-black"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          {feedback === "wrong" && (
            <p className="font-body text-sm text-red-400">Leider falsch, versuch&apos;s nochmal!</p>
          )}

          <Button
            onClick={handleCheck}
            disabled={selected.length === 0}
            className="w-full h-12 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast disabled:bg-[#2B3438] disabled:text-[#5B646A]"
          >
            Prüfen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <RadioGroup
            value={selected[0]?.toString() ?? ""}
            onValueChange={(value) => setSelected([Number(value)])}
            aria-labelledby={questionId}
            className="space-y-2"
          >
            {options.map((option, i) => {
              const isSelected = selected.includes(i);
              const optionId = `${questionId}-option-${i}`;
              return (
                <label key={i} htmlFor={optionId} className={optionRowClass(isSelected)}>
                  <RadioGroupItem
                    id={optionId}
                    value={i.toString()}
                    className="shrink-0 h-5 w-5 border-2 border-gq-grey/50 text-gq-teal data-[state=checked]:border-gq-teal"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </RadioGroup>

          {feedback === "wrong" && (
            <p className="font-body text-sm text-red-400">Leider falsch, versuch&apos;s nochmal!</p>
          )}

          <Button
            onClick={handleCheck}
            disabled={selected.length === 0}
            className="w-full h-12 rounded-pill bg-gq-teal text-gq-black font-tech text-sm uppercase tracking-[0.1em] font-bold hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast disabled:bg-[#2B3438] disabled:text-[#5B646A]"
          >
            Prüfen
          </Button>
        </div>
      )}
    </div>
  );
}
