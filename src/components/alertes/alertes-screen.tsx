"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { EmptyState } from "@/components/pignon/empty-state";
import { Page, PageHeader } from "@/components/pignon/page";
import { PlanGate } from "@/components/pignon/plan-gate";
import { Button } from "@/components/ui/button";
import { getBusiness, getNewRegistrations, getSector } from "@/lib/data";
import { formatDate, formatRelative, plural } from "@/lib/format";
import { can } from "@/lib/plans";
import { useAppStore, useNow, type AlertKind } from "@/lib/store";
import { cn } from "@/lib/utils";
import { groupByDay, KIND_ORDER, KINDS } from "./alert-model";
import { AlertRow } from "./alert-row";

export function AlertesScreen() {
  const now = useNow(20_000);
  const plan = useAppStore((state) => state.plan);
  const all = useAppStore((state) => state.alerts);
  const shared = useAppStore((state) => state.shared);
  const opens = useAppStore((state) => state.opens);
  const cityId = useAppStore((state) => state.zone.cityId);
  const markAllAlertsRead = useAppStore((state) => state.markAllAlertsRead);
  const [kind, setKind] = useState<AlertKind | "all">("all");

  // The feed only carries what the plan includes; the rest shows locked on the side.
  const allowed = useMemo(() => all.filter((alert) => can(plan, KINDS[alert.kind].feature)), [all, plan]);
  const shown = kind === "all" ? allowed : allowed.filter((alert) => alert.kind === kind);
  const groups = groupByDay(shown, now);
  const unread = allowed.filter((alert) => !alert.read).length;

  const mockups = useMemo(
    () =>
      Object.entries(shared)
        .map(([id, share]) => {
          const times = opens.filter((open) => open.businessId === id).map((open) => open.at);
          return { business: getBusiness(id), sentAt: share.at, count: times.length, last: times.length > 0 ? Math.max(...times) : undefined };
        })
        .filter((item) => item.business !== undefined)
        .sort((a, b) => (b.last ?? 0) - (a.last ?? 0) || b.sentAt - a.sentAt),
    [shared, opens],
  );
  const registrations = getNewRegistrations(cityId).slice(0, 6);

  return (
    <Page>
      <PageHeader
        title="Alertes"
        description={unread > 0 ? `${plural(unread, "alerte non lue", "alertes non lues")}. La plus précieuse : un commerçant qui regarde sa maquette.` : "Tout est lu. Les prochaines arrivent ici."}
        actions={
          unread > 0 ? (
            <Button variant="outline" className="bg-nuit-800" onClick={markAllAlertsRead}>
              Tout marquer comme lu
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <section aria-label="Fil des alertes" className="min-w-0">
          <div role="group" aria-label="Filtrer par sorte" className="mb-6 flex flex-wrap gap-2">
            <Filter active={kind === "all"} onClick={() => setKind("all")} label="Toutes" count={allowed.length} />
            {KIND_ORDER.filter((item) => can(plan, KINDS[item].feature)).map((item) => (
              <Filter
                key={item}
                active={kind === item}
                onClick={() => setKind(item)}
                label={KINDS[item].label}
                count={allowed.filter((alert) => alert.kind === item).length}
              />
            ))}
          </div>

          {groups.length === 0 ? (
            <EmptyState
              title="Aucune alerte pour l'instant"
              description="Elles arrivent toutes seules : quand un commerçant ouvre sa maquette, quand une entreprise s'installe dans ta zone, avant un rendez-vous ou la fin d'une réservation."
              className="rounded-2xl border border-dashed border-trait-fort"
            />
          ) : (
            groups.map((group) => (
              <div key={group.id} className="mb-8">
                <h2 className="mb-2 px-1 text-sm text-brume">{group.label}</h2>
                <ul className="flex flex-col gap-1.5">
                  <AnimatePresence initial={false}>
                    {group.alerts.map((alert) => (
                      <AlertRow key={alert.id} alert={alert} now={now} />
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            ))
          )}
        </section>

        <aside className="flex min-w-0 flex-col gap-12">
          <PlanGate feature="open-alert" title="Qui a ouvert sa maquette">
            <section aria-labelledby="ouvertes" className={cn(!can(plan, "open-alert") && "p-4")}>
              <h2 id="ouvertes" className="titre text-xl">
                Maquettes envoyées
              </h2>
              {mockups.length === 0 ? (
                <p className="mt-3 text-sm text-brume">Aucune maquette envoyée. Le bouton « Envoyer par SMS » est sur chaque fiche.</p>
              ) : (
                <ul className="mt-2 divide-y divide-trait">
                  {mockups.map(({ business, count, last, sentAt }) =>
                    business ? (
                      <li key={business.id} className="flex items-center gap-3 py-3">
                        <BusinessMark sector={business.sector} heat={business.heat} size={32} lit={count > 0} />
                        <div className="min-w-0 flex-1">
                          <Link href={`/app/commerces/${business.id}`} className="block truncate rounded text-sm font-medium hover:underline">
                            {business.name}
                          </Link>
                          <p className="truncate text-ui text-brume">
                            {last !== undefined ? `Ouverte ${formatRelative(last, now)}` : `Envoyée ${formatRelative(sentAt, now)}, jamais ouverte`}
                          </p>
                        </div>
                        <span className={cn("cote text-sm", count > 0 ? "font-medium text-lumiere-doux" : "text-pave")}>{count} ×</span>
                      </li>
                    ) : null,
                  )}
                </ul>
              )}
            </section>
          </PlanGate>

          <PlanGate feature="new-business-alerts" title="Les nouvelles entreprises de ta zone">
            <section aria-labelledby="registre" className={cn(!can(plan, "new-business-alerts") && "p-4")}>
              <h2 id="registre" className="titre text-xl">
                Nouvelles entreprises de ta zone
              </h2>
              <ul className="mt-2 divide-y divide-trait">
                {registrations.map((registration) => (
                  <li key={registration.id} className="py-3">
                    <p className="flex items-baseline justify-between gap-3 text-sm font-medium">
                      <span className="truncate">{registration.name}</span>
                      <span className="cote shrink-0 text-2xs font-normal text-pave">{formatDate(registration.registeredAt)}</span>
                    </p>
                    <p className="truncate text-ui text-brume">
                      {getSector(registration.sector).label}, {registration.street}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </PlanGate>

          <p className="text-sm text-brume">
            Tu choisis ce qui te prévient dans les{" "}
            <Link href="/app/reglages" className="text-craie underline decoration-trait-fort underline-offset-4 hover:decoration-craie">
              réglages de notification
            </Link>
            .
          </p>
        </aside>
      </div>
    </Page>
  );
}

function Filter({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors",
        active ? "border-craie bg-craie text-nuit-950" : "border-trait-fort bg-nuit-800 text-brume hover:border-pave hover:text-craie",
      )}
    >
      {label}
      <span className={cn("cote text-2xs", active ? "opacity-70" : "text-pave")}>{count}</span>
    </button>
  );
}
