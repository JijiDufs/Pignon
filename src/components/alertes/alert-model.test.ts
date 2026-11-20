import { describe, expect, it } from "vitest";
import type { AppAlert } from "@/lib/store";
import { alertTime, dayGroupOf, groupByDay, meetingWhen } from "./alert-model";

const at = (iso: string) => new Date(iso).getTime();
const NOW = at("2026-11-20T10:00:00");

const alert = (id: string, time: number): AppAlert => ({ id, kind: "meeting-soon", title: id, body: "", at: time, read: true });

describe("le fil des alertes", () => {
  it("range par jour de calendrier, pas par tranche de 24 h", () => {
    expect(dayGroupOf(at("2026-11-20T00:05:00"), NOW)).toBe("today");
    // 11 hours ago, but the day before.
    expect(dayGroupOf(at("2026-11-19T23:00:00"), NOW)).toBe("yesterday");
    expect(dayGroupOf(at("2026-11-14T12:00:00"), NOW)).toBe("week");
    expect(dayGroupOf(at("2026-11-13T12:00:00"), NOW)).toBe("earlier");
  });

  it("trie du plus récent au plus ancien et retire les jours vides", () => {
    const groups = groupByDay(
      [alert("ancien", at("2026-11-01T09:00:00")), alert("matin", at("2026-11-20T08:00:00")), alert("tout-juste", NOW - 60_000)],
      NOW,
    );
    expect(groups.map((group) => group.id)).toEqual(["today", "earlier"]);
    expect(groups[0].alerts.map((item) => item.id)).toEqual(["tout-juste", "matin"]);
  });

  it("dit l'heure comme on la dirait", () => {
    expect(alertTime(NOW - 12 * 60_000, NOW)).toBe("il y a 12 min");
    expect(alertTime(at("2026-11-19T14:05:00"), NOW)).toBe("hier à 14:05");
    expect(meetingWhen(at("2026-11-20T14:00:00"), NOW)).toBe("aujourd'hui à 14:00");
    expect(meetingWhen(at("2026-11-21T14:00:00"), NOW)).toBe("demain à 14:00");
  });
});
