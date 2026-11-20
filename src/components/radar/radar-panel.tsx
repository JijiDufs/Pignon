"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { ChevronDown, Lock, LockKeyhole, Radar, RotateCw } from "lucide-react";
import { AnimatedNumber } from "@/components/pignon/animated-number";
import { BusinessMark } from "@/components/pignon/business-mark";
import { EmptyState } from "@/components/pignon/empty-state";
import { HEAT_COLOR } from "@/components/pignon/heat";
import { LockChip } from "@/components/pignon/plan-gate";
import { ScorePill } from "@/components/pignon/score";
import { SITE_STATUS_STYLE, SiteStatusBadge } from "@/components/pignon/site-status";
import { Button } from "@/components/ui/button";
import { getSector, HEAT, SITE_STATUS } from "@/lib/data";
import { formatDistance, formatEuro, maskName, plural } from "@/lib/format";
import { souple } from "@/lib/motion";
import { useAppStore, useCan, useIsMasked, type Zone } from "@/lib/store";
import type { Business, City, SectorId } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  hasFilter,
  HEAT_ORDER,
  NO_FILTER,
  OPPORTUNITY_STATUSES,
  rowId,
  toggled,
  type Availability,
  type Filters,
  type SortKey,
  type Tally,
} from "./radar-data";
import { ZoneControls } from "./zone-controls";

export type Phase = "idle" | "scanning" | "done";

interface RadarPanelProps {
  city: City;
  zone: Zone;
  phase: Phase;
  /** Totals of what the scan has seen so far (everything, once it is done) */
  stats: Tally;
  /** Rows to show, already filtered and sorted */
  list: Business[];
  /** What the scan is reading right now */
  liveLine: string;
  filters: Filters;
  sort: SortKey;
  selectedId: string | null;
  hoveredId: string | null;
  controlsOpen: boolean;
  availabilityOf: (businessId: string) => Availability;
  onToggleControls: () => void;
  onCity: (cityId: string) => void;
  onRadius: (radiusKm: number) => void;
  onSectors: (sectors: SectorId[]) => void;
  onScan: () => void;
  onFilters: (filters: Filters) => void;
  onSort: (sort: SortKey) => void;
  onSelect: (businessId: string) => void;
  onHover: (businessId: string | null) => void;
}

const CONTROLS_ID = "reglages-de-zone";

/** The left column of the radar: the zone, the scan, the totals, the filters and the list. */
export function RadarPanel(props: RadarPanelProps) {
  const { city, zone, phase, stats, list, filters, controlsOpen } = props;
  const scanning = phase === "scanning";

  return (
    <section
      aria-label="Résultats du radar"
      className="feuille flex min-h-0 flex-col max-lg:flex-1 lg:absolute lg:top-3 lg:bottom-3 lg:left-3 lg:z-10 lg:w-[392px] lg:overflow-hidden lg:rounded-2xl"
    >
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0 flex-1">
          <h1 className="titre truncate text-xl">{city.name}</h1>
          <p className="text-ui text-brume">
            Rayon de {zone.radiusKm} km, {plural(zone.sectors.length, "métier")}
          </p>
        </div>
        {phase === "done" && (
          <Button variant="ghost" size="icon-sm" className="text-brume" aria-label="Relancer le scan" onClick={props.onScan}>
            <RotateCw aria-hidden="true" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          aria-expanded={controlsOpen}
          aria-controls={CONTROLS_ID}
          onClick={props.onToggleControls}
          disabled={scanning}
        >
          Modifier la zone
          <ChevronDown aria-hidden="true" className={cn("transition-transform", controlsOpen && "rotate-180")} />
        </Button>
      </header>

      {controlsOpen && (
        <ZoneControls
          id={CONTROLS_ID}
          zone={zone}
          onCity={props.onCity}
          onRadius={props.onRadius}
          onRadiusCommit={() => {}}
          onSectors={props.onSectors}
        />
      )}

      {phase === "idle" ? (
        <EmptyState
          className="my-auto"
          title="Cette zone n'a pas encore été scannée"
          description="Le radar passe sur chaque commerce de la zone, regarde s'il a un site et dans quel état, puis classe ceux qui valent un appel."
          action={
            <Button size="lg" onClick={props.onScan}>
              <Radar aria-hidden="true" />
              Scanner la zone
            </Button>
          }
        />
      ) : (
        <>
          <Totals stats={stats} scanning={scanning} liveLine={props.liveLine} />
          {phase === "done" && <FilterBar {...props} />}
          <ul className="scrollbar-fin min-h-0 flex-1 divide-y divide-trait overflow-y-auto border-t border-trait">
            {list.map((business) => (
              <Row
                key={business.id}
                business={business}
                availability={props.availabilityOf(business.id)}
                selected={props.selectedId === business.id}
                hovered={props.hoveredId === business.id}
                entering={scanning}
                onSelect={props.onSelect}
                onHover={props.onHover}
              />
            ))}
            {phase === "done" && list.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-brume">
                {hasFilter(filters) ? (
                  <>
                    Aucun commerce ne correspond à ces filtres.{" "}
                    <button
                      type="button"
                      className="font-medium text-craie underline underline-offset-4"
                      onClick={() => props.onFilters(NO_FILTER)}
                    >
                      Effacer les filtres
                    </button>
                  </>
                ) : (
                  "Aucune opportunité dans cette zone. Élargis le rayon ou coche d'autres métiers."
                )}
              </li>
            )}
          </ul>
        </>
      )}
    </section>
  );
}

function Totals({ stats, scanning, liveLine }: { stats: Tally; scanning: boolean; liveLine: string }) {
  return (
    <div className="px-4 pb-4">
      <div className="flex items-end justify-between gap-6 whitespace-nowrap">
        <p>
          <AnimatedNumber value={stats.opportunities} duration={0.25} className="enseigne block text-[3.25rem] text-lumiere" />
          <span className="text-ui text-brume">
            {stats.opportunities > 1 ? "opportunités" : "opportunité"} sur {plural(stats.scanned, "commerce")}
          </span>
        </p>
        <p className="pb-px text-right">
          <AnimatedNumber value={stats.revenue} format={formatEuro} duration={0.25} className="titre block text-2xl" />
          <span className="text-ui text-brume">de sites à vendre</span>
        </p>
      </div>

      <HeatBar stats={stats} />

      {/* Always in the page, so that screen readers announce the scan as it goes. */}
      <p aria-live="polite" className={cn("mt-2.5 flex h-5 items-center gap-2 truncate text-ui text-pave", !scanning && "sr-only")}>
        {scanning && <span aria-hidden="true" className="size-1.5 shrink-0 animate-veille rounded-full bg-lumiere" />}
        <span className="truncate">
          {scanning ? liveLine : `Scan terminé : ${plural(stats.opportunities, "opportunité")} sur ${plural(stats.scanned, "commerce")}.`}
        </span>
      </p>
    </div>
  );
}

/** How the opportunities split by heat, as one stacked bar with its legend. */
function HeatBar({ stats }: { stats: Tally }) {
  return (
    <div className="mt-3.5">
      <div aria-hidden="true" className="flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-nuit-700">
        {HEAT_ORDER.map((heat) => (
          <motion.span
            key={heat}
            className="h-full rounded-full"
            style={{ background: HEAT_COLOR[heat] }}
            initial={false}
            animate={{ flexGrow: stats.byHeat[heat] }}
            transition={souple}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-2xs text-brume">
        {HEAT_ORDER.filter((heat) => stats.byHeat[heat] > 0).map((heat) => (
          <li key={heat} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: HEAT_COLOR[heat] }} />
            <span className="cote font-medium text-craie">{stats.byHeat[heat]}</span>
            {HEAT[heat].label.toLowerCase()}
          </li>
        ))}
      </ul>
    </div>
  );
}

const chip =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-ui font-medium transition-colors max-lg:h-10";
const chipOn = "border-transparent bg-craie text-nuit-950";
const chipOff = "border-trait-fort bg-nuit-800 text-brume hover:bg-nuit-700 hover:text-craie";

function FilterBar({ stats, filters, sort, onFilters, onSort }: RadarPanelProps) {
  const canSeeNew = useCan("new-business-alerts");
  const promptUpgrade = useAppStore((state) => state.promptUpgrade);

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      <div role="group" aria-label="Filtrer par état du site" className="scrollbar-fin -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1"
        // The chips scroll sideways: fade the edge so the cut reads as "there is more".
        style={{ maskImage: "linear-gradient(to right, black calc(100% - 40px), transparent)" }}
      >
        {OPPORTUNITY_STATUSES.filter((status) => stats.byStatus[status] > 0).map((status) => {
          const active = filters.statuses.includes(status);
          const Icon = SITE_STATUS_STYLE[status].icon;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => onFilters({ ...filters, statuses: toggled(filters.statuses, status) })}
              className={cn(chip, active ? chipOn : chipOff)}
            >
              <Icon aria-hidden="true" className="size-3.5" style={{ color: SITE_STATUS_STYLE[status].color }} />
              {SITE_STATUS[status].short}
              <span className="cote text-pave">{stats.byStatus[status]}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <div role="group" aria-label="Filtrer par chaleur" className="flex gap-1.5">
          {HEAT_ORDER.filter((heat) => stats.byHeat[heat] > 0).map((heat) => {
            const active = filters.heats.includes(heat);
            return (
              <button
                key={heat}
                type="button"
                aria-pressed={active}
                onClick={() => onFilters({ ...filters, heats: toggled(filters.heats, heat) })}
                className={cn(chip, active ? chipOn : chipOff)}
              >
                <span aria-hidden="true" className="size-2 rounded-full" style={{ background: HEAT_COLOR[heat] }} />
                {HEAT[heat].label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-pressed={filters.onlyNew}
          onClick={() => (canSeeNew ? onFilters({ ...filters, onlyNew: !filters.onlyNew }) : promptUpgrade("new-business-alerts"))}
          className={cn(chip, filters.onlyNew ? chipOn : chipOff)}
        >
          Moins de 6 mois
          <LockChip feature="new-business-alerts" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 text-ui">
        <div role="group" aria-label="Trier la liste" className="flex items-center gap-1 text-brume">
          Trier par
          {(["score", "distance"] as const).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={sort === key}
              onClick={() => onSort(key)}
              className={cn(
                "rounded-md px-1.5 py-1 font-medium transition-colors",
                sort === key ? "bg-nuit-600 text-craie" : "hover:text-craie",
              )}
            >
              {key === "score" ? "score" : "distance"}
            </button>
          ))}
        </div>
        {hasFilter(filters) && (
          <button
            type="button"
            onClick={() => onFilters(NO_FILTER)}
            className="rounded-sm font-medium text-craie underline decoration-trait-fort underline-offset-4 hover:decoration-craie"
          >
            Effacer les filtres
          </button>
        )}
      </div>
    </div>
  );
}

interface RowProps {
  business: Business;
  availability: Availability;
  selected: boolean;
  hovered: boolean;
  /** Arriving during a scan: slides in */
  entering: boolean;
  onSelect: (businessId: string) => void;
  onHover: (businessId: string | null) => void;
}

const Row = memo(function Row({ business, availability, selected, hovered, entering, onSelect, onHover }: RowProps) {
  const masked = useIsMasked(business.id);
  const taken = availability === "taken";

  return (
    // `layout` lets the rows glide to their rank when the scan ends and the list sorts by score.
    <motion.li layout="position" transition={souple} initial={entering ? { opacity: 0, x: -10 } : false} animate={{ opacity: 1, x: 0 }}>
      <button
        type="button"
        id={rowId(business.id)}
        aria-pressed={selected}
        onClick={() => onSelect(business.id)}
        onPointerEnter={() => onHover(business.id)}
        onPointerLeave={() => onHover(null)}
        className={cn(
          "relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-offset-[-2px]",
          selected ? "bg-nuit-700" : hovered ? "bg-nuit-700/60" : "hover:bg-nuit-700/60",
          taken && "text-brume",
        )}
      >
        {selected && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-lumiere" />}
        <BusinessMark sector={business.sector} heat={taken ? "cold" : business.heat} size={38} lit={selected && !taken} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{masked ? maskName(business.name) : business.name}</span>
            {availability === "mine" && <LockKeyhole aria-label="Réservé pour toi" className="size-3.5 shrink-0 text-lumiere" />}
            {taken && <Lock aria-label="Réservé par un autre abonné" className="size-3.5 shrink-0 text-pave" />}
          </span>
          <span className="mt-0.5 block truncate text-ui text-brume">
            {getSector(business.sector).label}, à {formatDistance(business.distanceKm)}
          </span>
          <SiteStatusBadge status={business.site.status} className="mt-1.5" />
        </span>
        <ScorePill score={business.score} />
      </button>
    </motion.li>
  );
});
