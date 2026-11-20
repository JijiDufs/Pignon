"use client";

import { useState } from "react";
import { AnimatedNumber } from "@/components/pignon/animated-number";
import { formatEuro, plural } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import type { BillingCycle, PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Curseur } from "./curseur";
import { PAID_PLANS, SIMULATOR, simulate } from "./pricing-logic";
import { Segmented } from "./segmented";

const PLAN_OPTIONS = PAID_PLANS.map((plan) => ({ value: plan.id, label: plan.name }));
const SLOTS = Array.from({ length: SIMULATOR.sites.max }, (_, index) => index);

/** The argument of the pricing page, handed to the visitor: how many signed sites pay for the plan. */
export function Simulator({ cycle }: { cycle: BillingCycle }) {
  const [sites, setSites] = useState<number>(SIMULATOR.sites.initial);
  const [price, setPrice] = useState<number>(SIMULATOR.price.initial);
  const [planId, setPlanId] = useState<PlanId>("pro");
  const plan = getPlan(planId);
  const result = simulate(sites, price, plan, cycle);
  // A column per signed site, as tall as the site is expensive: the same marks as on the map.
  const height = 24 + ((price - SIMULATOR.price.min) / (SIMULATOR.price.max - SIMULATOR.price.min)) * 76;

  return (
    <div className="grid gap-10 rounded-3xl bg-nuit-800 p-6 shadow-flottant sm:p-10 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-8">
        <Curseur
          label="Combien de sites tu signes par mois ?"
          value={sites}
          onChange={setSites}
          min={SIMULATOR.sites.min}
          max={SIMULATOR.sites.max}
          format={(value) => plural(value, "site")}
        />
        <Curseur
          label="À quel prix moyen ?"
          value={price}
          onChange={setPrice}
          min={SIMULATOR.price.min}
          max={SIMULATOR.price.max}
          step={SIMULATOR.price.step}
          format={formatEuro}
        />
        <div>
          <p className="mb-2 text-sm text-brume">Avec la formule</p>
          <Segmented label="Formule à rembourser" value={planId} onChange={setPlanId} options={PLAN_OPTIONS} />
        </div>
      </div>

      <div className="flex flex-col">
        <div aria-hidden="true" className="flex h-28 items-end gap-2 border-b border-craie">
          {SLOTS.map((slot) => (
            <span
              key={slot}
              className={cn("flex-1 rounded-t-sm transition-[height,background-color] duration-500 ease-doux", slot < sites ? "bg-lumiere" : "bg-nuit-600")}
              style={{ height: slot < sites ? `${height}%` : "6%" }}
            />
          ))}
        </div>

        <p aria-live="polite" className="mt-7">
          <AnimatedNumber value={result.revenue} format={formatEuro} duration={0.5} className="cote text-5xl font-medium tracking-tight sm:text-6xl" />
          <span className="mt-1 block text-brume">de sites vendus par mois</span>
        </p>
        <p className="mt-5 max-w-[46ch] text-lg">
          {sites === 0 ? (
            "Aucun site signé ce mois-ci. La formule Découverte reste gratuite : tu ne paies qu'une fois lancé."
          ) : (
            <>
              {plan.name}, à {formatEuro(plan.price[cycle])} par mois, est remboursée{" "}
              <span className="cote font-medium text-lumiere-doux">{result.timesRepaid} fois</span>.
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-brume">
          Un seul site à {formatEuro(price)} paie {plural(result.monthsPerSite, "mois", "mois")} de {plan.name}.
        </p>
      </div>
    </div>
  );
}
