import { DAY, HOUR, startOfDay, type Pipeline } from "@/components/pipeline/model";
import type { CallLog, CallOutcome, MaquetteOpen, Reservation } from "@/lib/store";
import type { Business, PipelineStage } from "@/lib/types";

/** The queue of the day: who to call now, most urgent first. Pure: pass the clock in. */

export type QueueKind = "open" | "meeting" | "hot" | "ending" | "to-call";

export interface QueueItem {
  /** Stable across renders. A fresh mockup open gets a new key, so it enters the list as a new row. */
  key: string;
  kind: QueueKind;
  business: Business;
  stage?: PipelineStage;
  /** What puts the row in the queue: the last open, the meeting, the reservation or the entry in the list */
  at: number;
  /** An open less than an hour old */
  live: boolean;
  /** Opens over the last two days (kind "open") */
  opens: number;
  meetingAt?: number;
  reservedUntil?: number;
}

export interface QueueInput {
  pipeline: Pipeline;
  opens: MaquetteOpen[];
  reservations: Record<string, Reservation>;
  /** Plan features. Without them the matching rows are left out. */
  openAlert: boolean;
  reservation: boolean;
}

export const LIVE_WINDOW = HOUR;
export const OPEN_WINDOW = 2 * DAY;
export const ENDING_WINDOW = 5 * DAY;
export const QUEUE_SIZE = 6;

export function buildQueue(
  input: QueueInput,
  lookup: (id: string) => Business | undefined,
  now: number,
  size = QUEUE_SIZE,
): QueueItem[] {
  const { pipeline, reservations } = input;
  const items: QueueItem[] = [];
  const seen = new Set<string>();

  // One row per business: its most urgent reason wins.
  const add = (kind: QueueKind, id: string, at: number, extra: Partial<QueueItem> = {}) => {
    const business = seen.has(id) ? undefined : lookup(id);
    if (!business) return;
    seen.add(id);
    const until = reservations[id]?.until;
    items.push({
      key: `${kind}:${id}`,
      kind,
      business,
      at,
      live: false,
      opens: 0,
      stage: pipeline[id]?.stage,
      meetingAt: pipeline[id]?.meetingAt,
      reservedUntil: input.reservation && until !== undefined && until > now ? until : undefined,
      ...extra,
    });
  };

  // 1. The shop owner looked at the mockup: call back while it is warm.
  if (input.openAlert) {
    const latest = new Map<string, { open: MaquetteOpen; count: number }>();
    for (const open of input.opens) {
      if (now - open.at > OPEN_WINDOW) continue;
      const known = latest.get(open.businessId);
      if (!known) latest.set(open.businessId, { open, count: 1 });
      else {
        known.count += 1;
        if (open.at > known.open.at) known.open = open;
      }
    }
    [...latest.values()]
      .sort((a, b) => b.open.at - a.open.at)
      .forEach(({ open, count }) =>
        add("open", open.businessId, open.at, {
          key: `open:${open.id}`,
          live: now - open.at < LIVE_WINDOW,
          opens: count,
        }),
      );
  }

  const entries = Object.entries(pipeline);
  const score = (id: string) => lookup(id)?.score ?? 0;

  // 2. A meeting today or tomorrow.
  const today = startOfDay(now);
  entries
    .filter(([, entry]) => entry.stage === "meeting" && entry.meetingAt !== undefined)
    .map(([id, entry]) => ({ id, at: entry.meetingAt ?? 0 }))
    .filter(({ at }) => at >= today && at < today + 2 * DAY)
    .sort((a, b) => a.at - b.at)
    .forEach(({ id, at }) => add("meeting", id, at));

  if (input.reservation) {
    // 3. Hot, reserved, never called.
    entries
      .filter(([id, entry]) => entry.stage === "to-call" && reservations[id] && lookup(id)?.heat === "hot")
      .sort(([a], [b]) => score(b) - score(a))
      .forEach(([id]) => add("hot", id, reservations[id].at));

    // 4. A reservation that ends within five days.
    Object.entries(reservations)
      .filter(([id, { until }]) => {
        const stage = pipeline[id]?.stage;
        return until > now && until - now < ENDING_WINDOW && stage !== "won" && stage !== "lost";
      })
      .sort(([, a], [, b]) => a.until - b.until)
      .forEach(([id, { until }]) => add("ending", id, until));
  }

  // 5. Then whoever still waits for a first call, hottest first.
  entries
    .filter(([, entry]) => entry.stage === "to-call")
    .sort(([a], [b]) => score(b) - score(a))
    .forEach(([id, entry]) => add("to-call", id, entry.updatedAt));

  return items.slice(0, size);
}

export const OUTCOMES: CallOutcome[] = ["meeting", "callback", "refused", "voicemail"];

export interface CallDay {
  /** Local midnight */
  start: number;
  counts: Record<CallOutcome, number>;
  total: number;
}

/** The last `days` days, oldest first, today last. */
export function callsByDay(calls: CallLog[], now: number, days = 7): CallDay[] {
  const week = Array.from({ length: days }, (_, index): CallDay => {
    const date = new Date(startOfDay(now));
    date.setDate(date.getDate() - (days - 1 - index));
    return { start: date.getTime(), counts: { meeting: 0, callback: 0, refused: 0, voicemail: 0 }, total: 0 };
  });
  for (const call of calls) {
    const day = week.find((item) => item.start === startOfDay(call.at));
    if (!day) continue;
    day.counts[call.outcome] += 1;
    day.total += 1;
  }
  return week;
}
