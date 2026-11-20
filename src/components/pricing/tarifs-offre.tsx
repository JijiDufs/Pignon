"use client";

import { useState } from "react";
import { LinkButton } from "@/components/pignon/link-button";
import type { BillingCycle } from "@/lib/types";
import { BillingToggle } from "./billing-toggle";
import { PlansGrid } from "./plans-grid";
import { Simulator } from "./simulator";

/** Top of /tarifs: the billing cycle drives both the four plans and the simulator under them. */
export function TarifsOffre() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <>
      <section className="mx-auto max-w-[1240px] px-4 pt-14 pb-20 sm:px-6 lg:px-10 lg:pt-20 lg:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <div>
            <h1 className="enseigne max-w-[17ch] text-[clamp(2.5rem,5.6vw,4.5rem)]">Un site signé paie ton abonnement pour des mois</h1>
            <p className="mt-6 max-w-[50ch] text-lg text-brume">
              Quatre formules, sans engagement. Tu commences gratuitement, tu changes ou tu arrêtes quand tu veux.
            </p>
          </div>
          <BillingToggle cycle={cycle} onChange={setCycle} />
        </div>

        <PlansGrid
          cycle={cycle}
          className="mt-14 xl:mt-20"
          action={(plan) => (
            <LinkButton href={`/inscription?formule=${plan.id}`} variant={plan.recommended ? "default" : "outline"} size="lg" className="w-full">
              {plan.price.monthly === 0 ? "Commencer gratuitement" : `Choisir ${plan.name}`}
            </LinkButton>
          )}
        />
      </section>

      <section className="border-y border-trait bg-nuit-700/60">
        <div className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <h2 className="enseigne max-w-[20ch] text-[clamp(2rem,4vw,3.125rem)]">Fais le calcul avec tes chiffres</h2>
          <p className="mt-5 mb-12 max-w-[54ch] text-lg text-brume">
            Déplace les curseurs : ce que tes sites rapportent en un mois, et combien de fois la formule est remboursée.
          </p>
          <Simulator cycle={cycle} />
        </div>
      </section>
    </>
  );
}
