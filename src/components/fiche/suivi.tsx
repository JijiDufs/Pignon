"use client";

import { useState } from "react";
import { PlanGate } from "@/components/pignon/plan-gate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PIPELINE_STAGES } from "@/lib/data";
import { formatDuration } from "@/lib/format";
import { useAppStore, useNow, type CallOutcome } from "@/lib/store";
import type { Business, PipelineStage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { quand } from "./lecture";

const OUTCOME: Record<CallOutcome, string> = {
  meeting: "Rendez-vous pris",
  callback: "À rappeler",
  refused: "Pas intéressé",
  voicemail: "Répondeur",
};

/** Where this business stands in the pipeline, a free note, and the calls already made. */
export function Suivi({ business }: { business: Business }) {
  const entry = useAppStore((state) => state.pipeline[business.id]);
  const calls = useAppStore((state) => state.calls);
  const setStage = useAppStore((state) => state.setStage);
  const updateEntry = useAppStore((state) => state.updatePipelineEntry);
  const remove = useAppStore((state) => state.removeFromPipeline);
  const now = useNow();
  const [note, setNote] = useState(entry?.note ?? "");
  const history = calls.filter((call) => call.businessId === business.id).slice(0, 5);

  const pick = (stage: PipelineStage) => setStage(business.id, stage, note ? { note } : undefined);

  return (
    <section aria-labelledby="suivi">
      <h2 id="suivi" className="titre text-xl">
        Suivi
      </h2>
      <PlanGate feature="pipeline" className="mt-4 rounded-xl">
        <div className="mt-4">
          <div role="radiogroup" aria-label="Étape du pipeline" className="flex flex-wrap gap-1.5">
            {PIPELINE_STAGES.map((stage) => {
              const active = entry?.stage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => pick(stage.id)}
                  className={cn(
                    "h-8 rounded-full border px-3 text-ui font-medium transition-colors",
                    active
                      ? stage.id === "won"
                        ? "border-transparent bg-pharmacie text-nuit-950"
                        : "border-transparent bg-lumiere text-nuit-950"
                      : "border-trait-fort text-brume hover:bg-nuit-700 hover:text-craie",
                  )}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>
          {entry ? (
            <p className="mt-2.5 text-2xs text-pave">
              Dans le pipeline, mis à jour {quand(entry.updatedAt, now)}.{" "}
              <button type="button" className="underline underline-offset-2 hover:text-craie" onClick={() => remove(business.id)}>
                Retirer du pipeline
              </button>
            </p>
          ) : (
            <p className="mt-2.5 text-2xs text-pave">Pas encore dans ton pipeline : choisis une étape pour l&apos;y ajouter.</p>
          )}

          <label htmlFor="note" className="mt-5 block text-ui text-brume">
            Note
          </label>
          <Textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onBlur={() => entry && updateEntry(business.id, { note })}
            placeholder="Ce qu'il a dit, quand rappeler, ce qu'il veut voir"
            className="mt-1.5 min-h-20"
          />
          {!entry && note && (
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => pick("to-call")}>
              Enregistrer la note et ajouter au pipeline
            </Button>
          )}

          {history.length > 0 && (
            <>
              <h3 className="mt-6 text-ui font-semibold">Appels passés</h3>
              <ul className="mt-1.5 flex flex-col">
                {history.map((call) => (
                  <li key={call.id} className="flex items-baseline justify-between gap-3 border-t border-trait py-2 text-ui first:border-t-0">
                    <span className="font-medium">{OUTCOME[call.outcome]}</span>
                    <span className="text-pave">
                      {quand(call.at, now)}, {formatDuration(call.durationSec)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </PlanGate>
    </section>
  );
}
