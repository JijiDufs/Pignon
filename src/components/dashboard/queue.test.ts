import { describe, expect, it } from "vitest";
import { DAY, HOUR } from "@/components/pipeline/model";
import type { Business, Heat } from "@/lib/types";
import { buildQueue, callsByDay, type QueueInput } from "./queue";

const NOW = new Date(2026, 10, 20, 11, 0).getTime();
const MIN = 60_000;

const shop = (id: string, score: number, heat: Heat = "hot") => ({ id, score, heat }) as Business;
const shops = [shop("a", 91), shop("b", 84), shop("c", 77, "warm"), shop("d", 88), shop("e", 62, "warm")];
const lookup = (id: string) => shops.find((item) => item.id === id);
const entry = (stage: QueueInput["pipeline"][string]["stage"], extra = {}) => ({
  stage,
  addedAt: NOW - 3 * DAY,
  updatedAt: NOW - DAY,
  ...extra,
});

const input: QueueInput = {
  pipeline: {
    a: entry("to-call"),
    b: entry("mockup-sent"),
    c: entry("meeting", { meetingAt: NOW + DAY }),
    d: entry("called"),
    e: entry("to-call"),
  },
  opens: [
    { id: "o1", businessId: "b", da: "atelier", at: NOW - 12 * MIN },
    { id: "o2", businessId: "b", da: "atelier", at: NOW - 5 * HOUR },
    { id: "o3", businessId: "c", da: "maison", at: NOW - 6 * DAY },
  ],
  reservations: {
    a: { at: NOW - 2 * HOUR, until: NOW + 30 * DAY },
    d: { at: NOW - 27 * DAY, until: NOW + 3 * DAY },
  },
  openAlert: true,
  reservation: true,
};

describe("buildQueue", () => {
  it("orders by urgency: open, meeting, hot reserved, ending reservation, then the rest to call", () => {
    const queue = buildQueue(input, lookup, NOW);
    expect(queue.map((item) => `${item.kind}:${item.business.id}`)).toEqual([
      "open:b",
      "meeting:c",
      "hot:a",
      "ending:d",
      "to-call:e",
    ]);
    expect(queue[0]).toMatchObject({ key: "open:o1", live: true, opens: 2 });
  });

  it("puts a fresh open first, whatever the row said before, under a new key", () => {
    const opens = [{ id: "o9", businessId: "c", da: "maison" as const, at: NOW - MIN }, ...input.opens];
    const queue = buildQueue({ ...input, opens }, lookup, NOW);
    expect(queue.map((item) => item.key).slice(0, 2)).toEqual(["open:o9", "open:o1"]);
    expect(queue.filter((item) => item.business.id === "c")).toHaveLength(1);
    expect(queue[0].meetingAt).toBe(NOW + DAY);
  });

  it("leaves out what the plan does not include", () => {
    const queue = buildQueue({ ...input, openAlert: false, reservation: false }, lookup, NOW);
    expect(queue.map((item) => item.kind)).toEqual(["meeting", "to-call", "to-call"]);
    expect(queue.every((item) => item.reservedUntil === undefined)).toBe(true);
  });

  it("ignores meetings past tomorrow and caps the list", () => {
    const pipeline = { ...input.pipeline, c: entry("meeting", { meetingAt: NOW + 3 * DAY }) };
    expect(buildQueue({ ...input, pipeline }, lookup, NOW).some((item) => item.kind === "meeting")).toBe(false);
    expect(buildQueue(input, lookup, NOW, 2)).toHaveLength(2);
  });
});

describe("callsByDay", () => {
  it("counts each outcome on its day, today last", () => {
    const week = callsByDay(
      [
        { id: "1", businessId: "a", at: NOW - HOUR, outcome: "meeting", durationSec: 90 },
        { id: "2", businessId: "b", at: NOW - 2 * HOUR, outcome: "voicemail", durationSec: 20 },
        { id: "3", businessId: "c", at: NOW - 2 * DAY, outcome: "refused", durationSec: 40 },
        { id: "4", businessId: "d", at: NOW - 9 * DAY, outcome: "callback", durationSec: 40 },
      ],
      NOW,
    );
    expect(week).toHaveLength(7);
    expect(week[6]).toMatchObject({ total: 2, counts: { meeting: 1, voicemail: 1 } });
    expect(week[4].counts.refused).toBe(1);
    expect(week.reduce((sum, day) => sum + day.total, 0)).toBe(3);
  });
});
