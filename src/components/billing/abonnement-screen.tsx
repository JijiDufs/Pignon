"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Page, PageHeader } from "@/components/pignon/page";
import { BillingToggle } from "@/components/pricing/billing-toggle";
import { Comparison } from "@/components/pricing/comparison";
import { PlansGrid } from "@/components/pricing/plans-grid";
import { chargePerPeriod, CYCLE_LABEL, switchLabel } from "@/components/pricing/pricing-logic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatEuro, plural } from "@/lib/format";
import { can, FEATURES, getPlan, planRank, type Plan } from "@/lib/plans";
import { useAppStore, usePlan, useQuota } from "@/lib/store";
import type { BillingCycle, PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { buildInvoices, isPlanId, nextRenewal } from "./billing-logic";
import { CheckoutDialog } from "./checkout-dialog";
import { DemoCard } from "./demo-card";

/** `?choisir=<formule>` opens the checkout: remounting on that parameter lets the screen read it once, as initial state. */
export function AbonnementScreen() {
  const asked = useSearchParams().get("choisir");
  return <Abonnement key={asked ?? ""} asked={isPlanId(asked) ? asked : null} />;
}

function Abonnement({ asked }: { asked: PlanId | null }) {
  const router = useRouter();
  const plan = usePlan();
  const storedCycle = useAppStore((state) => state.cycle);
  const [cycle, setCycle] = useState<BillingCycle>(storedCycle);
  const [now] = useState(() => Date.now());
  // The plan held when a purchase starts: the success screen compares against it after the switch.
  const [checkout, setCheckout] = useState<{ to: PlanId; from: PlanId } | null>(() =>
    asked && planRank(asked) > planRank(plan.id) ? { to: asked, from: plan.id } : null,
  );
  const [leaving, setLeaving] = useState<PlanId | null>(null);

  const close = () => {
    setCheckout(null);
    if (asked) router.replace("/app/abonnement");
  };

  const choose = (target: Plan) => {
    if (planRank(target.id) < planRank(plan.id)) setLeaving(target.id);
    else setCheckout({ to: target.id, from: plan.id });
  };

  const paid = plan.price.monthly > 0;

  return (
    <Page>
      <PageHeader title="Abonnement" description="Ta formule, ce que tu en utilises, et de quoi en changer. Rien n'est facturé dans cette démo." />

      <CurrentPlan plan={plan} cycle={storedCycle} now={now} />

      <section aria-labelledby="changer" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="changer" className="titre text-2xl">
            Changer de formule
          </h2>
          <BillingToggle cycle={cycle} onChange={setCycle} />
        </div>
        <PlansGrid
          cycle={cycle}
          current={plan.id}
          className="mt-8 xl:mt-12"
          action={(target) => {
            const mine = target.id === plan.id;
            const otherCycle = mine && paid && cycle !== storedCycle;
            if (mine && !otherCycle) {
              return (
                <Button variant="outline" size="lg" className="w-full" disabled>
                  Ta formule actuelle
                </Button>
              );
            }
            return (
              <Button
                variant={target.recommended || otherCycle ? "default" : "outline"}
                size="lg"
                className="w-full"
                onClick={() => (otherCycle ? setCheckout({ to: target.id, from: plan.id }) : choose(target))}
              >
                {otherCycle ? `Passer en ${CYCLE_LABEL[cycle].toLowerCase()}` : switchLabel(target, plan.id)}
              </Button>
            );
          }}
        />
      </section>

      <section aria-labelledby="detail" className="mt-16">
        <h2 id="detail" className="titre text-2xl">
          Le détail, ligne par ligne
        </h2>
        <Comparison current={plan.id} className="mt-2" />
      </section>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="paiement">
          <h2 id="paiement" className="titre text-2xl">
            Moyen de paiement
          </h2>
          <DemoCard className="mt-5" />
          {paid && (
            <button
              type="button"
              onClick={() => setLeaving("free")}
              className="mt-5 rounded-md text-sm text-brume underline decoration-trait-fort underline-offset-4 hover:text-craie hover:decoration-craie"
            >
              Arrêter l&apos;abonnement
            </button>
          )}
        </section>

        <section aria-labelledby="factures">
          <h2 id="factures" className="titre text-2xl">
            Factures
          </h2>
          <Invoices plan={plan} cycle={storedCycle} now={now} />
        </section>
      </div>

      {checkout && <CheckoutDialog planId={checkout.to} from={checkout.from} onClose={close} />}
      {leaving && <LeaveDialog target={leaving} onClose={() => setLeaving(null)} />}
    </Page>
  );
}

function CurrentPlan({ plan, cycle, now }: { plan: Plan; cycle: BillingCycle; now: number }) {
  const quota = useQuota();
  const reservations = useAppStore((state) => state.reservations);
  const territories = useAppStore((state) => state.territories.length);
  const active = Object.values(reservations).filter((reservation) => reservation.until > now).length;
  const paid = plan.price.monthly > 0;

  return (
    <section aria-label="Ta formule" className="grid gap-8 rounded-3xl bg-nuit-800 p-6 shadow-flottant sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
      <div>
        <p className="text-sm text-brume">Ta formule</p>
        <p className="enseigne mt-1 text-5xl">{plan.name}</p>
        <p className="cote mt-4 text-sm text-brume">
          {paid ? `${formatEuro(chargePerPeriod(plan, cycle))} ${cycle === "yearly" ? "par an" : "par mois"}` : "Gratuite, sans limite de durée"}
        </p>
        {paid && <p className="mt-1 text-sm text-brume">Prochaine échéance le {formatDate(nextRenewal(now, cycle), true)}</p>}
      </div>
      <dl className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <Gauge label="Fiches ouvertes ce mois-ci" used={quota.used} limit={quota.limit} />
        <Gauge label="Commerces réservés" used={active} limit={plan.limits.activeReservations} />
        <Gauge label="Territoires exclusifs" used={territories} limit={plan.limits.territories} />
        <Gauge label="Zones de prospection" used={1} limit={plan.limits.zones} quota={false} />
      </dl>
    </section>
  );
}

/** `quota` turns the bar to the accent when the allowance is nearly used up. */
function Gauge({ label, used, limit, quota = true }: { label: string; used: number; limit: number; quota?: boolean }) {
  const ratio = limit > 0 ? Math.min(1, used / limit) : 0;
  return (
    <div>
      <dt className="text-sm text-brume">{label}</dt>
      <dd className="mt-1.5">
        {limit > 0 ? (
          <>
            <span className="cote text-xl font-medium">{used}</span>
            <span className="cote text-sm text-pave"> sur {limit}</span>
          </>
        ) : (
          <span className="text-sm text-pave">Pas dans ta formule</span>
        )}
        <span aria-hidden="true" className="mt-2 block h-1 rounded-full bg-nuit-600">
          <span className={cn("block h-full rounded-full", quota && ratio >= 0.9 ? "bg-lumiere" : "bg-craie")} style={{ width: `${ratio * 100}%` }} />
        </span>
      </dd>
    </div>
  );
}

function Invoices({ plan, cycle, now }: { plan: Plan; cycle: BillingCycle; now: number }) {
  const invoices = buildInvoices(plan, cycle, now);
  if (invoices.length === 0) return <p className="mt-5 text-brume">Aucune facture : la formule Découverte est gratuite.</p>;

  return (
    <ul className="mt-3 divide-y divide-trait">
      {invoices.map((invoice) => (
        <li key={invoice.id} className="flex items-center gap-4 py-3.5 text-sm">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{formatDate(invoice.at, true)}</p>
            <p className="truncate text-ui text-brume">
              {invoice.label} <span className="cote text-pave">{invoice.id}</span>
            </p>
          </div>
          <span className="cote">{formatEuro(invoice.amount)}</span>
          <Button variant="outline" size="sm" disabled aria-label={`Télécharger la facture ${invoice.id}, indisponible dans la démo`}>
            PDF, démo
          </Button>
        </li>
      ))}
    </ul>
  );
}

/** Going down or stopping: says exactly what is lost, with no pressure. */
function LeaveDialog({ target, onClose }: { target: PlanId; onClose: () => void }) {
  const current = usePlan();
  const cycle = useAppStore((state) => state.cycle);
  const setPlan = useAppStore((state) => state.setPlan);
  const release = useAppStore((state) => state.release);
  const releaseTerritory = useAppStore((state) => state.releaseTerritory);
  const reservations = useAppStore((state) => state.reservations);
  const territories = useAppStore((state) => state.territories);
  const shared = useAppStore((state) => state.shared);
  const next = getPlan(target);
  const lost = current.features.filter((feature) => !can(target, feature));
  const reserved = Object.keys(reservations);
  const online = Object.keys(shared).length;

  const consequences = [
    !can(target, "live-mockup") && online > 0 && `${plural(online, "maquette")} en ligne ${online > 1 ? "sont dépubliées" : "est dépubliée"}`,
    !can(target, "lead-reservation") && reserved.length > 0 && `${plural(reserved.length, "réservation")} ${reserved.length > 1 ? "sont libérées" : "est libérée"}`,
    !can(target, "territory") && territories.length > 0 && `${plural(territories.length, "territoire")} ${territories.length > 1 ? "sont rendus" : "est rendu"}`,
  ].filter((line): line is string => Boolean(line));

  const confirm = () => {
    // Keep the account consistent with what the dialog announced.
    if (!can(target, "lead-reservation")) reserved.forEach(release);
    if (!can(target, "territory")) territories.forEach(releaseTerritory);
    setPlan(target, target === "free" ? undefined : cycle);
    toast.success(`Tu es sur ${next.name}`, { description: "Le changement est immédiat" });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="titre text-xl">{target === "free" ? "Arrêter l'abonnement" : `Revenir à ${next.name}`}</DialogTitle>
          <DialogDescription>
            Tu passes de {current.name} à {next.name}
            {target === "free" ? ", gratuite" : `, ${formatEuro(next.price[cycle])} par mois`}. Voici ce que ça change.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm">
          <p className="font-medium">Tu n&apos;auras plus</p>
          <ul className="mt-2 flex flex-col gap-1.5 text-brume">
            {lost.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-pave" />
                {FEATURES[feature].label}
              </li>
            ))}
          </ul>
          {consequences.length > 0 && (
            <>
              <p className="mt-4 font-medium">Tout de suite</p>
              <ul className="mt-2 flex flex-col gap-1.5 text-brume">
                {consequences.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-pave" />
                    {line}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-4 text-brume">Ton compte, ton pipeline et tes notes restent là. Tu peux reprendre une formule quand tu veux.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Garder {current.name}
          </Button>
          <Button variant="outline" onClick={confirm}>
            {target === "free" ? "Arrêter l'abonnement" : `Revenir à ${next.name}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
