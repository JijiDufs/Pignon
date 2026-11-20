"use client";

import { Fragment, useState } from "react";
import { Check, Minus } from "lucide-react";
import { PLANS } from "@/lib/plans";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { comparisonGroups, type Cell } from "./pricing-logic";
import { Segmented } from "./segmented";

const GROUPS = comparisonGroups();
const PLAN_OPTIONS = PLANS.map((plan) => ({ value: plan.id, label: plan.name }));

function Value({ cell }: { cell: Cell }) {
  if (cell.kind === "value") return <span className="cote text-sm">{cell.text}</span>;
  if (cell.kind === "yes") {
    return (
      <>
        <Check aria-hidden="true" className="mx-auto size-4 text-craie max-lg:mr-0" />
        <span className="sr-only">Inclus</span>
      </>
    );
  }
  return (
    <>
      <Minus aria-hidden="true" className="mx-auto size-4 text-nuit-500 max-lg:mr-0" />
      <span className="sr-only">Non inclus</span>
    </>
  );
}

/**
 * Every limit and feature, plan by plan. On a wide screen the four plans stand side by side;
 * on a phone one plan shows at a time, picked with the selector.
 */
export function Comparison({ current, className }: { current?: PlanId; className?: string }) {
  const [selected, setSelected] = useState<PlanId>(current ?? "pro");

  return (
    <div className={className}>
      <Segmented label="Formule affichée" value={selected} onChange={setSelected} options={PLAN_OPTIONS} stretch className="mb-6 lg:hidden" />
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Comparaison détaillée des formules</caption>
        <thead>
          <tr>
            <th scope="col" className="pb-4 text-sm font-normal text-pave">
              <span className="sr-only">Ce qui est comparé</span>
            </th>
            {PLANS.map((plan) => (
              <th
                key={plan.id}
                scope="col"
                className={cn("w-[14%] pb-4 text-center text-sm font-medium max-lg:w-[36%] max-lg:text-right", plan.id !== selected && "max-lg:hidden")}
              >
                {plan.name}
                {plan.id === current && <span className="block text-2xs font-normal text-pave">ta formule</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GROUPS.map((group) => (
            <Fragment key={group.id}>
              <tr>
                <th scope="colgroup" colSpan={PLANS.length + 1} className="border-b border-craie pt-9 pb-3 text-left">
                  <span className="titre text-lg">{group.title}</span>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.id} className="border-b border-trait">
                  <th scope="row" className="py-3.5 pr-4 text-left align-top font-normal">
                    <span className="block text-[0.9375rem] font-medium">{row.label}</span>
                    <span className="mt-0.5 block max-w-[52ch] text-ui text-brume">{row.description}</span>
                  </th>
                  {PLANS.map((plan) => (
                    <td
                      key={plan.id}
                      className={cn(
                        "py-3.5 text-center align-top max-lg:text-right",
                        plan.recommended && "lg:bg-nuit-800",
                        plan.id !== selected && "max-lg:hidden",
                      )}
                    >
                      <Value cell={row.cells[plan.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
