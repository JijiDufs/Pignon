import { formatDate, formatRelative, formatTime, formatWeekdayTime } from "@/lib/format";
import type { PipelineEntry } from "@/lib/store";
import type { Business, PipelineStage } from "@/lib/types";

/** Pure helpers shared by the pipeline board and the "Aujourd'hui" screen. Pass `now` in: nothing here reads the clock. */

export type Pipeline = Record<string, PipelineEntry>;
export type Columns = Record<PipelineStage, string[]>;

/** The columns of the board, in order. "lost" lives apart, in its own tray. */
export const BOARD_STAGES: PipelineStage[] = ["to-call", "called", "mockup-sent", "meeting", "won"];

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

export function startOfDay(at: number): number {
  return new Date(at).setHours(0, 0, 0, 0);
}

/** What a business weighs in the pipeline: the signed amount once won, the estimate before. */
export function entryValue(entry: PipelineEntry, business: Business): number {
  return entry.stage === "won" ? (entry.dealValue ?? business.estimatedDeal) : business.estimatedDeal;
}

/** Deals signed during the calendar month of `now`. */
export function signedThisMonth(entries: PipelineEntry[], now: number): { total: number; count: number } {
  const month = new Date(now);
  let total = 0;
  let count = 0;
  for (const entry of entries) {
    const date = new Date(entry.updatedAt);
    if (entry.stage !== "won" || date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) continue;
    total += entry.dealValue ?? 0;
    count += 1;
  }
  return { total, count };
}

/** Signed businesses over businesses called at least once (every stage past "to-call"). */
export function conversion(entries: PipelineEntry[]): { won: number; called: number; rate: number } {
  const called = entries.filter((entry) => entry.stage !== "to-call").length;
  const won = entries.filter((entry) => entry.stage === "won").length;
  return { won, called, rate: called === 0 ? 0 : won / called };
}

/** Every id in display order: cards never placed by hand first (latest activity on top), then the manual order. */
export function orderedIds(pipeline: Pipeline, order: string[]): string[] {
  const placed = new Set(order);
  const fresh = Object.keys(pipeline)
    .filter((id) => !placed.has(id))
    .sort((a, b) => pipeline[b].updatedAt - pipeline[a].updatedAt);
  return [...fresh, ...order.filter((id) => id in pipeline)];
}

/** Splits ordered ids into columns. `override` shows one card in another stage than the stored one (a signature waiting for its amount). */
export function toColumns(
  ids: string[],
  pipeline: Pipeline,
  override?: { id: string; stage: PipelineStage } | null,
): Columns {
  const columns: Columns = { "to-call": [], called: [], "mockup-sent": [], meeting: [], won: [], lost: [] };
  for (const id of ids) {
    const stage = override?.id === id ? override.stage : pipeline[id]?.stage;
    if (stage) columns[stage].push(id);
  }
  return columns;
}

/** The global order once `id` sits where `columnIds` shows it. Ids hidden by a filter keep their place. */
export function reorder(all: string[], id: string, columnIds: string[]): string[] {
  const rest = all.filter((item) => item !== id);
  const index = columnIds.indexOf(id);
  const next = columnIds[index + 1];
  const previous = columnIds[index - 1];
  if (next !== undefined && rest.includes(next)) rest.splice(rest.indexOf(next), 0, id);
  else if (previous !== undefined && rest.includes(previous)) rest.splice(rest.indexOf(previous) + 1, 0, id);
  else rest.unshift(id);
  return rest;
}

const VERB: Record<PipelineStage, string> = {
  "to-call": "Ajouté",
  called: "Appelé",
  "mockup-sent": "Maquette envoyée",
  meeting: "Rendez-vous pris",
  won: "Signé",
  lost: "Perdu",
};

/** "Appelé hier", "Signé il y a 3 jours" */
export function lastActivity(entry: PipelineEntry, now: number): string {
  const when = formatRelative(entry.updatedAt, now);
  // Past a month formatRelative returns a bare date.
  return `${VERB[entry.stage]} ${/^\d/.test(when) ? `le ${when}` : when}`;
}

/** "aujourd'hui à 14:00", "demain à 10:30", "mardi à 09:00", "le 3 décembre à 09:00" */
export function meetingLabel(at: number, now: number): string {
  const days = Math.round((startOfDay(at) - startOfDay(now)) / DAY);
  if (days === 0) return `aujourd'hui à ${formatTime(at)}`;
  if (days === 1) return `demain à ${formatTime(at)}`;
  if (days === -1) return `hier à ${formatTime(at)}`;
  if (days > 1 && days < 7) return formatWeekdayTime(at);
  return `le ${formatDate(at)} à ${formatTime(at)}`;
}

const PREVIEW: [PipelineStage, number][] = [
  ["to-call", 2 * HOUR],
  ["to-call", 5 * HOUR],
  ["to-call", 2 * DAY],
  ["called", DAY],
  ["called", 4 * DAY],
  ["mockup-sent", 3 * HOUR],
  ["mockup-sent", 2 * DAY],
  ["meeting", DAY],
  ["meeting", 3 * DAY],
  ["won", 3 * DAY],
  ["won", 9 * DAY],
];

/** A believable board for the preview behind the lock, when the account has no pipeline of its own yet. */
export function previewPipeline(businesses: Business[], now: number): Pipeline {
  const pipeline: Pipeline = {};
  PREVIEW.forEach(([stage, age], index) => {
    const business = businesses[index];
    if (!business) return;
    pipeline[business.id] = { stage, addedAt: now - age - 2 * DAY, updatedAt: now - age };
    if (stage === "won") pipeline[business.id].dealValue = business.estimatedDeal;
    if (stage === "meeting") pipeline[business.id].meetingAt = startOfDay(now) + (index - 6) * DAY + 14 * HOUR;
  });
  return pipeline;
}

/** A compact age for a card's corner: "12 min", "3 h", "hier", "4 j". */
export function shortAgo(at: number, now: number): string {
  const minutes = Math.max(1, Math.round((now - at) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "hier" : `${days} j`;
}
