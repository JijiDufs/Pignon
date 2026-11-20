"use client";

import { Slider } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

interface CurseurProps {
  /** The question the slider answers, shown above it and read as its name */
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** The value as shown and as announced: "2 sites", "1 500 €", "5 km" */
  format: (value: number) => string;
  className?: string;
}

/**
 * The brand slider: a question, its answer in large type, and a thumb big enough for a finger.
 * (The shared `ui/slider` has no visible label and a 12 px thumb.)
 */
export function Curseur({ label, value, onChange, min, max, step = 1, format, className }: CurseurProps) {
  return (
    <Slider.Root
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      step={step}
      thumbAlignment="edge"
      className={cn("flex flex-col", className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <Slider.Label className="text-base font-medium">{label}</Slider.Label>
        <span aria-hidden="true" className="cote shrink-0 text-2xl font-medium">
          {format(value)}
        </span>
      </div>
      <Slider.Control className="mt-1 flex h-11 w-full cursor-pointer touch-none items-center select-none">
        <Slider.Track className="h-2 w-full rounded-full bg-nuit-600 select-none">
          <Slider.Indicator className="rounded-full bg-craie select-none" />
          <Slider.Thumb
            getAriaValueText={(_, current) => format(current)}
            className="size-6 rounded-full bg-nuit-950 shadow-flottant ring-[1.5px] ring-craie select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-craie"
          />
        </Slider.Track>
      </Slider.Control>
      <div aria-hidden="true" className="flex justify-between text-ui text-pave">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </Slider.Root>
  );
}
