import type { Heat, SectorId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HEAT_COLOR } from "./heat";
import { GABLE_PATH } from "./logo";
import { SectorIcon } from "./sector-icon";

interface BusinessMarkProps {
  sector: SectorId;
  heat: Heat;
  /** Pixel size of the square box */
  size?: number;
  /** Fully lit: solid heat colour, for the selected or signed business */
  lit?: boolean;
  className?: string;
}

/** A business as a small gable holding its trade icon, tinted by heat. The avatar of every shop. */
export function BusinessMark({ sector, heat, size = 40, lit = false, className }: BusinessMarkProps) {
  const color = HEAT_COLOR[heat];
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" className="absolute inset-0 size-full">
        <path
          d={GABLE_PATH}
          fill={lit ? color : `color-mix(in oklab, ${color} 26%, #fff)`}
          stroke={lit ? "none" : `color-mix(in oklab, ${color} 70%, transparent)`}
          strokeWidth="0.75"
        />
      </svg>
      <SectorIcon
        sector={sector}
        className="relative"
        strokeWidth={2}
        style={{
          width: size * 0.42,
          height: size * 0.42,
          marginTop: size * 0.14,
          // Pale heats cannot carry a white icon.
          color: lit && (heat === "hot" || heat === "warm") ? "#fff" : "var(--color-craie)",
        }}
      />
    </span>
  );
}
