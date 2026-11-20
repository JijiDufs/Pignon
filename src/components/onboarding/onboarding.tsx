"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { AnimatedNumber } from "@/components/pignon/animated-number";
import { Logo } from "@/components/pignon/logo";
import { SectorIcon } from "@/components/pignon/sector-icon";
import { Curseur } from "@/components/pricing/curseur";
import { Button } from "@/components/ui/button";
import { CITIES, getCity, getOpportunities, getZoneStats, SECTORS } from "@/lib/data";
import { formatDistance, formatEuro, plural } from "@/lib/format";
import { getPlan, PLAN_ORDER } from "@/lib/plans";
import { useAppStore, useIsClient } from "@/lib/store";
import type { SectorId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OnboardingScene } from "./onboarding-scene";

const STEPS = ["Où prospectes-tu ?", "Quels métiers ?", "Ta zone est prête"];
const MIN_KM = 1;
const MAX_KM = 4;

/** First launch. The store is only read once the page runs in the browser: before that, the frame alone is drawn. */
export function Onboarding() {
  const isClient = useIsClient();
  const asked = useSearchParams().get("formule");
  const paid = asked !== null && (PLAN_ORDER as string[]).includes(asked) && asked !== "free" ? asked : null;
  return isClient ? <Wizard paidPlan={paid} /> : <Frame step={0} />;
}

/** The fixed part of the three steps: brand, progress, and the place of the map. */
export function Frame({ step, children, scene }: { step: number; children?: React.ReactNode; scene?: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:h-dvh lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
      <main className="flex flex-col px-6 py-8 sm:px-12 lg:overflow-y-auto lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="Pignon, accueil" className="w-fit rounded-md">
            <Logo className="text-xl" />
          </Link>
          <p className="cote text-ui text-pave">
            Étape {step + 1} sur {STEPS.length}
          </p>
        </div>
        <ol aria-label="Progression" className="mt-6 flex gap-1.5">
          {STEPS.map((label, index) => (
            <li key={label} aria-current={index === step ? "step" : undefined} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", index <= step ? "bg-craie" : "bg-nuit-600")}>
              <span className="sr-only">{label}</span>
            </li>
          ))}
        </ol>
        {children}
      </main>
      <div className="relative isolate bg-nuit-700 max-lg:order-first max-lg:h-56">{scene}</div>
    </div>
  );
}

function Wizard({ paidPlan }: { paidPlan: string | null }) {
  const router = useRouter();
  const cityField = useId();
  // Someone who already has a zone starts from it: this is also how the zone is changed.
  const [start] = useState(() => {
    const { onboarded, zone } = useAppStore.getState();
    return onboarded ? zone : { cityId: CITIES[0].id, radiusKm: 2, sectors: [] as SectorId[] };
  });
  const [step, setStep] = useState(0);
  const [cityId, setCityId] = useState(start.cityId);
  const [radiusKm, setRadiusKm] = useState(Math.min(MAX_KM, Math.max(MIN_KM, start.radiusKm)));
  const [sectors, setSectors] = useState<SectorId[]>(start.sectors);

  const city = getCity(cityId) ?? CITIES[0];
  const inRadius = useMemo(() => getZoneStats(cityId, { radiusKm }), [cityId, radiusKm]);
  const stats = useMemo(() => getZoneStats(cityId, { radiusKm, sectors }), [cityId, radiusKm, sectors]);
  // Step 1 shows no column yet: the columns are the reward of step 2.
  const businesses = useMemo(() => (step === 0 ? [] : getOpportunities(cityId, { radiusKm, sectors })), [step, cityId, radiusKm, sectors]);
  const plan = paidPlan ? getPlan(paidPlan as Parameters<typeof getPlan>[0]) : null;

  const toggle = (id: SectorId) => setSectors((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  const finish = () => {
    useAppStore.getState().completeOnboarding({ cityId, radiusKm, sectors });
    router.push(plan ? `/app/abonnement?choisir=${plan.id}` : "/app/radar?scan=1");
  };

  return (
    <Frame step={step} scene={<OnboardingScene city={city} radiusKm={radiusKm} businesses={businesses} orbit={step === 2} />}>
      <div className="my-auto py-8">
        <h1 className="enseigne text-4xl sm:text-5xl">{STEPS[step]}</h1>

        {step === 0 && (
          <div className="mt-8 flex flex-col gap-8">
            <div>
              <label htmlFor={cityField} className="text-base font-medium">
                Ta ville
              </label>
              <select
                id={cityField}
                value={cityId}
                onChange={(event) => setCityId(event.target.value)}
                className="mt-2 block h-12 w-full rounded-xl border border-trait-fort bg-nuit-800 px-3.5 text-lg outline-none focus-visible:border-craie focus-visible:ring-3 focus-visible:ring-craie/15"
              >
                {CITIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <Curseur label="Dans quel rayon ?" value={radiusKm} onChange={setRadiusKm} min={MIN_KM} max={MAX_KM} step={0.5} format={formatDistance} />
            <p className="text-brume">
              <span className="cote font-medium text-craie">{inRadius.scanned}</span> commerces à analyser autour du centre de {city.name}.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-brume">Coche ceux à qui tu veux vendre un site.</p>
              <button
                type="button"
                onClick={() => setSectors(sectors.length === SECTORS.length ? [] : SECTORS.map((sector) => sector.id))}
                className="shrink-0 rounded-md text-sm font-medium underline decoration-trait-fort underline-offset-4 hover:decoration-craie"
              >
                {sectors.length === SECTORS.length ? "Tout décocher" : "Tout cocher"}
              </button>
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {SECTORS.map((sector) => {
                const checked = sectors.includes(sector.id);
                const count = getZoneStats(cityId, { radiusKm, sectors: [sector.id] }).opportunities;
                return (
                  <li key={sector.id}>
                    <label
                      className={cn(
                        "flex h-[4.25rem] cursor-pointer items-center gap-3 rounded-xl border px-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-craie has-[:focus-visible]:ring-offset-2",
                        checked ? "border-craie bg-nuit-800 shadow-petit" : "border-trait-fort hover:border-pave",
                      )}
                    >
                      <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(sector.id)} />
                      <SectorIcon sector={sector.id} aria-hidden="true" className={cn("size-5 shrink-0", checked ? "text-lumiere" : "text-pave")} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.9375rem] font-medium">{sector.plural}</span>
                        <span className="cote block text-2xs text-pave">{count} sans site</span>
                      </span>
                      <span aria-hidden="true" className={cn("grid size-5 shrink-0 place-items-center rounded-md border", checked ? "border-craie bg-craie text-nuit-950" : "border-trait-fort")}>
                        {checked && <Check className="size-3.5" />}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p aria-live="polite" className="mt-6 flex items-baseline gap-3">
              <AnimatedNumber value={stats.opportunities} duration={0.5} className="cote text-5xl font-medium tracking-tight text-lumiere" />
              <span className="text-brume">{stats.opportunities > 1 ? "commerces à appeler dans ta zone" : "commerce à appeler dans ta zone"}</span>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            <p className="text-brume">
              {city.name}, {formatDistance(radiusKm)} autour du centre, {plural(sectors.length, "métier")}.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-8">
              <div className="flex flex-col-reverse justify-end">
                <dt className="mt-1 text-brume">commerces sans site digne de ce nom</dt>
                <dd>
                  <AnimatedNumber value={stats.opportunities} from={0} duration={1.4} className="cote text-6xl font-medium tracking-tight text-lumiere" />
                </dd>
              </div>
              <div className="flex flex-col-reverse justify-end">
                <dt className="mt-1 text-brume">de sites à vendre</dt>
                <dd>
                  <AnimatedNumber value={stats.potentialRevenue} from={0} duration={1.4} format={formatEuro} className="cote text-4xl font-medium tracking-tight sm:text-5xl" />
                </dd>
              </div>
            </dl>
            {plan && (
              <p className="mt-8 rounded-xl bg-nuit-700 px-4 py-3 text-sm">
                Tu as choisi <strong className="font-medium">{plan.name}</strong> : l&apos;étape suivante l&apos;active, sans paiement dans cette démo.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
            Retour
          </Button>
        ) : (
          <span />
        )}
        {step < 2 ? (
          <Button size="xl" disabled={step === 1 && sectors.length === 0} onClick={() => setStep(step + 1)}>
            Continuer
          </Button>
        ) : (
          <Button size="xl" onClick={finish}>
            {plan ? `Activer ${plan.name}` : "Lancer mon premier scan"}
          </Button>
        )}
      </div>
    </Frame>
  );
}
