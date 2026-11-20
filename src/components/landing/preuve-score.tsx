"use client";

import { useState } from "react";
import { ScoreDial } from "@/components/pignon/score";
import { getSector } from "@/lib/data";
import { formatEuro } from "@/lib/format";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Titre } from "./bloc";

/** Proof 3: the score is a sum of reasons the visitor can read, one business after another. */
export function PreuveScore({ businesses }: { businesses: Business[] }) {
  const [index, setIndex] = useState(0);
  const business = businesses[index];

  return (
    <section className="border-y border-trait bg-nuit-800">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 lg:px-10 lg:py-28">
        <div>
          <Titre
            title="Un score qui dit pourquoi lui, pourquoi maintenant"
            lead="Chaque commerce reçoit une note sur 100. Rien de magique : des raisons qui s'additionnent, écrites en clair, que tu peux répéter au téléphone."
          />
          <div role="group" aria-label="Commerce à examiner" className="mt-8 flex flex-col gap-2">
            {businesses.map((item, position) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={position === index}
                onClick={() => setIndex(position)}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-xl border px-4 text-left text-sm transition-colors",
                  position === index ? "border-craie font-medium" : "border-trait-fort text-brume hover:border-pave hover:text-craie",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <span className="hidden text-ui font-normal text-pave sm:inline">{getSector(item.sector).label}</span>
                <span className="cote w-7 text-right">{item.score}</span>
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite" className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <ScoreDial key={business.id} score={business.score} size="lg" animate showLabel />
          <div className="min-w-0 flex-1">
            <ol className="flex flex-col">
              {business.reasons.map((reason) => (
                <li key={reason.id} className="grid grid-cols-[3rem_1fr] gap-x-3 border-b border-trait py-4 first:pt-0">
                  <span className="cote text-lg font-medium text-lumiere">+{reason.points}</span>
                  <div>
                    <p className="font-medium">{reason.label}</p>
                    <p className="mt-0.5 text-sm text-brume">{reason.detail}</p>
                    <span aria-hidden="true" className="mt-3 block h-1 rounded-full bg-nuit-600">
                      <span className="block h-full rounded-full bg-craie transition-[width] duration-500 ease-doux" style={{ width: `${reason.points}%` }} />
                    </span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="cote mt-4 text-sm text-brume">
              {business.reasons.map((reason) => reason.points).join(" + ")} = <span className="font-medium text-craie">{business.score}</span>
              <span className="ml-3 text-pave">site estimé à {formatEuro(business.estimatedDeal)}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
