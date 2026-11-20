"use client";

import { Check } from "lucide-react";
import { AnimatedNumber } from "@/components/pignon/animated-number";
import { PLANS, type Plan } from "@/lib/plans";
import type { BillingCycle, PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { priceNote } from "./pricing-logic";

interface PlansGridProps {
  cycle: BillingCycle;
  /** In the app: the subscriber's plan, marked as theirs */
  current?: PlanId;
  /** The action of each plan: a link on the public site, a button in the app */
  action: (plan: Plan) => React.ReactNode;
  className?: string;
}

/**
 * The four plans side by side. Three quiet columns and one raised sheet: the recommended plan
 * is the only thing with a shadow, so the eye lands on it without a banner.
 */
export function PlansGrid({ cycle, current, action, className }: PlansGridProps) {
  return (
    <ul className={cn("grid gap-y-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {PLANS.map((plan) => (
        <li
          key={plan.id}
          className={cn(
            "flex flex-col p-6 xl:px-7",
            plan.recommended
              ? "rounded-2xl bg-nuit-800 shadow-halo xl:-my-4 xl:py-10"
              : "border-trait max-xl:rounded-2xl max-xl:border xl:border-l xl:first:border-l-0",
          )}
        >
          <h3 className="titre flex items-baseline gap-2.5 text-xl">
            {plan.name}
            {plan.id === current ? (
              <span className="text-2xs font-normal text-pave">ta formule</span>
            ) : (
              plan.recommended && <span className="text-2xs font-normal text-lumiere-doux">conseillée</span>
            )}
          </h3>
          <p className="mt-1.5 min-h-[2.75em] text-sm text-brume">{plan.audience}</p>

          <p className="mt-6 flex items-baseline gap-2">
            <span className="cote text-5xl font-medium tracking-tight">
              <AnimatedNumber value={plan.price[cycle]} duration={0.5} />
              <span className="ml-1 text-3xl">€</span>
            </span>
            <span className="text-sm text-pave">par mois</span>
          </p>
          <p className="mt-2 min-h-10 text-ui text-pave">{priceNote(plan, cycle)}</p>

          <div className="mt-5">{action(plan)}</div>

          <ul className="mt-7 flex flex-col gap-2.5 border-t border-trait pt-6 text-sm">
            {plan.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2.5">
                <Check aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", plan.recommended ? "text-lumiere" : "text-pave")} />
                {highlight}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
