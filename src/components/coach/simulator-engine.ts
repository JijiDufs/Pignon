import { hashText } from "@/lib/data/prng";
import type { Business, CallScript } from "@/lib/types";

/** The training partner: a shop owner played by a small, deterministic dialogue tree. Nothing is sent anywhere. */

export type Mood = "sympa" | "presse" | "mefiant";
export type Quality = "good" | "ok" | "bad";
export type Skill = "ouverture" | "personnalisation" | "objections" | "conclusion";

export const MOODS: Record<Mood, { label: string; hint: string; start: number }> = {
  sympa: { label: "Sympa", hint: "Écoute volontiers, pardonne une maladresse.", start: 60 },
  presse: { label: "Pressé", hint: "Du monde au comptoir : va droit au but.", start: 45 },
  mefiant: { label: "Méfiant", hint: "Démarché trois fois par semaine. Une phrase creuse et ça raccroche.", start: 34 },
};

export const SKILLS: Record<Skill, string> = {
  ouverture: "L'ouverture",
  personnalisation: "La personnalisation",
  objections: "Les objections",
  conclusion: "La conclusion",
};

export interface Choice {
  quality: Quality;
  text: string;
}

export interface Beat {
  id: string;
  skill: Skill;
  /** What the shop owner says before the caller answers */
  owner: string;
  /** The three replies offered, already in their display order */
  choices: Choice[];
  /** How the owner takes each kind of reply */
  reactions: Record<Quality, string>;
}

const DELTA: Record<Mood, Record<Quality, number>> = {
  sympa: { good: 13, ok: 3, bad: -14 },
  presse: { good: 14, ok: -3, bad: -18 },
  mefiant: { good: 15, ok: -2, bad: -24 },
};

/** Below this, the owner hangs up. */
export const HANG_UP = 12;
const MEETING_AT = 58;

/** Same business, same beat: same order. It varies from one beat to the next, so the good reply is never always first. */
function shuffled(choices: Choice[], seed: string): Choice[] {
  return choices
    .map((choice, index) => ({ choice, rank: hashText(`${seed}:${index}`) }))
    .sort((a, b) => a.rank - b.rank)
    .map((item) => item.choice);
}

const OBJECTIONS_BY_MOOD: Record<Mood, string[]> = {
  sympa: ["clients"],
  presse: ["temps"],
  mefiant: ["connu", "prix"],
};

export function buildScenario(business: Business, script: CallScript, mood: Mood, firstName: string): Beat[] {
  const step = (id: string) => script.steps.find((item) => item.id === id)?.line ?? "";
  const beat = (id: string, skill: Skill, owner: string, good: string, ok: string, bad: string, reactions: Record<Quality, string>): Beat => ({
    id,
    skill,
    owner,
    reactions,
    choices: shuffled(
      [
        { quality: "good", text: good },
        { quality: "ok", text: ok },
        { quality: "bad", text: bad },
      ],
      `${business.id}:${mood}:${id}`,
    ),
  });

  const objections = OBJECTIONS_BY_MOOD[mood]
    .map((id) => script.objections.find((item) => item.id === id))
    .filter((item) => item !== undefined)
    .map((item) =>
      beat(
        `objection-${item.id}`,
        "objections",
        item.objection,
        item.answer,
        "Je comprends. Mais un site, aujourd'hui, ça apporte quand même des clients.",
        "Pourtant tous vos concurrents en ont un. Vous prenez du retard.",
        {
          good: "Hm. Vu comme ça, ce n'est pas faux.",
          ok: "Oui, enfin, c'est ce que tout le monde me dit.",
          bad: "Dites, je ne vous ai pas demandé de me faire la leçon.",
        },
      ),
    );

  return [
    beat(
      "opening",
      "ouverture",
      `${business.name}, bonjour.`,
      step("opening"),
      `Bonjour, ${firstName} à l'appareil, je crée des sites internet. Vous avez deux minutes ?`,
      "Bonjour, je vous appelle pour vous faire profiter d'une offre exceptionnelle sur la création de votre site web.",
      {
        good: "Au moins, c'est honnête. Allez-y, trente secondes.",
        ok: "Deux minutes, pas plus. J'ai du monde.",
        bad: "Encore du démarchage. Je n'ai vraiment pas le temps pour ça.",
      },
    ),
    beat(
      "reason",
      "personnalisation",
      "C'est à quel sujet, exactement ?",
      step("reason"),
      "J'ai vu que vous n'aviez pas de site internet. Aujourd'hui, tout le monde cherche sur son téléphone.",
      "Nous accompagnons les commerces de proximité dans leur transformation digitale, avec des solutions clés en main.",
      {
        good: "Ah, vous avez regardé nos avis. Continuez.",
        ok: "Oui, on me l'a déjà dit. Et donc ?",
        bad: "Je n'ai rien compris. Vous vendez quoi, au juste ?",
      },
    ),
    ...objections,
    beat(
      "proof",
      "personnalisation",
      "Et concrètement, vous proposez quoi ?",
      step("proof"),
      "Je peux vous envoyer notre plaquette par mail, avec nos tarifs.",
      "Il faudrait qu'on signe un devis, et ensuite je commence à travailler dessus.",
      {
        good: "Attendez, je regarde… Ah oui, c'est bien chez nous. Vous avez mis nos horaires.",
        ok: "Un mail de plus. Envoyez toujours.",
        bad: "Signer avant d'avoir vu quoi que ce soit ? Non merci.",
      },
    ),
    beat(
      "closing",
      "conclusion",
      "Bon. Et la suite, c'est quoi ?",
      step("closing"),
      "Vous êtes disponible quand, pour qu'on en parle ?",
      "Je vous laisse réfléchir, et vous me rappelez quand vous voulez.",
      {
        good: "Jeudi, ça me va. Passez, on regardera ça ensemble.",
        ok: "Je ne sais pas, rappelez-moi la semaine prochaine.",
        bad: "C'est ça, je vous rappelle.",
      },
    ),
  ];
}

export function nextGauge(gauge: number, mood: Mood, quality: Quality): number {
  return Math.max(0, Math.min(100, gauge + DELTA[mood][quality]));
}

export interface Turn {
  beat: Beat;
  choice: Choice;
  gauge: number;
}

export interface Debrief {
  meeting: boolean;
  hungUp: boolean;
  /** 0–100 per skill, undefined when the call ended before the skill came up */
  skills: Record<Skill, number | undefined>;
  best?: Turn;
  /** The reply to rework, with the one that would have worked */
  weakest?: { turn: Turn; better: string };
}

const POINTS: Record<Quality, number> = { good: 100, ok: 55, bad: 15 };

export function debrief(turns: Turn[], hungUp: boolean): Debrief {
  const last = turns[turns.length - 1];
  const skills = Object.fromEntries(
    (Object.keys(SKILLS) as Skill[]).map((skill) => {
      const scores = turns.filter((turn) => turn.beat.skill === skill).map((turn) => POINTS[turn.choice.quality]);
      return [skill, scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : undefined];
    }),
  ) as Record<Skill, number | undefined>;
  const weak = turns.find((turn) => turn.choice.quality === "bad") ?? turns.find((turn) => turn.choice.quality === "ok");

  return {
    hungUp,
    meeting: !hungUp && last?.beat.id === "closing" && last.choice.quality !== "bad" && last.gauge >= MEETING_AT,
    skills,
    best: turns.find((turn) => turn.choice.quality === "good"),
    weakest: weak ? { turn: weak, better: weak.beat.choices.find((choice) => choice.quality === "good")?.text ?? "" } : undefined,
  };
}

function words(text: string): Set<string> {
  return new Set(
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );
}

/** A typed sentence is matched to the offered reply it shares the most words with. No shared word: the middling one. */
export function closestChoice(typed: string, choices: Choice[]): Choice {
  const said = words(typed);
  let best: { choice: Choice; score: number } | null = null;
  for (const choice of choices) {
    let score = 0;
    for (const word of words(choice.text)) if (said.has(word)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { choice, score };
  }
  return best?.choice ?? choices.find((choice) => choice.quality === "ok") ?? choices[0];
}
