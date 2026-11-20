"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Segmented } from "@/components/pricing/segmented";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildCallScript, getSector } from "@/lib/data";
import { souple } from "@/lib/motion";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  buildScenario,
  closestChoice,
  debrief,
  HANG_UP,
  MOODS,
  nextGauge,
  SKILLS,
  type Choice,
  type Mood,
  type Skill,
  type Turn,
} from "./simulator-engine";

const MOOD_OPTIONS = (Object.keys(MOODS) as Mood[]).map((mood) => ({ value: mood, label: MOODS[mood].label }));
const HANG_UP_LINE = "Écoutez, je n'ai pas de temps à perdre. Au revoir.";

interface SimulatorProps {
  /** Businesses to train on, best first */
  businesses: Business[];
  firstName: string;
}

/** Practice against a shop owner played by the machine. Nothing leaves the browser. */
export function Simulator({ businesses, firstName }: SimulatorProps) {
  const selectId = useId();
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [mood, setMood] = useState<Mood>("presse");
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  // The owner is "talking": the next line appears once the pause is over.
  const [thinking, setThinking] = useState(false);
  const [typed, setTyped] = useState("");

  const business = businesses.find((item) => item.id === businessId) ?? businesses[0];
  const beats = useMemo(() => (business ? buildScenario(business, buildCallScript(business, firstName), mood, firstName) : []), [business, mood, firstName]);
  const gauge = turns.length > 0 ? turns[turns.length - 1].gauge : MOODS[mood].start;
  const hungUp = gauge <= HANG_UP;
  const over = hungUp || turns.length >= beats.length;
  const beat = over ? undefined : beats[turns.length];
  const result = over && !thinking ? debrief(turns, hungUp) : null;

  useEffect(() => {
    if (!thinking) return;
    const timer = setTimeout(() => setThinking(false), 900);
    return () => clearTimeout(timer);
  }, [thinking, turns.length]);

  if (!business) return null;

  const answer = (choice: Choice) => {
    if (!beat || thinking) return;
    setTurns((list) => [...list, { beat, choice, gauge: nextGauge(gauge, mood, choice.quality) }]);
    setThinking(true);
    setTyped("");
  };

  const restart = () => {
    setTurns([]);
    setThinking(false);
    setStarted(false);
  };

  const owner = `${business.owner.civility} ${business.owner.lastName}`;

  if (!started) {
    return (
      <div className="grid max-w-3xl gap-8">
        <div>
          <label htmlFor={selectId} className="text-sm font-medium">
            Qui appelles-tu ?
          </label>
          <select
            id={selectId}
            value={business.id}
            onChange={(event) => setBusinessId(event.target.value)}
            className="mt-2 block h-11 w-full max-w-md rounded-lg border border-trait-fort bg-nuit-800 px-3 text-base outline-none focus-visible:border-craie focus-visible:ring-3 focus-visible:ring-craie/15"
          >
            {businesses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}, {getSector(item.sector).label.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Son humeur aujourd&apos;hui</p>
          <Segmented label="Humeur du commerçant" value={mood} onChange={setMood} options={MOOD_OPTIONS} />
          <p className="mt-2.5 text-sm text-brume">{MOODS[mood].hint}</p>
        </div>
        <div>
          <Button size="xl" onClick={() => setStarted(true)}>
            Appeler {owner}
          </Button>
          <p className="mt-3 text-sm text-pave">Un entraînement : le commerçant est joué par la machine, rien n&apos;est envoyé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <ol aria-live="polite" className="flex flex-col gap-3">
          {turns.map((turn, position) => (
            <li key={turn.beat.id} className="contents">
              <Bubble who={owner}>{turn.beat.owner}</Bubble>
              <Bubble mine>{turn.choice.text}</Bubble>
              {(position < turns.length - 1 || !thinking) && <Bubble who={owner}>{turn.beat.reactions[turn.choice.quality]}</Bubble>}
            </li>
          ))}
          {thinking && <Speaking who={owner} />}
          {!thinking && hungUp && <Bubble who={owner}>{HANG_UP_LINE}</Bubble>}
          {!thinking && beat && <Bubble who={owner}>{beat.owner}</Bubble>}
        </ol>

        {beat && !thinking && (
          <div className="mt-8 border-t border-trait pt-6">
            <p className="text-sm text-brume">Ta réponse</p>
            <div className="mt-3 flex flex-col gap-2">
              {beat.choices.map((choice) => (
                <button
                  key={choice.text}
                  type="button"
                  onClick={() => answer(choice)}
                  className="voix rounded-xl border border-trait-fort bg-nuit-800 px-4 py-3 text-left text-[0.9375rem] transition-colors hover:border-craie"
                >
                  {choice.text}
                </button>
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (typed.trim()) answer(closestChoice(typed, beat.choices));
              }}
            >
              <Input value={typed} onChange={(event) => setTyped(event.target.value)} aria-label="Ou dis-le avec tes mots" placeholder="Ou dis-le avec tes mots" className="h-10" />
              <Button type="submit" variant="outline" size="lg" className="bg-nuit-800" disabled={!typed.trim()}>
                Dire
              </Button>
            </form>
          </div>
        )}

        {result && (
          <section aria-label="Débrief" className="mt-10 rounded-2xl bg-nuit-800 p-6 shadow-flottant">
            <h3 className="enseigne text-3xl">{result.meeting ? "Rendez-vous obtenu" : result.hungUp ? "Il a raccroché" : "Pas de rendez-vous cette fois"}</h3>
            <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {(Object.keys(SKILLS) as Skill[]).map((skill) => {
                const score = result.skills[skill];
                return (
                  <div key={skill}>
                    <dt className="flex items-baseline justify-between text-sm">
                      {SKILLS[skill]}
                      <span className="cote text-pave">{score === undefined ? "non joué" : `${score} sur 100`}</span>
                    </dt>
                    <dd aria-hidden="true" className="mt-1.5 h-1 rounded-full bg-nuit-600">
                      <span className={cn("block h-full rounded-full", (score ?? 0) >= 70 ? "bg-craie" : "bg-pave")} style={{ width: `${score ?? 0}%` }} />
                    </dd>
                  </div>
                );
              })}
            </dl>
            {result.best && (
              <div className="mt-6 border-t border-trait pt-5">
                <p className="text-sm text-brume">Ta meilleure réplique</p>
                <p className="voix mt-1.5">{result.best.choice.text}</p>
              </div>
            )}
            {result.weakest && (
              <div className="mt-5 border-t border-trait pt-5">
                <p className="text-sm text-brume">À retravailler</p>
                <p className="voix mt-1.5 text-brume line-through decoration-trait-fort">{result.weakest.turn.choice.text}</p>
                <p className="mt-3 text-sm text-brume">Ce qui aurait porté</p>
                <p className="voix mt-1.5">{result.weakest.better}</p>
              </div>
            )}
            <Button size="lg" className="mt-7" onClick={restart}>
              Rejouer
            </Button>
          </section>
        )}
      </div>

      <aside aria-label="Humeur du commerçant" className="lg:sticky lg:top-6 lg:self-start">
        <p className="text-sm text-brume">
          {owner}, {MOODS[mood].label.toLowerCase()}
        </p>
        <p className="titre mt-1 text-xl">{gauge <= HANG_UP ? "A raccroché" : gauge < 40 ? "Agacé" : gauge < 60 ? "Sur la réserve" : gauge < 78 ? "À l'écoute" : "Intéressé"}</p>
        <div
          role="meter"
          aria-label="Intérêt du commerçant"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={gauge}
          className="relative mt-5 h-2 rounded-full bg-nuit-600"
        >
          <motion.span
            className={cn("absolute inset-y-0 left-0 rounded-full", gauge >= 60 ? "bg-lumiere" : "bg-craie")}
            initial={false}
            animate={{ width: `${gauge}%` }}
            transition={souple}
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-1/2 size-4 -translate-1/2 rounded-full bg-nuit-950 shadow-flottant ring-[1.5px] ring-craie"
            initial={false}
            animate={{ left: `${gauge}%` }}
            transition={souple}
          />
        </div>
        <div aria-hidden="true" className="mt-2 flex justify-between text-2xs text-pave">
          <span>Agacé</span>
          <span>Intéressé</span>
        </div>
        <Button variant="ghost" size="sm" className="mt-6 -ml-2.5 text-brume" onClick={restart}>
          Changer de commerce ou d&apos;humeur
        </Button>
      </aside>
    </div>
  );
}

function Bubble({ who, mine = false, children }: { who?: string; mine?: boolean; children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={souple}
      className={cn(
        "voix max-w-[52ch] rounded-2xl px-4 py-3 text-[0.9375rem]",
        mine ? "self-end rounded-br-md bg-craie text-nuit-950" : "self-start rounded-bl-md bg-nuit-700",
      )}
    >
      <span className="sr-only">{mine ? "Toi : " : `${who} : `}</span>
      {children}
    </motion.p>
  );
}

/** The owner is answering: a small voice wave, so the pause reads as someone talking. */
function Speaking({ who }: { who: string }) {
  return (
    <p className="flex h-11 w-fit items-center gap-1 self-start rounded-2xl rounded-bl-md bg-nuit-700 px-4">
      <span className="sr-only">{who} répond</span>
      {[0, 1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          aria-hidden="true"
          className="w-1 animate-veille rounded-full bg-pave"
          style={{ height: [10, 18, 12, 20, 9][bar], animationDelay: `${bar * 120}ms`, animationDuration: "0.9s" }}
        />
      ))}
    </p>
  );
}
