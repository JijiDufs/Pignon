import { HEAT } from "@/lib/data";
import type { Heat } from "@/lib/types";
import { cn } from "@/lib/utils";

/** CSS colour of each heat level. Use for inline styles and SVG fills. */
export const HEAT_COLOR: Record<Heat, string> = {
  hot: "var(--color-heat-hot)",
  warm: "var(--color-heat-warm)",
  mild: "var(--color-heat-mild)",
  cold: "var(--color-heat-cold)",
};

/** The same colours as plain hex, for the map canvas (it cannot read CSS variables). */
export const HEAT_HEX: Record<Heat, string> = {
  hot: "#ff4a1c",
  warm: "#ff8d52",
  mild: "#ffc09c",
  cold: "#c9ccd1",
};

/** "Brûlant", "Chaud"… with its colour dot. */
export function HeatLabel({ heat, className }: { heat: Heat; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-ui font-medium", className)}>
      <span aria-hidden="true" className="size-2 rounded-full" style={{ background: HEAT_COLOR[heat] }} />
      {HEAT[heat].label}
    </span>
  );
}
