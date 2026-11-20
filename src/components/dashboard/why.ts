import { meetingLabel } from "@/components/pipeline/model";
import { formatDaysLeft, formatRelative } from "@/lib/format";
import type { QueueItem, QueueKind } from "./queue";

/** Why this business is in the queue right now, in one line. */
export function whyNow(item: QueueItem, now: number): string {
  switch (item.kind) {
    case "open": {
      const when = formatRelative(item.at, now);
      const again = item.opens > 1 ? `, ${item.opens} ouvertures en deux jours` : "";
      return item.live ? `Regarde sa maquette, ${when}${again}` : `A ouvert sa maquette ${when}${again}`;
    }
    case "meeting":
      return `Rendez-vous ${meetingLabel(item.meetingAt ?? item.at, now)}`;
    case "hot":
      return "Brûlant, réservé pour toi, jamais appelé";
    case "ending":
      return `Ta réservation se termine ${formatDaysLeft(item.reservedUntil ?? item.at, now)}`;
    default:
      return "Attend ton premier appel";
  }
}

/** What the visitor is told to do, as a heading for the first row. */
export const HEADLINE: Record<QueueKind, string> = {
  open: "Rappelle maintenant",
  meeting: "Prépare ton rendez-vous",
  hot: "Appelle en premier",
  ending: "Appelle avant la fin de ta réservation",
  "to-call": "Appelle en premier",
};

export const ACTION: Record<QueueKind, string> = {
  open: "Rappeler",
  meeting: "Préparer",
  hot: "Appeler",
  ending: "Appeler",
  "to-call": "Appeler",
};
