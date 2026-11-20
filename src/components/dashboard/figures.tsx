"use client";

import { AnimatedNumber } from "@/components/pignon/animated-number";
import { BOARD_STAGES, type Pipeline } from "@/components/pipeline/model";
import { PIPELINE_STAGES } from "@/lib/data";
import type { CallLog, CallOutcome } from "@/lib/store";
import { cn } from "@/lib/utils";
import { callsByDay, OUTCOMES } from "./queue";

/** A figure set down without a box: the number, then what it counts. */
export function Figure({ value, label, format, accent = false }: { value: number; label: string; format?: (value: number) => string; accent?: boolean }) {
  return (
    <div className="flex flex-col-reverse justify-end">
      <dt className="mt-1 text-sm text-brume">{label}</dt>
      <dd>
        <AnimatedNumber value={value} format={format} className={cn("cote text-3xl font-medium tracking-tight", accent && "text-lumiere")} />
      </dd>
    </div>
  );
}

/** How many businesses stand at each stage, as one stepped figure. */
export function Funnel({ pipeline }: { pipeline: Pipeline }) {
  const counts = BOARD_STAGES.map((stage) => ({
    stage,
    label: PIPELINE_STAGES.find((item) => item.id === stage)?.label ?? stage,
    count: Object.values(pipeline).filter((entry) => entry.stage === stage).length,
  }));
  const max = Math.max(1, ...counts.map((item) => item.count));

  return (
    <ol className="flex flex-col gap-2.5">
      {counts.map((item) => (
        <li key={item.stage} className="grid grid-cols-[8.5rem_1fr_1.5rem] items-center gap-3 text-sm">
          <span className="text-brume">{item.label}</span>
          <span aria-hidden="true" className="h-2 rounded-full bg-nuit-600">
            <span
              className={cn("block h-full rounded-full transition-[width] duration-500 ease-doux", item.stage === "won" ? "bg-lumiere" : "bg-craie")}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </span>
          <span className="cote text-right font-medium">{item.count}</span>
        </li>
      ))}
    </ol>
  );
}

const OUTCOME: Record<CallOutcome, { label: string; fill: string }> = {
  meeting: { label: "Rendez-vous", fill: "bg-lumiere" },
  callback: { label: "À rappeler", fill: "bg-craie" },
  refused: { label: "Refus", fill: "bg-pave" },
  voicemail: { label: "Répondeur", fill: "bg-nuit-500" },
};

const DAY_LETTER = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });

/** The week's calls, a bar per day stacked by outcome. The legend carries the totals, so colour is never the only key. */
export function CallsWeek({ calls, now }: { calls: CallLog[]; now: number }) {
  const days = callsByDay(calls, now);
  const max = Math.max(1, ...days.map((day) => day.total));
  const totals = OUTCOMES.map((outcome) => ({ outcome, count: days.reduce((sum, day) => sum + day.counts[outcome], 0) }));
  const total = totals.reduce((sum, item) => sum + item.count, 0);

  return (
    <figure>
      <figcaption className="sr-only">
        {total} appels sur sept jours : {totals.map((item) => `${item.count} ${OUTCOME[item.outcome].label.toLowerCase()}`).join(", ")}
      </figcaption>
      <div aria-hidden="true" className="flex h-28 items-end gap-2 border-b border-trait-fort">
        {days.map((day) => (
          <div key={day.start} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            {day.total > 0 && <span className="cote text-2xs text-pave">{day.total}</span>}
            <div className="flex w-full max-w-9 flex-col-reverse gap-px overflow-hidden rounded-t-sm" style={{ height: `${(day.total / max) * 78}%` }}>
              {OUTCOMES.map((outcome) =>
                day.counts[outcome] > 0 ? <span key={outcome} className={OUTCOME[outcome].fill} style={{ flexGrow: day.counts[outcome] }} /> : null,
              )}
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="mt-1.5 flex gap-2">
        {days.map((day) => (
          <span key={day.start} className="flex-1 text-center text-2xs text-pave">
            {DAY_LETTER.format(day.start).replace(".", "")}
          </span>
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-ui">
        {totals.map((item) => (
          <li key={item.outcome} className="flex items-center gap-2">
            <span aria-hidden="true" className={cn("size-2.5 rounded-sm", OUTCOME[item.outcome].fill)} />
            <span className="flex-1 text-brume">{OUTCOME[item.outcome].label}</span>
            <span className="cote font-medium">{item.count}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
