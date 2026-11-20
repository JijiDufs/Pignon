import { metersPerPixel } from "@/lib/map-style";
import type { Zone } from "@/lib/store";
import type { Business, Heat, SiteStatus } from "@/lib/types";

/** Pure helpers of the radar: what is in the zone, what the scan counts, how the list is filtered and sorted. */

export const HEAT_ORDER: Heat[] = ["hot", "warm", "mild", "cold"];

/** Every status that makes a business an opportunity, best first. */
export const OPPORTUNITY_STATUSES: SiteStatus[] = ["none", "social-only", "dead", "insecure", "not-mobile", "outdated"];

export function isOpportunity(business: Business): boolean {
  return business.site.status !== "ok";
}

/** Businesses of a city that fall inside the zone, opportunities or not. */
export function inZone(businesses: Business[], zone: Pick<Zone, "radiusKm" | "sectors">): Business[] {
  return businesses.filter(
    (business) => business.distanceKm <= zone.radiusKm && zone.sectors.includes(business.sector),
  );
}

/** The order in which a beam starting north and turning clockwise meets the businesses. */
export function sweepOrder(businesses: Business[]): Business[] {
  return [...businesses].sort((a, b) => a.bearing - b.bearing);
}

export interface Tally {
  /** Businesses the scan has looked at */
  scanned: number;
  opportunities: number;
  /** Sum of the estimated deals of the opportunities, in euros */
  revenue: number;
  byHeat: Record<Heat, number>;
  byStatus: Record<SiteStatus, number>;
}

/** The running total of a scan, and its final summary. Same rules as `getZoneStats`. */
export function tally(businesses: Business[]): Tally {
  const result: Tally = {
    scanned: businesses.length,
    opportunities: 0,
    revenue: 0,
    byHeat: { hot: 0, warm: 0, mild: 0, cold: 0 },
    byStatus: { none: 0, "social-only": 0, dead: 0, insecure: 0, "not-mobile": 0, outdated: 0, ok: 0 },
  };
  for (const business of businesses) {
    result.byStatus[business.site.status] += 1;
    if (!isOpportunity(business)) continue;
    result.opportunities += 1;
    result.revenue += business.estimatedDeal;
    result.byHeat[business.heat] += 1;
  }
  return result;
}

export interface Filters {
  /** Empty means every heat */
  heats: Heat[];
  /** Empty means every status */
  statuses: SiteStatus[];
  /** Only companies registered less than six months ago */
  onlyNew: boolean;
}

export const NO_FILTER: Filters = { heats: [], statuses: [], onlyNew: false };

export function hasFilter(filters: Filters): boolean {
  return filters.heats.length > 0 || filters.statuses.length > 0 || filters.onlyNew;
}

export function applyFilters(businesses: Business[], filters: Filters): Business[] {
  return businesses.filter(
    (business) =>
      (filters.heats.length === 0 || filters.heats.includes(business.heat)) &&
      (filters.statuses.length === 0 || filters.statuses.includes(business.site.status)) &&
      (!filters.onlyNew || business.isNew),
  );
}

export type SortKey = "score" | "distance";

/** Who can work this business: anyone, me (I reserved it), or another subscriber. */
export type Availability = "free" | "mine" | "taken";

export function sortBusinesses(businesses: Business[], key: SortKey): Business[] {
  return [...businesses].sort((a, b) =>
    key === "score" ? b.score - a.score || a.distanceKm - b.distanceKm : a.distanceKm - b.distanceKm || b.score - a.score,
  );
}

/** Adds the item when it is missing, removes it when it is there. */
export function toggled<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((other) => other !== item) : [...list, item];
}

/**
 * What the scan reads about one business, as a short status line ("garage-ferreira.fr, copyright 2014").
 * On a masked business the name and the address of the site are replaced by the trade.
 */
export function analysisLine(business: Business, masked: boolean, trade: string): string {
  const { site } = business;
  const who = masked ? trade : business.name;
  const where = masked || !site.url ? who : site.url;
  switch (site.status) {
    case "none":
      return `${who}, aucun site trouvé`;
    case "social-only":
      return `${who}, une page ${site.platform ?? "Facebook"} et rien d'autre`;
    case "dead":
      return `${where}, l'adresse ne répond plus`;
    case "insecure":
      return `${where}, pas de HTTPS`;
    case "not-mobile":
      return `${where}, illisible sur mobile`;
    case "outdated":
      return site.copyrightYear ? `${where}, copyright ${site.copyrightYear}` : `${where}, site daté`;
    case "ok":
      return `${where}, site correct`;
  }
}

/** Zoom at which a circle of `radiusKm` is `pixels` wide on screen. */
export function zoomToFit(lat: number, radiusKm: number, pixels: number): number {
  return Math.log2((metersPerPixel(lat, 0) * pixels) / (2000 * radiusKm));
}

/** Dom ids shared by the list and the map, so that one can focus or scroll to the other. */
export const rowId = (businessId: string) => `ligne-${businessId}`;
export const pinId = (businessId: string) => `epingle-${businessId}`;
