import { Building2, CalendarClock, Eye, Hourglass, type LucideIcon } from "lucide-react";
import { formatDate, formatRelative, formatTime, formatWeekdayTime } from "@/lib/format";
import type { FeatureId } from "@/lib/plans";
import type { AlertKind, AppAlert } from "@/lib/store";

/** What each kind of alert is called, which feature unlocks it and when it shows up. */
export const KINDS: Record<AlertKind, { label: string; feature: FeatureId; icon: LucideIcon; when: string }> = {
  "mockup-opened": {
    label: "Maquettes ouvertes",
    feature: "open-alert",
    icon: Eye,
    when: "À la seconde où un commerçant ouvre le lien de sa maquette.",
  },
  "new-business": {
    label: "Nouvelles entreprises",
    feature: "new-business-alerts",
    icon: Building2,
    when: "Chaque matin, dès qu'une entreprise s'immatricule dans ta zone.",
  },
  "reservation-ending": {
    label: "Réservations",
    feature: "lead-reservation",
    icon: Hourglass,
    when: "Trois jours avant qu'un commerce réservé redevienne visible pour les autres.",
  },
  "meeting-soon": {
    label: "Rendez-vous",
    feature: "pipeline",
    icon: CalendarClock,
    when: "La veille de chaque rendez-vous fixé dans ton pipeline.",
  },
};

export const KIND_ORDER: AlertKind[] = ["mockup-opened", "new-business", "reservation-ending", "meeting-soon"];

/** A mockup opened less than ten minutes ago is still "live". */
export const LIVE_MS = 10 * 60_000;

export type DayGroupId = "today" | "yesterday" | "week" | "earlier";

const GROUP_LABEL: Record<DayGroupId, string> = {
  today: "Aujourd'hui",
  yesterday: "Hier",
  week: "Cette semaine",
  earlier: "Plus tôt",
};

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Calendar days between two instants (positive when `to` is later). Rounded: a day can last 23 or 25 hours. */
export function calendarDays(from: number, to: number): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000);
}

export function dayGroupOf(at: number, now: number): DayGroupId {
  const days = calendarDays(at, now);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return "week";
  return "earlier";
}

export interface DayGroup {
  id: DayGroupId;
  label: string;
  alerts: AppAlert[];
}

/** Newest first, bucketed by day. Empty buckets are dropped. */
export function groupByDay(alerts: AppAlert[], now: number): DayGroup[] {
  const sorted = [...alerts].sort((a, b) => b.at - a.at);
  return (Object.keys(GROUP_LABEL) as DayGroupId[])
    .map((id) => ({ id, label: GROUP_LABEL[id], alerts: sorted.filter((alert) => dayGroupOf(alert.at, now) === id) }))
    .filter((group) => group.alerts.length > 0);
}

/** "il y a 12 min", "hier à 14:05", "mardi à 9:30", then a date. */
export function alertTime(at: number, now: number): string {
  const group = dayGroupOf(at, now);
  if (group === "today") return formatRelative(at, now);
  if (group === "yesterday") return `hier à ${formatTime(at)}`;
  if (group === "week") return formatWeekdayTime(at);
  return formatDate(at);
}

/** "aujourd'hui à 14:00", "demain à 14:00", "jeudi à 14:00", or a date once the day is further away or past. */
export function meetingWhen(at: number, now: number): string {
  const days = calendarDays(now, at);
  if (days === 0) return `aujourd'hui à ${formatTime(at)}`;
  if (days === 1) return `demain à ${formatTime(at)}`;
  if (days > 1 && days < 7) return formatWeekdayTime(at);
  return `le ${formatDate(at)} à ${formatTime(at)}`;
}
