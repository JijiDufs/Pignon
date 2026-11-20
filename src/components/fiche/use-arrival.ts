"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

// Beats of the arrival, in ms. The dial draws itself in 900 ms (ScoreDial): the first reason lands as it settles.
const FIRST_REASON = 650;
const BETWEEN_REASONS = 170;
const SUM_AFTER = 240;
const LIGHT_AFTER = 320;
// A slow mockup must not hold the light back forever.
const LIGHT_DEADLINE = 6000;

export interface Arrival {
  /** How many reasons are lined up */
  revealed: number;
  /** The addition has landed on the score */
  summed: boolean;
  /** The mockup has taken the light */
  lit: boolean;
  /** False when the final state is shown straight away (reduced motion, locked sheet) */
  playing: boolean;
  /** Called once the mockup frames are painted: the light waits for them */
  onFramesReady: () => void;
}

/**
 * The signature moment of the sheet, played once on arrival: the dial rises, the reasons line up
 * one by one, the addition lands on the score, then the mockup takes the light.
 */
export function useArrival(reasonCount: number, enabled = true): Arrival {
  const reduced = useReducedMotion();
  const playing = enabled && !reduced;
  const last = reasonCount + 2;
  const [step, setStep] = useState(playing ? 0 : last);
  const [framesReady, setFramesReady] = useState(!playing);

  useEffect(() => {
    if (!playing) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, value: number) => timers.push(setTimeout(() => setStep(value), ms));

    for (let i = 1; i <= reasonCount; i++) at(FIRST_REASON + (i - 1) * BETWEEN_REASONS, i);
    const end = FIRST_REASON + Math.max(0, reasonCount - 1) * BETWEEN_REASONS;
    at(end + SUM_AFTER, reasonCount + 1);
    at(end + SUM_AFTER + LIGHT_AFTER, last);
    timers.push(setTimeout(() => setFramesReady(true), LIGHT_DEADLINE));

    return () => timers.forEach(clearTimeout);
  }, [playing, reasonCount, last]);

  const onFramesReady = useCallback(() => setFramesReady(true), []);

  return {
    revealed: Math.min(step, reasonCount),
    summed: step > reasonCount,
    lit: step >= last && framesReady,
    playing,
    onFramesReady,
  };
}
