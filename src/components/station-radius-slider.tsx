"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Fixed steps rather than a free-running range (PROJ-7 spec + Tech Design
// decision): easier to grasp for creators without GPS knowledge, and more
// precise to hit by touch than dragging to an arbitrary meter value.
const RADIUS_STEPS = [10, 25, 50, 100] as const;

interface StationRadiusSliderProps {
  value: number;
  onChange: (radiusMeters: number) => void;
}

// Maps an arbitrary radius (e.g. from an imported quest whose radiusMeters
// isn't one of the 4 UI steps, see PROJ-7 QA BUG-2) to the closest step index,
// instead of indexOf's -1 collapsing to 0 — which silently parked the thumb at
// 10m and made the first nudge shrink the radius instead of moving from it.
function closestStepIndex(value: number): number {
  let closest = 0;
  let smallestDiff = Infinity;
  RADIUS_STEPS.forEach((step, index) => {
    const diff = Math.abs(step - value);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = index;
    }
  });
  return closest;
}

export function StationRadiusSlider({ value, onChange }: StationRadiusSliderProps) {
  const stepIndex = closestStepIndex(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-tech text-[10px] tracking-[0.1em]">Ankunftsradius</Label>
        <span className="font-body text-sm text-foreground">{value} m</span>
      </div>
      <Slider
        min={0}
        max={RADIUS_STEPS.length - 1}
        step={1}
        value={[stepIndex]}
        onValueChange={([nextIndex]) => onChange(RADIUS_STEPS[nextIndex])}
        aria-label="Ankunftsradius"
      />
      <div className="flex justify-between font-body text-xs text-muted-foreground">
        {RADIUS_STEPS.map((step) => (
          <span key={step}>{step} m</span>
        ))}
      </div>
    </div>
  );
}
