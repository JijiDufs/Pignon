"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Lock, LockKeyhole, LockKeyholeOpen, PhoneCall } from "lucide-react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { EmptyState } from "@/components/pignon/empty-state";
import { LinkButton } from "@/components/pignon/link-button";
import { HEAT_HEX } from "@/components/pignon/heat";
import { MapBeacons } from "@/components/pignon/map-layers";
import { Page } from "@/components/pignon/page";
import { PignonMap, useMap } from "@/components/pignon/pignon-map";
import { LockChip } from "@/components/pignon/plan-gate";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { buildCallScript, getBusiness, getSector } from "@/lib/data";
import { takenByOthers } from "@/lib/exclusivity";
import { formatDate, formatDistance, maskName } from "@/lib/format";
import { useAppStore, useNow, useQuota } from "@/lib/store";
import type { Business, DaId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ControleTechnique, Voisins, WhyBlock } from "./diagnostic";
import { joursRestants } from "./lecture";
import { MaquetteBlock } from "./maquette-block";
import { PromptBlock, ScriptBlock } from "./parole";
import { Suivi } from "./suivi";
import { useArrival } from "./use-arrival";

/** The sheet of one business: everything needed to prepare the call. */
export function FicheScreen() {
  const { id } = useParams<{ id: string }>();
  const business = getBusiness(decodeURIComponent(id));

  if (!business) {
    return (
      <Page>
        <EmptyState
          title="Ce commerce n'existe pas"
          description="L'adresse ne correspond à aucun commerce de tes zones. Repars du radar pour en choisir un."
          action={<LinkButton href="/app/radar">Ouvrir le radar</LinkButton>}
        />
      </Page>
    );
  }
  return <Fiche key={business.id} business={business} />;
}

function Fiche({ business }: { business: Business }) {
  const unlocked = useAppStore((state) => state.unlocked.includes(business.id));
  const unlock = useAppStore((state) => state.unlock);
  const promptUpgrade = useAppStore((state) => state.promptUpgrade);
  const firstName = useAppStore((state) => state.user.firstName);
  const { remaining } = useQuota();
  const taken = takenByOthers(business.id);
  const [da, setDa] = useState<DaId>(business.recommendedDas[0]);
  const arrival = useArrival(business.reasons.length, unlocked);

  // Opening a sheet uses one of the month's sheets. With none left, the page stays locked instead of nagging.
  useEffect(() => {
    if (!unlocked && remaining > 0) unlock(business.id);
  }, [unlocked, remaining, unlock, business.id]);

  if (!unlocked) {
    return (
      <Page width="narrow">
        <BackLink />
        <div className="mt-10 flex flex-col items-center text-center">
          <BusinessMark sector={business.sector} heat={business.heat} size={72} />
          <h1 className="enseigne mt-5 text-4xl">{maskName(business.name)}</h1>
          <p className="mt-2 text-brume">
            {getSector(business.sector).label}, à {formatDistance(business.distanceKm)} du centre. Score de {business.score} sur 100.
          </p>
          <span className="mt-8 grid size-12 place-items-center rounded-full bg-craie text-nuit-950">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </span>
          <p className="titre mt-4 text-xl">Tu as ouvert toutes tes fiches du mois</p>
          <p className="mt-2 max-w-[46ch] text-brume">
            Derrière ce verrou : son nom, son téléphone, sa maquette, le diagnostic de son site et le script pour l&apos;appeler.
          </p>
          <Button size="xl" className="mt-7" onClick={() => promptUpgrade("full-profile")}>
            Débloquer les fiches
          </Button>
        </div>
      </Page>
    );
  }

  const script = buildCallScript(business, firstName);

  return (
    <Page>
      <BackLink />
      <Header business={business} taken={taken} />

      <div className="mt-10 grid gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-14">
          <MaquetteBlock
            business={business}
            da={da}
            onDa={setDa}
            lit={arrival.lit}
            restricted={taken !== null}
            smsTemplate={script.smsTemplate}
          />
          <PromptBlock business={business} da={da} />
          <ScriptBlock business={business} script={script} />
        </div>

        <aside className="flex min-w-0 flex-col gap-11 max-lg:row-start-1">
          <WhyBlock business={business} arrival={arrival} />
          <ControleTechnique business={business} />
          <Voisins business={business} />
          <Suivi business={business} />
        </aside>
      </div>
    </Page>
  );
}

function BackLink() {
  return (
    <Link href="/app/radar" className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-brume hover:text-craie">
      <ArrowLeft aria-hidden="true" className="size-4" />
      Radar
    </Link>
  );
}

/** Once the street view is there, the camera turns a quarter around the shop, then rests. */
function Orbit() {
  const map = useMap();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!map || reduced) return;
    map.easeTo({ bearing: map.getBearing() + 70, duration: 14000, easing: (t) => 1 - Math.pow(1 - t, 3) });
  }, [map, reduced]);
  return null;
}

function Header({ business, taken }: { business: Business; taken: { until: string } | null }) {
  const reservation = useAppStore((state) => state.reservations[business.id]);
  const reserve = useAppStore((state) => state.reserve);
  const release = useAppStore((state) => state.release);
  const now = useNow();
  const [notify, setNotify] = useState(false);
  // Plays the settle once, on the click that reserves.
  const [justReserved, setJustReserved] = useState(false);
  const { owner, address } = business;

  const onReserve = () => {
    if (!reserve(business.id)) return;
    setJustReserved(true);
    toast.success("Commerce réservé", { description: "Il disparaît pour les autres abonnés pendant 30 jours" });
  };

  return (
    <header className="relative mt-4 overflow-hidden rounded-3xl border border-trait bg-nuit-800">
      {/* Where the shop stands: the same 3D street the radar dived into. The title sits on the calm side. */}
      <div className="absolute inset-y-0 right-0 w-[64%] max-md:hidden">
        <PignonMap center={business.coords} zoom={16.4} pitch={64} bearing={-36} interactive={false} label="">
          <MapBeacons
            beacons={[{ id: business.id, lng: business.coords.lng, lat: business.coords.lat, score: business.score, color: HEAT_HEX[business.heat] }]}
          />
          <Orbit />
        </PignonMap>
        <div className="absolute inset-0 bg-linear-to-r from-nuit-800 via-nuit-800/50 via-20% to-transparent to-50%" />
      </div>

      <div className="relative max-w-[640px] p-6 sm:p-9">
        <div className="flex items-center gap-4">
          <BusinessMark sector={business.sector} heat={business.heat} size={52} lit={Boolean(reservation)} />
          <p className="text-sm text-brume">
            {getSector(business.sector).label}, à {formatDistance(business.distanceKm)} du centre
          </p>
        </div>
        <h1 className="enseigne mt-5 text-[2.75rem] sm:text-6xl">{business.name}</h1>
        <p className="mt-3 text-brume">
          {address.street}, {address.postalCode} {address.city}
        </p>

        {!taken && (
          <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-4">
            <div className="col-span-2">
              <dt className="text-ui text-pave">Téléphone</dt>
              <dd className="cote text-xl font-medium">{business.phone}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ui text-pave">Gérant</dt>
              <dd className="text-base font-medium">
                {owner.civility} {owner.firstName} {owner.lastName}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ui text-pave">Créé le</dt>
              <dd>
                {formatDate(business.registeredAt, true)}
                {business.isNew && <span className="ml-2 rounded-md bg-lumiere-pale px-1.5 py-0.5 text-2xs font-medium text-lumiere-fort">tout récent</span>}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ui text-pave">Effectif</dt>
              <dd>{business.staff}</dd>
            </div>
          </dl>
        )}

        {!taken && (
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            {reservation ? (
              <div className={cn("flex h-10 items-center gap-2 rounded-lg bg-nuit-700 pr-1.5 pl-3 text-sm", justReserved && "animate-allumage")}>
                <LockKeyhole aria-hidden="true" className="size-4 text-lumiere" />
                <span>
                  <strong className="font-medium">Réservé</strong>
                  <span className="text-brume">, {joursRestants(reservation.until, now)}</span>
                </span>
                <Button variant="ghost" size="sm" className="text-brume" onClick={() => release(business.id)}>
                  Libérer
                </Button>
              </div>
            ) : (
              <Button size="lg" onClick={onReserve}>
                <LockKeyholeOpen aria-hidden="true" />
                Réserver ce commerce
                <LockChip feature="lead-reservation" />
              </Button>
            )}
            <LinkButton href={`/app/coach?commerce=${business.id}`} variant="outline" size="lg" className="bg-nuit-800">
              <PhoneCall aria-hidden="true" />
              Préparer l&apos;appel
            </LinkButton>
          </div>
        )}

        {taken && (
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-nuit-700 p-4">
            <Lock aria-hidden="true" className="size-5 shrink-0 text-pave" />
            <p className="min-w-0 flex-1 basis-72 text-sm">
              <strong className="font-medium">Réservé par un autre abonné jusqu&apos;au {formatDate(taken.until)}.</strong>{" "}
              <span className="text-brume">
                Ses coordonnées sont masquées et sa maquette ne peut pas être envoyée. La même règle protège tes réservations.
              </span>
            </p>
            <label className="flex items-center gap-2.5 text-sm">
              <Switch
                checked={notify}
                onCheckedChange={(checked) => {
                  setNotify(checked);
                  if (checked) toast("Tu seras prévenu quand ce commerce se libère");
                }}
              />
              Me prévenir quand il se libère
            </label>
          </div>
        )}
      </div>
    </header>
  );
}
