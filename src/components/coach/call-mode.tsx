"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { MessageSquareText, PhoneOff } from "lucide-react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { Kbd } from "@/components/pignon/kbd";
import { LockChip } from "@/components/pignon/plan-gate";
import { MeetingDialog } from "@/components/pipeline/dialogs";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/format";
import { rebond } from "@/lib/motion";
import { useAppStore, useCan, type CallOutcome } from "@/lib/store";
import type { Business, CallScript } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CallModeProps {
  business: Business;
  script: CallScript;
  onEnd: (outcome: CallOutcome, durationSec: number, meetingAt?: number) => void;
}

const OUTCOMES: { id: CallOutcome; label: string; hint: string }[] = [
  { id: "meeting", label: "Rendez-vous pris", hint: "On fixe la date ensemble" },
  { id: "callback", label: "À rappeler", hint: "Intéressé, pas maintenant" },
  { id: "refused", label: "Pas intéressé", hint: "Le commerce passe en perdu" },
  { id: "voicemail", label: "Répondeur", hint: "Personne n'a décroché" },
];

// The prompter rolls: the new line comes up from below, tilted, and straightens as it arrives.
const ROLL = {
  initial: { opacity: 0, y: 70, rotateX: -32 },
  animate: { opacity: 1, y: 0, rotateX: 0 },
  exit: { opacity: 0, y: -70, rotateX: 32 },
};

/** What is on screen during the call: one line to say, in large type, and the objections one key away. */
export function CallMode({ business, script, onEnd }: CallModeProps) {
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [index, setIndex] = useState(0);
  const [objectionId, setObjectionId] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [meeting, setMeeting] = useState(false);

  const canShare = useCan("live-mockup");
  const promptUpgrade = useAppStore((state) => state.promptUpgrade);
  const shareMaquette = useAppStore((state) => state.shareMaquette);
  const sent = useAppStore((state) => Boolean(state.shared[business.id]));
  const watching = useAppStore((state) => state.opens.some((open) => open.businessId === business.id && open.at >= startedAt));

  const last = script.steps.length - 1;
  const step = script.steps[index];
  const objection = script.objections.find((item) => item.id === objectionId);

  // "Décrocher" may have been clicked far down the page: the call starts at the top.
  useEffect(() => {
    document.getElementById("contenu")?.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (ending) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => clearInterval(timer);
  }, [ending, startedAt]);

  useEffect(() => {
    if (ending) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (event.metaKey || event.ctrlKey || event.altKey || target?.closest("input, textarea, select")) return;
      if (/^[1-9]$/.test(event.key)) {
        const picked = script.objections[Number(event.key) - 1];
        if (!picked) return;
        event.preventDefault();
        setObjectionId((current) => (current === picked.id ? null : picked.id));
      } else if (event.key === "Escape") {
        setObjectionId(null);
      } else if (event.key === " " || event.key === "ArrowRight" || event.key === "ArrowDown") {
        // Space on a focused button belongs to that button.
        if (event.key === " " && target?.closest("button, a")) return;
        event.preventDefault();
        setObjectionId(null);
        setIndex((current) => Math.min(last, current + 1));
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setObjectionId(null);
        setIndex((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ending, last, script]);

  const sendSms = () => {
    if (!canShare) {
      promptUpgrade("live-mockup");
      return;
    }
    shareMaquette(business.id, business.recommendedDas[0], "sms");
    toast.success("Maquette envoyée par SMS", { description: "Tu seras prévenu dès qu'elle est ouverte" });
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={rebond} className="flex min-h-full flex-col">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-trait px-4 py-4 sm:px-6 lg:px-10">
        <BusinessMark sector={business.sector} heat={business.heat} size={40} lit />
        <div className="min-w-0 flex-1">
          <p className="titre truncate text-lg">{business.name}</p>
          <p className="truncate text-sm text-brume">
            {business.owner.civility} {business.owner.firstName} {business.owner.lastName}, <span className="cote">{business.phone}</span>
          </p>
        </div>
        <p className="cote text-3xl font-medium tabular-nums" aria-label={`Durée de l'appel : ${formatDuration(elapsed)}`}>
          {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="lg" className="bg-nuit-800" onClick={sendSms}>
            <MessageSquareText aria-hidden="true" />
            {sent ? "Renvoyer la maquette" : "Envoyer la maquette par SMS"}
            <LockChip feature="live-mockup" />
          </Button>
          <Button variant="destructive" size="lg" onClick={() => setEnding(true)}>
            <PhoneOff aria-hidden="true" />
            Raccrocher
          </Button>
        </div>
      </header>

      {watching && (
        <p role="status" className="flex items-center justify-center gap-2.5 bg-lumiere px-4 py-2.5 text-sm font-medium text-nuit-950">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-nuit-950 opacity-70 motion-reduce:hidden" />
            <span className="relative size-2 rounded-full bg-nuit-950" />
          </span>
          {business.owner.civility} {business.owner.lastName} regarde sa maquette en ce moment
        </p>
      )}

      {ending ? (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
          <h2 className="enseigne text-4xl">Comment ça s&apos;est terminé</h2>
          <p className="mt-2 text-brume">
            Appel de {formatDuration(elapsed)} avec {business.name}. Ton choix range le commerce dans le pipeline.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {OUTCOMES.map((outcome) => (
              <button
                key={outcome.id}
                type="button"
                onClick={() => (outcome.id === "meeting" ? setMeeting(true) : onEnd(outcome.id, elapsed))}
                className={cn(
                  "rounded-2xl border p-5 text-left transition-colors",
                  outcome.id === "meeting" ? "border-craie bg-craie text-nuit-950 hover:bg-craie/90" : "border-trait-fort bg-nuit-800 hover:border-pave",
                )}
              >
                <span className="titre block text-xl">{outcome.label}</span>
                <span className={cn("mt-1 block text-sm", outcome.id === "meeting" ? "text-nuit-950/70" : "text-brume")}>{outcome.hint}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setEnding(false)} className="mt-6 w-fit rounded-md text-sm text-brume underline underline-offset-4 hover:text-craie">
            Je n&apos;ai pas raccroché, reprendre l&apos;appel
          </button>
        </div>
      ) : (
        <>
          <ol aria-label="Étapes du script" className="mx-auto flex w-full max-w-4xl gap-2 px-4 pt-8 sm:px-6">
            {script.steps.map((item, position) => (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  aria-current={position === index ? "step" : undefined}
                  onClick={() => {
                    setObjectionId(null);
                    setIndex(position);
                  }}
                  className={cn(
                    "w-full border-t-2 pt-2 text-left text-sm transition-colors",
                    position === index ? "border-lumiere font-medium text-craie" : position < index ? "border-craie text-brume" : "border-trait-fort text-pave hover:text-craie",
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ol>

          <div aria-live="polite" className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-8 [perspective:1100px] sm:px-6">
            <AnimatePresence mode="wait" initial={false}>
              {objection ? (
                <motion.div key={objection.id} {...ROLL} transition={rebond} className="origin-top">
                  <p className="text-sm text-brume">Il dit : « {objection.objection} »</p>
                  <p className="voix mt-3 text-[clamp(1.6rem,3.2vw,2.5rem)] leading-[1.35]">{objection.answer}</p>
                  <Button variant="outline" className="mt-6 bg-nuit-800" onClick={() => setObjectionId(null)}>
                    Revenir au script
                    <Kbd>Échap</Kbd>
                  </Button>
                </motion.div>
              ) : (
                <motion.div key={step.id} {...ROLL} transition={rebond} className="origin-top">
                  <p className="voix text-[clamp(1.6rem,3.2vw,2.5rem)] leading-[1.35]">{step.line}</p>
                  <p className="mt-6 max-w-[64ch] text-sm text-brume">
                    <span className="cote mr-3 text-pave">{step.durationSec} s</span>
                    {step.tip}
                  </p>
                  {index < last && (
                    <p className="mt-8 flex items-center gap-2.5 text-sm text-pave">
                      <Kbd>Espace</Kbd>
                      Ensuite : {script.steps[index + 1].title.toLowerCase()}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="border-t border-trait px-4 py-4 sm:px-6 lg:px-10">
            <p className="mb-2.5 text-sm text-brume">S&apos;il te répond</p>
            <ul className="flex flex-wrap gap-2">
              {script.objections.map((item, position) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={objectionId === item.id}
                    onClick={() => setObjectionId((current) => (current === item.id ? null : item.id))}
                    className={cn(
                      "flex h-10 items-center gap-2.5 rounded-lg border px-3 text-sm transition-colors",
                      objectionId === item.id ? "border-craie bg-craie text-nuit-950" : "border-trait-fort bg-nuit-800 hover:border-pave",
                    )}
                  >
                    <span className="cote text-2xs opacity-60">{position + 1}</span>
                    {item.objection}
                  </button>
                </li>
              ))}
            </ul>
          </footer>
        </>
      )}

      {meeting && <MeetingDialog business={business} onCancel={() => setMeeting(false)} onConfirm={(at) => onEnd("meeting", elapsed, at)} />}
    </motion.div>
  );
}
