"use client";

import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Page, PageHeader } from "@/components/pignon/page";
import { PlanGate } from "@/components/pignon/plan-gate";
import { SectorIcon } from "@/components/pignon/sector-icon";
import { Button } from "@/components/ui/button";
import { CITIES, getCity, getOpportunities, getZoneStats, SECTORS } from "@/lib/data";
import { territoryKey, territoryTakenBy } from "@/lib/exclusivity";
import { formatEuro, plural } from "@/lib/format";
import { useAppStore, usePlan } from "@/lib/store";
import type { Sector } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TerritoryScene } from "./territory-scene";

const COLUMNS = 4;

type Cell = { cityId: string; sector: Sector };

export function TerritoireScreen() {
  const addId = useId();
  const plan = usePlan();
  const zoneCity = useAppStore((state) => state.zone.cityId);
  const territories = useAppStore((state) => state.territories);
  const claimTerritory = useAppStore((state) => state.claimTerritory);
  const releaseTerritory = useAppStore((state) => state.releaseTerritory);
  const allowed = plan.features.includes("territory");

  // The zone's city first, then the next ones of the list. The selector swaps the last column.
  const [cityIds, setCityIds] = useState(() => [zoneCity, ...CITIES.map((city) => city.id).filter((id) => id !== zoneCity)].slice(0, COLUMNS));
  // Open on a territory that can be taken, not on a locked one.
  const [selected, setSelected] = useState<Cell>(() => ({
    cityId: zoneCity,
    sector: SECTORS.find((sector) => !territoryTakenBy(zoneCity, sector.id)) ?? SECTORS[0],
  }));
  const limit = plan.limits.territories;
  const full = territories.length >= limit;

  const city = getCity(selected.cityId) ?? CITIES[0];
  const key = territoryKey(selected.cityId, selected.sector.id);
  const mine = territories.includes(key);
  const taken = mine ? null : territoryTakenBy(selected.cityId, selected.sector.id);
  const businesses = useMemo(() => getOpportunities(selected.cityId, { sectors: [selected.sector.id] }), [selected]);
  const stats = useMemo(() => getZoneStats(selected.cityId, { sectors: [selected.sector.id] }), [selected]);
  const name = `${selected.sector.plural} à ${city.name}`;

  const claim = () => {
    if (claimTerritory(selected.cityId, selected.sector.id)) {
      toast.success(`${name} : le territoire est à toi`, { description: "Ces commerces ne sont plus proposés aux autres abonnés" });
    }
  };

  const content = (
    <div className="grid gap-x-10 gap-y-10 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
      <section aria-label="Grille des territoires" className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <p>
            <span className="cote text-3xl font-medium">{territories.length}</span>
            <span className="text-brume"> {territories.length > 1 ? "territoires tenus" : "territoire tenu"} sur {limit || 5}</span>
          </p>
          <div>
            <label htmlFor={addId} className="mr-2 text-sm text-brume">
              Dernière colonne
            </label>
            <select
              id={addId}
              value={cityIds[COLUMNS - 1]}
              onChange={(event) => setCityIds((list) => [...list.slice(0, COLUMNS - 1), event.target.value])}
              className="h-9 rounded-lg border border-trait-fort bg-nuit-800 px-2.5 text-sm outline-none focus-visible:border-craie focus-visible:ring-3 focus-visible:ring-craie/15"
            >
              {CITIES.filter((item) => !cityIds.slice(0, COLUMNS - 1).includes(item.id)).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative overflow-x-auto scrollbar-fin">
          <table className="w-full min-w-[620px] table-fixed border-separate border-spacing-1.5 text-left xl:min-w-0">
            <thead>
              <tr>
                <th scope="col" className="w-32 pb-1 text-sm font-normal text-pave">
                  <span className="sr-only">Métier</span>
                </th>
                {cityIds.map((id) => (
                  <th key={id} scope="col" className="pb-1 text-sm font-medium">
                    {getCity(id)?.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTORS.map((sector) => (
                <tr key={sector.id}>
                  <th scope="row" className="pr-2 text-sm font-normal">
                    <span className="flex items-center gap-2">
                      <SectorIcon sector={sector.id} aria-hidden="true" className="size-4 shrink-0 text-pave" />
                      {sector.plural}
                    </span>
                  </th>
                  {cityIds.map((id) => (
                    <td key={id} className="p-0">
                      <TerritoryCell
                        cityId={id}
                        sector={sector}
                        mine={territories.includes(territoryKey(id, sector.id))}
                        active={selected.cityId === id && selected.sector.id === sector.id}
                        onSelect={() => setSelected({ cityId: id, sector })}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-[62ch] text-sm text-brume">
          Tant que tu tiens un territoire, les commerces de ce métier dans cette ville ne sont plus proposés aux autres abonnés. Tu peux le
          rendre à tout moment.
        </p>
      </section>

      <section aria-label={name} aria-live="polite" className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <div className="h-[320px] overflow-hidden rounded-3xl bg-nuit-700 shadow-petit">
          <TerritoryScene city={city} businesses={businesses} mine={mine} />
        </div>
        <h2 className="enseigne mt-6 text-3xl">{name}</h2>
        <p className="mt-2 text-brume">
          <span className="cote font-medium text-craie">{plural(stats.opportunities, "opportunité")}</span>, soit{" "}
          <span className="cote font-medium text-craie">{formatEuro(stats.potentialRevenue)}</span> de sites à vendre.
        </p>

        <div className="mt-5">
          {mine ? (
            <>
              <p className="text-sm font-medium text-lumiere-doux">Ce territoire est à toi</p>
              <Button variant="outline" size="lg" className="mt-3 bg-nuit-800" onClick={() => releaseTerritory(key)}>
                Rendre ce territoire
              </Button>
            </>
          ) : taken ? (
            <p className="flex items-center gap-2 text-sm text-brume">
              <Lock aria-hidden="true" className="size-4 text-pave" />
              Tenu par {taken.agency}. Il redeviendra libre quand l&apos;agence le rendra.
            </p>
          ) : (
            <>
              <Button size="lg" onClick={claim} disabled={allowed && full}>
                Prendre ce territoire
              </Button>
              {allowed && full && (
                <p className="mt-3 max-w-[46ch] text-sm text-brume">
                  Tu tiens déjà tes {limit} territoires. Rends-en un pour prendre celui-ci.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );

  return (
    <Page>
      <PageHeader title="Territoire" description="Un métier dans une ville, pour une seule agence : la tienne." />
      <PlanGate feature="territory" title="L'exclusivité d'un métier dans une ville">
        {allowed ? content : <div className="p-4">{content}</div>}
      </PlanGate>
    </Page>
  );
}

interface TerritoryCellProps {
  cityId: string;
  sector: Sector;
  mine: boolean;
  active: boolean;
  onSelect: () => void;
}

function TerritoryCell({ cityId, sector, mine, active, onSelect }: TerritoryCellProps) {
  const taken = mine ? null : territoryTakenBy(cityId, sector.id);
  const stats = getZoneStats(cityId, { sectors: [sector.id] });
  const city = getCity(cityId)?.name ?? cityId;
  const state = mine ? "à toi" : taken ? `tenu par ${taken.agency}` : "libre";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "flex h-[4.25rem] w-full flex-col justify-center rounded-xl border px-3 text-left transition-colors",
        mine
          ? "border-lumiere bg-lumiere text-nuit-950"
          : taken
            ? "border-transparent bg-nuit-700 text-brume"
            : "border-trait-fort bg-nuit-800 hover:border-pave",
        active && !mine && "border-craie ring-1 ring-craie",
        active && mine && "ring-2 ring-craie ring-offset-2",
      )}
    >
      <span className="sr-only">
        {sector.plural} à {city}, {state}, {plural(stats.opportunities, "opportunité")},
      </span>
      {mine ? (
        <span aria-hidden="true" className="text-sm font-medium">
          À toi
        </span>
      ) : taken ? (
        <span aria-hidden="true" className="flex items-center gap-1.5 text-ui">
          <Lock className="size-3.5 shrink-0" />
          <span className="truncate">{taken.agency}</span>
        </span>
      ) : (
        <span aria-hidden="true" className="cote text-sm font-medium">
          {stats.opportunities}
        </span>
      )}
      <span className={cn("cote text-2xs", mine ? "text-nuit-950/80" : "text-pave")}>{formatEuro(stats.potentialRevenue)}</span>
    </button>
  );
}
