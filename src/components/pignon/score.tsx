"use client";

import { motion } from "motion/react";
import { heatOf, HEAT } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./animated-number";
import { HEAT_COLOR } from "./heat";

const SIZES = {
  sm: { box: 44, stroke: 3.5, text: "cote text-sm font-medium" },
  md: { box: 76, stroke: 5, text: "cote text-2xl font-medium" },
  lg: { box: 132, stroke: 7, text: "cote text-[2.75rem] font-medium tracking-tight" },
} as const;

interface ScoreDialProps {
  score: number;
  size?: keyof typeof SIZES;
  /** Draw the arc and count up on mount (use when the score is revealed by an action) */
  animate?: boolean;
  /** Show the heat label under the number (lg only) */
  showLabel?: boolean;
  className?: string;
}

/** The opportunity score as a 270° gauge coloured by heat. */
export function ScoreDial({ score, size = "md", animate = false, showLabel = false, className }: ScoreDialProps) {
  const { box, stroke, text } = SIZES[size];
  const heat = heatOf(score);
  const color = HEAT_COLOR[heat];
  const r = (box - stroke) / 2;
  const c = box / 2;
  const k = Math.SQRT1_2 * r;
  // 270° arc, open at the bottom
  const arc = `M ${c - k} ${c + k} A ${r} ${r} 0 1 1 ${c + k} ${c + k}`;
  const ratio = Math.max(0, Math.min(100, score)) / 100;

  return (
    <span
      role="img"
      aria-label={`Score ${score} sur 100, ${HEAT[heat].label.toLowerCase()}`}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: box, height: box }}
    >
      <svg viewBox={`0 0 ${box} ${box}`} className="absolute inset-0 size-full" aria-hidden="true">
        <path d={arc} fill="none" stroke="var(--color-nuit-600)" strokeWidth={stroke} strokeLinecap="round" />
        <motion.path
          d={arc}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: animate ? 0 : ratio }}
          animate={{ pathLength: ratio }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <span className="relative flex flex-col items-center leading-none">
        <AnimatedNumber value={score} from={animate ? 0 : undefined} className={text} />
        {showLabel && size === "lg" && (
          <span className="mt-1.5 text-ui text-brume">{HEAT[heat].label}</span>
        )}
      </span>
    </span>
  );
}

/** Compact score for lists and map popups. */
export function ScorePill({ score, className }: { score: number; className?: string }) {
  const heat = heatOf(score);
  const color = HEAT_COLOR[heat];
  return (
    <span
      aria-label={`Score ${score} sur 100, ${HEAT[heat].label.toLowerCase()}`}
      className={cn("cote inline-flex h-6 shrink-0 items-center gap-1.5 text-ui font-medium text-craie", className)}
    >
      <span aria-hidden="true" className="size-2 rounded-full" style={{ background: color }} />
      {score}
    </span>
  );
}
