import { expect, test } from "vitest";
import { buildCallScript, getOpportunities } from "@/lib/data";
import { buildScenario, closestChoice, debrief, HANG_UP, MOODS, nextGauge, type Mood, type Quality, type Turn } from "./simulator-engine";

const business = getOpportunities("lille")[0];
const script = buildCallScript(business, "Camille");

function play(mood: Mood, quality: Quality) {
  const turns: Turn[] = [];
  let gauge = MOODS[mood].start;
  for (const beat of buildScenario(business, script, mood, "Camille")) {
    const choice = beat.choices.find((item) => item.quality === quality)!;
    gauge = nextGauge(gauge, mood, quality);
    turns.push({ beat, choice, gauge });
    if (gauge <= HANG_UP) return debrief(turns, true);
  }
  return debrief(turns, false);
}

test("the right replies get the meeting, whatever the mood", () => {
  for (const mood of Object.keys(MOODS) as Mood[]) {
    const result = play(mood, "good");
    expect(result.meeting).toBe(true);
    expect(result.skills.objections).toBe(100);
  }
});

test("clumsy replies make a wary owner hang up, and the debrief says what to rework", () => {
  const result = play("mefiant", "bad");
  expect(result.hungUp).toBe(true);
  expect(result.meeting).toBe(false);
  expect(result.weakest?.better).toBe(script.steps[0].line);
});

test("every beat offers one reply of each kind, and the wary owner raises two objections", () => {
  const beats = buildScenario(business, script, "mefiant", "Camille");
  expect(beats.filter((beat) => beat.skill === "objections")).toHaveLength(2);
  for (const beat of beats) expect(beat.choices.map((choice) => choice.quality).sort()).toEqual(["bad", "good", "ok"]);
});

test("a typed sentence lands on the closest reply", () => {
  const [opening] = buildScenario(business, script, "sympa", "Camille");
  expect(closestChoice("je vous appelle pour une offre exceptionnelle", opening.choices).quality).toBe("bad");
  expect(closestChoice("euh", opening.choices).quality).toBe("ok");
});
