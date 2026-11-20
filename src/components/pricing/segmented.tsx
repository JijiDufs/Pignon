"use client";

import { useId } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { motion } from "motion/react";
import { vif } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  /** Accessible name of the group */
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  /** Options share the full width (phones) */
  stretch?: boolean;
  disabled?: boolean;
  className?: string;
}

/** A single choice among a few short options. The lit pill slides to the chosen one. */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  stretch = false,
  disabled = false,
  className,
}: SegmentedProps<T>) {
  const pill = useId();

  return (
    <RadioGroup
      aria-label={label}
      value={value}
      disabled={disabled}
      onValueChange={(next) => onChange(next as T)}
      className={cn(
        "rounded-xl bg-nuit-700 p-1",
        stretch ? "flex w-full" : "inline-flex w-fit",
        disabled && "opacity-60",
        className,
      )}
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          className={cn(
            "relative flex h-9 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium whitespace-nowrap text-brume transition-colors hover:text-craie data-checked:text-craie data-disabled:cursor-not-allowed",
            stretch && "min-w-0 flex-1 px-2",
          )}
        >
          {value === option.value && (
            <motion.span layoutId={pill} transition={vif} className="absolute inset-0 rounded-lg bg-nuit-800 shadow-petit" />
          )}
          <span className="relative">{option.label}</span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
