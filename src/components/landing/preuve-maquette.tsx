"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MaquetteStage } from "@/components/pignon/maquette-stage";
import { Button } from "@/components/ui/button";
import { DAS, getDa, getSector, SITE_STATUS } from "@/lib/data";
import { souple } from "@/lib/motion";
import type { Business, DaId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Titre } from "./bloc";

/** Proof 1: the site is designed before the call, and the visitor can restyle it and "open" it. */
export function PreuveMaquette({ business }: { business: Business }) {
  const [da, setDa] = useState<DaId>(business.recommendedDas[0]);
  /** Counts the simulated opens: each one replays the notice */
  const [opens, setOpens] = useState(0);
  const sector = getSector(business.sector);
  const ordered = [...business.recommendedDas, ...DAS.map((item) => item.id).filter((id) => !business.recommendedDas.includes(id))];

  return (
    <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.3fr)] lg:gap-16 lg:px-10 lg:py-28">
      <div>
        <Titre
          title="Sa maquette est prête avant ton appel"
          lead={`Voici ${business.name}, ${sector.label.toLowerCase()} à ${business.address.city} : ${SITE_STATUS[business.site.status].label.toLowerCase()}. Pignon a déjà monté son site, à son nom, avec son adresse et ses horaires.`}
        />

        <div role="group" aria-label="Direction artistique de la maquette" className="mt-8 flex flex-wrap gap-2">
          {ordered.map((id) => {
            const item = getDa(id);
            const active = id === da;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setDa(id)}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-lg border bg-nuit-800 px-3 text-sm transition-colors",
                  active ? "border-craie font-medium text-craie" : "border-trait-fort text-brume hover:border-pave hover:text-craie",
                )}
              >
                <span aria-hidden="true" className="flex -space-x-1">
                  {item.palette.slice(0, 3).map((color) => (
                    <i key={color.hex} className="size-3.5 rounded-full ring-1 ring-nuit-800" style={{ background: color.hex }} />
                  ))}
                </span>
                {item.name}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-brume">{getDa(da).tagline}</p>

        <div className="mt-10 border-t border-trait pt-6">
          <p className="max-w-[44ch] text-brume">
            Pendant l&apos;appel, tu lui envoies le lien par SMS. À la seconde où la maquette s&apos;ouvre, tu le sais.
          </p>
          <Button variant="outline" size="lg" className="mt-4 bg-nuit-800" onClick={() => setOpens((count) => count + 1)}>
            {opens === 0 ? "Simuler l'ouverture" : "Rejouer l'ouverture"}
          </Button>
        </div>
      </div>

      <MaquetteStage slug={business.slug} da={da} name={business.name}>
        <AnimatePresence>
          {opens > 0 && (
            <motion.div
              key={opens}
              role="status"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={souple}
              className="absolute top-4 right-4 z-20 w-[min(19rem,calc(100%-2rem))] rounded-xl bg-nuit-800 p-3.5 shadow-flottant"
            >
              <p className="flex items-center gap-2 text-ui font-medium">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-lumiere" />
                {business.name} regarde sa maquette
              </p>
              <p className="mt-1 pl-4 text-ui text-brume">À l&apos;instant, depuis un téléphone. C&apos;est le moment de rappeler.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </MaquetteStage>
    </section>
  );
}
