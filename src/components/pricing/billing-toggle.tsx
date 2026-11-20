"use client";

import type { BillingCycle } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CYCLE_LABEL, yearlySavingsSentence } from "./pricing-logic";
import { Segmented } from "./segmented";

const OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: CYCLE_LABEL.monthly },
  { value: "yearly", label: CYCLE_LABEL.yearly },
];

interface BillingToggleProps {
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  /** Replaces the sentence that states the yearly saving of each plan */
  note?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Monthly or yearly billing, with what the yearly cycle saves in real euros. */
export function BillingToggle({ cycle, onChange, note, disabled, className }: BillingToggleProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Segmented label="Cycle de facturation" value={cycle} onChange={onChange} options={OPTIONS} disabled={disabled} />
      <p className="max-w-[40ch] text-sm text-brume">
        {note ?? `En annuel, tu économises chaque année ${yearlySavingsSentence()}.`}
      </p>
    </div>
  );
}
