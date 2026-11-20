"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  /** Start value on mount. Defaults to `value` (no count-up on mount, only on change). */
  from?: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}

/** A number that counts to its new value when the data changes. */
export function AnimatedNumber({ value, from, format = formatNumber, duration = 0.9, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(from ?? value);
  const text = useTransform(motionValue, (latest) => format(Math.round(latest)));

  useEffect(() => {
    if (reduced) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: [0.2, 0.8, 0.2, 1] });
    return () => controls.stop();
  }, [value, duration, reduced, motionValue]);

  return <motion.span className={cn("chiffres", className)}>{text}</motion.span>;
}
