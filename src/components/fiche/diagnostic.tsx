"use client";

import { motion } from "motion/react";
import { Check, Minus, X } from "lucide-react";
import { ScoreDial } from "@/components/pignon/score";
import { SITE_STATUS_STYLE, SiteStatusBadge } from "@/components/pignon/site-status";
import { SITE_STATUS } from "@/lib/data";
import { formatEuro, formatRating } from "@/lib/format";
import { souple } from "@/lib/motion";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import { bilanDefaillances, defaillances, GRAVITES, phraseVoisins, pointsDeControle, resultatControle, type EtatControle } from "./lecture";
import type { Arrival } from "./use-arrival";

/** Why this business, now: the score, then the reasons that add up to it. */
export function WhyBlock({ business, arrival }: { business: Business; arrival: Arrival }) {
  return (
    <section aria-labelledby="pourquoi">
      <h2 id="pourquoi" className="titre text-xl">
        Pourquoi lui
      </h2>
      <div className="mt-5 flex items-center gap-5">
        <ScoreDial score={business.score} size="lg" animate={arrival.playing} showLabel />
        <p className="text-sm text-brume">
          Un site estimé à
          <strong className="enseigne mt-1 block text-3xl text-craie">{formatEuro(business.estimatedDeal)}</strong>
        </p>
      </div>

      <ol className="mt-6 flex flex-col">
        {business.reasons.map((reason, index) => (
          <motion.li
            key={reason.id}
            initial={false}
            animate={index < arrival.revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={souple}
            className="flex gap-3 border-t border-trait py-3"
          >
            <span className="chiffres w-9 shrink-0 text-right text-sm font-semibold text-lumiere-doux">+{reason.points}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{reason.label}</span>
              <span className="mt-0.5 block text-ui text-brume">{reason.detail}</span>
            </span>
          </motion.li>
        ))}
        <motion.li
          initial={false}
          animate={arrival.summed ? { opacity: 1 } : { opacity: 0 }}
          className="flex items-baseline gap-3 border-t border-trait-fort pt-3"
        >
          <span className="chiffres w-9 shrink-0 text-right text-lg font-bold">{business.score}</span>
          <span className="text-sm text-brume">points sur 100 : c&apos;est son score.</span>
        </motion.li>
      </ol>
    </section>
  );
}

const MARK: Record<EtatControle, { icon: typeof Check; tone: string; label: string }> = {
  ok: { icon: Check, tone: "bg-pharmacie/15 text-pharmacie", label: "Conforme" },
  ko: { icon: X, tone: "bg-enseigne/15 text-enseigne", label: "Défaillant" },
  na: { icon: Minus, tone: "bg-nuit-700 text-pave", label: "Non contrôlé" },
};

const STAMP: Record<string, string> = {
  Favorable: "border-pharmacie text-pharmacie",
  "Contre-visite": "border-enseigne text-enseigne",
  "Non présenté": "border-lumiere text-lumiere",
};

/** The diagnosis of the current website, laid out like the report of a French vehicle inspection. */
export function ControleTechnique({ business }: { business: Business }) {
  const { site } = business;
  const result = resultatControle(site.status);
  const failures = defaillances(site);
  const style = SITE_STATUS_STYLE[site.status];

  return (
    <section aria-labelledby="controle">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="controle" className="titre text-xl">
            Contrôle technique du site
          </h2>
          <p className="mt-1.5 text-ui text-brume">{SITE_STATUS[site.status].description}</p>
        </div>
        {/* The verdict, stamped like on the windscreen sticker. */}
        <span className={cn("shrink-0 -rotate-6 rounded-md border-2 px-2 py-1 text-ui font-bold", STAMP[result])}>{result}</span>
      </div>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl border border-trait bg-nuit-950/50 p-3.5 text-ui">
        <dt className="text-pave">Adresse</dt>
        <dd className="truncate font-medium">{site.url ?? "Aucune"}</dd>
        {site.platform && (
          <>
            <dt className="text-pave">Fait avec</dt>
            <dd className="truncate font-medium">{site.platform}</dd>
          </>
        )}
        <dt className="text-pave">Verdict</dt>
        <dd>
          <SiteStatusBadge status={site.status} label="full" />
        </dd>
      </dl>

      <ul className="mt-4 flex flex-col">
        {pointsDeControle(site).map((point) => {
          const mark = MARK[point.etat];
          return (
            <li key={point.id} className="flex items-center gap-3 border-t border-trait py-2.5 first:border-t-0">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", mark.tone)}>
                <mark.icon aria-hidden="true" className="size-3.5" strokeWidth={3} />
                <span className="sr-only">{mark.label}</span>
              </span>
              <span className="w-20 shrink-0 text-ui text-brume">{point.label}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{point.valeur}</span>
                {point.note && <span className="block truncate text-2xs text-pave">{point.note}</span>}
              </span>
            </li>
          );
        })}
      </ul>

      {failures.length > 0 && (
        <>
          <p className="mt-4 text-ui font-semibold" style={{ color: style.color }}>
            {bilanDefaillances(failures)}
          </p>
          <ul className="mt-2 flex flex-col gap-2.5">
            {failures.map((failure) => (
              <li key={failure.label} className="text-ui">
                <span className="font-semibold">{failure.label}</span>
                <span className="ml-2 rounded-sm bg-nuit-700 px-1.5 py-0.5 text-2xs text-brume">{GRAVITES[failure.severity].label}</span>
                <span className="mt-0.5 block text-brume">{failure.detail}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {site.paysSubscription && (
        <p className="mt-4 rounded-xl bg-lumiere/10 p-3 text-ui text-lumiere-doux">
          Il paie déjà un abonnement mensuel pour ce site : le budget existe, il s&apos;agit de mieux le dépenser.
        </p>
      )}
    </section>
  );
}

/** The three nearest businesses of the same trade: who already has a website. */
export function Voisins({ business }: { business: Business }) {
  return (
    <section aria-labelledby="voisins">
      <h2 id="voisins" className="titre text-xl">
        Ses voisins
      </h2>
      <p className="mt-1.5 text-ui text-brume">{phraseVoisins(business.competitors)}</p>
      <ul className="mt-3 flex flex-col">
        {business.competitors.map((competitor) => (
          <li key={competitor.name} className="flex items-center gap-3 border-t border-trait py-2.5 text-sm first:border-t-0">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full",
                competitor.hasSite ? "bg-enseigne/15 text-enseigne" : "bg-nuit-700 text-pave",
              )}
            >
              {competitor.hasSite ? <Check aria-hidden="true" className="size-3.5" strokeWidth={3} /> : <Minus aria-hidden="true" className="size-3.5" strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{competitor.name}</span>
              <span className="block text-2xs text-pave">
                {competitor.hasSite ? "A un site" : "Pas de site"}, à {competitor.distanceM} m
              </span>
            </span>
            <span className="chiffres shrink-0 text-ui text-brume">
              {formatRating(competitor.rating)} sur 5 ({competitor.reviewCount})
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
