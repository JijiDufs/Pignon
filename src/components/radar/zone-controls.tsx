"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { SectorIcon } from "@/components/pignon/sector-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CITIES, getCity, SECTORS } from "@/lib/data";
import { apparition } from "@/lib/motion";
import type { Zone } from "@/lib/store";
import type { SectorId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const MIN_RADIUS_KM = 1;
export const MAX_RADIUS_KM = 4;

interface ZoneControlsProps {
  id: string;
  zone: Zone;
  onCity: (cityId: string) => void;
  /** Fires while the thumb moves: the circle on the map follows */
  onRadius: (radiusKm: number) => void;
  /** Fires when the thumb is released: the map reframes the zone */
  onRadiusCommit: () => void;
  onSectors: (sectors: SectorId[]) => void;
}

/** Where to scan and for whom: city, radius, trades. */
export function ZoneControls({ id, zone, onCity, onRadius, onRadiusCommit, onSectors }: ZoneControlsProps) {
  const cityLabel = useId();
  const radiusLabel = useId();
  const sectorsLabel = useId();
  const all = zone.sectors.length === SECTORS.length;

  const toggleSector = (sector: SectorId) => {
    const next = SECTORS.map((item) => item.id).filter((item) =>
      item === sector ? !zone.sectors.includes(item) : zone.sectors.includes(item),
    );
    // A zone without any trade has nothing to scan: the last one stays checked.
    if (next.length > 0) onSectors(next);
  };

  return (
    <motion.div
      id={id}
      variants={apparition}
      initial="cache"
      animate="visible"
      className="flex flex-col gap-4 border-b border-trait px-4 pt-1 pb-4"
    >
      <div className="flex flex-col gap-1.5">
        <span id={cityLabel} className="text-ui text-brume">
          Ville
        </span>
        <Select value={zone.cityId} onValueChange={(value) => value && onCity(value)}>
          <SelectTrigger aria-labelledby={cityLabel} className="h-9! w-full max-lg:h-11!">
            <SelectValue>{(value: string) => getCity(value)?.name ?? "Choisir une ville"}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            {CITIES.map((city) => (
              <SelectItem key={city.id} value={city.id} className="py-1.5 max-lg:py-2.5">
                {city.name}
                <span className="chiffres text-pave">{city.postalCode}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-ui">
          <span id={radiusLabel} className="text-brume">
            Rayon autour du centre
          </span>
          <span className="chiffres text-sm font-semibold">{zone.radiusKm} km</span>
        </div>
        <Slider
          aria-labelledby={radiusLabel}
          value={[zone.radiusKm]}
          min={MIN_RADIUS_KM}
          max={MAX_RADIUS_KM}
          step={1}
          format={{ style: "unit", unit: "kilometer" }}
          locale="fr-FR"
          onValueChange={(value) => onRadius(typeof value === "number" ? value : value[0])}
          onValueCommitted={onRadiusCommit}
          className="py-2 **:data-[slot=slider-thumb]:size-4 **:data-[slot=slider-track]:h-1.5! **:data-[slot=slider-track]:bg-nuit-600"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between text-ui">
          <span id={sectorsLabel} className="text-brume">
            Métiers
          </span>
          {!all && (
            <button
              type="button"
              onClick={() => onSectors(SECTORS.map((sector) => sector.id))}
              className="rounded-sm font-medium text-craie underline decoration-trait-fort underline-offset-4 hover:decoration-craie"
            >
              Tout cocher
            </button>
          )}
        </div>
        <div role="group" aria-labelledby={sectorsLabel} className="flex flex-wrap gap-1.5">
          {SECTORS.map((sector) => {
            const checked = zone.sectors.includes(sector.id);
            return (
              <button
                key={sector.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleSector(sector.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-ui font-medium transition-colors max-lg:h-11",
                  checked
                    ? "border-transparent bg-nuit-600 text-craie"
                    : "border-trait-fort text-brume hover:bg-nuit-700 hover:text-craie",
                )}
              >
                <SectorIcon sector={sector.id} className={cn("size-3.5", !checked && "opacity-60")} />
                {sector.plural}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
