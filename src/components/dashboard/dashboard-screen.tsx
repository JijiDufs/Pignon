"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { LinkButton } from "@/components/pignon/link-button";
import { Page } from "@/components/pignon/page";
import { PlanGate } from "@/components/pignon/plan-gate";
import { ScorePill } from "@/components/pignon/score";
import { previewPipeline, signedThisMonth, startOfDay } from "@/components/pipeline/model";
import { getBusiness, getCity, getOpportunities, getSector, getZoneStats, CITIES } from "@/lib/data";
import { takenByOthers } from "@/lib/exclusivity";
import { formatEuro, formatRelative, maskName, plural } from "@/lib/format";
import { souple } from "@/lib/motion";
import { useAppStore, useCan, useNow } from "@/lib/store";
import type { Business } from "@/lib/types";
import { CallsWeek, Figure, Funnel } from "./figures";
import { buildQueue, type QueueItem } from "./queue";
import { Scene } from "./scene";
import { ACTION, HEADLINE, whyNow } from "./why";

const FIRST_STEPS = [
  { title: "Scanne ta zone", text: "Pignon relève les commerces sans site, ou avec un site à l'abandon, et les classe par score." },
  { title: "Ouvre une fiche", text: "Le diagnostic, les voisins, la maquette déjà prête. Ajoute le commerce à ton pipeline." },
  { title: "Reviens ici", text: "Chaque matin, cette page te dit qui appeler en premier, et pourquoi." },
];

const TODAY = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "Aujourd'hui" answers one question: who do I call now? */
export function DashboardScreen() {
  const now = useNow();
  const user = useAppStore((state) => state.user);
  const zone = useAppStore((state) => state.zone);
  const lastScanAt = useAppStore((state) => state.lastScanAt);
  const pipeline = useAppStore((state) => state.pipeline);
  const opens = useAppStore((state) => state.opens);
  const reservations = useAppStore((state) => state.reservations);
  const calls = useAppStore((state) => state.calls);
  const plan = useAppStore((state) => state.plan);
  const canPipeline = useCan("pipeline");
  const openAlert = useCan("open-alert");
  const reservation = useCan("lead-reservation");

  const city = getCity(zone.cityId) ?? CITIES[0];
  const stats = useMemo(() => getZoneStats(zone.cityId, zone), [zone]);
  const queue = useMemo(
    () => (canPipeline ? buildQueue({ pipeline, opens, reservations, openAlert, reservation }, getBusiness, now) : []),
    [canPipeline, pipeline, opens, reservations, openAlert, reservation, now],
  );
  // Without a pipeline (Découverte, or a new account), the best free opportunities of the zone stand in for the queue.
  const suggestions = useMemo(
    () =>
      queue.length > 0
        ? []
        : getOpportunities(zone.cityId, zone)
            .filter((business) => !takenByOthers(business.id))
            .slice(0, 5),
    [queue.length, zone],
  );

  const [first, ...rest] = queue;
  const scanned = lastScanAt !== null;
  const sceneBusinesses = useMemo(
    () => (queue.length > 0 ? queue.map((item) => item.business) : scanned ? suggestions : []),
    [queue, scanned, suggestions],
  );
  const entries = Object.values(pipeline);
  const signed = signedThisMonth(entries, now);
  const meetings = entries.filter((entry) => entry.stage === "meeting" && (entry.meetingAt ?? 0) >= startOfDay(now)).length;
  const masked = plan === "free";

  return (
    <Page>
      <section className="relative isolate overflow-hidden rounded-3xl bg-nuit-700 shadow-petit">
        <Scene city={city} businesses={sceneBusinesses} focus={first?.business} className="absolute inset-0 -z-10" />
        <div className="flex min-h-[420px] flex-col justify-between gap-6 p-4 sm:p-6 lg:w-[480px]">
          <div className="feuille rounded-2xl p-5 sm:p-6">
            <p className="text-sm text-brume first-letter:uppercase">{TODAY.format(now)}</p>
            <h1 className="enseigne mt-1 text-3xl sm:text-4xl">Bonjour {user.firstName}</h1>

            <AnimatePresence mode="popLayout" initial={false}>
              {first ? (
                <motion.div
                  key={first.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={souple}
                  className="mt-6 border-t border-trait pt-5"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-lumiere-doux">
                    {first.live && (
                      <span aria-hidden="true" className="relative flex size-2">
                        <span className="absolute inset-0 animate-ping rounded-full bg-lumiere opacity-60 motion-reduce:hidden" />
                        <span className="relative size-2 rounded-full bg-lumiere" />
                      </span>
                    )}
                    {HEADLINE[first.kind]}
                  </p>
                  <div className="mt-3 flex items-center gap-3.5">
                    <BusinessMark sector={first.business.sector} heat={first.business.heat} size={48} lit />
                    <div className="min-w-0">
                      <p className="titre truncate text-2xl">{first.business.name}</p>
                      <p className="truncate text-sm text-brume">{whyNow(first, now)}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <LinkButton href={`/app/coach?commerce=${first.business.id}`} size="lg">
                      {ACTION[first.kind]} {first.business.owner.civility} {first.business.owner.lastName}
                    </LinkButton>
                    <LinkButton href={`/app/commerces/${first.business.id}`} size="lg" variant="outline" className="bg-nuit-800">
                      Voir la fiche
                    </LinkButton>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="vide" initial={false} className="mt-6 border-t border-trait pt-5">
                  <p className="titre text-xl">{scanned ? "Personne à appeler pour l'instant" : "Ta zone n'a pas encore été scannée"}</p>
                  <p className="mt-1.5 text-sm text-brume">
                    {scanned
                      ? "Ouvre une fiche depuis le radar et ajoute le commerce à ton pipeline : il arrivera ici."
                      : `Lance le premier scan de ${city.name} : Pignon relève les commerces sans site et les classe pour toi.`}
                  </p>
                  <LinkButton href={scanned ? "/app/radar" : "/app/radar?scan=1"} size="lg" className="mt-5">
                    {scanned ? "Ouvrir le radar" : "Scanner ma zone"}
                  </LinkButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="cote w-fit rounded-md bg-nuit-800/85 px-2.5 py-1.5 text-2xs text-brume max-sm:mb-6">
            {city.name}, {zone.radiusKm} km, {plural(zone.sectors.length, "métier")}
            {scanned && lastScanAt ? `, scanné ${formatRelative(lastScanAt, now)}` : ""}
            <Link href="/app/radar" className="ml-2 text-craie underline underline-offset-2">
              Radar
            </Link>
          </p>
        </div>
      </section>

      {!scanned ? (
        <ol className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-3">
          {FIRST_STEPS.map((step, index) => (
            <li key={step.title} className="border-t border-craie pt-5">
              <span className="cote text-sm text-pave">0{index + 1}</span>
              <h2 className="titre mt-4 text-xl">{step.title}</h2>
              <p className="mt-2 text-brume">{step.text}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-10 grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <section aria-labelledby="file" className="min-w-0">
            <h2 id="file" className="titre text-2xl">
              {queue.length > 0 ? "Ensuite" : "Les meilleures opportunités de ta zone"}
            </h2>
            {queue.length > 0 ? (
              rest.length > 0 ? (
                <ul className="mt-3 divide-y divide-trait">
                  <AnimatePresence initial={false} mode="popLayout">
                    {rest.map((item) => (
                      <QueueRow key={item.key} item={item} now={now} />
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <p className="mt-3 text-brume">C&apos;est le seul appel de la file. Le radar en a d&apos;autres.</p>
              )
            ) : (
              <ul className="mt-3 divide-y divide-trait">
                {suggestions.map((business) => (
                  <SuggestionRow key={business.id} business={business} masked={masked} />
                ))}
              </ul>
            )}
          </section>

          <div className="flex min-w-0 flex-col gap-12">
            <section aria-labelledby="releve">
              <h2 id="releve" className="titre text-2xl">
                Le relevé
              </h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-7">
                <Figure value={stats.opportunities} label="opportunités dans ta zone" />
                <Figure value={stats.potentialRevenue} format={formatEuro} label="de sites à vendre" />
                {entries.length > 0 && (
                  <>
                    <Figure value={meetings} label="rendez-vous à venir" />
                    <Figure value={signed.total} format={formatEuro} label="signés ce mois-ci" accent={signed.total > 0} />
                  </>
                )}
              </dl>
            </section>

            {(entries.length > 0 || !canPipeline) && (
              <PlanGate feature="pipeline" title="Ton pipeline, étape par étape">
                <div className="flex flex-col gap-12">
                  <section aria-labelledby="entonnoir">
                    <h2 id="entonnoir" className="titre text-2xl">
                      Où en sont tes commerces
                    </h2>
                    <div className="mt-5">
                      <Funnel pipeline={canPipeline ? pipeline : previewPipeline(getOpportunities(zone.cityId), now)} />
                    </div>
                  </section>
                  <section aria-labelledby="appels">
                    <h2 id="appels" className="titre text-2xl">
                      Tes appels, sur sept jours
                    </h2>
                    <div className="mt-5">
                      {calls.length > 0 ? (
                        <CallsWeek calls={calls} now={now} />
                      ) : (
                        <p className="text-brume">Aucun appel noté cette semaine. Le coach les enregistre quand tu raccroches.</p>
                      )}
                    </div>
                  </section>
                </div>
              </PlanGate>
            )}
          </div>
        </div>
      )}
    </Page>
  );
}

function QueueRow({ item, now }: { item: QueueItem; now: number }) {
  const { business } = item;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={souple}
      className="flex items-center gap-3.5 py-4"
    >
      <BusinessMark sector={business.sector} heat={business.heat} size={40} />
      <div className="min-w-0 flex-1">
        <Link href={`/app/commerces/${business.id}`} className="block truncate rounded font-medium hover:underline">
          {business.name}
        </Link>
        <p className="truncate text-sm text-brume">{whyNow(item, now)}</p>
      </div>
      <ScorePill score={business.score} className="max-sm:hidden" />
      <LinkButton href={`/app/coach?commerce=${business.id}`} variant="outline" className="bg-nuit-800">
        {ACTION[item.kind]}
      </LinkButton>
    </motion.li>
  );
}

function SuggestionRow({ business, masked }: { business: Business; masked: boolean }) {
  const unlocked = useAppStore((state) => state.unlocked.includes(business.id));
  const name = masked && !unlocked ? maskName(business.name) : business.name;
  return (
    <li className="flex items-center gap-3.5 py-4">
      <BusinessMark sector={business.sector} heat={business.heat} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        <p className="truncate text-sm text-brume">
          {getSector(business.sector).label}, un site estimé à {formatEuro(business.estimatedDeal)}
        </p>
      </div>
      <ScorePill score={business.score} />
      <LinkButton href="/app/radar" variant="outline" className="bg-nuit-800">
        Voir sur le radar
      </LinkButton>
    </li>
  );
}
