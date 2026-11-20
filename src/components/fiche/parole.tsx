"use client";

import { toast } from "sonner";
import { Clock, Copy, PhoneCall } from "lucide-react";
import { LinkButton } from "@/components/pignon/link-button";
import { Panel } from "@/components/pignon/panel";
import { PlanGate } from "@/components/pignon/plan-gate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { buildPrompt, getDa } from "@/lib/data";
import type { Business, CallScript, DaId } from "@/lib/types";
import { Section } from "./section";

/** The prompt to paste into an AI site builder, in the art direction currently shown. */
export function PromptBlock({ business, da }: { business: Business; da: DaId }) {
  const prompt = buildPrompt(business, da);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    toast.success("Prompt copié", { description: `Direction artistique ${getDa(da).name}.` });
  };

  return (
    <Section
      id="prompt"
      title="Le prompt du site"
      lead="Le brief complet de ce site, dans la direction artistique affichée plus haut. Colle-le dans Lovable, v0 ou Claude pour construire le vrai site."
      action={
        <Button variant="secondary" onClick={copy}>
          <Copy aria-hidden="true" />
          Copier le prompt
        </Button>
      }
    >
      <PlanGate feature="all-da-prompts" title="Le prompt prêt à coller" className="rounded-xl">
        <Panel tone="sunken" className="relative">
          <pre
            tabIndex={0}
            aria-label="Texte du prompt"
            className="scrollbar-fin max-h-72 overflow-y-auto p-4 font-mono text-ui leading-relaxed whitespace-pre-wrap text-brume"
          >
            {prompt}
          </pre>
        </Panel>
      </PlanGate>
    </Section>
  );
}

/** What to say on the phone: the best moment, the four steps, the objections. */
export function ScriptBlock({ business, script }: { business: Business; script: CallScript }) {
  return (
    <Section
      id="script"
      title="Le script d'appel"
      lead="Écrit avec les données de ce commerce. À dire avec tes mots : c'est une trame, pas une récitation."
      action={
        <LinkButton href={`/app/coach?commerce=${business.id}`}>
          <PhoneCall aria-hidden="true" />
          Passer en mode appel
        </LinkButton>
      }
    >
      <PlanGate feature="call-script" className="rounded-xl">
        <div>
          <p className="flex items-start gap-2.5 rounded-xl bg-nuit-800/70 p-3.5 text-sm">
            <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-lumiere" />
            <span>
              <strong className="font-semibold">{script.bestTime}.</strong> <span className="text-brume">{script.bestTimeWhy}</span>
            </span>
          </p>

          <ol className="mt-6 flex flex-col gap-7">
            {script.steps.map((step, index) => (
              <li key={step.id} className="grid gap-x-5 gap-y-2 sm:grid-cols-[7.5rem_1fr]">
                <div>
                  <p className="text-sm font-semibold">
                    <span className="chiffres mr-1.5 text-pave">{index + 1}.</span>
                    {step.title}
                  </p>
                  <p className="chiffres mt-0.5 text-2xs text-pave">environ {step.durationSec} s</p>
                </div>
                <div>
                  <p className="voix text-lg text-craie">« {step.line} »</p>
                  <p className="mt-2 text-ui text-brume">{step.tip}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="titre mt-9 text-base">S&apos;il répond</h3>
          <Accordion className="mt-2">
            {script.objections.map((objection) => (
              <AccordionItem key={objection.id} value={objection.id}>
                <AccordionTrigger className="text-[0.9375rem]">« {objection.objection} »</AccordionTrigger>
                <AccordionContent>
                  <p className="voix max-w-[62ch] text-base text-craie">« {objection.answer} »</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </PlanGate>
    </Section>
  );
}
