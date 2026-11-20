"use client";

import { motion } from "motion/react";
import { allumage, allumageTransition } from "@/lib/motion";

interface AllumageProps {
  /** Turns the light on. Flip it from an action or a change of data. */
  on?: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * The brand's signature motion: content catches like a neon sign (two stutters, then steady).
 * Reserve it for the moment something is found, unlocked, reserved or signed.
 */
export function Allumage({ on = true, delay = 0, className, children }: AllumageProps) {
  return (
    <motion.div
      className={className}
      variants={allumage}
      initial="eteint"
      animate={on ? "allume" : "eteint"}
      transition={{ ...allumageTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
